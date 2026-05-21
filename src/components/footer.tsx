'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ExternalLink } from 'lucide-react';

const FOOTER_LINKS = [
  {
    title: "Product",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Features", href: "#features" },
      { label: "Integrations", href: "#integrations" },
      { label: "Build on AgentSecrets", href: "#" },
      { label: "Ecosystem", href: "#" }
    ]
  }
];

export default function Footer() {
  return (
    <footer id="footer" className="w-full bg-white pt-24 pb-28 px-4 md:px-6 lg:px-8 relative">
      <div className="max-w-[1400px] mx-auto px-2 md:px-16 lg:px-20">
        
        {/* Top Section: Links & Branding */}
        <div className="flex flex-col lg:flex-row justify-between gap-16 lg:gap-24 mb-24">
          
          {/* Branding Column */}
          <div className="max-w-[400px]">
            <div className="flex items-center gap-3" style={{ marginBottom: '8px' }}>
              <Image 
                src="/Logo.png" 
                alt="Agent Secrets" 
                width={120} 
                height={28} 
                className="h-[24px] md:h-[28px] w-auto object-contain"
              />
            </div>
            <p className="text-[28px] md:text-[36px] font-medium tracking-[-0.03em] text-[#1B1B1B] leading-[1.1] mb-16">
              You can't steal what<br />was never there
            </p>
          </div>

          {/* Engineering Publication Brief */}
          <div className="max-w-[320px] lg:mt-2">
            <p className="text-[15px] text-[#1B1B1B]/50 leading-relaxed" style={{ marginBottom: '24px' }}>
              We're building AgentSecrets in public. Follow our journey as we architect the zero-knowledge future of the agentic era.
            </p>
            <a 
              href="https://engineering.theseventeen.co/series/building-agentsecrets" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="group flex items-center gap-2 w-fit px-6 py-3 rounded-full text-[12px] font-bold tracking-tight transition-all bg-[#F5F5F7] text-[#1B1B1B]/60 hover:bg-[#0d9488]/10 hover:text-[#0d9488]"
            >
              Read the series
              <ExternalLink size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Links Column (Far Right) */}
          <div className="flex flex-col min-w-[160px]">
            {FOOTER_LINKS.map((group) => (
              <div key={group.title}>
                <h4 className="text-[12px] font-bold tracking-[0.15em] uppercase mb-8 text-[#1B1B1B]">{group.title}</h4>
                <ul className="space-y-4">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <a 
                        href={link.href} 
                        className="text-[15px] text-[#1B1B1B]/40 hover:text-[#1B1B1B] transition-colors flex items-center gap-1 group"
                      >
                        {link.label}
                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* Baseline Row */}
        <div className="mt-24 flex flex-col md:flex-row items-center justify-between w-full text-[13px] font-medium tracking-tight">
          <p className="text-[#1B1B1B]/40">© 2026 Agent Secrets. All rights reserved.</p>
          <div className="flex items-center gap-1.5 mt-4 md:mt-0">
            <span className="text-[#1B1B1B]/30">built by</span>
            <a 
              href="https://theseventeen.co" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-[#1B1B1B] hover:text-[#0d9488] transition-colors underline decoration-[#1B1B1B]/30 underline-offset-[3px]"
            >
              The Seventeen
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
