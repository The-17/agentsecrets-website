"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import SearchPill from "./search-pill";
import { DOCS_SECTIONS } from "@/lib/docs-sections";

interface SidebarContentProps {
  active: string;
  groups: string[];
  onLinkClick?: () => void;
}

function SidebarContent({ active, groups, onLinkClick }: SidebarContentProps) {
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
                      <Link
                        href={`/docs/${s.id}`}
                        onClick={onLinkClick}
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
                          fontWeight: isActive ? 500 : 400,
                          textDecoration: "none"
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
                      </Link>

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
                                <Link
                                  key={child.id}
                                  href={`/docs/${child.id}`}
                                  onClick={onLinkClick}
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
                                    fontWeight: isChildActive ? 500 : 400,
                                    textDecoration: "none"
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
                                </Link>
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

export default function DocsLayoutWrapper({ children }: { children: React.ReactNode }) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Compute the active section ID based on the pathname
  const active = pathname.replace(/^\/docs\/?/, "") || "what-is-agentsecrets";
  const groups = [...new Set(DOCS_SECTIONS.map((s) => s.group))];

  const handleLinkClick = () => {
    setDrawerOpen(false);
  };

  const handleNavigate = (sectionId: string, headingId?: string) => {
    setDrawerOpen(false);
    const hash = headingId ? `#${headingId}` : "";
    router.push(`/docs/${sectionId}${hash}`);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
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
        <div 
          onClick={() => setDrawerOpen(false)} 
          style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }} 
        />
      )}
      
      {/* Mobile Sidebar */}
      <div 
        className="docs-drawer lg:hidden" 
        style={{ 
          position: "fixed", top: 0, left: 0, bottom: 0, width: 280, zIndex: 201, 
          background: "#FFFFFF", borderRight: "1px solid rgba(0,0,0,0.08)", 
          padding: "80px 20px 40px", 
          transform: drawerOpen ? "translateX(0)" : "translateX(-100%)", 
          transition: "transform 0.28s cubic-bezier(0.32, 0.72, 0, 1)", 
          overflowY: "auto" 
        }}
      >
        <SidebarContent active={active} groups={groups} onLinkClick={handleLinkClick} />
      </div>

      {/* Desktop Sidebar */}
      <aside 
        className="docs-sidebar hidden lg:block" 
        style={{ 
          position: "fixed", left: 0, width: 280, top: 60, height: "calc(100vh - 60px)", 
          overflowY: "auto", borderRight: "1px solid var(--border)", 
          padding: "32px 8px 32px 20px" 
        }}
      >
        <SidebarContent active={active} groups={groups} />
      </aside>

      {/* Main layout containing the dynamic page children */}
      {children}

      {/* Persistent Floating Search Pill */}
      <SearchPill onMenuClick={() => setDrawerOpen(true)} onNavigate={handleNavigate} />
    </>
  );
}
