'use client';

import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, FileText, Clock, ArrowRight, CornerDownLeft } from 'lucide-react';
import { useDocSearch, type SearchResult } from '@/hooks/use-doc-search';
import { DOCS_SECTIONS } from '@/lib/docs-sections';

/* ──────────────────────────── Curated suggestions ──────────────────────────── */
const SUGGESTED_SECTIONS = [
  {
    category: 'Getting Started',
    items: ['quick-start', 'installation', 'what-is-agentsecrets'],
  },
  {
    category: 'Popular',
    items: [
      'proxy/overview',
      'integrations/claude-desktop',
      'zero-knowledge-difference',
      'concepts/proxy-model',
    ],
  },
];

function resolveSectionMeta(id: string) {
  const s = DOCS_SECTIONS.find((sec) => sec.id === id);
  return s ? { id: s.id, label: s.label, group: s.group } : null;
}

/* ──────────────────────────── Component ──────────────────────────── */

interface SearchPillProps {
  onMenuClick?: () => void;
  onNavigate?: (sectionId: string) => void;
}

export default function SearchPill({ onMenuClick, onNavigate }: SearchPillProps) {
  /* ── Core state ── */
  const [isReady, setIsReady] = useState(false);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);

  /* ── Refs ── */
  const inputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [growCount, setGrowCount] = useState(0);

  /* ── Search hook ── */
  const { search, ensureIndex, isIndexLoading, recentSearches, trackRecent } = useDocSearch();

  /* ── Ready animation + ⌘K listener ── */
  useEffect(() => {
    const timer = setTimeout(() => setIsReady(true), 400);

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  /* ── Preload index on focus ── */
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    ensureIndex();
  }, [ensureIndex]);

  /* ── Close panel on outside click ── */
  useEffect(() => {
    if (!isFocused) return;
    const handleClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        panelRef.current && !panelRef.current.contains(target) &&
        inputRef.current && !inputRef.current.contains(target)
      ) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isFocused]);

  /* ── Debounced search ── */
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setActiveIdx(0);
      return;
    }
    const timer = setTimeout(async () => {
      const r = await search(query);
      setResults(r);
      setActiveIdx(0);
    }, 120);
    return () => clearTimeout(timer);
  }, [query, search]);

  /* ── Navigate to a result ── */
  const navigateTo = useCallback(
    (id: string, label: string, group: string) => {
      trackRecent({ id, label, group });
      setQuery('');
      setResults([]);
      setIsFocused(false);
      inputRef.current?.blur();
      
      // Parse sectionId and headingId
      const [sectionId, headingId] = id.split('::');
      onNavigate?.(sectionId, headingId);
    },
    [onNavigate, trackRecent],
  );

  /* ── Keyboard nav ── */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setQuery('');
        setResults([]);
        setIsFocused(false);
        inputRef.current?.blur();
        return;
      }

      // Only navigate if we have results
      if (query.trim() && results.length > 0) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveIdx((prev) => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveIdx((prev) => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          const r = results[activeIdx];
          if (r) navigateTo(r.id, r.label, r.group);
        }
      } else if (e.key === 'Enter') {
        e.preventDefault();
      }
    },
    [query, results, activeIdx, navigateTo],
  );

  /* ── Auto-grow input width ── */
  useLayoutEffect(() => {
    if (!mirrorRef.current || !inputContainerRef.current) return;
    const textWidth = mirrorRef.current.scrollWidth;
    const containerWidth = inputContainerRef.current.offsetWidth;
    if (containerWidth > 0 && textWidth >= containerWidth * 0.95) {
      setGrowCount((prev) => prev + 1);
    }
  }, [query]);

  useLayoutEffect(() => {
    if (!mirrorRef.current) return;
    const textWidth = mirrorRef.current.scrollWidth;
    const step = 40;
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
    const baseW = isMobile ? 140 : 185;
    if (growCount > 0) {
      const prevCapacity = baseW + (growCount - 1) * step;
      if (textWidth < prevCapacity * 0.8) {
        setGrowCount((prev) => Math.max(0, prev - 1));
      }
    }
  }, [query, growCount]);

  const smoothSpring = { type: 'spring' as const, stiffness: 260, damping: 32, mass: 0.5 };
  const step = 40;
  const extraWidth = growCount * step;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;
  const baseW = isMobile ? 140 : 185;
  const showPanel = isFocused && isReady;

  /* ── Determine panel content ── */
  const hasQuery = query.trim().length > 0;

  return (
    <div className='fixed bottom-6 sm:bottom-8 left-0 right-0 z-[100] px-5 flex justify-center pointer-events-none'>
      <div className='relative flex flex-col items-center max-w-full pointer-events-auto'>

        {/* ─── Overlay ─── */}
        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='fixed inset-0 z-[-1] bg-[#1B1B1B]/10 backdrop-blur-[2px] pointer-events-auto'
              onClick={() => setIsFocused(false)}
            />
          )}
        </AnimatePresence>

        {/* ─── Results Panel ─── */}
        <AnimatePresence>
          {showPanel && (
            <motion.div
              ref={panelRef}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.97 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className='absolute bottom-full mb-3 w-[92vw] sm:w-[440px] max-h-[60vh] bg-white rounded-2xl shadow-2xl border border-black/[0.06] overflow-hidden flex flex-col'
            >
              {hasQuery ? (
                /* ── Search Results ── */
                results.length > 0 ? (
                  <div className='flex flex-col'>
                    <div className='px-4 pt-3 pb-2 shrink-0'>
                      <span className='text-[11px] font-bold tracking-[0.08em] uppercase text-[#1B1B1B]/30'>
                        Results
                      </span>
                    </div>
                    <div className='overflow-y-auto max-h-[50vh] overscroll-contain'>
                      {results.map((r, idx) => {
                        const isSubHeading = r.id.includes('::');
                        return (
                          <button
                            key={r.id}
                            onClick={() => navigateTo(r.id, r.label, r.group)}
                            onMouseEnter={() => setActiveIdx(idx)}
                            className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                              idx === activeIdx
                                ? 'bg-[#f0fdfa]'
                                : 'hover:bg-[#fafafa]'
                            }`}
                          >
                            {idx === activeIdx && (
                              <div className='w-[3px] h-5 bg-[#0d9488] rounded-full shrink-0 absolute left-0' />
                            )}
                            {isSubHeading ? (
                              <div className='flex items-center justify-center w-[14px] h-[14px] text-[#0d9488] shrink-0 font-bold text-[10px] opacity-60'>#</div>
                            ) : (
                              <FileText size={14} className='text-[#0d9488] shrink-0' />
                            )}
                          <div className='flex flex-col min-w-0 flex-1'>
                            <span className='text-[14px] font-medium text-[#1B1B1B] whitespace-normal break-words'>
                              {r.label}
                            </span>
                            <span className='text-[12px] text-[#1B1B1B]/40 whitespace-normal break-words'>
                              {r.group}
                            </span>
                          </div>
                          <ArrowRight size={12} className={`ml-auto shrink-0 transition-opacity ${idx === activeIdx ? 'text-[#0d9488] opacity-100' : 'opacity-0'}`} />
                        </button>
                      )})}
                    </div>
                    {/* Footer hints */}
                    <div className='px-4 py-2 border-t border-black/[0.04] flex items-center gap-4 text-[11px] text-[#1B1B1B]/30 font-medium'>
                      <span className='flex items-center gap-1'>
                        <CornerDownLeft size={10} /> select
                      </span>
                      <span>↑↓ navigate</span>
                      <span>esc close</span>
                    </div>
                  </div>
                ) : (
                  /* ── No results ── */
                  <div className='px-4 py-8 text-center'>
                    <p className='text-[14px] text-[#1B1B1B]/40 font-medium'>
                      No results for &ldquo;{query.trim()}&rdquo;
                    </p>
                    <p className='text-[12px] text-[#1B1B1B]/25 mt-1'>
                      Try a different search term
                    </p>
                  </div>
                )
              ) : (
                /* ── Suggestions + Recent ── */
                <div className='flex flex-col overflow-y-auto max-h-[50vh] overscroll-contain'>
                  {/* Recent searches */}
                  {recentSearches.length > 0 && (
                    <>
                      <div className='px-4 pt-3 pb-2'>
                        <span className='text-[11px] font-bold tracking-[0.08em] uppercase text-[#1B1B1B]/30'>
                          Recent
                        </span>
                      </div>
                      {recentSearches.map((item) => (
                        <button
                          key={`recent-${item.id}`}
                          onClick={() => navigateTo(item.id, item.label, item.group)}
                          className='w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-[#fafafa] transition-colors'
                        >
                          <Clock size={13} className='text-[#1B1B1B]/25 shrink-0' />
                          <span className='text-[13px] font-medium text-[#1B1B1B]/70 whitespace-normal break-words flex-1 min-w-0'>
                            {item.label}
                          </span>
                          <span className='text-[11px] text-[#1B1B1B]/25 ml-auto shrink-0 whitespace-normal break-words max-w-[40%] text-right'>
                            {item.group}
                          </span>
                        </button>
                      ))}
                      <div className='h-px bg-black/[0.04] mx-4 my-1' />
                    </>
                  )}

                  {/* Curated suggestions */}
                  {SUGGESTED_SECTIONS.map((group) => (
                    <div key={group.category}>
                      <div className='px-4 pt-3 pb-2'>
                        <span className='text-[11px] font-bold tracking-[0.08em] uppercase text-[#1B1B1B]/30'>
                          {group.category}
                        </span>
                      </div>
                      {group.items.map((id) => {
                        const meta = resolveSectionMeta(id);
                        if (!meta) return null;
                        return (
                          <button
                            key={id}
                            onClick={() => navigateTo(meta.id, meta.label, meta.group)}
                            className='w-full text-left px-4 py-2.5 flex items-center gap-3 hover:bg-[#fafafa] transition-colors'
                          >
                            <FileText size={13} className='text-[#0d9488]/50 shrink-0' />
                            <span className='text-[13px] font-medium text-[#1B1B1B]/70 whitespace-normal break-words flex-1 min-w-0'>
                              {meta.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  ))}

                  {/* Loading indicator */}
                  {isIndexLoading && (
                    <div className='px-4 py-2 text-center'>
                      <span className='text-[11px] text-[#1B1B1B]/25'>Loading search index…</span>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Outer Pill ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0, width: 'auto' }}
          transition={{
            opacity: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
          }}
          className='bg-[#005E50] rounded-[24px] sm:rounded-[28px] shadow-lg flex items-center border border-white/[0.08] min-h-[48px] sm:min-h-[52px] py-1.5 sm:py-2 max-w-[92vw] sm:max-w-[600px] overflow-hidden'
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
                className='relative bg-white rounded-[20px] sm:rounded-[24px] min-h-[36px] sm:min-h-[40px] flex items-center overflow-hidden pl-3 sm:pl-4 pr-0 py-1.5'
              >
                {/* Mirror for width calculation */}
                <div
                  ref={mirrorRef}
                  className='invisible absolute whitespace-pre-wrap break-words text-[13px] sm:text-[14px] font-medium opacity-0 pointer-events-none'
                  aria-hidden='true'
                  style={{ left: 16, right: 40 }}
                >
                  {query || 'Search documentation...'}
                </div>

                {/* Input container */}
                <motion.div
                  ref={inputContainerRef}
                  className='flex items-center relative'
                  animate={{ width: baseW + extraWidth }}
                  transition={smoothSpring}
                  style={{ minWidth: baseW, maxWidth: 450 }}
                >
                  <textarea
                    ref={inputRef as any}
                    rows={1}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      // Auto-resize textarea height
                      e.target.style.height = 'auto';
                      e.target.style.height = `${e.target.scrollHeight}px`;
                    }}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    placeholder='Search documentation...'
                    className='w-full bg-transparent border-none outline-none text-[#1B1B1B] font-medium text-[13px] sm:text-[14px] placeholder:text-[#1B1B1B]/30 leading-[1.4] py-1 m-0 resize-none overflow-hidden'
                    autoComplete='off'
                    spellCheck={false}
                  />
                </motion.div>

                {/* Keyboard Shortcut Indicator */}
                <div className='flex items-center justify-center shrink-0 h-[20px] sm:h-[24px] px-1 sm:px-1.5 rounded-md sm:rounded-lg bg-[#F5F5F7] text-[#1B1B1B]/40 text-[8px] sm:text-[10px] font-bold tracking-widest font-mono border border-black/5 ml-[2px] mr-1 sm:mr-1.5'>
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
