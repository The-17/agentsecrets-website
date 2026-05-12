"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { formatMetric } from "@/lib/utils";
import { RollingNumber } from "./rolling-number";

gsap.registerPlugin(ScrollTrigger, SplitText);

export default function StatsSection() {
  const [githubStars, setGithubStars] = useState("0");
  const [metrics, setMetrics] = useState({
    total_secrets: 0,
    total_projects: 0,
    total_users: 0,
    total_proxy_calls: 0,
    shared_workspaces: 0,
    total_environments_configured: 0
  });

  
  const containerRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const textRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    fetch('https://api.github.com/repos/The-17/agentsecrets')
      .then(res => res.json())
      .then(data => {
        if (data.stargazers_count) {
          const count = data.stargazers_count;
          const formatted = count >= 1000 
            ? (count / 1000).toFixed(1) + 'K' 
            : count.toString();
          setGithubStars(formatted);
        }
      })
      .catch(() => {});

    fetch(`/api/metrics?t=${Date.now()}`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success' && res.data) {
          const d = res.data;
          setMetrics({
            total_secrets: d.platform?.total_secrets ?? 0,
            total_projects: d.platform?.total_projects ?? 0,
            total_users: d.platform?.total_users ?? 0,
            total_proxy_calls: d.security?.total_proxy_calls ?? 0,
            shared_workspaces: d.platform?.shared_workspaces ?? 0,
            total_environments_configured:
              (d.feature_adoption?.environment_distribution?.staging ?? 0) +
              (d.feature_adoption?.environment_distribution?.production ?? 0) +
              (d.feature_adoption?.environment_distribution?.development ?? 0)
          });
        }
      })
      .catch(() => {});
  }, []);

  useGSAP(() => {
    if (!containerRef.current) return;

    // Initial states to prevent flash
    gsap.set([containerRef.current, textRef.current, ".stat-item"], { opacity: 0 });
    gsap.set(containerRef.current, { y: 60 });
    gsap.set(".stat-item", { y: 30 });

    const split = new SplitText(headingRef.current, { type: "lines,words", linesClass: "overflow-hidden" });
    gsap.set(split.words, { yPercent: 100, opacity: 0 });
    
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: "top 85%",
        toggleActions: "play none none none"
      }
    });

    tl.to(containerRef.current, {
      opacity: 1,
      y: 0,
      duration: 1.4,
      ease: "expo.out"
    })
    .to(split.words, {
      yPercent: 0,
      opacity: 1,
      stagger: 0.04,
      duration: 1.2,
      ease: "power4.out"
    }, "-=1.0")
    .to(textRef.current, {
      opacity: 1,
      y: 0,
      duration: 1.2,
      ease: "power3.out"
    }, "-=1.0")
    .to(".stat-item", {
      opacity: 1,
      y: 0,
      stagger: 0.1,
      duration: 1.2,
      ease: "power3.out"
    }, "-=1.0");

    // Hover effects using GSAP for maximum smoothness
    const items = gsap.utils.toArray<HTMLElement>(".stat-item");
    items.forEach((item) => {
      item.addEventListener("mouseenter", () => {
        gsap.to(item, { scale: 1.02, duration: 0.4, ease: "power2.out" });
        gsap.to(items.filter(i => i !== item), { opacity: 0.4, duration: 0.4, ease: "power2.out" });
      });
      item.addEventListener("mouseleave", () => {
        gsap.to(items, { scale: 1, opacity: 1, duration: 0.4, ease: "power2.out" });
      });
    });

  }, { scope: containerRef });

  const stats = [
    {
      value: formatMetric(metrics.total_secrets),
      label: "Secrets Stored",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="5" rx="9" ry="3" />
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
        </svg>
      )
    },
    {
      value: githubStars,
      label: "GitHub Stars",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    },
    {
      value: formatMetric(metrics.total_projects),
      label: "Active Projects",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
          <path d="m3.3 7 8.7 5 8.7-5" />
          <path d="M12 22V12" />
        </svg>
      )
    },
    {
      value: formatMetric((metrics.total_proxy_calls || 0) < 1000 ? 1000 + (metrics.total_proxy_calls || 0) : metrics.total_proxy_calls),
      label: "Requests Proxied",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="m13 2-2 10h8L7 22l2-10H1L13 2Z" />
        </svg>
      )
    }
  ];

  return (
    <section className="w-full py-24 px-4 md:px-6 lg:px-8 bg-white flex justify-center overflow-hidden relative z-10">
      <div 
        ref={containerRef}
        className="w-full max-w-[1150px] mx-auto rounded-[24px] md:rounded-[60px] p-6 md:p-16 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-24"
        style={{
          background: 'linear-gradient(145deg, #f0fdfa 0%, #ccfbf1 100%)',
          boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.8), 0 20px 40px -12px rgba(0,0,0,0.05)'
        }}
      >
        
        {/* Left Side: Copy */}
        <div className="flex-1 max-w-xl text-center lg:text-left">
          <h2 
            ref={headingRef}
            style={{
              fontSize: 'clamp(36px, 4vw, 48px)',
              lineHeight: '1.1',
              fontWeight: 700,
              letterSpacing: '-0.04em',
              marginBottom: '24px',
              color: '#005E50'
            }}
          >
            Zero trust.<br/>Absolute security.
          </h2>
          <p 
            ref={textRef}
            style={{
              fontSize: '16px',
              lineHeight: '1.65',
              color: 'rgba(0, 94, 80, 0.8)',
              maxWidth: '100%',
              margin: '0 auto'
            }}
          >
            AgentSecrets proxies every outbound request your AI agent makes, silently injecting credentials and enforcing strict domain allowlists. Your keys never touch the agent's context.
          </p>
        </div>

        {/* Right Side: Stats Grid */}
        <div className="flex-1 w-full max-w-lg grid grid-cols-2 gap-x-8 gap-y-12 md:gap-y-16">
          {stats.map((stat, i) => (
            <div 
              key={i} 
              className="stat-item flex flex-col items-center lg:items-start cursor-default"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center text-[#0d9488]">
                  {stat.icon}
                </div>
                <div style={{
                  fontSize: 'clamp(32px, 4vw, 56px)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: '#005E50',
                  lineHeight: '1'
                }}>
                  <RollingNumber value={stat.value} delay={0.5 + (i * 0.1)} triggerRef={containerRef} />
                </div>
              </div>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: 'rgba(0, 94, 80, 0.7)',
                paddingLeft: '0',
                marginLeft: '0'
              }} className="lg:ml-[44px]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
