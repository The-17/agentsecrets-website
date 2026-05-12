'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import MiniSearch, { type SearchResult as MiniSearchResult } from 'minisearch';

const RECENT_SEARCHES_KEY = 'as-docs-recent-searches';
const MAX_RECENT = 5;

export interface SearchResult {
  id: string;    // Full composite ID: sectionId::headingId
  title: string; // Heading or Page Title
  group: string; // Docs Group
  label: string; // Section Label
  score: number;
}

/**
 * Manages recent searches in localStorage.
 */
function getRecentSearches(): { id: string; label: string; group: string }[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addRecentSearch(item: { id: string; label: string; group: string }) {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentSearches().filter(r => r.id !== item.id);
    const updated = [item, ...existing].slice(0, MAX_RECENT);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    // localStorage may be unavailable
  }
}

/**
 * React hook for documentation search.
 * Lazy-loads the search index on first use, then performs instant client-side search.
 */
export function useDocSearch() {
  const miniSearchRef = useRef<MiniSearch | null>(null);
  const [isIndexLoaded, setIsIndexLoaded] = useState(false);
  const [isIndexLoading, setIsIndexLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<{ id: string; label: string; group: string }[]>([]);

  // Load recent searches on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Lazy-load the index
  const ensureIndex = useCallback(async (): Promise<MiniSearch | null> => {
    if (miniSearchRef.current) return miniSearchRef.current;
    if (isIndexLoading) return null;
    
    setIsIndexLoading(true);
    try {
      const res = await fetch('/search-index.json');
      if (!res.ok) {
        console.error('Failed to load search index:', res.status);
        return null;
      }
      const data = await res.json();
      const ms = MiniSearch.loadJSON<SearchResult>(JSON.stringify(data), {
        fields: ['title', 'body', 'label'],
        storeFields: ['title', 'group', 'label'],
        searchOptions: {
          boost: { title: 4, label: 2, body: 1 },
          fuzzy: 0.2,
          prefix: true,
        },
      });
      miniSearchRef.current = ms;
      setIsIndexLoaded(true);
      return ms;
    } catch (err) {
      console.error('Error loading search index:', err);
      return null;
    } finally {
      setIsIndexLoading(false);
    }
  }, [isIndexLoading]);

  // Search function
  const search = useCallback(async (query: string): Promise<SearchResult[]> => {
    const trimmed = query.trim();
    if (!trimmed) return [];
    
    const ms = await ensureIndex();
    if (!ms) return [];

    const results = ms.search(trimmed, {
      boost: { title: 4, label: 2, body: 1 },
      fuzzy: 0.2,
      prefix: true,
    }) as (MiniSearchResult & { title: string; group: string; label: string })[];

    return results.slice(0, 8).map(r => ({
      id: r.id,
      title: r.title,
      group: r.group,
      label: r.label,
      score: r.score,
    }));
  }, [ensureIndex]);

  // Track a navigation as a recent search
  const trackRecent = useCallback((item: { id: string; label: string; group: string }) => {
    addRecentSearch(item);
    setRecentSearches(getRecentSearches());
  }, []);

  return {
    search,
    ensureIndex,
    isIndexLoaded,
    isIndexLoading,
    recentSearches,
    trackRecent,
  };
}
