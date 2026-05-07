"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const features = [
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 4L36 20L20 36L4 20Z" />
        <circle cx="20" cy="20" r="4" fill="currentColor" stroke="none" />
      </svg>
    ),
    title: "OS Keychain\nStorage",
    desc: "Credentials live in the OS keychain. macOS Keychain, Linux Secret Service, Windows Credential Manager. No plaintext on disk, no environment variable exposed to neighboring processes.",
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="20,4 34,12 34,28 20,36 6,28 6,12" />
        <circle cx="20" cy="20" r="3" fill="currentColor" stroke="none" />
        <path d="M20 4V17 M34 12L22.5 18.5 M34 28L22.5 21.5 M20 36V23 M6 28L17.5 21.5 M6 12L17.5 18.5" />
      </svg>
    ),
    title: "Six Auth\nStyles",
    desc: "Bearer, Basic, custom header, query param, JSON body, form field. Every REST and OAuth pattern has a corresponding injection style.",
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="20" cy="20" r="16" />
        <circle cx="20" cy="20" r="8" />
        <path d="M20 4V12 M20 28V36 M4 20H12 M28 20H36" />
      </svg>
    ),
    title: "Domain\nAllowlist",
    desc: "Deny-by-default. Every outbound request must target an authorized domain. Unauthorized attempts are blocked and logged before injection happens.",
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="8" y1="12" x2="32" y2="12" />
        <line x1="8" y1="20" x2="14" y2="20" />
        <rect x="18" y="17" width="14" height="6" fill="currentColor" stroke="none" />
        <line x1="8" y1="28" x2="32" y2="28" />
      </svg>
    ),
    title: "Response\nRedaction",
    desc: "If an API echoes a credential back in its response, the proxy catches and redacts it before the agent sees the response.",
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="20" cy="10" r="4" />
        <circle cx="10" cy="28" r="4" />
        <circle cx="30" cy="28" r="4" />
        <path d="M18 13.5L12 24.5 M22 13.5L28 24.5 M14 28H26" />
      </svg>
    ),
    title: "Team\nWorkspaces",
    desc: "Secrets encrypted client-side before upload. The server holds ciphertext. A new developer onboards without anyone sharing credentials over Slack.",
  },
  {
    icon: (
      <svg width="48" height="48" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M20 4V36" />
        <path d="M20 12H30" />
        <circle cx="30" cy="12" r="3" fill="currentColor" stroke="none" />
        <path d="M20 20H10" />
        <circle cx="10" cy="20" r="3" fill="currentColor" stroke="none" />
        <path d="M20 28H26" />
        <circle cx="26" cy="28" r="3" fill="currentColor" stroke="none" />
      </svg>
    ),
    title: "Audit\nLog",
    desc: "Every proxied request logged. Key name, endpoint, status, timing. No value field, because there is nowhere to put one.",
  },
];

export default function FeaturesGrid() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    gsap.from(gsap.utils.toArray(".feature-card"), {
      opacity: 0,
      y: 40,
      scale: 0.95,
      stagger: 0.1,
      duration: 1,
      ease: "power4.out",
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 70%",
        toggleActions: "play none none none"
      }
    });
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef}
      id="features" 
      className="w-full min-h-screen flex items-center justify-center bg-white py-20 px-4 md:px-6 lg:px-8 text-[#1B1B1B] relative z-10 scroll-mt-24"
    >
      <div 
        ref={cardRef}
        className="w-full max-w-[1150px] mx-auto bg-white rounded-[32px] p-8 md:p-12 lg:p-16 flex flex-col items-center"
      >
        
        <div className="w-full max-w-fit">
          {/* Section Label */}
          <div className="text-[11px] font-bold tracking-[0.15em] uppercase mb-16 opacity-60">
            FEATURES
          </div>

        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-20">
          {features.map((f, i) => {
            const isHovered = hoveredIdx === i;
            
            return (
            <motion.div
              key={f.title}
              className="feature-card flex flex-col cursor-pointer transition-opacity duration-500 ease-out"
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              animate={{
                opacity: hoveredIdx !== null && !isHovered ? 0.8 : 1,
                y: isHovered ? -4 : 0
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            >
              {/* Abstract SVG Icon */}
              <motion.div 
                style={{ marginBottom: '24px' }}
                animate={{
                  scale: isHovered ? 1.1 : 1,
                  rotate: isHovered ? (i === 5 ? 3 : (i % 2 === 0 ? 3 : -3)) : 0,
                  color: isHovered ? '#0d9488' : '#1B1B1B'
                }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                {f.icon}
              </motion.div>
              
              {/* Large Editorial Title */}
              <motion.h3 
                style={{ 
                  fontSize: 'clamp(28px, 2.5vw, 36px)', 
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
                {f.title}
              </motion.h3>
              
              {/* Subtle Description Text */}
              <motion.p 
                style={{ 
                  fontSize: '14px', 
                  lineHeight: '1.65', 
                  maxWidth: '95%'
                }}
                animate={{ color: isHovered ? '#0d9488' : 'rgba(27, 27, 27, 0.7)' }}
                transition={{ duration: 0.2 }}
              >
                {f.desc}
              </motion.p>
            </motion.div>
          )})}
        </div>

        </div>
      </div>
    </section>
  );
}
