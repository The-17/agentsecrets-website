"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { CodeWindow, McpJsonWindow } from "@/components/ui/code-window";
import MarkdownRenderer from "./markdown-renderer";
import SearchPill from "./search-pill";
import { getDocContent, submitFeedback } from "@/app/actions/docs";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const DOCS_SECTIONS = [
  // Getting Started
  { id: "what-is-agentsecrets", group: "Getting Started", label: "What is AgentSecrets?" },
  { id: "zero-knowledge-difference", group: "Getting Started", label: "The Zero-Knowledge Difference" },
  { id: "how-it-works", group: "Getting Started", label: "How AgentSecrets Works" },
  { id: "installation", group: "Getting Started", label: "Installation" },
  { id: "quick-start", group: "Getting Started", label: "Quick Start" },
  { id: "migrate-from-env", group: "Getting Started", label: "Migrating from .env Files" },
  { id: "migrate-from-vault", group: "Getting Started", label: "Migrating from Vault / AWS" },
  { id: "migrate-from-dotenv-vault", group: "Getting Started", label: "Migrating from dotenv-vault" },
  { id: "production-checklist", group: "Getting Started", label: "Production Checklist" },

  // Fundamental Concepts
  { id: "concepts/credential-exposure", group: "Fundamental Concepts", label: "Credential Exposure" },
  { id: "concepts/zero-knowledge", group: "Fundamental Concepts", label: "What Zero-Knowledge Means" },
  { id: "concepts/proxy-model", group: "Fundamental Concepts", label: "The Proxy Model" },
  { id: "concepts/secrets-projects-workspaces", group: "Fundamental Concepts", label: "The Three-Layer Model" },
  { id: "concepts/environments", group: "Fundamental Concepts", label: "Environments" },
  { id: "concepts/agent-identity", group: "Fundamental Concepts", label: "Agent Identity" },
  { id: "concepts/storage-modes", group: "Fundamental Concepts", label: "Storage Modes" },
  { id: "concepts/no-get-method", group: "Fundamental Concepts", label: "The No get() Principle" },

  // Secrets
  { id: "secrets/managing", group: "Secrets", label: "Managing Secrets" },
  { id: "secrets/push", group: "Secrets", label: "Pushing to Cloud Sync" },
  { id: "secrets/pull", group: "Secrets", label: "Pulling from Cloud Sync" },
  { id: "secrets/diff", group: "Secrets", label: "Diffing Secrets" },
  { id: "secrets/import-env", group: "Secrets", label: "Importing from .env" },
  { id: "secrets/rotation", group: "Secrets", label: "Secret Rotation (Soon)" },

  // Environments
  { id: "environments/overview", group: "Environments", label: "Environments Overview" },
  { id: "environments/switch", group: "Environments", label: "Switching Environments" },
  { id: "environments/list", group: "Environments", label: "Listing & Coverage" },
  { id: "environments/copy", group: "Environments", label: "Copying an Environment" },
  { id: "environments/merge", group: "Environments", label: "Merging Environments" },
  { id: "environments/clean", group: "Environments", label: "Cleaning an Environment" },

  // The Credential Proxy
  { id: "proxy/overview", group: "The Credential Proxy", label: "Proxy Overview" },
  { id: "proxy/start-stop", group: "The Credential Proxy", label: "Starting and Stopping" },
  { id: "proxy/injection", group: "The Credential Proxy", label: "How Injection Works" },
  { id: "proxy/injection-styles", group: "The Credential Proxy", label: "Auth Injection Styles" },
  { id: "proxy/domain-allowlist", group: "The Credential Proxy", label: "Domain Allowlist" },
  { id: "proxy/response-redaction", group: "The Credential Proxy", label: "Response Body Redaction" },
  { id: "proxy/ssrf-protection", group: "The Credential Proxy", label: "SSRF Protection" },
  { id: "proxy/session-token", group: "The Credential Proxy", label: "Session Token Auth" },
  { id: "proxy/logs", group: "The Credential Proxy", label: "Proxy Logs" },
  { id: "proxy/http-clients", group: "The Credential Proxy", label: "Using with HTTP Clients" },
  { id: "proxy/performance", group: "The Credential Proxy", label: "Performance & Latency" },

  // Environment Variable Injection
  { id: "env-injection/overview", group: "Env Injection", label: "How it Works" },
  { id: "env-injection/any-process", group: "Env Injection", label: "Injecting into Any Process" },
  { id: "env-injection/proxy-vs-env", group: "Env Injection", label: "Proxy vs env Injection" },

  // Workspaces & Teams
  { id: "workspaces/overview", group: "Workspaces & Teams", label: "Workspaces Overview" },
  { id: "workspaces/create", group: "Workspaces & Teams", label: "Creating a Workspace" },
  { id: "workspaces/invite", group: "Workspaces & Teams", label: "Inviting Team Members" },
  { id: "workspaces/roles", group: "Workspaces & Teams", label: "Roles and Permissions" },
  { id: "workspaces/onboarding", group: "Workspaces & Teams", label: "Onboarding a Developer" },
  { id: "workspaces/revoke", group: "Workspaces & Teams", label: "Revoking Access" },
  { id: "workspaces/multiple", group: "Workspaces & Teams", label: "Multiple Workspaces" },

  // Projects
  { id: "projects/overview", group: "Projects", label: "Projects Overview" },
  { id: "projects/create", group: "Projects", label: "Creating a Project" },
  { id: "projects/switch", group: "Projects", label: "Switching Between Projects" },
  { id: "projects/update-delete", group: "Projects", label: "Updating and Deleting" },
  { id: "projects/invites", group: "Projects", label: "Project Invites" },
  { id: "projects/organizing", group: "Projects", label: "Organizing Projects" },

  // Agent Identity
  { id: "agent-identity/overview", group: "Agent Identity", label: "Identity Overview" },
  { id: "agent-identity/anonymous", group: "Agent Identity", label: "Anonymous Agents" },
  { id: "agent-identity/declared", group: "Agent Identity", label: "Declared Identity" },
  { id: "agent-identity/tokens-issue", group: "Agent Identity", label: "Cryptographic Tokens" },
  { id: "agent-identity/token-lifecycle", group: "Agent Identity", label: "Token Lifecycle" },
  { id: "agent-identity/multi-agent", group: "Agent Identity", label: "Multi-Agent Systems" },
  { id: "agent-identity/auditing", group: "Agent Identity", label: "Auditing by Identity" },
  { id: "agent-identity/anonymous-gaps", group: "Agent Identity", label: "Finding Coverage Gaps" },

  // Audit & Governance
  { id: "audit/overview", group: "Audit & Governance", label: "Audit Log Overview" },
  { id: "audit/reading", group: "Audit & Governance", label: "Reading and Filtering" },
  { id: "audit/summary", group: "Audit & Governance", label: "Log Summary" },
  { id: "audit/export", group: "Audit & Governance", label: "Exporting Logs (CSV)" },
  { id: "audit/detail", group: "Audit & Governance", label: "Log Detail" },
  { id: "audit/compliance", group: "Audit & Governance", label: "Using for Compliance" },

  // Integrations
  { id: "integrations/overview", group: "Integrations", label: "Integrations Overview" },
  { id: "integrations/claude-desktop", group: "Integrations", label: "Claude Desktop" },
  { id: "integrations/cursor", group: "Integrations", label: "Cursor" },
  { id: "integrations/openclaw", group: "Integrations", label: "OpenClaw" },
  { id: "integrations/http-proxy", group: "Integrations", label: "HTTP Proxy (Any)" },
  { id: "integrations/langchain-native", group: "Integrations", label: "LangChain (Soon)" },
  { id: "integrations/crewai-native", group: "Integrations", label: "CrewAI (Soon)" },
  { id: "integrations/cicd", group: "Integrations", label: "CI/CD Pipeline" },

  // SDK
  { id: "sdk/overview", group: "SDK", label: "SDK Overview" },
  { id: "sdk/python", group: "SDK", label: "Python SDK" },
  { id: "sdk/python-reference", group: "SDK", label: "Python API Reference" },
  { id: "sdk/javascript", group: "SDK", label: "JavaScript SDK (Soon)" },
  { id: "sdk/zero-knowledge-mcp", group: "SDK", label: "ZK MCP Server" },

  // API & Backend
  { id: "api/overview", group: "API & Backend", label: "Backend Overview" },
  { id: "api/architecture", group: "API & Backend", label: "API Architecture" },
  { id: "api/authentication", group: "API & Backend", label: "Authentication" },
  { id: "api/workspaces", group: "API & Backend", label: "Workspaces API" },
  { id: "api/projects", group: "API & Backend", label: "Projects API" },
  { id: "api/secrets", group: "API & Backend", label: "Secrets API" },
  { id: "api/environments", group: "API & Backend", label: "Environments API" },
  { id: "api/agent-identity", group: "API & Backend", label: "Agent Identity API" },
  { id: "api/audit", group: "API & Backend", label: "Audit Log API" },
  { id: "api/reference", group: "API & Backend", label: "API Reference (Swagger)" },

  // Guides
  { id: "guides/guide", group: "Guides", label: "Guides Overview" },
  { id: "guides/stripe", group: "Guides", label: "Stripe Integration" },
  { id: "guides/openai", group: "Guides", label: "OpenAI Integration" },
  { id: "guides/multi-agent", group: "Guides", label: "Multi-Agent Setup" },
  { id: "guides/onboarding-developer", group: "Guides", label: "Onboarding Team" },
  { id: "guides/cicd", group: "Guides", label: "CI/CD Pipeline" },
  { id: "guides/build-zk-mcp", group: "Guides", label: "Publishing ZK MCP" },
  { id: "guides/rotate-credential", group: "Guides", label: "Rotating Credentials" },
  { id: "guides/audit-team", group: "Guides", label: "Auditing Team Activity" },
  { id: "guides/dev-to-production", group: "Guides", label: "Dev to Production" },
  { id: "guides/monorepo", group: "Guides", label: "Monorepo Setup" },

  // Security
  { id: "security/overview", group: "Security", label: "Security Overview" },
  { id: "security/encryption", group: "Security", label: "Encryption Model" },
  { id: "security/cloud-sync", group: "Security", label: "Zero-Knowledge Sync" },
  { id: "security/proxy-layers", group: "Security", label: "Proxy Security Layers" },
  { id: "security/threat-model", group: "Security", label: "Threat Model" },
  { id: "security/faq", group: "Security", label: "Security FAQ" },
  { id: "security/audit-status", group: "Security", label: "Third-Party Audit" },
  { id: "security/reporting", group: "Security", label: "Reporting Vulnerabilities" },

  // Comparisons
  { id: "comparisons/vs-env-files", group: "Comparisons", label: "vs .env Files" },
  { id: "comparisons/vs-vault", group: "Comparisons", label: "vs HashiCorp Vault" },
  { id: "comparisons/vs-aws-secrets-manager", group: "Comparisons", label: "vs AWS Secrets Manager" },
  { id: "comparisons/vs-dotenv-vault", group: "Comparisons", label: "vs dotenv-vault" },
  { id: "comparisons/vs-infisical", group: "Comparisons", label: "vs Infisical" },
  { id: "comparisons/when-not-to-use", group: "Comparisons", label: "When Not to Use" },

  // Troubleshooting
  { id: "troubleshooting/proxy-not-starting", group: "Troubleshooting", label: "Proxy Not Starting" },
  { id: "troubleshooting/proxy-not-resolving", group: "Troubleshooting", label: "Proxy Not Resolving" },
  { id: "troubleshooting/domain-blocked", group: "Troubleshooting", label: "Domain Blocked" },
  { id: "troubleshooting/sync-conflicts", group: "Troubleshooting", label: "Sync Conflicts" },
  { id: "troubleshooting/mcp", group: "Troubleshooting", label: "MCP Not Connecting" },
  { id: "troubleshooting/session-token", group: "Troubleshooting", label: "Session Token Errors" },
  { id: "troubleshooting/installation", group: "Troubleshooting", label: "Installation Issues" },

  // FAQ
  { id: "faq", group: "FAQ", label: "Frequently Asked Questions" },

  // Changelog
  { id: "changelog/v1-2-0", group: "Changelog", label: "v1.2.0" },
  { id: "changelog/v1-1-x", group: "Changelog", label: "v1.1.x" },
  { id: "changelog/v1-0-x", group: "Changelog", label: "v1.0.x" },

  // CLI Reference
  { id: "cli/account", group: "CLI Reference", label: "init / login / logout" },
  { id: "cli/secrets", group: "CLI Reference", label: "secrets" },
  { id: "cli/environment", group: "CLI Reference", label: "environment" },
  { id: "cli/workspace", group: "CLI Reference", label: "workspace" },
  { id: "cli/project", group: "CLI Reference", label: "project" },
  { id: "cli/proxy", group: "CLI Reference", label: "proxy" },
  { id: "cli/call", group: "CLI Reference", label: "call" },
  { id: "cli/mcp", group: "CLI Reference", label: "mcp" },
  { id: "cli/env", group: "CLI Reference", label: "env" },
  { id: "cli/log", group: "CLI Reference", label: "log" },
  { id: "cli/agent", group: "CLI Reference", label: "agent" },
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
                padding: "4px 12px", 
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
                          marginBottom: children.length > 0 && isParentOrChildActive ? 4 : 2,
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

                      {children.length > 0 && isParentOrChildActive && (
                        <div style={{ paddingLeft: 16, marginBottom: 8 }}>
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
                                  padding: "6px 12px",
                                  borderRadius: 8,
                                  fontSize: 12,
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
                              </button>
                            );
                          })}
                        </div>
                      )}
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
  useEffect(() => {
    let isMounted = true;
    const loadContent = async () => {
      // Instant render if cached
      if (docsCache[active]) {
        setContent(docsCache[active]);
        setIsLoading(false);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setIsLoading(true);
        const data = await getDocContent(active);
        if (isMounted) {
          if (data) docsCache[active] = data;
          setContent(data);
          setIsLoading(false);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }
      }

      // After active content is rendered, prewarm nearby sections
      if (isMounted) {
        const currentIndex = DOCS_SECTIONS.findIndex(s => s.id === active);
        const currentGroup = DOCS_SECTIONS[currentIndex]?.group;

        // Priority 1: Adjacent sections (prev/next) — load immediately
        const adjacent = [
          currentIndex > 0 ? DOCS_SECTIONS[currentIndex - 1] : null,
          currentIndex < DOCS_SECTIONS.length - 1 ? DOCS_SECTIONS[currentIndex + 1] : null,
        ].filter(Boolean) as typeof DOCS_SECTIONS;
        
        for (const s of adjacent) {
          if (!docsCache[s.id]) {
            getDocContent(s.id).then(data => { if (data) docsCache[s.id] = data; });
          }
        }

        // Priority 2: Same group — load after a short delay
        setTimeout(() => {
          if (!isMounted) return;
          const sameGroup = DOCS_SECTIONS.filter(s => s.group === currentGroup && s.id !== active);
          for (const s of sameGroup) {
            if (!docsCache[s.id]) {
              getDocContent(s.id).then(data => { if (data) docsCache[s.id] = data; });
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
                getDocContent(s.id).then(data => { if (data) docsCache[s.id] = data; });
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
      
      <SearchPill onMenuClick={() => setDrawerOpen(true)} />
    </>
  );
}