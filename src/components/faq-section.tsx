'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

const FAQ_ITEMS = [
  {
    question: "How long does setup take? Do I need to perform grand architectural changes to my app?",
    answer: "Zero. Setup is virtually instantaneous. You can initialize the infrastructure in exactly 10 seconds with a single command: `npx @the-17/agentsecrets init`. There are no configuration files to manage, no SDK code modifications required, and no custom networking needed. It sits silently under your application process layer. You keep writing your code exactly as you do today."
  },
  {
    question: "How does AgentSecrets protect my keys during local AI-assisted development (e.g., Cursor, Claude Desktop)?",
    answer: "AI coding assistants and local LLMs are fully capable of reading files within your workspace, including raw `.env` files containing highly sensitive production API keys. By migrating your `.env` values to AgentSecrets, your local workspace contains zero plaintext credentials. When your code runs, the values are securely fetched from your OS keychain and injected at runtime. Your coding assistant can read your entire workspace, edit your files, and execute helper tasks, but it is physically blind to your raw secrets."
  },
  {
    question: "How does AgentSecrets prevent LLM prompt injection attacks from stealing API keys?",
    answer: "Traditional secrets managers load credentials into process memory or environment variables, which can be easily extracted by an LLM via prompt injection. AgentSecrets uses a local loopback HTTP proxy. Your agent workflows or MCP servers reference keys only by their name (e.g., GITHUB_TOKEN). The local proxy intercepts outbound HTTP requests, fetches the credential from the OS keychain, injects it into the request header at the transport layer, and forwards the request. The agent process only receives the final API response—the raw key value never enters the agent's memory or context."
  },
  {
    question: "How does Keychain Auth protect secrets from rogue local processes or scripts?",
    answer: "Standard OS keychains allow any process running under your user session to query and retrieve credentials without sandboxing. AgentSecrets integrates with a connection-bound security daemon (keychain-auth) that uses kernel-level process verification (e.g., SO_PEERCRED on Linux, LOCAL_PEERPID on macOS). It retrieves the caller's true PID, resolves its executable path, verifies its SHA-256 binary hash against a user-approved database, and enforces strict namespace permissions. Unapproved scripts or background malware are blocked from accessing your keys."
  },
  {
    question: "What is the performance overhead and latency of using the local proxy?",
    answer: "Because the AgentSecrets proxy runs entirely on the loopback interface (localhost), there is zero network transit latency. Resolving credentials from the local OS keychain and performing transport-layer injection introduces a negligible overhead of less than 2-3 milliseconds per request. This is virtually imperceptible compared to the round-trip latency of LLM APIs or upstream network requests."
  },
  {
    question: "Does AgentSecrets support multi-environment isolation (Dev, Staging, Prod)?",
    answer: "Yes. Every project in AgentSecrets is pre-configured with three isolated environments: development, staging, and production. You can scope your credentials (e.g., STRIPE_KEY) specifically to any of these three environments. The local proxy automatically enforces boundaries, preventing local development runs or test agents from accidentally calling production endpoints or injecting production-level keys, keeping your test and live environments strictly separated."
  },
  {
    question: "How does the Zero-Knowledge team synchronization work?",
    answer: "When syncing secrets across a team, credentials are encrypted client-side using NaCl SealedBox (Curve25519) public-key cryptography before being sent to the sync server. The server stores only the encrypted ciphertext. Since the sync server never holds the private key or the plaintext credentials, a compromise of the sync server infrastructure yields zero readable secrets. New team members can onboard and fetch workspace configurations seamlessly without keys ever being exposed in plaintext."
  },
  {
    question: "Can I use AgentSecrets offline, and what role does the API backend server play?",
    answer: "AgentSecrets is designed local-first: all credential resolution, anti-impersonation process checks, and local transport-layer proxy injections occur entirely on your local machine (using loopback interfaces and your secure OS keychain). This local pipeline runs completely offline. However, the system relies on the secure API backend server for coordination tasks: user authentication, workspace synchronization, key rotation policies, and issuing verifiable cryptographic agent tokens for remote or containerized agent runtimes."
  },
  {
    question: "Is AgentSecrets compatible with all LLM frameworks and libraries?",
    answer: "Yes. AgentSecrets is framework-agnostic. Because it injects credentials at the transport layer via a local HTTP proxy, any tool, library, or language that can route HTTP traffic through a proxy is supported. This includes LangChain, CrewAI, AutoGen, LlamaIndex, the official OpenAI and Anthropic SDKs, or even a simple curl command in bash."
  }
];

