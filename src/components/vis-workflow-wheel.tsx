'use client';

import React, { useRef, useState, useEffect } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, AnimatePresence } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

const WORKFLOW_STEPS = [
  {
    label: "Store Credentials",
    cmd: "$ agentsecrets secrets set OPENAI_API_KEY=sk_...",
    output: "Encrypted locally. Stored in zero-knowledge vault."
  },
  {
    label: "Sync Environments",
    cmd: "$ agentsecrets secrets pull",
    output: "Synced 3 secrets from cloud to OS keychain."
  },
  {
    label: "Detect Drift",
    cmd: "$ agentsecrets secrets diff",
    output: "Only local:   NEW_KEY\nOnly remote:  DEPRECATED_KEY\nDiffers:      DATABASE_URL"
  },
  {
    label: "Switch Environments",
    cmd: "$ agentsecrets environment switch production",
    output: "Switched to production."
  },
  {
    label: "Execute Calls",
    cmd: "$ agentsecrets call --url api.stripe.com/v1/balance --bearer STRIPE_KEY",
    output: '{"object":"balance","available":[{"amount":420000,"currency":"usd"}]}'
  },
  {
    label: "Audit Logs",
    cmd: "$ agentsecrets proxy logs --watch",
    output: "14:23:01  GET  api.stripe.com/v1/balance  STRIPE_KEY  200  245ms"
  },
];

const CIRCLE_ITEMS = WORKFLOW_STEPS;

/* ─────────────────────────────────────────────
   MOBILE VERSION — vertical stepper with tap
   ───────────────────────────────────────────── */
function MobileWorkflow() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [stepProgress, setStepProgress] = useState(0);
  const containerRef = useRef<HTMLElement>(null);
  const pillRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const pillsContainerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    let mm = gsap.matchMedia();

    mm.add("(max-width: 767px)", () => {
      // Track scroll progress of the container without pinning
      ScrollTrigger.create({
        id: 'mobile-workflow-trigger',
        trigger: containerRef.current,
        start: 'top 70%',
        end: 'bottom 30%',
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          const totalSteps = WORKFLOW_STEPS.length;
          const index = Math.min(
            Math.floor(p * totalSteps),
            totalSteps - 1
          );
          setActiveIndex(index);
          
          const stepSize = 1 / totalSteps;
          const progressInStep = (p - index * stepSize) / stepSize;
          const clamped = Math.max(0, Math.min(1, progressInStep));
          setStepProgress(clamped * 100);
        }
      });
    });

    return () => mm.revert();
  }, { scope: containerRef });

  useEffect(() => {
    const container = pillsContainerRef.current;
    const pill = pillRefs.current[activeIndex];
    if (container && pill) {
      const containerWidth = container.offsetWidth;
      const pillWidth = pill.offsetWidth;
      const pillLeft = pill.offsetLeft;
      
      // Center the pill in the horizontal scrolling container
      const scrollTarget = pillLeft - (containerWidth / 2) + (pillWidth / 2);
      
      container.scrollTo({
        left: scrollTarget,
        behavior: 'smooth'
      });
    }
  }, [activeIndex]);

  const handlePillClick = (i: number) => {
    const trigger = ScrollTrigger.getById('mobile-workflow-trigger');
    if (trigger) {
      const start = trigger.start;
      const end = trigger.end;
      const stepSize = 1 / WORKFLOW_STEPS.length;
      const progress = (i + 0.5) * stepSize;
      const scrollPos = start + progress * (end - start);
      window.scrollTo({ top: scrollPos, behavior: 'smooth' });
    } else {
      setActiveIndex(i);
    }
  };

  return (
    <section
      ref={containerRef}
      className="w-full md:hidden select-none"
      style={{ backgroundColor: '#0D1512', color: '#FFFFFF', padding: '160px 24px' }}
    >
      {/* Section Label */}
      <div className="mobile-wf-label text-center" style={{ marginBottom: '100px' }}>
        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#34D399]/60 block mb-4">
          WORKFLOW
        </span>
        <h2 className="text-[28px] font-medium tracking-[-0.03em] leading-[1.15] text-white">
          The agent lifecycle,<br />
          <span className="text-white/40">without exposure.</span>
        </h2>
      </div>

      {/* Step Labels — horizontal scroll pills */}
      <div 
        ref={pillsContainerRef}
        className="flex gap-2 overflow-x-auto pb-4 mb-16 -mx-2 px-2 scrollbar-hide"
      >
        {WORKFLOW_STEPS.map((step, i) => (
          <button
            key={i}
            ref={el => { pillRefs.current[i] = el; }}
            onClick={() => handlePillClick(i)}
            className="mobile-wf-step shrink-0 px-4 py-2 rounded-full text-[12px] font-medium transition-all duration-300 whitespace-nowrap"
            style={{
              background: activeIndex === i ? 'rgba(52, 211, 153, 0.15)' : 'rgba(255,255,255,0.05)',
              color: activeIndex === i ? '#34D399' : 'rgba(255,255,255,0.4)',
              border: `1px solid ${activeIndex === i ? 'rgba(52, 211, 153, 0.3)' : 'rgba(255,255,255,0.06)'}`,
            }}
          >
            {step.label}
          </button>
        ))}
      </div>

      {/* Active Step Content — terminal card with fixed height to prevent layout shift */}
      <div
        className="rounded-2xl overflow-hidden flex flex-col justify-between"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="px-6 py-8"
          >
            {/* Step Number + Label */}
            <div className="flex items-center gap-3 mb-6">
              <span
                className="flex items-center justify-center w-[24px] h-[24px] rounded-full text-[11px] font-bold"
                style={{
                  background: 'rgba(52, 211, 153, 0.15)',
                  color: '#34D399',
                }}
              >
                {activeIndex + 1}
              </span>
              <span className="text-[14px] font-medium text-white/90">
                {WORKFLOW_STEPS[activeIndex].label}
              </span>
            </div>

            {/* Terminal Container with fixed height to prevent layout shift */}
            <div className="font-mono text-[12px] leading-relaxed min-h-[130px] flex flex-col justify-start">
              <div className="text-[#34D399] mb-4 font-medium whitespace-nowrap overflow-x-auto scrollbar-hide">
                {WORKFLOW_STEPS[activeIndex].cmd}
              </div>
              <div className="text-white/60 whitespace-pre-wrap break-all">
                {WORKFLOW_STEPS[activeIndex].output}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Progress bar */}
        <div className="h-[2px] bg-white/5 w-full">
          <div
            className="h-full bg-[#34D399]/40"
            style={{ 
              width: `${stepProgress}%`,
              transition: 'width 0.05s ease-out'
            }}
          />
        </div>
      </div>

      {/* Footnote */}
      <p 
        className="text-[12px] text-white/30 text-center leading-relaxed max-w-[300px] mx-auto"
        style={{ marginTop: '80px' }}
      >
        The agent managed the complete workflow autonomously. No credential value appeared at any step.
      </p>
    </section>
  );
}

