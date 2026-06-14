import { useCallback, useMemo, useState } from 'react';
import { STORAGE, readJson, writeJson } from '../services/storage.js';
import {
  COLLECTION_FILTERS,
  addRecentSong,
  buildLibraryStats,
  filterSongs,
  getSongKey,
  toggleSongKey,
} from '../services/libraryService.js';

export { COLLECTION_FILTERS, getSongKey };

export function useLibrary() {
  const [searchQuery, setSearchQuery] = useState('');
  const [collectionFilter, setCollectionFilter] = useState(COLLECTION_FILTERS.all);
  const [favoriteIds, setFavoriteIds] = useState(() => readJson(STORAGE.favorites, []));
  const [recentIds, setRecentIds] = useState(() => readJson(STORAGE.recents, []));

  const favoriteSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const recentSet = useMemo(() => new Set(recentIds), [recentIds]);

  const isFavorite = useCallback((song) => favoriteSet.has(getSongKey(song)), [favoriteSet]);
  const isRecent = useCallback((song) => recentSet.has(getSongKey(song)), [recentSet]);

  const toggleFavorite = useCallback((song) => {
    if (!song) return false;

    const { next, active } = toggleSongKey(favoriteIds, song);
    setFavoriteIds(next);
    writeJson(STORAGE.favorites, next);
    return active;
  }, [favoriteIds]);

  const rememberRecent = useCallback((song) => {
    if (!song) return;

    const next = addRecentSong(recentIds, song);
    setRecentIds(next);
    writeJson(STORAGE.recents, next);
  }, [recentIds]);

  const clearSearch = useCallback(() => setSearchQuery(''), []);

  const showAllSongs = useCallback(() => {
    setCollectionFilter(COLLECTION_FILTERS.all);
    setSearchQuery('');
  }, []);

  const showFavorites = useCallback(() => setCollectionFilter(COLLECTION_FILTERS.favorites), []);
  const showRecents = useCallback(() => setCollectionFilter(COLLECTION_FILTERS.recent), []);

  const applyFilters = useCallback((songs = []) => filterSongs({
    songs,
    query: searchQuery,
    collectionFilter,
    favoriteIds,
    recentIds,
  }), [collectionFilter, favoriteIds, recentIds, searchQuery]);

  const getStats = useCallback((songs = [], visibleSongs = []) => buildLibraryStats({
    total: songs.length,
    visible: visibleSongs.length,
    favoriteCount: favoriteIds.length,
    recentCount: recentIds.length,
  }), [favoriteIds.length, recentIds.length]);

  return {
    searchQuery,
    setSearchQuery,
    clearSearch,
    collectionFilter,
    setCollectionFilter,
    favoriteIds,
    recentIds,
    favoriteCount: favoriteIds.length,
    recentCount: recentIds.length,
    isFavorite,
    isRecent,
    toggleFavorite,
    rememberRecent,
    applyFilters,
    showAllSongs,
    showFavorites,
    showRecents,
    getStats,
  };
}