export default function FAQSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  useGSAP(() => {
    if (!containerRef.current) return;

    // Reveal Animation
    const revealTl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%",
        toggleActions: "play none none reverse"
      }
    });

    revealTl.from(".faq-reveal-header", {
      opacity: 0,
      y: 60,
      duration: 1.5,
      ease: "expo.out"
    })
    .from(".faq-reveal-item", {
      opacity: 0,
      y: 40,
      stagger: 0.1,
      duration: 1.2,
      ease: "expo.out"
    }, "-=1.0");

    // Pinning Logic for Desktop
    ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top top",
      end: "bottom bottom",
      pin: ".faq-pin-column",
      pinSpacing: false,
      anticipatePin: 1,
      onRefresh: (self) => {
        if (window.innerWidth < 1024) {
          self.disable();
        } else {
          self.enable();
        }
      }
    });

  }, { scope: containerRef });

  return (
    <section id="faq" ref={containerRef} className="w-full bg-white pt-24 pb-12 px-4 md:px-6 lg:px-8 border-t border-[#1B1B1B]/5 relative scroll-mt-24">
      <div className="max-w-[1400px] mx-auto px-2 md:px-16 lg:px-20">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-start">
          
          {/* Left Column: Header (Pinned) */}
          <div className="faq-pin-column lg:col-span-5 flex flex-col pt-4">
            <div className="faq-reveal-header">
              <div className="text-[10px] font-bold tracking-[0.15em] uppercase mb-8 text-[#007F6A]">
                SUPPORT
              </div>
              <h2 className="text-[clamp(32px,4vw,48px)] font-medium tracking-[-0.03em] leading-[1.15] text-[#1B1B1B]">
                Frequently Asked<br />Questions
              </h2>
            </div>
          </div>

          {/* Right Column: FAQ Items */}
          <div className="lg:col-span-7">
            <div className="space-y-0 border-t border-[#1B1B1B]/5">
              {FAQ_ITEMS.map((item, index) => {
                const isOpen = openIndex === index;
                return (
                  <div 
                    key={index} 
                    className="faq-reveal-item border-b border-[#1B1B1B]/5"
                  >
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : index)}
                      className="w-full py-8 flex items-center justify-between group transition-all duration-300"
                    >
                      <span className={`text-[17px] md:text-[18px] font-normal tracking-tight transition-colors duration-300 text-left pr-8 ${
                        isOpen ? 'text-[#0d9488]' : 'text-[#1B1B1B] group-hover:text-[#0d9488]'
                      }`}>
                        {item.question}
                      </span>
                      <div className={`flex-shrink-0 p-2 rounded-full transition-all duration-300 ${
                        isOpen ? 'bg-[#0d9488]/10 text-[#0d9488] rotate-90' : 'bg-[#F5F5F7] text-[#1B1B1B]/40 group-hover:bg-[#0d9488]/5 group-hover:text-[#0d9488]'
                      }`}>
                        {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                      </div>
                    </button>
                    
                    <motion.div
                      initial={false}
                      animate={{ 
                        height: isOpen ? 'auto' : 0, 
                        opacity: isOpen ? 1 : 0 
                      }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="pb-10 pr-12 text-[15px] md:text-[16px] text-[#1B1B1B]/60 leading-relaxed text-left">
                        {item.answer}
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
