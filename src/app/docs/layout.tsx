import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AgentSecrets Docs — How to Keep API Keys Hidden from AI Agents",
  description:
    "Learn how to safely give AI agents access to APIs without exposing your secrets. Step-by-step guides, quickstart, CLI reference, SDK docs, and MCP integration — all in one place.",
  keywords: [
    "AgentSecrets",
    "how to hide API keys from AI",
    "keep secrets safe with Claude",
    "AI agent API security",
    "how to use AI without sharing passwords",
    "secure API credentials for AI tools",
    "Claude Desktop setup guide",
    "MCP server secrets",
    "AI secrets manager",
    "zero-knowledge AI proxy",
    "Python SDK for AI agents",
    "CLI secrets manager",
    "agent credential guide",
  ],
  openGraph: {
    title: "AgentSecrets Docs — Keep Your API Keys Hidden from AI Agents",
    description:
      "Step-by-step docs on giving AI agents API access without ever revealing your credentials. Quickstart, integrations, CLI & SDK reference.",
    type: "website",
    url: "https://agentsecrets.theseventeen.co/docs",
  },
  alternates: {
    canonical: "https://agentsecrets.theseventeen.co/docs",
  },
};

import Nav from "@/components/nav";
import DocsLayoutWrapper from "@/components/docs/docs-layout-wrapper";

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="grid-bg" style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none" }} />
      <Nav page="docs" />
      <DocsLayoutWrapper>
        {children}
      </DocsLayoutWrapper>
    </>
  );
}
