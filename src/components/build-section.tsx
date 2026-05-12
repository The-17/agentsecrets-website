'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Layers, Blocks, ChevronRight } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const BUILD_CATEGORIES = [
  {
    id: "01",
    label: "SDKs & TOOLS",
    header: "Build with native speed",
    summary: "Integrate AgentSecrets directly into your application logic using our native libraries.",
    items: [
      {
        id: "sdk-python",
        title: "Native Python\nIntegration",
        description: "A native library to integrate AgentSecrets into your Django, FastAPI, or Flask applications. Complete support for all six auth styles.",
        icon: <Blocks size={48} strokeWidth={1.5} />,
        cta: "Get Started",
        status: "active"
      },
      {
        id: "sdk-js",
        title: "Modern JS/TS\nSDK",
        description: "Full support for Node.js, Bun, and browser environments. Secure credential injection for modern frontend and backend frameworks.",
        icon: <Layers size={48} strokeWidth={1.5} />,
        cta: "Coming Soon",
        status: "upcoming"
      }
    ]
  },
  {
    id: "02",
    label: "ECOSYSTEM",
    header: "Built on Agent Secrets",
    summary: "Explore tools and platforms built on top of our secure identity layer.",
    items: [
      {
        id: "mcp",
        title: "Zero-knowledge\nMCP",
        description: "Leverage the Model Context Protocol with full zero-knowledge security. Inject secrets into your MCP servers without ever exposing them to the host.",
        icon: (
          <svg width="48" height="48" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 20C12 15.5817 15.5817 12 20 12C24.4183 12 28 15.5817 28 20" />
            <path d="M12 20V28H28V20" />
            <circle cx="20" cy="20" r="2" fill="currentColor" stroke="none" />
            <path d="M20 8V12M8 20H12M28 20H32M20 28V32" strokeLinecap="round" />
          </svg>
        ),
        cta: "Explore MCP",
        status: "active"
      },
      {
        id: "dashboard",
        title: "Enterprise\nDashboard",
        description: "A premium interface to manage workspaces, rotated secrets, and real-time audit logs. Complete visibility into your agent's security posture.",
        icon: (
          <svg width="48" height="48" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="8" y="10" width="24" height="20" rx="2" />
            <path d="M8 16H32M14 24H18M22 24H26" />
          </svg>
        ),
        cta: "Coming Soon",
        status: "upcoming"
      }
    ]
  }
];

