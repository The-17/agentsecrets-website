'use client';

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu } from 'lucide-react';

export default function SearchPill({ onMenuClick }: { onMenuClick?: () => void }) {
  const [isReady, setIsReady] = useState(false);
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const [targetWidth, setTargetWidth] = useState(260);

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
    if (mirrorRef.current) {
      const textWidth = mirrorRef.current.scrollWidth;
      const step = 28; // Space for 3 characters
      const badgeW = 34; // ⌘K badge + 2px gap
      const initialWhitePillW = 185; 
      
      // Calculate expansion based on the 3px threshold at the end of the textarea
      // The current available width for text is (whitePillW - leftPadding - badgeW)
      const leftPadding = 16; // pl-4
      
      let whitePillW = initialWhitePillW;
      
      // We grow when the text gets within 3px of the end of the textarea
      // (The end of the textarea is the start of the 2px margin)
      while (textWidth > (whitePillW - leftPadding - badgeW - 3)) {
        whitePillW += step;
      }
      
      const iconsW = (onMenuClick ? 42 : 0) + 40;
      const outerPadding = 16;
      
      setTargetWidth(whitePillW + iconsW + outerPadding);
    }
  }, [query, isReady, onMenuClick]);

  const smoothSpring = {
    type: 'spring',
    stiffness: 260,
    damping: 32,
    mass: 0.5
  };

  return (
    <div className='fixed bottom-6 sm:bottom-8 left-0 right-0 z-[100] px-5 flex justify-center pointer-events-none'>
      <div className='relative flex flex-col items-center max-w-full pointer-events-auto'>
        
        {/* Outer Pill */}
        <motion.div 
          animate={{ width: targetWidth }}
          transition={smoothSpring}
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
                className='relative bg-white rounded-full h-[40px] flex flex-1 items-center overflow-hidden pl-4 pr-0'
              >
                {/* Mirror for width calculation */}
                <div 
                  ref={mirrorRef}
                  className="invisible absolute whitespace-nowrap text-[13px] sm:text-[14px] font-medium opacity-0 pointer-events-none"
                  aria-hidden="true"
                  style={{ left: 0 }}
                >
                  {query || "Search documentation..."}
                </div>

                <div className="flex-1 h-full flex items-center relative min-w-0">
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
                </div>

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
