export function sortSongsByTitle(songs = []) {
  return [...songs].sort((a, b) => String(a.title || '').localeCompare(String(b.title || ''), 'pt-BR'));
}

export function groupSongsByStyle(songs = []) {
  return songs.reduce((groups, song) => {
    const style = song.style || 'Sem estilo';
    if (!groups[style]) groups[style] = [];
    groups[style].push(song);
    return groups;
  }, {});
}

export function countLibraryStats(songs = [], playlists = {}) {
  return {
    songs: songs.length,
    styles: new Set(songs.map((song) => song.style).filter(Boolean)).size,
    playlists: Object.keys(playlists).length,
  };
}