export default function BuildSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredIdx, setHoveredIdx] = React.useState<string | null>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    // Main Header Reveal
    gsap.from(".reveal-header", {
      opacity: 0,
      y: 60,
      duration: 1.5,
      ease: "expo.out",
      scrollTrigger: {
        trigger: ".reveal-header",
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    });

    // Category Specific Reveals
    BUILD_CATEGORIES.forEach((cat) => {
      const catTl = gsap.timeline({
        scrollTrigger: {
          trigger: `.reveal-category-${cat.id}`,
          start: "top 85%",
          toggleActions: "play none none reverse"
        }
      });

      catTl.from(`.reveal-category-${cat.id}`, {
        opacity: 0,
        y: 40,
        duration: 1.2,
        ease: "expo.out"
      })
      .from(`.reveal-card-${cat.id}`, {
        opacity: 0,
        y: 40,
        stagger: 0.15,
        duration: 1.5,
        ease: "expo.out"
      }, "-=0.8");
    });

  }, { scope: containerRef });

  return (
    <section id="build" ref={containerRef} className="w-full bg-white pt-8 pb-24 px-4 md:px-6 lg:px-8 scroll-mt-24">
      <div className="max-w-[1400px] mx-auto">
        
        {/* Content Container */}
        <div className="w-full relative pt-0 md:pt-4 lg:pt-8 pb-8 md:pb-16 lg:pb-20 px-4 md:px-16 lg:px-20">
          
          {/* Main Header */}
          <div className="reveal-header flex flex-col lg:flex-row lg:items-end justify-between gap-12">
            <div className="max-w-2xl">
              <div className="text-[10px] font-bold tracking-[0.15em] uppercase mb-8 text-[#007F6A]">
                PLATFORM — BUILD ON AGENT SECRETS
              </div>
              <h2 className="text-[clamp(28px,3.5vw,42px)] font-medium tracking-[-0.03em] leading-[1.15] text-[#1B1B1B]">
                Make Agent Secrets<br />
                <span className="text-[#0d9488]">part of your product</span>
              </h2>
            </div>
            <div className="max-w-[380px]">
              <p className="text-[16px] md:text-[18px] text-[#1B1B1B]/50 leading-relaxed lg:text-right">
                Use Agent Secrets as the base, then extend it to build the secure credentials layer your product needs.
              </p>
            </div>
          </div>

          <div className="h-16 md:h-24" />

          {/* Categories Mapping */}
          <div className="flex flex-col gap-y-40">
            {BUILD_CATEGORIES.map((category) => (
              <div key={category.id} className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                
                {/* Left Column: Category Info */}
                <div className={`reveal-category-${category.id} lg:col-span-5 flex flex-col h-full justify-start pt-4`}>
                  <div className="mb-0">
                    <div className="text-[10px] font-bold tracking-[0.2em] text-[#007F6A] uppercase mb-4">
                      {category.label}
                    </div>
                    <h3 className="text-[24px] font-medium tracking-tight text-[#1B1B1B] mb-6">
                      {category.header}
                    </h3>
                    <p className="text-[16px] text-[#1B1B1B]/60 max-w-[280px] leading-snug">
                      {category.summary}
                    </p>
                  </div>
                </div>

                {/* Right Column: Items Grid */}
                <div className="lg:col-span-7 flex justify-end">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-[720px] w-full">
                    {category.items.map((item, i) => {
                      const isHovered = hoveredIdx === item.id;
                      return (
                        <div key={item.id} className={`reveal-card-${category.id}`}>
                          <motion.div 
                            className="flex flex-col cursor-pointer"
                            onMouseEnter={() => setHoveredIdx(item.id)}
                            onMouseLeave={() => setHoveredIdx(null)}
                            animate={isHovered ? {
                              y: -4,
                              opacity: 1
                            } : {
                              y: 0,
                              opacity: hoveredIdx !== null ? 0.8 : 1
                            }}
                            transition={{ duration: 0.4, ease: "easeOut" }}
                          >
                            <motion.div 
                              className="text-[#1B1B1B]" 
                              style={{ marginBottom: '24px' }}
                              animate={{ 
                                scale: isHovered ? 1.1 : 1,
                                rotate: isHovered ? (i % 2 === 0 ? 3 : -3) : 0,
                                color: isHovered ? '#0d9488' : '#1B1B1B'
                              }}
                              transition={{ type: "spring", stiffness: 300, damping: 15 }}
                            >
                              {item.icon}
                            </motion.div>
                            <motion.h3 
                              style={{ 
                                fontSize: 'clamp(24px, 2.2vw, 32px)', 
                                lineHeight: '1.1', 
                                fontWeight: 500, 
                                letterSpacing: '-0.03em', 
                                marginBottom: '28px',
                                maxWidth: '95%',
                                minHeight: '2.4em',
                                whiteSpace: 'pre-line'
                              }}
                              animate={{ color: isHovered ? '#0d9488' : '#1B1B1B' }}
                              transition={{ duration: 0.2 }}
                            >
                              {item.title}
                            </motion.h3>
                            <motion.p 
                              style={{ 
                                fontSize: '14px', 
                                lineHeight: '1.65', 
                                maxWidth: '85%',
                                marginBottom: '32px'
                              }}
                              animate={{ color: isHovered ? '#0d9488' : 'rgba(27, 27, 27, 0.7)' }}
                              className="font-medium"
                            >
                              {item.description}
                            </motion.p>
                            <motion.button 
                              className={`group flex items-center gap-2 w-fit px-4 py-2 rounded-full text-[12px] font-bold tracking-tight transition-all ${
                                isHovered 
                                  ? 'bg-[#0d9488]/10 text-[#0d9488]' 
                                  : 'bg-[#F5F5F7] text-[#1B1B1B]/60'
                              }`}
                              style={{ pointerEvents: item.status === "upcoming" ? 'none' : 'auto' }}
                            >
                              {item.cta}
                              {item.status === "active" && <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />}
                            </motion.button>
                          </motion.div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}
