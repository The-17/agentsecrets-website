'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type IntegrationMethod = 'OpenClaw' | 'MCP' | 'AgentSecrets Env' | 'HTTP Proxy';

const INTEGRATION_METHODS: IntegrationMethod[] = [
  "OpenClaw",
  "MCP",
  "AgentSecrets Env",
  "HTTP Proxy"
];

const METHOD_CONTENT: Record<IntegrationMethod, { icon?: React.ReactNode; title: string; description: string; code: string }> = {
  "OpenClaw": {
    icon: (
      <svg width="48" height="48" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="20" cy="20" r="12" />
        <circle cx="16" cy="19" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="24" cy="19" r="1.5" fill="currentColor" stroke="none" />
        <path d="M16 9C16 7 14 6 12 7" />
        <path d="M24 9C24 7 26 6 28 7" />
        <path d="M8 18C6 17 4 18 4 20C4 22 6 23 8 22" />
        <path d="M32 18C34 17 36 18 36 20C36 22 34 23 32 22" />
        <path d="M17 31.5V35" />
        <path d="M23 31.5V35" />
      </svg>
    ),
    title: "Native OpenClaw\nSupport",
    description: "AgentSecrets ships as a native exec provider for OpenClaw's SecretRef system. When your workflow references a credential, OpenClaw calls the AgentSecrets binary directly to resolve it. The value is injected at execution time and never written to any OpenClaw config file.",
    code: "openclaw skill install agentsecrets\n \n# Or the exec provider directly:\nagentsecrets exec\n \n# agentsecrets reads SecretRef from stdin,\n# resolves the value, injects it.\n# The calling OpenClaw skill never sees the value."
  },
  "MCP": {
    icon: (
      <svg width="48" height="48" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 26L22 14C23.5 12.5 26.5 12.5 28 14L18 24C16.5 25.5 16.5 28.5 18 30L28 20C29.5 18.5 32.5 18.5 34 20L24 30" />
        <circle cx="21" cy="22" r="3" fill="currentColor" stroke="none" />
      </svg>
    ),
    title: "Claude Desktop\nand Cursor",
    description: "One command configures AgentSecrets as an MCP server for Claude Desktop and Cursor. Your credentials are resolved from the OS keychain at call time. No credential values in any config file.",
    code: "agentsecrets mcp install\n\n{\n  \"mcpServers\": {\n    \"agentsecrets\": {\n      \"command\": \"/usr/local/bin/agentsecrets\",\n      \"args\": [\"mcp\", \"serve\"]\n    }\n  }\n}"
  },
  "AgentSecrets Env": {
    icon: (
      <svg width="48" height="48" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="10" y="14" width="20" height="16" rx="2" />
        <path d="M20 18V22" />
        <circle cx="20" cy="24" r="1.5" fill="currentColor" stroke="none" />
        <path d="M14 14V10C14 8 16 7 20 7C24 7 26 8 26 10V14" />
      </svg>
    ),
    title: "Environment Variable\nInjection",
    description: "For tools that read credentials from environment variables — the Stripe CLI, Node servers, Django apps, any framework — wrap the process with `agentsecrets env`. Credentials are resolved from the OS keychain and injected into the child process at spawn time. Nothing is written to disk.",
    code: "agentsecrets env -- stripe mcp\n\nagentsecrets env -- node server.js\n\nagentsecrets env -- python manage.py runserver\n\nagentsecrets env -- npm run dev"
  },
  "HTTP Proxy": {
    icon: (
      <svg width="48" height="48" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="20" r="4" />
        <circle cx="28" cy="20" r="4" />
        <path d="M16 20H24" />
        <path d="M20 16L24 20L20 24" />
        <circle cx="20" cy="20" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
    title: "HTTP\nProxy",
    description: "Start the local proxy and route authenticated requests through it. Any agent, framework, or tool that makes HTTP calls works — LangChain, CrewAI, AutoGen, or a plain curl command. The proxy resolves credentials from the OS keychain and injects them at the transport layer.",
    code: "agentsecrets proxy start\n\ncurl http://localhost:8765/proxy \\\n  -H \"X-AS-Target-URL: https://api.stripe.com/v1/balance\" \\\n  -H \"X-AS-Inject-Bearer: STRIPE_KEY\"\n\n# All six auth styles supported\nX-AS-Inject-Bearer: KEY_NAME\nX-AS-Inject-Header: Header-Name=KEY_NAME\nX-AS-Inject-Query: param=KEY_NAME\nX-AS-Inject-Basic: KEY_NAME\nX-AS-Inject-Body-Field: path=KEY_NAME\nX-AS-Inject-Form-Field: field=KEY_NAME"
  }
};

const renderCodeLine = (line: string, i: number) => {
  if (line.trim().startsWith('#')) {
    return (
      <div key={i} style={{ color: '#7f848e', fontStyle: 'italic' }}>
        {line}
      </div>
    );
  }

  const html = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\b(agentsecrets|openclaw|curl|node|python|npm|brew|pip|go)\b/g, '<span style="color: #61afef; font-weight: 500;">$1</span>')
    .replace(/(^|\s)(-[HXD]|\-\-)\b/g, '$1<span style="color: #c678dd;">$2</span>')
    .replace(/("(\w+)")\s*:/g, '<span style="color: #e06c75;">$1</span>:')
    .replace(/("(.*?)")/g, '<span style="color: #98c379;">$1</span>');

  return (
    <div key={i} dangerouslySetInnerHTML={{ __html: html }} />
  );
};

