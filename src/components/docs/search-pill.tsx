'use client';

import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Menu, FileText, Clock, ArrowRight, CornerDownLeft, Hash, BookOpen, ChevronRight, X } from 'lucide-react';
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
  const showPanel = isFocused && isReady;
  const [results, setResults] = useState<SearchResult[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);

  useEffect(() => {
    if (!showPanel || query) return;

    const sections = ['section-recents', 'section-getting-started', 'section-popular'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { 
        threshold: 0.2,
        rootMargin: '-80px 0px -60% 0px' 
      }
    );

    sections.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [showPanel, query]);

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

  /* ── Determine panel content ── */
  const hasQuery = query.trim().length > 0;

  return (
    <div className='fixed bottom-6 sm:bottom-8 left-0 right-0 z-[1000] px-5 flex justify-center pointer-events-none'>
      {/* ─── Overlay + Card Layout ─── */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='fixed inset-0 z-[999] bg-white pointer-events-auto overflow-y-auto flex flex-col items-center'
          >
            <div className='w-full max-w-[1400px] mx-auto px-8 pt-32 pb-48 flex flex-row relative'>
              {/* Left Ghost Spacer for Centering */}
              <div className='hidden lg:block w-[260px] shrink-0' aria-hidden="true" />

              {/* Main Content Area */}
              <div className='flex-1 max-w-[820px] mx-auto flex flex-col gap-[100px]'>
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
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => navigateTo(r.id, r.label, r.group)}
                            onMouseEnter={() => setActiveIdx(idx)}
                            className={`p-6 rounded-[20px] text-left border transition-all duration-300 ${
                              activeIdx === idx 
                                ? 'bg-[#005E50] border-[#005E50] shadow-xl translate-y-[-2px]' 
                                : 'bg-white border-black/[0.05] hover:border-black/10'
                            }`}
                          >
                            <div className='flex items-center gap-3 mb-4'>
                              <div className={`p-2 rounded-lg ${activeIdx === idx ? 'bg-white/20 text-white' : 'bg-black/[0.03] text-[#1B1B1B]/40'}`}>
                                <FileText size={16} />
                              </div>
                              <span className={`text-[10px] font-bold tracking-widest uppercase ${activeIdx === idx ? 'text-white/60' : 'text-[#1B1B1B]/30'}`}>
                                {r.group}
                              </span>
                            </div>
                            <h4 className={`text-[17px] font-semibold mb-2 leading-tight ${activeIdx === idx ? 'text-white' : 'text-[#1B1B1B]'}`}>
                              {r.label}
                            </h4>
                            <p className={`text-[13px] line-clamp-2 leading-relaxed ${activeIdx === idx ? 'text-white/70' : 'text-[#1B1B1B]/40'}`}>
                              {r.snippet}
                            </p>
                          </motion.button>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className='text-center py-32'>
                      <div className='inline-flex items-center justify-center w-16 h-16 rounded-full bg-black/[0.03] mb-6'>
                        <Search size={24} className='text-[#1B1B1B]/20' />
                      </div>
                      <h3 className='text-[18px] font-semibold text-[#1B1B1B] mb-2'>No results found</h3>
                      <p className='text-[#1B1B1B]/40 max-w-[300px] mx-auto text-[14px]'>
                        We couldn't find anything matching "{query}". Try a different term.
                      </p>
                    </div>
                  )
                ) : (
                  <>
                    {/* ── Recents ── */}
                    {recentSearches.length > 0 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-100px' }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className='flex flex-col gap-[24px]'
                      >
                        <h3 id="section-recents" className='text-[22px] font-bold text-[#1B1B1B]/60'>
                          Recents
                        </h3>
                        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-16 gap-y-10'>
                          {recentSearches.map((item, idx) => {
                            const isHovered = hoveredItemId === `recent-${item.id}`;
                            return (
                              <motion.button
                                key={`recent-${item.id}-${idx}`}
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
                    {SUGGESTED_SECTIONS.map((group, groupIdx) => {
                      const isGettingStarted = group.category === 'Getting Started';
                      
                      return (
                        <motion.div 
                          key={group.category} 
                          id={`section-${group.category.toLowerCase().replace(/ /g, '-')}`}
                          initial={{ opacity: 0, y: 40 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true, margin: '-100px' }}
                          transition={{ duration: 0.8, ease: "easeOut", delay: groupIdx * 0.1 }}
                          className='flex flex-col gap-[32px]'
                        >
                          <h3 className='text-[22px] font-bold text-[#1B1B1B]/60'>
                            {group.category}
                          </h3>
                          
                          <div className={`grid grid-cols-1 ${isGettingStarted ? 'lg:grid-cols-3 gap-4 lg:-mx-12' : 'sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:-mx-8'}`}>
                            {group.items.map((id) => {
                              const meta = resolveSectionMeta(id);
                              if (!meta) return null;
                              const isHovered = hoveredItemId === `suggested-${id}`;
                              
                              if (isGettingStarted) {
                                return (
                                  <motion.button
                                    key={id}
                                    onClick={() => navigateTo(meta.id, meta.label, meta.group, meta.snippet)}
                                    onMouseEnter={() => setHoveredItemId(`suggested-${id}`)}
                                    onMouseLeave={() => setHoveredItemId(null)}
                                    animate={{
                                      y: isHovered ? -8 : 0,
                                      opacity: hoveredItemId !== null && !isHovered ? 0.5 : 1,
                                    }}
                                    transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                                    className='text-left bg-white rounded-[24px] p-6 sm:p-8 flex flex-col gap-6 sm:gap-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] hover:shadow-[0_32px_80px_rgba(0,0,0,0.08)] transition-all duration-500 cursor-pointer group border border-black/[0.03] h-full relative'
                                  >
                                    <div className='flex flex-col gap-3 flex-1'>
                                      <motion.h4 
                                        animate={{ color: isHovered ? '#0d9488' : '#1B1B1B' }}
                                        className='text-[20px] sm:text-[22px] font-semibold leading-[1.2] tracking-[-0.03em] w-full'
                                      >
                                        {meta.label}
                                      </motion.h4>
                                      <motion.p 
                                        animate={{ color: isHovered ? '#0d9488' : 'rgba(27, 27, 27, 0.3)' }}
                                        className='text-[13px] sm:text-[14px] leading-[1.6] line-clamp-3 font-medium'
                                        style={{ textWrap: 'pretty' } as any}
                                      >
                                        {meta.snippet}
                                      </motion.p>
                                    </div>

                                    <div className='mt-auto pt-4'>
                                      <motion.span 
                                        animate={{ 
                                          opacity: isHovered ? 1 : 0.5,
                                          backgroundColor: 'transparent',
                                          color: isHovered ? '#0d9488' : '#1B1B1B',
                                          borderColor: isHovered ? '#0d9488' : 'rgba(0,0,0,0.1)'
                                        }}
                                        transition={{ duration: 0.3, ease: "easeOut" }}
                                        className='flex items-center justify-center gap-2 text-[11px] sm:text-[12px] font-bold px-4 sm:px-6 py-2.5 rounded-[12px] border w-full group/btn whitespace-nowrap'
                                      >
                                        Start Learning 
                                        <ChevronRight 
                                          size={14} 
                                          className={`transition-transform duration-300 ${isHovered ? 'translate-x-0.5' : ''}`} 
                                        />
                                      </motion.span>
                                    </div>
                                  </motion.button>
                                );
                              }

                              return (
                                <motion.button
                                  key={id}
                                  onClick={() => navigateTo(meta.id, meta.label, meta.group, meta.snippet)}
                                  onMouseEnter={() => setHoveredItemId(`suggested-${id}`)}
                                  onMouseLeave={() => setHoveredItemId(null)}
                                  animate={{
                                    y: isHovered ? -2 : 0,
                                    opacity: hoveredItemId !== null && !isHovered ? 0.9 : 1
                                  }}
                                  transition={{ duration: 0.2, ease: "easeOut" }}
                                  className='text-left bg-white rounded-[24px] p-6 flex flex-col gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.04)] transition-shadow duration-300 cursor-pointer group border border-black/[0.04] h-full'
                                >
                                  {/* Minimal Icon */}
                                  <motion.div 
                                    className='mb-2 text-[#1B1B1B]'
                                    animate={{
                                      color: isHovered ? '#0d9488' : '#1B1B1B'
                                    }}
                                    transition={{ duration: 0.2 }}
                                  >
                                    <FileText size={32} strokeWidth={1.5} />
                                  </motion.div>
                                  
                                  {/* Title and Snippet */}
                                  <div className='flex flex-col gap-2 flex-1'>
                                    <h4 className='text-[16px] font-semibold text-[#1B1B1B] leading-tight group-hover:text-[#0d9488] transition-colors duration-200'>
                                      {splitToTwoLines(meta.label)}
                                    </h4>
                                    <p className='text-[12px] text-[#1B1B1B]/60 leading-relaxed line-clamp-3 font-medium'>
                                      {meta.snippet}
                                    </p>
                                  </div>

                                  {/* Learn More Pill */}
                                  <div className='mt-2 w-full'>
                                    <div className='w-full rounded-full bg-[#F5F5F7] py-2 text-center text-[11px] font-semibold text-[#1B1B1B]/70 group-hover:bg-[#0d9488] group-hover:text-white transition-colors duration-200'>
                                      Learn more
                                    </div>
                                  </div>
                                </motion.button>
                              );
                            })}
                          </div>
                        </motion.div>
                      );
                    })}

                    {isIndexLoading && (
                      <div className='text-center py-12'>
                        <span className='text-[12px] text-[#1B1B1B]/15'>Loading search index…</span>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Sidebar Navigation */}
              {!hasQuery && (
                <div className='hidden lg:block w-[260px] shrink-0 sticky top-48 h-fit border-l border-black/[0.05] pl-12 self-start'>
                  <div className='flex flex-col gap-6'>
                    <nav className='flex flex-col gap-4'>
                      {[
                        { id: 'section-recents', label: 'recents', show: recentSearches.length > 0 },
                        { id: 'section-getting-started', label: 'getting started', show: true },
                        { id: 'section-popular', label: 'popular', show: true }
                      ].filter(l => l.show).map((link) => {
                        const isActive = activeSection === link.id;
                        return (
                          <button
                            key={link.id}
                            onClick={() => document.getElementById(link.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                            className='flex items-center group text-left transition-all duration-300'
                          >
                            <span className={`text-[13px] font-medium transition-colors duration-300 ${isActive ? 'text-[#0d9488]' : 'text-[#1B1B1B]/40 group-hover:text-[#1B1B1B]/70'}`}>
                              {link.label}
                            </span>
                          </button>
                        );
                      })}
                    </nav>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Bottom Action Bar ─── */}
      <div className='relative z-[1001] flex items-center gap-4 max-w-full pointer-events-auto'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0, 
            width: 'auto',
            backgroundColor: isFocused ? '#005E50' : '#F1F1F4',
            borderColor: isFocused ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.1)'
          }}
          transition={{
            opacity: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 1.2, ease: [0.16, 1, 0.3, 1] },
            backgroundColor: { duration: 0.4 },
            borderColor: { duration: 0.4 }
          }}
          className='relative rounded-full shadow-lg flex items-center border h-[48px] sm:h-[52px] max-w-[92vw] sm:max-w-[600px] overflow-hidden'
          style={{ paddingLeft: onMenuClick ? '6px' : '8px', paddingRight: '8px' }}
        >
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className={`lg:hidden flex items-center justify-center w-[40px] h-[40px] rounded-full transition-colors shrink-0 ${isFocused ? 'text-white/90 hover:bg-white/10' : 'text-[#1B1B1B]/60 hover:bg-black/5'}`}
            >
              <Menu size={18} />
            </button>
          )}

          <div className={`flex items-center justify-center w-[36px] sm:w-[40px] h-[36px] sm:h-[40px] shrink-0 transition-colors ${isFocused ? 'text-white/70' : 'text-[#1B1B1B]/40'}`}>
            <Search size={18} />
          </div>

          <AnimatePresence>
            {isReady && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className='relative bg-white rounded-full h-[36px] sm:h-[40px] flex items-center overflow-hidden pl-3 sm:pl-4 pr-2'
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
                <div className='flex items-center justify-center shrink-0 h-[20px] sm:h-[24px] px-1 sm:px-1.5 rounded-md sm:rounded-lg bg-[#F5F5F7] text-[#1B1B1B]/40 text-[8px] sm:text-[10px] font-bold tracking-widest font-mono border border-black/5 ml-[2px] mr-0'>
                  ⌘K
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ─── Cancel Button (Always to the right of the pill on search page) ─── */}
        <AnimatePresence>
          {isFocused && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8, x: -20 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8, x: -20 }}
              onClick={() => setIsFocused(false)}
              className='h-[48px] sm:h-[52px] w-[48px] sm:w-[52px] rounded-full bg-[#F1F1F4] border border-black/5 shadow-none flex items-center justify-center text-[#1B1B1B]/60 hover:text-[#1B1B1B] transition-all hover:scale-110 active:scale-95 pointer-events-auto'
              aria-label='Close search'
            >
              <X size={20} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
