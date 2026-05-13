'use client';

import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, FileText, Clock, ArrowRight, CornerDownLeft, Hash, BookOpen } from 'lucide-react';
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
  const defaultSnippets: Record<string, string> = {
    'quick-start': 'Get up and running with AgentSecrets in under 5 minutes.',
    'installation': 'Detailed guide on installing the AgentSecrets CLI and SDK.',
    'what-is-agentsecrets': 'Understanding the core mission and architecture of the platform.',
    'proxy/overview': 'Learn how our zero-knowledge proxy keeps your keys safe.',
    'integrations/claude-desktop': 'Connect AgentSecrets directly to your Claude Desktop app.',
    'zero-knowledge-difference': 'Why our security model is superior to traditional vaulting.',
    'concepts/proxy-model': 'Deep dive into the three-layer proxy security model.',
  };
  return s ? { 
    id: s.id, 
    label: s.label, 
    group: s.group,
    snippet: defaultSnippets[id] || `Overview of ${s.label} and its role in the ecosystem.`
  } : null;
}

/** Split a label into exactly two lines at the midpoint, like features grid titles */
function splitToTwoLines(label: string): string {
  const words = label.split(' ');
  if (words.length <= 1) return label;
  const mid = Math.ceil(words.length / 2);
  return words.slice(0, mid).join(' ') + '\n' + words.slice(mid).join(' ');
}

/* ──────────────────────────── Component ──────────────────────────── */

interface SearchPillProps {
  onMenuClick?: () => void;
  onNavigate?: (sectionId: string, headingId?: string) => void;
}

