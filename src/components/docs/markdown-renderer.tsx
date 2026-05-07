"use client";

import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import mermaid from "mermaid";

// Initialize Mermaid
if (typeof window !== "undefined") {
  mermaid.initialize({
    startOnLoad: true,
    theme: "neutral",
    securityLevel: "loose",
    fontFamily: "var(--font-sans)",
  });
}

const Mermaid = ({ chart }: { chart: string }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current && chart) {
      ref.current.removeAttribute("data-processed");
      mermaid.contentLoaded();
    }
  }, [chart]);

  return (
    <div className="mermaid" ref={ref} style={{ margin: "24px 0", display: "flex", justifyContent: "center" }}>
      {chart}
    </div>
  );
};

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h1: ({ children }) => (
            <h1 className="docs-h1" style={{ fontSize: "clamp(32px, 4vw, 42px)", fontWeight: 600, letterSpacing: "-0.04em", marginBottom: 24, lineHeight: 1.1, color: "#1B1B1B" }}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="docs-h2" style={{ fontSize: 24, fontWeight: 600, marginBottom: 16, marginTop: 48, letterSpacing: "-0.02em", color: "#1B1B1B" }}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="docs-h3" style={{ fontSize: 13, fontWeight: 700, marginBottom: 12, marginTop: 32, color: "#007F6A", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="docs-p" style={{ fontSize: 15, color: "#4A4A4A", lineHeight: 1.7, marginBottom: 20 }}>
              {children}
            </p>
          ),
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const isMermaid = match && match[1] === "mermaid";

            if (isMermaid) {
              return <Mermaid chart={String(children).replace(/\n$/, "")} />;
            }

            return !inline && match ? (
              <div style={{ margin: "24px 0", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)" }}>
                <SyntaxHighlighter
                  style={oneLight}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: "20px",
                    fontSize: "13px",
                    background: "#FAFAFA",
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                style={{
                  background: "rgba(0,0,0,0.04)",
                  padding: "2px 6px",
                  borderRadius: 4,
                  fontSize: 13,
                  color: "#1B1B1B",
                  fontFamily: "var(--font-mono)",
                  fontWeight: 500,
                }}
                {...props}
              >
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <div className="docs-callout" style={{
              border: "1px solid var(--border-em)",
              background: "rgba(0,255,135,0.04)",
              borderRadius: 12,
              margin: "24px 0",
              padding: "16px 20px",
              display: "flex",
              gap: 12
            }}>
              <span style={{ fontSize: 16 }}>🔐</span>
              <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "#2D2D2D" }}>{children}</div>
            </div>
          ),
          table: ({ children }) => (
            <div className="docs-table-wrap" style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", margin: "28px 0" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th style={{ padding: "14px 20px", fontSize: 11, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "#666666", textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.08)", background: "#FAFAFA" }}>
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td style={{ padding: "16px 20px", fontSize: 14, verticalAlign: "top", lineHeight: 1.6, color: "#4A4A4A" }}>
              {children}
            </td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
