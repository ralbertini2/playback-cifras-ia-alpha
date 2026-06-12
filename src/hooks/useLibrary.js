import { useCallback, useMemo, useState } from 'react';
import { STORAGE, readJson, writeJson } from '../services/storage.js';

const RECENTS_KEY = 'pc_recent_songs_v2';
const MAX_RECENTS = 20;

export function getSongKey(song) {
  return song?.id || song?.pdfId || `${song?.style || ''}|${song?.title || ''}`;
}

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function matchesQuery(song, query) {
  const term = normalize(query);
  if (!term) return true;
  const haystack = normalize([
    song?.title,
    song?.artist,
    song?.style,
    song?.fileName,
  ].filter(Boolean).join(' '));
  return haystack.includes(term);
}

export function useLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionFilter, setCollectionFilter] = useState('all');
  const [favoriteIds, setFavoriteIds] = useState(() => readJson(STORAGE.favorites, []));
  const [recentIds, setRecentIds] = useState(() => readJson(RECENTS_KEY, []));

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const recentSet = useMemo(() => new Set(recentIds), [recentIds]);

  const isFavorite = useCallback((song) => favoriteSet.has(getSongKey(song)), [favoriteSet]);

  const toggleFavorite = useCallback((song) => {
    if (!song) return false;
    const key = getSongKey(song);
    let becameFavorite = false;
    const next = favoriteSet.has(key)
      ? favoriteIds.filter((item) => item !== key)
      : (becameFavorite = true, [...favoriteIds, key]);
    setFavoriteIds(next);
    writeJson(STORAGE.favorites, next);
    return becameFavorite;
  }, [favoriteIds, favoriteSet]);

  const rememberRecent = useCallback((song) => {
    if (!song) return;
    const key = getSongKey(song);
    const next = [key, ...recentIds.filter((item) => item !== key)].slice(0, MAX_RECENTS);
    setRecentIds(next);
    writeJson(RECENTS_KEY, next);
  }, [recentIds]);

  const applyFilters = useCallback((songs = []) => {
    return songs.filter((song) => {
      const key = getSongKey(song);
      if (collectionFilter === 'favorites' && !favoriteSet.has(key)) return false;
      if (collectionFilter === 'recent' && !recentSet.has(key)) return false;
      return matchesQuery(song, searchQuery);
    });
  }, [collectionFilter, favoriteSet, recentSet, searchQuery]);

  return {
    searchQuery,
    setSearchQuery,
    collectionFilter,
    setCollectionFilter,
    favoriteIds,
    recentIds,
    favoriteCount: favoriteIds.length,
    recentCount: recentIds.length,
    isFavorite,
    toggleFavorite,
    rememberRecent,
    applyFilters,
  };
}
