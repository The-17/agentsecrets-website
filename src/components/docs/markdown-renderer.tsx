"use client";

import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import mermaid from "mermaid";

if (typeof window !== "undefined") {
  mermaid.initialize({
    startOnLoad: false,
    theme: "base",
    themeVariables: {
      primaryColor: "#00FF87",
      primaryTextColor: "#FFFFFF",
      primaryBorderColor: "#00FF87",
      lineColor: "#FFFFFF",
      secondaryColor: "#007F6A",
      tertiaryColor: "#0A0A0A",
      mainBkg: "#111111",
      nodeBorder: "#00FF87",
      clusterBkg: "#1A1A1A",
      titleColor: "#FFFFFF",
    },
    fontFamily: "var(--font-sans)",
  });
}

const Mermaid = ({ chart }: { chart: string }) => {
  const [svg, setSvg] = useState<string>("");

  useEffect(() => {
    let isMounted = true;
    const renderChart = async () => {
      try {
        const id = `mermaid-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        const { svg } = await mermaid.render(id, chart);
        if (isMounted) setSvg(svg);
      } catch (err) {
        console.error("Mermaid rendering failed", err);
      }
    };
    renderChart();
    return () => { isMounted = false; };
  }, [chart]);

  if (!svg) return <div className="mermaid-loading">Loading diagram...</div>;
  return <div className="mermaid-wrap" dangerouslySetInnerHTML={{ __html: svg }} />;
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="code-copy-btn"
      aria-label="Copy code"
      title="Copy code"
    >
      {copied ? (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#007F6A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
      )}
    </button>
  );
};

export default function MarkdownRenderer({ content, id: sectionId }: { content: string; id: string }) {
  const [progress, setProgress] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem("agentsecrets_progress");
    if (saved) {
      try { setProgress(JSON.parse(saved)); } catch (e) { console.error(e); }
    }
  }, []);

  const toggleCheckbox = (cbId: string) => {
    const newProgress = { ...progress, [cbId]: !progress[cbId] };
    setProgress(newProgress);
    localStorage.setItem("agentsecrets_progress", JSON.stringify(newProgress));
  };

  return (
    <div className="markdown-body">
      <style>{`
        .markdown-body {
          color: #2D2D2D;
          font-size: 15px;
          line-height: 1.7;
        }
        .markdown-body h1 { font-size: clamp(32px, 4vw, 42px); font-weight: 600; letter-spacing: -0.04em; margin-bottom: 24px; line-height: 1.25; color: #1B1B1B; }
        .markdown-body h2 { font-size: 28px; font-weight: 700; margin-bottom: 16px; margin-top: 48px; letter-spacing: -0.03em; color: #1B1B1B; scroll-margin-top: 100px; line-height: 1.3; }
        .markdown-body h3 { font-size: 20px; font-weight: 600; margin-bottom: 12px; margin-top: 32px; color: #1B1B1B; letter-spacing: -0.02em; scroll-margin-top: 100px; }
        .markdown-body p { margin-bottom: 20px; }
        .markdown-body a { color: #007F6A; text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 2px; }
        .markdown-body ul { list-style-type: disc; padding-left: 24px; margin-bottom: 20px; }
        .markdown-body ol { list-style-type: decimal; padding-left: 24px; margin-bottom: 20px; }
        .markdown-body li { margin-bottom: 8px; }
        .markdown-body strong { font-weight: 600; color: #1B1B1B; }
        .markdown-body blockquote { border: 1px solid var(--border-em, rgba(0,0,0,0.08)); background: rgba(0,255,135,0.04); border-radius: 12px; margin: 24px 0; padding: 16px 20px; }
        .markdown-body table { width: 100%; border-collapse: collapse; margin: 0; }
        .markdown-body th { padding: 14px 20px; font-size: 12px; font-weight: 600; color: #666; text-align: left; border-bottom: 1px solid rgba(0,0,0,0.08); background: #FAFAFA; }
        .markdown-body td { padding: 16px 20px; font-size: 14px; vertical-align: top; border-bottom: 1px solid rgba(0,0,0,0.04); }
        .markdown-body hr { border: none; height: 1px; background: rgba(0,0,0,0.06); margin: 40px 0; }
        .markdown-body .step-heading { display: flex; align-items: center; gap: 12px; scroll-margin-top: 100px; }
        .markdown-body .step-heading .step-number { display: flex; align-items: center; justify-content: center; width: 26px; height: 26px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.15); font-size: 13px; font-weight: 500; color: #666; flex-shrink: 0; font-variant-numeric: tabular-nums; }
        .markdown-body .checkbox-row { 
          display: flex; 
          align-items: flex-start; 
          gap: 12px; 
          margin-bottom: 12px; 
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 8px 12px;
          margin-left: -12px;
          border-radius: 8px;
          border: 1px solid transparent;
        }
        .markdown-body .checkbox-row:hover {
          background: rgba(0,255,135,0.05);
          border-color: rgba(0,127,106,0.08);
        }
        .markdown-body .checkbox-box {
          width: 18px; 
          height: 18px; 
          border-radius: 4px; 
          border: 1.5px solid rgba(0,0,0,0.15); 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          flex-shrink: 0; 
          margin-top: 2px;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .markdown-body .checkbox-row.checked .checkbox-box {
          background: #007F6A;
          border-color: #007F6A;
        }
        .markdown-body .checkbox-row.checked .checkbox-text {
          color: #999;
          text-decoration: line-through;
          text-decoration-color: rgba(0,0,0,0.2);
        }
        .mermaid-loading { padding: 40px; background: #111; border-radius: 12px; margin: 24px 0; color: #666; text-align: center; }
        .mermaid-wrap { margin: 32px 0; display: flex; justify-content: center; background: #0A0A0A; padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.05); }
        .code-block-wrapper { position: relative; margin: 24px 0; border-radius: 12px; overflow: hidden; border: 1px solid rgba(0,0,0,0.08); background: #FAFAFA; }
        .code-block-wrapper .code-copy-btn { position: absolute; top: 12px; right: 12px; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.04); border: 1px solid rgba(0,0,0,0.06); border-radius: 8px; color: #666; cursor: pointer; opacity: 0; transition: all 0.2s ease; z-index: 10; }
        .code-block-wrapper:hover .code-copy-btn { opacity: 1; }
        .code-block-wrapper .code-copy-btn:hover { background: white; color: #1B1B1B; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }
        .code-block-wrapper .code-copy-btn:active { transform: scale(0.95); }
      `}</style>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          h2({ children, ...props }: any) {
            let text = "";
            React.Children.forEach(children, (child) => { if (typeof child === "string") text += child; });
            const stepMatch = text.match(/^(?:(?:Step|Stage)\s+)?(\d+)(?:\s*[—:\-\.]\s+)(.*)$/i);
            const generatedId = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
            
            if (stepMatch) {
              return (
                <h2 id={generatedId} className="step-heading" {...props}>
                  <span className="step-number">{stepMatch[1]}</span>
                  {stepMatch[2]}
                </h2>
              );
            }
            return <h2 id={generatedId} {...props}>{children}</h2>;
          },
          h3({ children, ...props }: any) {
            let text = "";
            React.Children.forEach(children, (child) => { if (typeof child === "string") text += child; });
            const stepMatch = text.match(/^(?:(?:Step|Stage)\s+)?(\d+)(?:\s*[—:\-\.]\s+)(.*)$/i);
            const generatedId = text.toLowerCase().replace(/[^\w]+/g, '-').replace(/^-|-$/g, '');
            
            if (stepMatch) {
              return (
                <h3 id={generatedId} className="step-heading" {...props}>
                  <span className="step-number">{stepMatch[1]}</span>
                  {stepMatch[2]}
                </h3>
              );
            }
            return <h3 id={generatedId} {...props}>{children}</h3>;
          },
          p({ children }: any) {
            const childrenArray = React.Children.toArray(children);
            const containsCheckbox = childrenArray.some(
              (child) => typeof child === "string" && /\[[ x]\]/.test(child)
            );

            if (!containsCheckbox) return <p>{children}</p>;

            const prefix: React.ReactNode[] = [];
            const items: { content: React.ReactNode[] }[] = [];
            let currentItem: React.ReactNode[] | null = null;

            childrenArray.forEach((child) => {
              if (typeof child === "string") {
                const parts = child.split(/(\[[ x]\])/g);
                parts.forEach((part) => {
                  if (part === "[ ]" || part === "[x]") {
                    currentItem = [];
                    items.push({ content: currentItem });
                  } else if (currentItem) {
                    currentItem.push(part);
                  } else if (part) {
                    prefix.push(part);
                  }
                });
              } else {
                if (currentItem) currentItem.push(child);
                else prefix.push(child);
              }
            });

            return (
              <div style={{ marginBottom: 20 }}>
                {prefix.length > 0 && <p style={{ marginBottom: 12 }}>{prefix}</p>}
                {items.map((item, idx) => {
                  let contentText = "";
                  item.content.forEach(c => { if (typeof c === "string") contentText += c; });
                  if (!contentText.trim() && item.content.length === 0) return null;

                  const cbId = `${sectionId}:${contentText.trim().slice(0, 50).replace(/\s+/g, '-')}`;
                  const isChecked = progress[cbId] || false;

                  return (
                    <div 
                      key={`cb-${idx}`} 
                      className={`checkbox-row ${isChecked ? 'checked' : ''}`}
                      onClick={() => toggleCheckbox(cbId)}
                    >
                      <div className="checkbox-box">
                        {isChecked && (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        )}
                      </div>
                      <div className="checkbox-text" style={{ flex: 1 }}>{item.content}</div>
                    </div>
                  );
                })}
              </div>
            );
          },
          table({ children, ...props }: any) {
            return (
              <div style={{ margin: "28px 0", borderRadius: 12, overflow: "hidden", border: "1px solid rgba(0,0,0,0.08)", width: "100%", overflowX: "auto" }}>
                <table {...props}>{children}</table>
              </div>
            );
          },
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            if (match && match[1] === "mermaid") return <Mermaid chart={String(children).replace(/\n$/, "")} />;
            const isBlock = match || String(children).includes("\n");
            if (isBlock) {
              const codeString = String(children).replace(/\n$/, "");
              return (
                <div className="code-block-wrapper">
                  <CopyButton text={codeString} />
                  <SyntaxHighlighter
                    style={oneLight}
                    language={match ? match[1] : "text"}
                    PreTag="div"
                    wrapLines={true}
                    wrapLongLines={true}
                    customStyle={{ margin: 0, padding: "20px", fontSize: "13px", background: "transparent" }}
                    {...props}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              );
            }
            
            return (
              <code style={{ background: "rgba(0,127,106,0.08)", padding: "2px 6px", borderRadius: 4, fontSize: 13, color: "#007F6A", fontFamily: "var(--font-mono)", fontWeight: 500 }} {...props}>{children}</code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
