"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { CodeWindow, McpJsonWindow } from "@/components/ui/code-window";
import MarkdownRenderer from "./markdown-renderer";
import { getDocContent, submitFeedback } from "@/app/actions/docs";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const DOCS_SECTIONS = [
  { id: "overview",      group: "Introduction",  label: "Overview" },
  { id: "quickstart",    group: "Introduction",  label: "Getting Started" },
  { id: "howworks",      group: "Core Concepts", label: "How It Works" },
  { id: "keychain",      group: "Core Concepts", label: "OS Keychain" },
  { id: "storagemodes",  group: "Core Concepts", label: "Storage Modes" },
  { id: "zerok",         group: "Core Concepts", label: "Zero-Knowledge Design" },
  { id: "environments",  group: "Core Concepts", label: "Environments" },
  { id: "allowlist",     group: "Core Concepts", label: "Domain Allowlist" },
  { id: "redaction",     group: "Core Concepts", label: "Response Redaction" },
  { id: "identity",      group: "Core Concepts", label: "Agent Identity" },
  { id: "governancelog", group: "Core Concepts", label: "Governance Log" },
  { id: "workspaces",    group: "Team Features", label: "Workspaces" },
  { id: "projects",      group: "Team Features", label: "Projects" },
  { id: "secretsmanagement", group: "Team Features", label: "Secrets Management" },
  { id: "mcp",           group: "Integrations",  label: "MCP / Claude Desktop" },
  { id: "proxy-int",     group: "Integrations",  label: "HTTP Proxy" },
  { id: "sdk-int",       group: "Integrations",  label: "Python SDK" },
  { id: "env-int",       group: "Integrations",  label: "agentsecrets env" },
  { id: "openclaw-i",    group: "Integrations",  label: "OpenClaw" },
  { id: "cli-full",      group: "Reference",     label: "CLI Reference" },
  { id: "sdk-ref",       group: "Reference",     label: "SDK Reference" },
];

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
  return (
    <>
      {groups.map((group) => (
        <div key={group} style={{ marginBottom: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 12, paddingLeft: 12 }}>
            {group}
          </div>
          {DOCS_SECTIONS.filter((s) => s.group === group).map((s) => {
            const isActive = active === s.id;
            return (
              <button
                key={s.id}
                onClick={() => onJump(s.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: 8,
                  fontSize: 13,
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
                {s.label}
              </button>
            );
          })}
        </div>
      ))}
    </>
  );
}

const docsCache: Record<string, string> = {};

export default function DocsPage() {
  const [active, setActive] = useState("overview");
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  // 1. Pre-warm cache on mount
  useEffect(() => {
    const prewarm = async () => {
      for (const s of DOCS_SECTIONS) {
        if (!docsCache[s.id]) {
          getDocContent(s.id).then(data => {
            if (data) docsCache[s.id] = data;
          });
        }
      }
    };
    prewarm();
  }, []);

  // 2. Resolve section from URL
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && DOCS_SECTIONS.find((s) => s.id === hash)) {
      setActive(hash);
    }
  }, [searchParams]);

  // 3. Load content (Instant if cached)
  useEffect(() => {
    let isMounted = true;
    const loadContent = async () => {
      if (docsCache[active]) {
        setContent(docsCache[active]);
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }
      setIsLoading(true);
      const data = await getDocContent(active);
      if (isMounted) {
        if (data) docsCache[active] = data;
        setContent(data);
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    loadContent();
    return () => { isMounted = false; };
  }, [active]);

  // 4. Feedback State (Persistent per section)
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const rollInnerRef = useRef<HTMLDivElement>(null);

  // 5. Table of Contents & ScrollSpy
  const [toc, setToc] = useState<{id: string, title: string}[]>([]);
  const [activeHeading, setActiveHeading] = useState("");

  useEffect(() => {
    if (!content) {
      setToc([]);
      return;
    }
    const headings: {id: string, title: string}[] = [];
    const regex = /^#{2,3}\s+(.*)$/gm;
    let match;
    while ((match = regex.exec(content)) !== null) {
      let rawTitle = match[1].trim();
      const stepMatch = rawTitle.match(/^(?:(?:Step|Stage)\s+)?(\d+)(?:\s*[—:\-\.]\s+)(.*)$/i);
      const id = rawTitle.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
      const displayTitle = stepMatch ? stepMatch[2] : rawTitle;
      headings.push({ id, title: displayTitle });
    }
    setToc(headings);
  }, [content]);

  useEffect(() => {
    if (toc.length === 0) return;
    
    const handleScroll = () => {
      let currentId = toc[0]?.id || "";
      for (const item of toc) {
        const el = document.getElementById(item.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          // Threshold of 150px accounts for sticky header + scroll margin + some buffer
          if (rect.top <= 150) {
            currentId = item.id;
          } else {
            break;
          }
        }
      }
      setActiveHeading(currentId);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    // Initial check
    setTimeout(handleScroll, 100);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [toc, active]);

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

  const jump = (id: string) => {
    setActive(id);
    setDrawerOpen(false);
    const section = DOCS_SECTIONS.find((s) => s.id === id);
    const group = section?.group.toLowerCase().replace(/\s+/g, "-") ?? "";
    window.history.replaceState(null, "", `/docs?q=${encodeURIComponent(group)}#${id}`);
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
      `}} />

      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div onClick={() => setDrawerOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} />
      )}
      
      {/* Mobile Sidebar */}
      <div className="docs-drawer lg:hidden" style={{ position: "fixed", top: 0, left: 0, bottom: 0, width: 280, zIndex: 201, background: "var(--bg2)", borderRight: "1px solid var(--border)", padding: "80px 20px 40px", transform: drawerOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)", overflowY: "auto" }}>
        <SidebarContent active={active} groups={groups} onJump={jump} />
      </div>

      {/* Mobile FAB */}
      <button className="docs-fab lg:hidden" onClick={() => setDrawerOpen(true)} style={{ position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", zIndex: 199, display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", background: "#0A0A0A", borderRadius: 100, color: "white", fontSize: 12, fontWeight: 600 }}>
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FF87" }} />
        {activeLabel}
      </button>

      {/* Desktop Sidebar */}
      <aside className="docs-sidebar hidden lg:block" style={{ position: "fixed", left: 0, width: 280, top: 60, height: "calc(100vh - 60px)", overflowY: "auto", borderRight: "1px solid var(--border)", padding: "32px 24px" }}>
        <SidebarContent active={active} groups={groups} onJump={jump} />
      </aside>

      {/* Main Layout Grid */}
      <div className="docs-layout grid grid-cols-1 lg:grid-cols-[280px_1fr] xl:grid-cols-[280px_1fr_260px]" style={{ minHeight: "100vh" }}>
        <div className="hidden lg:block" />
        <main ref={contentRef} className="docs-content" style={{ padding: "80px 40px 120px", width: "100%", maxWidth: "900px", margin: "0 auto", minHeight: "80vh", display: "flex", flexDirection: "column" }}>
          
          <div key={active} className="docs-section animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ flex: 1 }}>
            <Breadcrumb items={[DOCS_SECTIONS.find(s => s.id === active)?.group || "Docs", activeLabel]} />
            {isLoading && !docsCache[active] ? (
              <div style={{ padding: "40px 0", color: "#999", fontSize: 14 }}>Loading...</div>
            ) : content ? (
              <MarkdownRenderer content={content} />
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
                    <svg width="20" height="8" viewBox="0 0 24 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 9C2 9 6 1 12 1C18 1 22 9 22 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button onClick={() => handleFeedback(active, "neutral")} className={`feedback-btn flex items-center justify-center w-10 h-10 rounded-full ${userReaction === "neutral" ? "active" : ""}`} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <div className="line" style={{ width: 14, height: 2, background: "currentColor", borderRadius: 1 }} />
                  </button>
                  <button onClick={() => handleFeedback(active, "smile")} className={`feedback-btn flex items-center justify-center w-10 h-10 rounded-full ${userReaction === "smile" ? "active" : ""}`} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <svg width="20" height="8" viewBox="0 0 24 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M2 1C2 1 6 9 12 9C18 9 22 1 22 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#999999", fontWeight: 400, letterSpacing: "0.01em" }}>
                Your feedback helps us improve the platform.
              </div>
            </div>
          </div>
        </main>

        {/* Right Sidebar (Table of Contents) */}
        <aside className="hidden xl:block" style={{ position: "sticky", top: 60, height: "calc(100vh - 60px)", padding: "32px 24px", overflowY: "auto" }}>
          {toc.length > 0 && (
            <div>
              <div style={{ fontSize: 13, fontWeight: 400, color: "#999", marginBottom: 16 }}>On this page</div>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                {toc.map(item => {
                  const isActive = activeHeading === item.id;
                  return (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                          setActiveHeading(item.id);
                        }}
                        style={{
                          fontSize: 13,
                          color: isActive ? "#007F6A" : "#666",
                          fontWeight: isActive ? 500 : 400,
                          textDecoration: "none",
                          transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                          display: "inline-block",
                          transform: isActive ? "translateX(4px)" : "none"
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
      </div>
    </>
  );
}