export default function PlatformSection() {
  const [activeMethod, setActiveMethod] = React.useState(INTEGRATION_METHODS[0]);
  const containerRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const content = METHOD_CONTENT[activeMethod];

  useGSAP(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      }
    });

    tl.from(".reveal-label", {
      y: 30,
      opacity: 0,
      duration: 1.2,
      ease: 'expo.out'
    })
    .from(headingRef.current, {
      y: 40,
      opacity: 0,
      duration: 1.5,
      ease: 'expo.out'
    }, "-=0.9")
    .from(".reveal-pills-wrapper", {
      y: 30,
      opacity: 0,
      duration: 1.2,
      ease: 'expo.out'
    }, "-=1.1")
    .from(".reveal-content-wrapper", {
      y: 50,
      opacity: 0,
      duration: 1.8,
      ease: 'expo.out'
    }, "-=1.2");
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef}
      id='platform'
      className='w-full bg-white py-20 flex flex-col items-center justify-center scroll-mt-24'
    >
      <div className='w-full flex flex-col items-center'>
        
        <div className='w-full max-w-[1150px] mx-auto px-4 md:px-6 lg:px-8 flex flex-col items-center'>
          
          {/* Section Label */}
          <div className="reveal-label text-[10px] font-bold tracking-[0.15em] uppercase mb-8 text-[#007F6A]">
            PLATFORM — INTEGRATION
          </div>

          <h2 
            ref={headingRef}
            className='text-[clamp(28px,3.5vw,42px)] leading-[1.15] tracking-[-0.03em] text-[#1B1B1B] font-medium text-center w-full'
            style={{ fontFamily: 'var(--font-helvetica), sans-serif' }}
          >
            Use Agent Secrets in the<br />way that fits your stack
          </h2>

          <div className="h-16 md:h-20" />
        </div>

        {/* Integrations content area */}
        <div className="reveal-content-wrapper w-full">
          <div className='w-full bg-[#F5F5F7] pt-6 pb-6 md:pt-8 md:pb-8 border-y border-[#1B1B1B]/5 min-h-[600px] flex flex-col items-center'>
            <div className='w-full mx-auto px-4 md:px-6 lg:px-8 flex flex-col items-center'>
              
              {/* Integration Selection Pill */}
              <div className='reveal-pills bg-[#1B1B1B] p-1 rounded-full flex items-center gap-1 relative overflow-x-auto border border-[#1B1B1B]/10 mb-12 mt-0 shadow-lg max-w-full scrollbar-hide'>
                {INTEGRATION_METHODS.map((method) => {
                  const isActive = activeMethod === method;
                  return (
                    <button
                      key={method}
                      onClick={() => setActiveMethod(method)}
                      className={`relative shrink-0 px-4 sm:px-8 py-2 sm:py-2.5 rounded-full text-[11px] sm:text-[13px] font-bold tracking-tight transition-all duration-200 z-10 ${
                        isActive ? 'bg-[#5EEAD4] text-[#007F6A]' : 'text-white/40 hover:text-white'
                      }`}
                    >
                      {method.toUpperCase()}
                    </button>
                  );
                })}
              </div>
              
              {/* Substantial Spacer */}
              <div className="h-10 md:h-12" />

              {INTEGRATION_METHODS.map((method) => {
                const isSelected = activeMethod === method;
                const methodContent = METHOD_CONTENT[method];
                return (
                  <motion.div
                    key={method}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: isSelected ? 1 : 0, y: isSelected ? 0 : 10 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{ display: isSelected ? 'grid' : 'none' }}
                    className='w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-32 px-4 md:px-8 items-stretch min-h-0 lg:min-h-[450px]'
                  >
                    {/* Left: Text Content */}
                    <div className='flex flex-col justify-between text-left items-start max-w-[440px] h-full py-2'>
                      <div className="flex flex-col items-start">
                        {methodContent.icon && (
                          <>
                            <div className="text-[#007F6A]">
                              {methodContent.icon}
                            </div>
                            <div className="h-3 md:h-4" />
                          </>
                        )}
                        <h3 className='text-[24px] md:text-[32px] font-medium tracking-tight text-[#1B1B1B] leading-tight whitespace-pre-line'>
                          {methodContent.title}
                        </h3>
                        <div className="h-8 md:h-10" />
                        <p className='text-[16px] md:text-[18px] text-[#1B1B1B]/70 font-medium leading-relaxed max-w-[400px]'>
                          {methodContent.description}
                        </p>
                      </div>
                    </div>

                    {/* Right: Command Block */}
                    <div className='flex items-center justify-center'>
                      <div className='w-full bg-[#282c34] rounded-[16px] md:rounded-[24px] px-4 md:px-8 py-6 md:py-14 border border-[#3e4451] relative overflow-hidden group shadow-xl'>
                        <pre className='font-mono text-[11px] sm:text-[12px] md:text-[14px] leading-relaxed text-[#abb2bf] whitespace-pre-wrap break-all sm:break-words'>
                          <code>
                            {methodContent.code.split('\n').map((line, i) => renderCodeLine(line, i))}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </motion.div>
                );
              })}

            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

