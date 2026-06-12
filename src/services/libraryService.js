export const COLLECTION_FILTERS = {
  all: 'all',
  favorites: 'favorites',
  recent: 'recent',
};

export const MAX_RECENTS = 20;

export function getSongKey(song) {
  return song?.id || song?.pdfId || `${song?.style || ''}|${song?.title || ''}`;
}

export function normalizeText(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function songMatchesQuery(song, query) {
  const term = normalizeText(query);
  if (!term) return true;

  const searchableText = normalizeText([
    song?.title,
    song?.artist,
    song?.style,
    song?.fileName,
  ].filter(Boolean).join(' '));

  return searchableText.includes(term);
}

export function filterSongs({
  songs = [],
  query = '',
  collectionFilter = COLLECTION_FILTERS.all,
  favoriteIds = [],
  recentIds = [],
}) {
  const favoriteSet = new Set(favoriteIds);
  const recentSet = new Set(recentIds);

  return songs.filter((song) => {
    const key = getSongKey(song);

    if (collectionFilter === COLLECTION_FILTERS.favorites && !favoriteSet.has(key)) {
      return false;
    }

    if (collectionFilter === COLLECTION_FILTERS.recent && !recentSet.has(key)) {
      return false;
    }

    return songMatchesQuery(song, query);
  });
}

export function toggleSongKey(list = [], song) {
  const key = getSongKey(song);
  if (!key) return { next: list, active: false };

  if (list.includes(key)) {
    return { next: list.filter((item) => item !== key), active: false };
  }

  return { next: [...list, key], active: true };
}

export function addRecentSong(list = [], song) {
  const key = getSongKey(song);
  if (!key) return list;

  return [key, ...list.filter((item) => item !== key)].slice(0, MAX_RECENTS);
}

export function buildLibraryStats({ total = 0, visible = 0, favoriteCount = 0, recentCount = 0 }) {
  return {
    total,
    visible,
    favoriteCount,
    recentCount,
    hasFavorites: favoriteCount > 0,
    hasRecents: recentCount > 0,
  };
}
