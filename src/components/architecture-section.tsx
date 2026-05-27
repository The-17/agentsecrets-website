'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Shield, Cpu, Key, ArrowRightLeft } from 'lucide-react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const ARCH_FLOW = [
  {
    step: "01",
    title: "Agent Sandbox",
    subtitle: "Untrusted Workspace",
    icon: <Cpu size={24} />,
    description: "The AI agent runs anonymously or with low privilege. It only references API keys by name (e.g., STRIPE_KEY). Raw values are absent from process memory, environment, and disk.",
    color: "rgba(239, 68, 68, 0.15)", // red highlight
    borderColor: "rgba(239, 68, 68, 0.25)",
    textColor: "#EF4444"
  },
  {
    step: "02",
    title: "Process Guard",
    subtitle: "Binary Attestation",
    icon: <Shield size={24} />,
    description: "The AgentSecrets daemon intercepts outbound calls. It performs kernel-level process verification (PID, binary path, and SHA-256 hash attestation) to block unauthorized scripts.",
    color: "rgba(0, 127, 106, 0.08)", // emerald/teal highlight
    borderColor: "rgba(0, 127, 106, 0.15)",
    textColor: "#007F6A"
  },
  {
    step: "03",
    title: "OS Keychain",
    subtitle: "Zero-Knowledge Storage",
    icon: <Key size={24} />,
    description: "Secrets are resolved locally from the secure OS keychain (macOS Keychain, Windows Credential Manager, or Linux Secret Service). Plaintext credentials never leave the machine.",
    color: "rgba(0, 127, 106, 0.08)",
    borderColor: "rgba(0, 127, 106, 0.15)",
    textColor: "#007F6A"
  },
  {
    step: "04",
    title: "Secure Transport",
    subtitle: "Active Response Redaction",
    icon: <ArrowRightLeft size={24} />,
    description: "The local proxy injects the credential at the transport layer for the outbound API call. If the upstream API echoes the secret back, it is actively redacted before returning to the agent.",
    color: "rgba(0, 127, 106, 0.08)",
    borderColor: "rgba(0, 127, 106, 0.15)",
    textColor: "#007F6A"
  }
];

export default function ArchitectureSection() {
  const containerRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 85%',
        toggleActions: 'play none none reverse',
      }
    });

    tl.from(".reveal-arch-label", {
      y: 20,
      opacity: 0,
      duration: 1.0,
      ease: 'power3.out'
    })
    .from(headingRef.current, {
      y: 35,
      opacity: 0,
      duration: 1.2,
      ease: 'power3.out'
    }, "-=0.8")
    .from(".reveal-arch-card", {
      y: 40,
      opacity: 0,
      stagger: 0.12,
      duration: 1.4,
      ease: 'expo.out'
    }, "-=0.9")
    .from(".reveal-arch-connector", {
      scaleX: 0,
      opacity: 0,
      stagger: 0.1,
      duration: 1.2,
      ease: 'power2.inOut'
    }, "-=1.0");
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef}
      id="architecture" 
      className="w-full bg-[#F5F5F7]/30 py-24 px-4 md:px-6 lg:px-8 border-y border-[#1B1B1B]/5 scroll-mt-24"
    >
      <div className="max-w-[1250px] mx-auto flex flex-col items-center">
        
        {/* Section Label */}
        <div className="reveal-arch-label text-[10px] font-bold tracking-[0.15em] uppercase mb-6 text-[#007F6A]">
          SYSTEM ARCHITECTURE
        </div>

        <h2 
          ref={headingRef}
          className="text-[clamp(28px,3.5vw,42px)] leading-[1.15] tracking-[-0.03em] text-[#1B1B1B] font-medium text-center max-w-3xl"
          style={{ fontFamily: 'var(--font-helvetica), sans-serif' }}
        >
          Zero-Knowledge Execution Flow
        </h2>
        
        <p className="mt-6 text-[15px] md:text-[17px] text-[#1B1B1B]/50 text-center max-w-[580px] leading-relaxed">
          How AgentSecrets isolates credential values from the untrusted agent runtime while maintaining seamless external API access.
        </p>

        {/* 4-Step Diagram Layout */}
        <div className="w-full mt-20 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6 relative z-10">
            {ARCH_FLOW.map((step, i) => {
              const isLast = i === ARCH_FLOW.length - 1;
              return (
                <div key={step.step} className="flex flex-col relative group">
                  {/* Visual Connector Line (Desktop) */}
                  {!isLast && (
                    <div 
                      className="reveal-arch-connector hidden lg:block absolute top-[44px] left-[calc(100%-12px)] w-[calc(100%-24px)] h-[1px] bg-gradient-to-r from-[#007F6A]/20 to-[#007F6A]/5 z-0 origin-left"
                    />
                  )}
                  
                  {/* Card wrapper */}
                  <div 
                    className="reveal-arch-card flex flex-col items-start bg-white rounded-2xl p-6 border border-[#1B1B1B]/5 shadow-sm hover:shadow-md transition-shadow duration-300 h-full relative z-10"
                  >
                    {/* Top row: badge + step number */}
                    <div className="w-full flex items-center justify-between mb-8">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                        style={{ 
                          backgroundColor: step.color, 
                          color: step.textColor,
                          border: `1px solid ${step.borderColor}` 
                        }}
                      >
                        {step.icon}
                      </div>
                      <span className="text-[12px] font-mono font-bold opacity-30 tracking-widest">{step.step}</span>
                    </div>

                    {/* Meta/Subtitle info */}
                    <span 
                      className="text-[10px] font-bold tracking-wider uppercase mb-1"
                      style={{ color: step.textColor }}
                    >
                      {step.subtitle}
                    </span>

                    {/* Title */}
                    <h3 className="text-[18px] font-medium tracking-tight text-[#1B1B1B] mb-4">
                      {step.title}
                    </h3>

                    {/* Body */}
                    <p className="text-[13px] text-[#1B1B1B]/60 leading-relaxed font-normal">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic Architectural Bulletproof Guarantee */}
        <div className="mt-16 bg-[#FAFAFA] border border-[#1B1B1B]/5 rounded-2xl p-6 md:p-8 max-w-4xl w-full flex flex-col md:flex-row items-center gap-6 md:gap-8 justify-between">
          <div className="max-w-[480px]">
            <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-[#007F6A] block mb-2">ARCHITECTURAL GUARANTEE</span>
            <h4 className="text-[15px] font-semibold text-[#1B1B1B] mb-2">Local Cryptographic Decoupling</h4>
            <p className="text-[13px] text-[#1B1B1B]/60 leading-relaxed">
              Decryption is local-only. Zero plaintext credential values are transmitted to, stored by, or cached on the cloud coordination server. Cloud services remain entirely blind to your secrets.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-[#007F6A]/5 border border-[#007F6A]/10 px-5 py-3 rounded-xl shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#34D399] animate-pulse" />
            <span className="text-[11px] font-mono font-bold text-[#007F6A] uppercase tracking-wider">Zero-Knowledge Active</span>
          </div>
        </div>

      </div>
    </section>
  );
}