export default function SearchPill({ onMenuClick, onNavigate }: SearchPillProps) {
  /* ── Core state ── */
  const [isReady, setIsReady] = useState(false);
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);

  /* ── Refs ── */
  const inputRef = useRef<HTMLInputElement>(null);
  const mirrorRef = useRef<HTMLDivElement>(null);
  const inputContainerRef = useRef<HTMLDivElement>(null);
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

  /* ── Close panel on Escape ── */
  useEffect(() => {
    if (!isFocused) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setQuery('');
        setResults([]);
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
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
    (id: string, label: string, group: string, snippet: string = '') => {
      trackRecent({ id, label, group, snippet });
      setQuery('');
      setResults([]);
      setIsFocused(false);
      inputRef.current?.blur();

      // Parse composite ID for deep linking
      const [sectionId, headingId] = id.includes('::') ? id.split('::') : [id, undefined];
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

        {/* ─── Overlay + Card Layout ─── */}
        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className='fixed inset-0 z-[-1] bg-white pointer-events-auto overflow-y-auto flex flex-col items-center'
              onClick={(e) => { if (e.target === e.currentTarget) setIsFocused(false); }}
            >
              <div className='w-full max-w-[820px] mx-auto px-8 pt-32 pb-48 flex flex-col gap-[80px]'>
                {hasQuery ? (
                  results.length > 0 ? (
                    <>
                      <div className='text-center mb-10'>
                        <h3 className='text-[13px] font-medium text-[#1B1B1B]/30 tracking-wide'>
                          {results.length} result{results.length !== 1 ? 's' : ''}
                        </h3>
                      </div>
                      <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                        {results.map((r, idx) => (
                          <motion.button
                            key={r.id}
                            onClick={() => navigateTo(r.id, r.label, r.group, r.snippet)}
                            onMouseEnter={() => setActiveIdx(idx)}
                            whileHover={{ y: -4 }}
                            className={`text-left bg-white rounded-2xl border p-6 min-h-[180px] flex flex-col gap-3 transition-all duration-200 cursor-pointer ${
                              idx === activeIdx
                                ? 'border-[#0d9488]/15 shadow-[0_4px_20px_rgba(0,0,0,0.04)] scale-[1.01]'
                                : 'border-transparent hover:border-black/[0.04] shadow-[0_1px_3px_rgba(0,0,0,0.02)]'
                            }`}
                          >
                            <span className='inline-flex items-center self-start text-[9px] font-bold tracking-[0.1em] uppercase text-[#0d9488] bg-[#ECFDF5] rounded-full px-3 py-1'>
                              {r.group}
                            </span>
                            <span className='text-[16px] font-semibold text-[#1B1B1B] leading-snug line-clamp-2 mt-1'>
                              {r.label}
                            </span>
                            {r.snippet && (
                              <span className='text-[12px] text-[#1B1B1B]/35 leading-[1.6] line-clamp-2'>
                                {r.snippet}
                              </span>
                            )}
                            <div className='flex items-center gap-3 mt-auto pt-3'>
                              <span className='flex items-center gap-1.5 text-[10px] text-[#1B1B1B]/20 font-medium'>
                                <BookOpen size={10} />
                                Docs
                              </span>
                              <span className={`flex items-center gap-1 text-[10px] font-semibold ml-auto transition-opacity duration-200 ${
                                idx === activeIdx ? 'text-[#0d9488] opacity-100' : 'opacity-0'
                              }`}>
                                Read <ArrowRight size={10} />
                              </span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className='text-center pt-32'>
                      <p className='text-[16px] text-[#1B1B1B]/25 font-medium'>
                        No results for &ldquo;{query.trim()}&rdquo;
                      </p>
                      <p className='text-[13px] text-[#1B1B1B]/15 mt-3'>
                        Try a different search term
                      </p>
                    </div>
                  )
                ) : (
                  <>
                    {/* ── Recents ── */}
                    {recentSearches.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className='flex flex-col gap-[24px]'
                      >
                        <h3 className='text-[22px] font-bold text-[#1B1B1B]/85'>
                          Recents
                        </h3>
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-16 gap-y-10'>
                          {recentSearches.map((item) => {
                            const isHovered = hoveredItemId === `recent-${item.id}`;
                            return (
                              <motion.button
                                key={`recent-${item.id}`}
                                onClick={() => navigateTo(item.id, item.label, item.group, item.snippet)}
                                onMouseEnter={() => setHoveredItemId(`recent-${item.id}`)}
                                onMouseLeave={() => setHoveredItemId(null)}
                                animate={{
                                  y: isHovered ? -4 : 0,
                                  opacity: hoveredItemId !== null && !isHovered ? 0.8 : 1
                                }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className='text-left flex flex-col gap-6 group cursor-pointer'
                              >
                                <motion.div 
                                  animate={{ 
                                    backgroundColor: isHovered ? '#0d94881a' : '#F5F5F7',
                                    color: isHovered ? '#0d9488' : 'rgba(27, 27, 27, 0.6)'
                                  }}
                                  className='inline-flex items-center self-start text-[9px] font-bold tracking-wide rounded-full px-2.5 py-1 transition-colors'
                                >
                                  {item.group}
                                </motion.div>
                                <div className='flex flex-col gap-4'>
                                  <motion.h4 
                                    animate={{ color: isHovered ? '#0d9488' : '#1B1B1B' }}
                                    className='text-[22px] font-medium leading-[1.15] tracking-[-0.035em] whitespace-pre-line line-clamp-2 min-h-[2.3em]'
                                  >
                                    {splitToTwoLines(item.label)}
                                  </motion.h4>
                                  <motion.p 
                                    animate={{ color: isHovered ? '#0d9488' : 'rgba(27, 27, 27, 0.6)' }}
                                    className='text-[13.5px] leading-[1.65] line-clamp-3 font-medium'
                                  >
                                    {item.snippet || 'Explore more about this section.'}
                                  </motion.p>
                                </div>
                                <div className='flex items-center gap-3 mt-auto opacity-30'>
                                  <span className='flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase'><Clock size={10} /> 2h ago</span>
                                  <span className='flex items-center gap-1 text-[9px] font-bold tracking-wider uppercase'><FileText size={10} /> PDF</span>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}

                    {/* ── Popular / Suggestions ── */}
                    {SUGGESTED_SECTIONS.map((group, groupIdx) => (
                      <motion.div 
                        key={group.category} 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut", delay: groupIdx * 0.1 }}
                        className='flex flex-col gap-[24px]'
                      >
                        <h3 className='text-[22px] font-bold text-[#1B1B1B]/85'>
                          {group.category}
                        </h3>
                        <div className='grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6'>
                          {group.items.map((id) => {
                            const meta = resolveSectionMeta(id);
                            if (!meta) return null;
                            const isHovered = hoveredItemId === `suggested-${id}`;
                            return (
                              <motion.button
                                key={id}
                                onClick={() => navigateTo(meta.id, meta.label, meta.group, meta.snippet)}
                                onMouseEnter={() => setHoveredItemId(`suggested-${id}`)}
                                onMouseLeave={() => setHoveredItemId(null)}
                                animate={{
                                  y: isHovered ? -4 : 0,
                                  opacity: hoveredItemId !== null && !isHovered ? 0.8 : 1
                                }}
                                transition={{ duration: 0.3, ease: "easeOut" }}
                                className='text-left bg-white rounded-[24px] p-8 flex items-center gap-8 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_12px_48px_rgba(0,0,0,0.06)] transition-all duration-300 cursor-pointer group border border-black/[0.01]'
                              >
                                <div className='flex flex-col gap-4 flex-1 min-w-0'>
                                  <motion.div 
                                    animate={{ 
                                      backgroundColor: isHovered ? '#0d94881a' : '#F5F5F7',
                                      color: isHovered ? '#0d9488' : 'rgba(27, 27, 27, 0.6)'
                                    }}
                                    className='inline-flex items-center self-start text-[9px] font-bold tracking-wide rounded-full px-3 py-1.5 transition-colors'
                                  >
                                    {meta.group}
                                  </motion.div>
                                  <motion.h4 
                                    animate={{ color: isHovered ? '#0d9488' : '#1B1B1B' }}
                                    className='text-[24px] font-medium leading-[1.1] tracking-[-0.03em] whitespace-pre-line line-clamp-2 min-h-[2.2em]'
                                  >
                                    {splitToTwoLines(meta.label)}
                                  </motion.h4>
                                  <motion.p 
                                    animate={{ color: isHovered ? '#0d9488' : 'rgba(27, 27, 27, 0.6)' }}
                                    className='text-[14px] leading-[1.6] line-clamp-2'
                                  >
                                    {meta.snippet}
                                  </motion.p>
                                </div>
                                <div className='w-[160px] h-[120px] rounded-[16px] bg-[#EBEBEB] shrink-0 relative overflow-hidden flex items-center justify-center border border-black/[0.03]'>
                                  <div className='absolute bottom-4 left-1/2 -translate-x-1/2'>
                                    <motion.span 
                                      animate={{ 
                                        backgroundColor: isHovered ? '#1B1B1B' : '#FFFFFF',
                                        color: isHovered ? '#FFFFFF' : '#1B1B1B'
                                      }}
                                      className='text-[11px] font-bold px-4 py-1.5 rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.08)] flex items-center gap-1.5 transition-colors'
                                    >
                                      Read <ArrowRight size={12} />
                                    </motion.span>
                                  </div>
                                </div>
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    ))}

                    {isIndexLoading && (
                      <div className='text-center py-12'>
                        <span className='text-[12px] text-[#1B1B1B]/15'>Loading search index…</span>
                      </div>
                    )}
                  </>
                )}
              </div>
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
          className='bg-[#005E50] rounded-full shadow-lg flex items-center border border-white/[0.08] h-[48px] sm:h-[52px] max-w-[92vw] sm:max-w-[600px] overflow-hidden'
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
                className='relative bg-white rounded-full h-[36px] sm:h-[40px] flex items-center overflow-hidden pl-3 sm:pl-4 pr-0'
              >
                {/* Mirror for width calculation */}
                <div
                  ref={mirrorRef}
                  className='invisible absolute whitespace-nowrap text-[13px] sm:text-[14px] font-medium opacity-0 pointer-events-none'
                  aria-hidden='true'
                  style={{ left: 0 }}
                >
                  {query || 'Search documentation...'}
                </div>

                {/* Input container */}
                <motion.div
                  ref={inputContainerRef}
                  className='h-full flex items-center relative'
                  animate={{ width: baseW + extraWidth }}
                  transition={smoothSpring}
                  style={{ minWidth: baseW, maxWidth: 450 }}
                >
                  <input
                    ref={inputRef}
                    type='text'
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                    placeholder='Search documentation...'
                    className='w-full bg-transparent border-none outline-none text-[#1B1B1B] font-medium text-[13px] sm:text-[14px] placeholder:text-[#1B1B1B]/30 leading-[20px] h-[20px] py-0 m-0'
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
