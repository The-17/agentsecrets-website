"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { CodeWindow, McpJsonWindow } from "@/components/ui/code-window";
import MarkdownRenderer from "./markdown-renderer";
import { getDocContent, submitFeedback } from "@/app/actions/docs";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { DOCS_SECTIONS } from "@/lib/docs-sections";
import { Frown, Meh, Smile } from "lucide-react";

function Breadcrumb({ items }: { items: string[] }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "var(--muted)", marginBottom: 28, flexWrap: "wrap" }}>
      {items.map((item, i) => (
        <span key={i} style={{ color: i === items.length - 1 ? "var(--em)" : "var(--muted)" }}>
          {i > 0 && <span style={{ marginRight: 8, color: "var(--muted)" }}>›</span>}
          {item}
        </span>
      ))}
    </div>
  );
}

interface DocsActivePageProps {
  activeId: string;
  content: string;
}

export default function DocsActivePage({ activeId, content }: DocsActivePageProps) {
  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);
  const rollInnerRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLElement>(null);

  // 1. Reset scroll view when page changes
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0 });
    }
  }, [activeId]);

  // 2. Handle deep linking to custom headings on initial load or path change
  useEffect(() => {
    const handleHashScroll = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        const timer = setTimeout(() => {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 150);
        return () => clearTimeout(timer);
      }
    };

    handleHashScroll();
    
    // Also listen to hash changes
    window.addEventListener("hashchange", handleHashScroll);
    return () => window.removeEventListener("hashchange", handleHashScroll);
  }, [activeId]);

  // 3. Feedback State (Persistent per section)
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  useEffect(() => {
    const saved = localStorage.getItem("agentsecrets_feedback");
    if (saved) {
      try { setFeedback(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  const handleFeedback = (id: string, reaction: string) => {
    const isUnselect = feedback[id] === reaction;
    const newFeedback = { ...feedback };
    if (isUnselect) { 
      delete newFeedback[id]; 
    } else { 
      newFeedback[id] = reaction; 
      // Send to server when selected
      submitFeedback(id, reaction);
    }
    setFeedback(newFeedback);
    localStorage.setItem("agentsecrets_feedback", JSON.stringify(newFeedback));
  };

  // 4. Table of Contents & ScrollSpy
  const toc = useMemo(() => {
    if (!content) return [];

    const headings: {id: string; title: string; isTab: boolean}[] = [];
    const lines = content.split('\n');
    let inTabs = false;
    const idCounts: Record<string, number> = {};

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.match(/^:{2,3}tabs/)) { inTabs = true; return; }
      if (trimmed.match(/^:{2,3}/)) { 
        // Ends the tabs context
        inTabs = false; 
        return; 
      }
      
      const match = trimmed.match(/^(#{2,3})\s+(.*)$/);
      if (match) {
        const rawTitle = match[2].trim();
        let id = rawTitle.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
        
        if (idCounts[id] !== undefined) {
          idCounts[id]++;
          id = `${id}-${idCounts[id]}`;
        } else {
          idCounts[id] = 0;
        }

        const stepMatch = rawTitle.match(/^(?:(?:Step|Stage)\s+)?(\d+)(?:\s*[—:\-\.]\s+)(.*)$/i);
        const title = stepMatch ? stepMatch[2] : rawTitle;
        
        // Tab titles are always ## inside :::tabs
        headings.push({ id, title, isTab: inTabs && match[1] === '##' });
      }
    });

    return headings;
  }, [content]);

  const [activeHeading, setActiveHeading] = useState("");
  const activeHeadingRef = useRef(activeHeading);
  
  useEffect(() => {
    activeHeadingRef.current = activeHeading;
  }, [activeHeading]);

  // Scroll Spy for Table of Contents
  useEffect(() => {
    const mainContainer = contentRef.current;
    if (!mainContainer) return;

    const handleScroll = () => {
      const headingElements = mainContainer.querySelectorAll("h2, h3");
      let currentId = "";
      
      headingElements.forEach((el: any) => {
        const rect = el.getBoundingClientRect();
        // Adjust threshold based on layout (top nav + padding)
        if (rect.top <= 220) {
          currentId = el.id;
        }
      });
      
      if (currentId && currentId !== activeHeadingRef.current) {
        setActiveHeading(currentId);
      }
    };

    mainContainer.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    handleScroll();

    return () => mainContainer.removeEventListener("scroll", handleScroll);
  }, [content, activeId]);

  // Sync TOC scroll with active heading
  useEffect(() => {
    if (!activeHeading || !tocRef.current) return;
    const activeLink = tocRef.current.querySelector(`a[href="#${activeHeading}"]`);
    if (activeLink) {
      activeLink.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [activeHeading]);

  const activeLabel = DOCS_SECTIONS.find((s) => s.id === activeId)?.label ?? "Docs";
  const userReaction = feedback[activeId];

  useGSAP(() => {
    if (!rollInnerRef.current) return;
    gsap.to(rollInnerRef.current, {
      y: userReaction ? -20 : 0,
      duration: 0.6,
      ease: "power4.out"
    });
  }, { dependencies: [userReaction] });

  // Pagination resolve (Prev & Next buttons)
  const currentIndex = DOCS_SECTIONS.findIndex(s => s.id === activeId);
  const prev = currentIndex > 0 ? DOCS_SECTIONS[currentIndex - 1] : null;
  const next = currentIndex < DOCS_SECTIONS.length - 1 ? DOCS_SECTIONS[currentIndex + 1] : null;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        .feedback-btn {
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          border: 1px solid transparent !important;
          color: #1B1B1B;
        }
        .feedback-btn:hover {
          background-color: rgba(0, 0, 0, 0.08) !important;
          border-color: rgba(0, 0, 0, 0.1) !important;
          transform: translateY(-2px);
        }
        .feedback-btn:active {
          transform: scale(0.92);
        }
        .feedback-btn.active {
          background-color: #CCFBF1 !important;
          color: #005E50 !important;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 94, 80, 0.12);
        }
        .feedback-btn.active .line {
          background-color: #005E50 !important;
        }
        .text-roll-container {
          height: 20px;
          overflow: hidden;
          position: relative;
        }
        .text-roll-inner {
          will-change: transform;
        }
      `}} />

      {/* Right Sidebar (Table of Contents) */}
      <aside 
        ref={tocRef as any} 
        className="hidden xl:block" 
        style={{ 
          position: "fixed", right: 0, width: 380, top: 60, height: "calc(100vh - 60px)", 
          overflowY: "auto", borderLeft: "1px solid var(--border)", 
          padding: "32px 32px" 
        }}
      >
        {toc.length > 0 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#1B1B1B", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="7" y2="10"></line><line x1="21" y1="6" x2="3" y2="6"></line><line x1="21" y1="14" x2="3" y2="14"></line><line x1="21" y1="18" x2="7" y2="18"></line></svg>
              On this page
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {toc.map(item => {
                const isActive = activeHeading === item.id;
                return (
                  <li key={item.id} style={{ paddingLeft: (item as any).isTab ? 16 : 0 }}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                        setActiveHeading(item.id);
                        window.history.replaceState(null, "", `#${item.id}`);
                      }}
                      style={{
                        fontSize: 13,
                        color: isActive ? "#007F6A" : "#888",
                        fontWeight: isActive ? 500 : 400,
                        textDecoration: "none",
                        transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                        display: "block",
                        paddingLeft: 2,
                        borderLeft: `2px solid ${isActive ? "#007F6A" : "transparent"}`,
                        marginLeft: -2,
                        padding: "4px 0 4px 12px"
                      }}
                    >
                      {item.title}
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </aside>

      {/* Main Layout Grid */}
      <div className="docs-layout grid grid-cols-1" style={{ minHeight: "100vh" }}>
        <div className="hidden lg:block" />
        <main 
          ref={contentRef} 
          className="docs-content" 
          style={{ 
            padding: "100px 64px 120px 64px", width: "100%", height: "calc(100vh - 60px)", 
            marginTop: 60, overflowY: "auto", scrollBehavior: "smooth", 
            display: "flex", flexDirection: "column", alignItems: "center" 
          }}
        >
          <div style={{ width: "100%", maxWidth: "680px" }}>
            <div key={activeId} className="docs-section animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Breadcrumb items={[DOCS_SECTIONS.find(s => s.id === activeId)?.group || "Docs", activeLabel]} />
              <MarkdownRenderer content={content} id={activeId} />
            </div>

            {/* Pagination Navigation */}
            <div style={{ marginTop: 80, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 40 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 60 }}>
                {prev ? (
                  <button 
                    onClick={() => router.push(`/docs/${prev.id}`)} 
                    style={{ textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>Previous</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: "#1B1B1B", display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 24 }}>‹</span> {prev.label}
                    </div>
                  </button>
                ) : <div />}

                {next ? (
                  <button 
                    onClick={() => router.push(`/docs/${next.id}`)} 
                    style={{ textAlign: "right", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>Next</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: "#1B1B1B", display: "flex", alignItems: "center", gap: 8 }}>
                      {next.label} <span style={{ fontSize: 24 }}>›</span>
                    </div>
                  </button>
                ) : <div />}
              </div>

              {/* Abstract Feedback Pill */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div 
                  style={{ 
                    background: "transparent", borderRadius: 100, padding: "10px 24px", 
                    display: "flex", alignItems: "center", gap: 20, border: "1px solid #000000", 
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)" 
                  }}
                >
                  <div className="text-roll-container" style={{ width: userReaction ? 155 : 115, transition: "width 0.5s cubic-bezier(0.32, 0.72, 0, 1)" }}>
                    <div ref={rollInnerRef} className="text-roll-inner">
                      <div style={{ height: 20, lineHeight: "20px", fontSize: 13, color: "#1B1B1B", fontWeight: 500 }}>Was this helpful?</div>
                      <div style={{ height: 20, lineHeight: "20px", fontSize: 13, color: "#1B1B1B", fontWeight: 500 }}>Thanks for your feedback!</div>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: 8 }}>
                    <button 
                      onClick={() => handleFeedback(activeId, "sad")} 
                      className={`feedback-btn flex items-center justify-center w-10 h-10 rounded-full ${userReaction === "sad" ? "active" : ""}`} 
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      <Frown size={20} strokeWidth={1.5} />
                    </button>
                    <button 
                      onClick={() => handleFeedback(activeId, "neutral")} 
                      className={`feedback-btn flex items-center justify-center w-10 h-10 rounded-full ${userReaction === "neutral" ? "active" : ""}`} 
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      <Meh size={20} strokeWidth={1.5} />
                    </button>
                    <button 
                      onClick={() => handleFeedback(activeId, "smile")} 
                      className={`feedback-btn flex items-center justify-center w-10 h-10 rounded-full ${userReaction === "smile" ? "active" : ""}`} 
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
                    >
                      <Smile size={20} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#999999", fontWeight: 400, letterSpacing: "0.01em" }}>
                  Your feedback helps us improve the platform.
                </div>
              </div>
            </div>
          </div>
        </main>

        <div className="hidden xl:block" />
      </div>
    </>
  );
}
