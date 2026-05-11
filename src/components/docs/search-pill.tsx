'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu } from 'lucide-react';

export default function SearchPill({ onMenuClick }: { onMenuClick?: () => void }) {
  const [isReady, setIsReady] = useState(false);
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const textareaContainerRef = useRef<HTMLDivElement>(null);
  const [growCount, setGrowCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 400);
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useLayoutEffect(() => {
    if (!mirrorRef.current || !textareaContainerRef.current) return;

    const textWidth = mirrorRef.current.scrollWidth;
    const containerWidth = textareaContainerRef.current.offsetWidth;

    // Only grow when text fills 95% of the ACTUAL textarea container
    if (containerWidth > 0 && textWidth >= containerWidth * 0.95) {
      setGrowCount(prev => prev + 1);
    }
  }, [query]);

  // Shrink back when text is deleted
  useLayoutEffect(() => {
    if (!mirrorRef.current) return;
    const textWidth = mirrorRef.current.scrollWidth;
    const step = 40; // ~5 characters per step

    // Figure out minimum grow steps needed for current text
    const baseTextareaW = 185; // matches the min-width below
    if (growCount > 0) {
      const currentCapacity = baseTextareaW + growCount * step;
      const prevCapacity = baseTextareaW + (growCount - 1) * step;
      // If text fits in the previous step's capacity at 80%, shrink
      if (textWidth < prevCapacity * 0.80) {
        setGrowCount(prev => Math.max(0, prev - 1));
      }
    }
  }, [query, growCount]);

  const smoothSpring = {
    type: 'spring',
    stiffness: 260,
    damping: 32,
    mass: 0.5
  };

  const step = 40; // ~5 characters per growth step
  const extraWidth = growCount * step;

  return (
    <div className='fixed bottom-6 sm:bottom-8 left-0 right-0 z-[100] px-5 flex justify-center pointer-events-none'>
      <div className='relative flex flex-col items-center max-w-full pointer-events-auto'>
        
        {/* Outer Pill */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, width: 'auto' }}
          transition={{ 
            opacity: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 1.2, ease: [0.16, 1, 0.3, 1] }
          }}
          className='bg-[#005E50] rounded-full shadow-lg flex items-center border border-white/[0.08] h-[52px] max-w-[90vw] sm:max-w-[600px] overflow-hidden'
          style={{ paddingLeft: onMenuClick ? '6px' : '8px', paddingRight: '8px' }}
        >
          {onMenuClick && (
            <button 
              onClick={onMenuClick}
              className='lg:hidden flex items-center justify-center w-[40px] h-[40px] rounded-full text-white/90 hover:bg-white/10 transition-colors shrink-0'
            >
              <Menu size={18} />
            </button>
          )}

          <div className='flex items-center justify-center w-[36px] sm:w-[40px] h-[36px] sm:h-[40px] text-white/70 shrink-0'>
            <Search size={18} />
          </div>

          <AnimatePresence>
            {isReady && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className='relative bg-white rounded-full h-[40px] flex items-center overflow-hidden pl-4 pr-0'
              >
                {/* Mirror for width calculation - measures actual text pixel width */}
                <div 
                  ref={mirrorRef}
                  className="invisible absolute whitespace-nowrap text-[13px] sm:text-[14px] font-medium opacity-0 pointer-events-none"
                  aria-hidden="true"
                  style={{ left: 0 }}
                >
                  {query || "Search documentation..."}
                </div>

                {/* Textarea container - this is what we measure against */}
                <motion.div 
                  ref={textareaContainerRef}
                  className="h-full flex items-center relative"
                  animate={{ width: 185 + extraWidth }}
                  transition={smoothSpring}
                  style={{ minWidth: 185, maxWidth: 450 }}
                >
                  <textarea
                    ref={textareaRef}
                    rows={1}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search documentation..."
                    className="w-full bg-transparent border-none outline-none text-[#1B1B1B] font-medium text-[13px] sm:text-[14px] placeholder:text-[#1B1B1B]/30 resize-none leading-[20px] h-[20px] py-0 m-0 overflow-hidden block"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.preventDefault();
                    }}
                  />
                </motion.div>

                {/* Keyboard Shortcut Indicator */}
                <div className='flex items-center justify-center shrink-0 h-[24px] px-1.5 rounded-lg bg-[#F5F5F7] text-[#1B1B1B]/40 text-[10px] font-bold tracking-widest font-mono border border-black/5 ml-[2px] mr-1.5'>
                  ⌘K
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
