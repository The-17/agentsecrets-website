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
    question: "What exactly is Zero-Knowledge security?",
    answer: "Zero-knowledge means our platform never sees or stores your raw secrets. Credentials are encrypted locally and only resolved at the final moment of execution on your secure infrastructure. We manage the identity and the 'keys' to the secrets, but the secrets themselves remain invisible to us."
  },
  {
    question: "How does the Agent Proxy inject credentials?",
    answer: "The Agent Proxy acts as a secure intermediary. When your agent makes an LLM call requiring an API key, the proxy intercepts the request, retrieves the secret from your secure vault (using our ZK protocol), injects it into the header, and passes it to the provider."
  },
  {
    question: "Is Agent Secrets compatible with all LLMs?",
    answer: "Yes. Our platform is model-agnostic. Whether you're using OpenAI, Anthropic, local models via Ollama, or custom deployments on AWS/Azure, our SDKs and Proxy layer work seamlessly to manage the underlying authentication."
  },
  {
    question: "Can I use Agent Secrets with local agents like AutoGPT?",
    answer: "Absolutely. Any agent that can run our CLI or SDK can benefit from Agent Secrets. Our CLI provides a 'wrap' command that injects secrets into any terminal process, making it perfect for AutoGPT, BabyAGI, and custom local scripts."
  },
  {
    question: "How do I handle secret rotation?",
    answer: "Rotation is handled automatically through our integration layer. You can define rotation policies in your vault (like AWS Secrets Manager or HashiCorp Vault), and Agent Secrets ensures your agents always fetch the latest version."
  },
  {
    question: "Can I self-host the Agent Secrets infrastructure?",
    answer: "Yes. The core components of Agent Secrets are portable and can be deployed within your VPC or on-premise infrastructure for maximum data sovereignty and compliance."
  },
  {
    question: "How is this different from a standard password manager?",
    answer: "While password managers are for humans, Agent Secrets is for agents. We provide the infrastructure for zero-knowledge injection into LLM tool-calling loops, ensuring that your AI models can use secrets without ever 'knowing' them."
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
                    
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <div className="pb-10 pr-12 text-[15px] md:text-[16px] text-[#1B1B1B]/60 leading-relaxed text-left">
                            {item.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
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