/* ─────────────────────────────────────────────
   DESKTOP VERSION — original scroll wheel
   ───────────────────────────────────────────── */
function DesktopWorkflow() {
  const containerRef = useRef<HTMLElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const contentRefs = useRef<(HTMLDivElement | null)[]>([]);
  const glow1Ref = useRef<HTMLDivElement>(null);
  const glow2Ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (!containerRef.current || !wrapperRef.current) return;

    let mm = gsap.matchMedia();

    mm.add("(min-width: 768px)", () => {
      if (glow1Ref.current) {
        gsap.to(glow1Ref.current, {
          yPercent: 10,
          xPercent: 5,
          scale: 1.1,
          duration: 8,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut'
        });
      }
      if (glow2Ref.current) {
        gsap.to(glow2Ref.current, {
          yPercent: -15,
          xPercent: -10,
          scale: 1.2,
          duration: 11,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          delay: 2
        });
      }

      let radius = window.innerHeight * 0.9; 
      let centerX = (window.innerWidth * 0.10) - radius;

      gsap.set(wrapperRef.current, { left: centerX, top: '50%' });

      const updateItemsPosition = (scrollProgress: number) => {
        const spacing = Math.PI / 18; 
        const maxRotation = (CIRCLE_ITEMS.length - 1) * spacing;

        let closestIndex = 0;
        let minDistance = Infinity;

        CIRCLE_ITEMS.forEach((_, index) => {
          const item = itemsRef.current[index];
          if (!item) return;

          const angle = (index * spacing) - (scrollProgress * maxRotation);
          
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const rotation = (angle * 180) / Math.PI;

          const distanceToZero = Math.abs(angle);

          if (distanceToZero < minDistance) {
            minDistance = distanceToZero;
            closestIndex = index;
          }

          let opacity = 0;
          let color = '#FFFFFF';
          let textShadow = 'none';

          const isAbove = angle < 0;
          const targetLowOpacity = isAbove ? 0.35 : 0.08;

          if (distanceToZero < 0.05) {
            opacity = 1;
            const depthProgress = distanceToZero / 0.05;
            const blurAmount = Math.round((1 - depthProgress) * 25);
            const alphaAmount = (1 - depthProgress) * 0.6;
            textShadow = `0 0 ${blurAmount}px rgba(255,255,255,${alphaAmount})`;
          } else if (distanceToZero < 0.15) {
            const dropProgress = (distanceToZero - 0.05) / 0.10;
            opacity = 1 - (dropProgress * (1 - targetLowOpacity)); 
          } else if (distanceToZero < 0.8) {
            const fadeProgress = (distanceToZero - 0.15) / 0.65;
            opacity = targetLowOpacity * (1 - fadeProgress);
          } else {
            opacity = 0;
          }

          gsap.set(item, {
            x,
            y,
            xPercent: 0, 
            yPercent: -50,
            rotation,
            opacity,
            color,
            textShadow,
            transformOrigin: "left center",
          });
        });

        WORKFLOW_STEPS.forEach((_, i) => {
          if (contentRefs.current[i]) {
            const isActive = i === closestIndex;
            gsap.set(contentRefs.current[i], {
              opacity: isActive ? 1 : 0,
              y: isActive ? 0 : 20,
              pointerEvents: isActive ? 'auto' : 'none',
            });
          }
        });
      };

      updateItemsPosition(0);

      ScrollTrigger.create({
        trigger: containerRef.current,
        start: 'top top',
        end: '+=300%',
        pin: true,
        pinSpacing: true,
        scrub: 1,
        onUpdate: (self) => {
          const animationProgress = Math.min(self.progress / 0.66, 1);
          updateItemsPosition(animationProgress);
        },
      });

      const handleResize = () => {
        radius = window.innerHeight * 0.9;
        centerX = (window.innerWidth * 0.10) - radius;
        gsap.set(wrapperRef.current, { left: centerX });
        ScrollTrigger.update();
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    });

    return () => mm.revert();
  }, { scope: containerRef });

  return (
    <section 
      ref={containerRef} 
      className='h-screen w-full hidden md:flex items-center justify-center relative overflow-hidden z-0'
      style={{ backgroundColor: '#0D1512', color: '#FFFFFF' }}
    >
      <div ref={glow1Ref} className='absolute left-[5%] top-[40%] w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/20 blur-[100px] pointer-events-none z-0 will-change-transform' />
      <div ref={glow2Ref} className='absolute right-0 bottom-0 w-[400px] h-[400px] translate-x-1/4 rounded-full bg-white/15 blur-[90px] pointer-events-none z-0 will-change-transform' />

      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-[0.2] mix-blend-overlay" 
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` 
        }}
      />

      <div className='w-full max-w-[1600px] mx-auto flex items-center justify-between h-full relative z-10'>
        <div 
          ref={wrapperRef}
          className='absolute top-1/2' 
          style={{ transform: 'translate(0, -50%)' }}
        >
          {CIRCLE_ITEMS.map((step, i) => (
            <div
              key={i}
              ref={el => { itemsRef.current[i] = el; }}
              className='absolute font-medium tracking-tight whitespace-nowrap will-change-transform'
              style={{ 
                fontFamily: 'Helvetica, Arial, sans-serif',
                fontSize: 'clamp(30px, 4vw, 60px)',
                lineHeight: '1.1',
              }}
            >
              {step.label}
            </div>
          ))}
        </div>

        <div className='absolute right-6 md:right-12 lg:right-24 top-1/2 -translate-y-1/2 w-full max-w-[500px] h-[250px] z-20 pointer-events-none'>
          {WORKFLOW_STEPS.map((step, i) => (
            <div
              key={i}
              ref={el => { contentRefs.current[i] = el; }}
              className='absolute inset-0 flex flex-col justify-center transition-all duration-300'
              style={{ opacity: i === 0 ? 1 : 0 }}
            >
              <div className='font-mono text-[15px] leading-relaxed'>
                <div className='text-[#34D399] mb-2 font-medium'>{step.cmd}</div>
                <div className='text-white/70 whitespace-pre-wrap'>{step.output}</div>
              </div>

              <p className='mt-8 text-[14px] text-white/50 leading-relaxed font-mono max-w-[400px]'>
                {i === WORKFLOW_STEPS.length - 1 
                  ? "The agent managed the complete workflow autonomously. No credential value appeared at any step."
                  : "Executing autonomous lifecycle management without context exposure."}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   EXPORTED COMPONENT — renders the right one
   ───────────────────────────────────────────── */
export default function VisWorkflowWheel() {
  return (
    <>
      <MobileWorkflow />
      <DesktopWorkflow />
    </>
  );
}
