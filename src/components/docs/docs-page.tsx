"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { CodeWindow, McpJsonWindow } from "@/components/ui/code-window";
import MarkdownRenderer from "./markdown-renderer";
import SearchPill from "./search-pill";
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

function SidebarContent({ active, groups, onJump }: { active: string; groups: string[]; onJump: (id: string) => void }) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // Ensure the group containing the active item is always expanded
  useEffect(() => {
    const activeGroup = DOCS_SECTIONS.find(s => s.id === active)?.group;
    if (activeGroup && !expandedGroups.has(activeGroup)) {
      setExpandedGroups(prev => {
        const next = new Set(prev);
        next.add(activeGroup);
        return next;
      });
    }
  }, [active]);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  return (
    <>
      {groups.map((group) => {
        const isExpanded = expandedGroups.has(group);
        return (
          <div key={group} style={{ marginBottom: 24 }}>
            <button 
              onClick={() => toggleGroup(group)}
              style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between", 
                width: "100%", 
                background: "none", 
                border: "none", 
                padding: "4px 4px", 
                marginBottom: 8,
                cursor: "pointer",
                textAlign: "left"
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.02em", color: "var(--muted)" }}>
                {group}
              </span>
              <svg 
                width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s ease" }}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </button>
            <div style={{ 
              display: "grid", 
              gridTemplateRows: isExpanded ? "1fr" : "0fr",
              transition: "grid-template-rows 0.3s ease",
            }}>
              <div style={{ overflow: "hidden" }}>
                {DOCS_SECTIONS.filter((s) => s.group === group && !(s as any).parent).map((s) => {
                  const isActive = active === s.id;
                  const children = DOCS_SECTIONS.filter((child) => (child as any).parent === s.id);
                  const isParentOrChildActive = isActive || children.some(child => child.id === active);

                  return (
                    <div key={s.id}>
                      <button
                        onClick={() => {
                          onJump(s.id);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          width: "100%",
                          padding: "8px 4px",
                          borderRadius: 8,
                          fontSize: 14,
                          color: isActive ? "#1B1B1B" : "#666666",
                          background: isActive ? "rgba(0,255,135,0.08)" : "transparent",
                          border: `1px solid ${isActive ? "rgba(0,127,106,0.1)" : "transparent"}`,
                          cursor: "pointer",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          textAlign: "left",
                          marginBottom: 2,
                          fontFamily: "inherit",
                          fontWeight: isActive ? 500 : 400
                        }}
                      >
                        <span style={{
                          width: 6, height: 6, borderRadius: "50%",
                          background: "#007F6A",
                          display: "inline-block",
                          opacity: isActive ? 1 : 0,
                          transition: "opacity 0.2s",
                          flexShrink: 0,
                        }} />
                        <span style={{ flex: 1 }}>{s.label}</span>
                        {children.length > 0 && (
                          <svg 
                            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            style={{ 
                              opacity: 0.5, 
                              transform: isParentOrChildActive ? "rotate(0deg)" : "rotate(-90deg)", 
                              transition: "transform 0.2s ease",
                              color: isParentOrChildActive ? "#007F6A" : "inherit" 
                            }}
                          >
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        )}
                        {children.length === 0 && (
                          <svg 
                            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                            style={{ opacity: isActive ? 0.8 : 0, transition: "opacity 0.2s", color: "#007F6A" }}
                          >
                            <polyline points="9 18 15 12 9 6"></polyline>
                          </svg>
                        )}
                      </button>

                      <div style={{ 
                        display: "grid", 
                        gridTemplateRows: (children.length > 0 && isParentOrChildActive) ? "1fr" : "0fr",
                        transition: "grid-template-rows 0.3s ease",
                      }}>
                        <div style={{ overflow: "hidden" }}>
                          <div style={{ paddingLeft: 16, marginBottom: 8, marginTop: 4 }}>
                            {children.map(child => {
                              const isChildActive = active === child.id;
                              return (
                                <button
                                  key={child.id}
                                  onClick={() => onJump(child.id)}
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 8,
                                    width: "100%",
                                    padding: "6px 4px",
                                    borderRadius: 8,
                                    fontSize: 13,
                                    color: isChildActive ? "#1B1B1B" : "#888888",
                                    background: isChildActive ? "rgba(0,255,135,0.05)" : "transparent",
                                    border: `1px solid ${isChildActive ? "rgba(0,127,106,0.1)" : "transparent"}`,
                                    cursor: "pointer",
                                    transition: "all 0.2s",
                                    textAlign: "left",
                                    marginBottom: 2,
                                    fontFamily: "inherit",
                                    fontWeight: isChildActive ? 500 : 400
                                  }}
                                >
                                  {child.label}
                                  <span style={{ flex: 1 }} />
                                  <svg 
                                    width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                                    style={{ opacity: isChildActive ? 0.6 : 0, transition: "opacity 0.2s", color: "#007F6A" }}
                                  >
                                    <polyline points="9 18 15 12 9 6"></polyline>
                                  </svg>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

const docsCache: Record<string, string> = {};

export default function DocsPage() {
  const [active, setActive] = useState("what-is-agentsecrets");
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const rollInnerRef = useRef<HTMLDivElement>(null);
  const tocRef = useRef<HTMLElement>(null);
  const searchParams = useSearchParams();

  // 1. Resolve section from URL
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash && DOCS_SECTIONS.find((s) => s.id === hash)) {
        setActive(hash);
      } else if (!hash) {
        setActive("what-is-agentsecrets");
      }
    };
    
    // Initial check
    handleHashChange();
    
    // Listen for changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [searchParams]);

  // 2. Load active content immediately, then prewarm nearby sections
  const [pendingHeadingId, setPendingHeadingId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    // Clear stale state
    setToc([]);
    setActiveHeading("");

    const loadContent = async () => {
      // Instant render if cached
      if (docsCache[active]) {
        setContent(docsCache[active]);
        setIsLoading(false);
        if (!pendingHeadingId && contentRef.current) {
          contentRef.current.scrollTo({ top: 0 });
        }
      } else {
        setIsLoading(true);
        const data = await getDocContent(active);
        if (isMounted) {
          if (data) docsCache[active] = data.content;
          setContent(data ? data.content : null);
          setIsLoading(false);
          if (!pendingHeadingId && contentRef.current) {
            contentRef.current.scrollTo({ top: 0 });
          }
        }
      }

      // ... existing prewarming logic ...
      if (isMounted) {
        const currentIndex = DOCS_SECTIONS.findIndex(s => s.id === active);
        const currentGroup = DOCS_SECTIONS[currentIndex]?.group;

        // Priority 1: Adjacent sections (prev/next) — load immediately
        const adjacent = [
          currentIndex > 0 ? DOCS_SECTIONS[currentIndex - 1] : null,
          currentIndex < DOCS_SECTIONS.length - 1 ? DOCS_SECTIONS[currentIndex + 1] : null,
        ].filter(Boolean) as any[];
        
        for (const s of adjacent) {
          if (!docsCache[s.id]) {
            getDocContent(s.id).then(data => { if (data) docsCache[s.id] = data.content; });
          }
        }

        // Priority 2: Same group — load after a short delay
        setTimeout(() => {
          if (!isMounted) return;
          const sameGroup = DOCS_SECTIONS.filter(s => s.group === currentGroup && s.id !== active);
          for (const s of sameGroup) {
            if (!docsCache[s.id]) {
              getDocContent(s.id).then(data => { if (data) docsCache[s.id] = data.content; });
            }
          }
        }, 500);

        // Priority 3: Everything else — load in small batches during idle time
        setTimeout(() => {
          if (!isMounted) return;
          const remaining = DOCS_SECTIONS.filter(s => !docsCache[s.id]);
          let i = 0;
          const BATCH_SIZE = 5;
          
          const loadBatch = () => {
            if (!isMounted || i >= remaining.length) return;
            const batch = remaining.slice(i, i + BATCH_SIZE);
            for (const s of batch) {
              if (!docsCache[s.id]) {
                getDocContent(s.id).then(data => { if (data) docsCache[s.id] = data.content; });
              }
            }
            i += BATCH_SIZE;
            
            if (typeof requestIdleCallback !== 'undefined') {
              requestIdleCallback(loadBatch);
            } else {
              setTimeout(loadBatch, 200);
            }
          };
          loadBatch();
        }, 1500);
      }
    };
    loadContent();
    return () => { isMounted = false; };
  }, [active]);

  // 2.1 Handle pending heading scroll
  useEffect(() => {
    if (pendingHeadingId && !isLoading && content) {
      const timer = setTimeout(() => {
        const el = document.getElementById(pendingHeadingId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setPendingHeadingId(null);
        }
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [pendingHeadingId, isLoading, content]);

  // 4. Feedback State (Persistent per section)
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  // 5. Table of Contents & ScrollSpy
  const [toc, setToc] = useState<{id: string, title: string, level: number}[]>([]);
  const [activeHeading, setActiveHeading] = useState("");
  const activeHeadingRef = useRef(activeHeading);
  useEffect(() => {
    activeHeadingRef.current = activeHeading;
  }, [activeHeading]);

  useEffect(() => {
    if (!content) {
      setToc([]);
      return;
    }

    const headings: {id: string, title: string, isTab: boolean}[] = [];
    const lines = content.split('\n');
    let inTabs = false;
    const idCounts: Record<string, number> = {};

    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed.match(/^:{2,3}tabs/)) { inTabs = true; return; }
      if (trimmed.match(/^:{2,3}/)) { 
        // If it's a closing marker for something else, it also ends the tabs context for TOC purposes
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
    
    setToc(headings as any);
  }, [content]);



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

  // Scroll Spy for TOC
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
  }, [content, active, isLoading]);

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

  const jump = (id: string, headingId?: string) => {
    setActive(id);
    setDrawerOpen(false);
    if (headingId) setPendingHeadingId(headingId);
    const section = DOCS_SECTIONS.find((s) => s.id === id);
    const group = section?.group.toLowerCase().replace(/\s+/g, "-") ?? "";
    const hash = headingId ? headingId : id;
    window.history.replaceState(null, "", `/docs?q=${encodeURIComponent(group)}#${hash}`);
  };

  const groups = [...new Set(DOCS_SECTIONS.map((s) => s.group))];
  const activeLabel = DOCS_SECTIONS.find((s) => s.id === active)?.label ?? "Docs";
  const userReaction = feedback[active];

  useGSAP(() => {
    if (!rollInnerRef.current) return;
    gsap.to(rollInnerRef.current, {
      y: userReaction ? -20 : 0,
      duration: 0.6,
      ease: "power4.out"
    });
  }, { dependencies: [userReaction] });

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
        @media (min-width: 1024px) {
          .docs-layout { 
            display: grid !important;
            grid-template-columns: 280px 1fr !important; 
            height: 100vh;
            overflow: hidden;
          }
        }
        @media (min-width: 1280px) {
          .docs-layout { 
            display: grid !important;
            grid-template-columns: 280px 1fr 380px !important; 
            height: 100vh;
            overflow: hidden;
          }
        }
      `}} />

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div onClick={() => setDrawerOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
      )}
      
      {/* Mobile Sidebar */}
      <div className="docs-drawer lg:hidden" style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 280, zIndex: 201, background: "#FFFFFF", borderRight: "1px solid rgba(0,0,0,0.08)", padding: "80px 20px 40px", transform: drawerOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)", overflowY: "auto" }}>
        <SidebarContent active={active} groups={groups} onJump={jump} />
      </div>



      {/* Desktop Sidebar */}
      <aside className="docs-sidebar hidden lg:block" style={{ position: "fixed", left: 0, width: 280, top: 60, height: "calc(100vh - 60px)", overflowY: "auto", borderRight: "1px solid var(--border)", padding: "32px 8px 32px 20px" }}>
        <SidebarContent active={active} groups={groups} onJump={jump} />
      </aside>

      {/* Right Sidebar (Table of Contents) */}
      <aside ref={tocRef} className="hidden xl:block" style={{ position: "fixed", right: 0, width: 380, top: 60, height: "calc(100vh - 60px)", overflowY: "auto", borderLeft: "1px solid var(--border)", padding: "32px 32px" }}>
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
        <main ref={contentRef} className="docs-content" style={{ padding: "100px 64px 120px 64px", width: "100%", height: "calc(100vh - 60px)", marginTop: 60, overflowY: "auto", scrollBehavior: "smooth", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: "680px" }}>
            <div key={active} className="docs-section animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Breadcrumb items={[DOCS_SECTIONS.find(s => s.id === active)?.group || "Docs", activeLabel]} />
              {isLoading && !docsCache[active] ? (
                <div style={{ padding: "40px 0", color: "#999", fontSize: 14 }}>Loading...</div>
              ) : content ? (
                <MarkdownRenderer content={content} id={active} />
              ) : (
                <div style={{ padding: "40px 0", color: "#666" }}>Section content not found.</div>
              )}
            </div>

            {/* Pagination Navigation */}
            <div style={{ marginTop: 80, borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: 40 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 60 }}>
                {(() => {
                  const currentIndex = DOCS_SECTIONS.findIndex(s => s.id === active);
                  const prev = currentIndex > 0 ? DOCS_SECTIONS[currentIndex - 1] : null;
                  return prev ? (
                    <button onClick={() => jump(prev.id)} style={{ textAlign: "left", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>Previous</div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: "#1B1B1B", display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 24 }}>‹</span> {prev.label}
                      </div>
                    </button>
                  ) : <div />;
                })()}
                {(() => {
                  const currentIndex = DOCS_SECTIONS.findIndex(s => s.id === active);
                  const next = currentIndex < DOCS_SECTIONS.length - 1 ? DOCS_SECTIONS[currentIndex + 1] : null;
                  return next ? (
                    <button onClick={() => jump(next.id)} style={{ textAlign: "right", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>Next</div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: "#1B1B1B", display: "flex", alignItems: "center", gap: 8 }}>
                        {next.label} <span style={{ fontSize: 24 }}>›</span>
                      </div>
                    </button>
                  ) : <div />;
                })()}
              </div>

              {/* Abstract Feedback Pill */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
                <div style={{ background: "transparent", borderRadius: 100, padding: "10px 24px", display: "flex", alignItems: "center", gap: 20, border: "1px solid #000000", boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }}>
                  <div className="text-roll-container" style={{ width: userReaction ? 155 : 115, transition: "width 0.5s cubic-bezier(0.32, 0.72, 0, 1)" }}>
                    <div ref={rollInnerRef} className="text-roll-inner">
                      <div style={{ height: 20, lineHeight: "20px", fontSize: 13, color: "#1B1B1B", fontWeight: 500 }}>Was this helpful?</div>
                      <div style={{ height: 20, lineHeight: "20px", fontSize: 13, color: "#1B1B1B", fontWeight: 500 }}>Thanks for your feedback!</div>
                    </div>
                  </div>
                  
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => handleFeedback(active, "sad")} className={`feedback-btn flex items-center justify-center w-10 h-10 rounded-full ${userReaction === "sad" ? "active" : ""}`} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      <Frown size={20} strokeWidth={1.5} />
                    </button>
                    <button onClick={() => handleFeedback(active, "neutral")} className={`feedback-btn flex items-center justify-center w-10 h-10 rounded-full ${userReaction === "neutral" ? "active" : ""}`} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                      <Meh size={20} strokeWidth={1.5} />
                    </button>
                    <button onClick={() => handleFeedback(active, "smile")} className={`feedback-btn flex items-center justify-center w-10 h-10 rounded-full ${userReaction === "smile" ? "active" : ""}`} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
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
      <SearchPill onMenuClick={() => setDrawerOpen(true)} onNavigate={jump} />
    </>
  );
}