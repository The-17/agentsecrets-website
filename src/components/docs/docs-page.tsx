"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { CodeWindow, McpJsonWindow } from "@/components/ui/code-window";
import MarkdownRenderer from "./markdown-renderer";
import { getDocContent } from "@/app/actions/docs";

const DOCS_SECTIONS = [
  { id: "overview",      group: "Introduction",  label: "Overview" },
  { id: "quickstart",    group: "Introduction",  label: "Getting Started" },
  { id: "howworks",      group: "Core Concepts", label: "How It Works" },
  { id: "keychain",      group: "Core Concepts", label: "OS Keychain" },
  { id: "zerok",         group: "Core Concepts", label: "Zero-Knowledge Design" },
  { id: "allowlist",     group: "Core Concepts", label: "Domain Allowlist" },
  { id: "redaction",     group: "Core Concepts", label: "Response Redaction" },
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

export default function DocsPage() {
  const [active, setActive] = useState("overview");
  const [content, setContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();

  const buildUrl = (id: string) => {
    const section = DOCS_SECTIONS.find((s) => s.id === id);
    const group = section?.group.toLowerCase().replace(/\s+/g, "-") ?? "";
    return `/docs?q=${encodeURIComponent(group)}#${id}`;
  };

  // Resolve section from URL
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && DOCS_SECTIONS.find((s) => s.id === hash)) {
      setActive(hash);
    }
  }, [searchParams]);

  // Load content when active section changes
  useEffect(() => {
    let isMounted = true;
    const loadContent = async () => {
      setIsLoading(true);
      const data = await getDocContent(active);
      if (isMounted) {
        setContent(data);
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    };
    loadContent();
    return () => { isMounted = false; };
  }, [active]);

  const jump = (id: string) => {
    setActive(id);
    setDrawerOpen(false);
    window.history.replaceState(null, "", buildUrl(id));
  };

  const groups = [...new Set(DOCS_SECTIONS.map((s) => s.group))];
  const activeLabel = DOCS_SECTIONS.find((s) => s.id === active)?.label ?? "Docs";

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {drawerOpen && (
        <div 
          onClick={() => setDrawerOpen(false)} 
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} 
        />
      )}
      
      {/* Mobile Sidebar (Drawer) */}
      <div 
        className="docs-drawer lg:hidden" 
        style={{ 
          position: "fixed", top: 0, left: 0, bottom: 0, width: 280, zIndex: 201, 
          background: "var(--bg2)", borderRight: "1px solid var(--border)", 
          padding: "80px 20px 40px", 
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)", 
          transition: "transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)", 
          overflowY: "auto" 
        }}
      >
        <SidebarContent active={active} groups={groups} onJump={jump} />
      </div>

      {/* Mobile FAB */}
      <button 
        className="docs-fab lg:hidden" 
        onClick={() => setDrawerOpen(true)} 
        style={{ 
          position: "fixed", bottom: 24, left: "50%", transform: "translateX(-50%)", 
          zIndex: 199, display: "flex", alignItems: "center", gap: 8, padding: "10px 18px", 
          background: "#0A0A0A", borderRadius: 100, color: "white", fontSize: 12, fontWeight: 600 
        }}
      >
        <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#00FF87" }} />
        {activeLabel}
      </button>

      {/* Desktop Sidebar (Fixed) */}
      <aside 
        className="docs-sidebar hidden lg:block" 
        style={{ 
          position: "fixed", left: 0, width: 280, top: 60, height: "calc(100vh - 60px)", 
          overflowY: "auto", borderRight: "1px solid var(--border)", padding: "32px 24px" 
        }}
      >
        <SidebarContent active={active} groups={groups} onJump={jump} />
      </aside>

      {/* Main Layout Grid */}
      <div className="docs-layout" style={{ display: "grid", gridTemplateColumns: "280px 1fr", minHeight: "100vh" }}>
        <div className="hidden lg:block" /> {/* Grid spacer */}
        
        <main ref={contentRef} className="docs-content" style={{ padding: "80px 40px 120px", maxWidth: "1000px", minHeight: "80vh", display: "flex", flexDirection: "column" }}>
          
          <div key={active} className="docs-section animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ flex: 1 }}>
            <Breadcrumb items={[DOCS_SECTIONS.find(s => s.id === active)?.group || "Docs", activeLabel]} />
            
            {isLoading ? (
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
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#1B1B1B" }}>‹ {prev.label}</div>
                  </button>
                ) : <div />;
              })()}
              {(() => {
                const currentIndex = DOCS_SECTIONS.findIndex(s => s.id === active);
                const next = currentIndex < DOCS_SECTIONS.length - 1 ? DOCS_SECTIONS[currentIndex + 1] : null;
                return next ? (
                  <button onClick={() => jump(next.id)} style={{ textAlign: "right", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                    <div style={{ fontSize: 11, color: "#999", marginBottom: 4 }}>Next</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#1B1B1B" }}>{next.label} ›</div>
                  </button>
                ) : <div />;
              })()}
            </div>

            {/* Helpful Feedback Pill */}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div style={{ background: "#0A0A0A", borderRadius: 100, padding: "12px 24px", display: "flex", alignItems: "center", gap: 16, border: "1px solid rgba(255,255,255,0.1)", boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>Was this helpful?</span>
                <div style={{ display: "flex", gap: 12 }}>
                  {["😭", "☹️", "😐", "🤩"].map((emoji, i) => (
                    <button key={i} className="hover:scale-125 transition-transform" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 16, padding: 0 }}>{emoji}</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}