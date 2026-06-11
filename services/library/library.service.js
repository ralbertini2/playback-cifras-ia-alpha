// Biblioteca própria Playback Cifras — base local para futura evolução com backend.
const LIBRARY_KEY = 'pc_v13_songs';

export function createSongRecord(data = {}){
  return {
    id: data.id || crypto.randomUUID?.() || String(Date.now()),
    title: data.title || '',
    artist: data.artist || '',
    album: data.album || '',
    key: data.key || '',
    bpm: data.bpm || '',
    category: data.category || data.style || '',
    notes: data.notes || '',
    tags: Array.isArray(data.tags) ? data.tags : [],
    favorite: !!data.favorite,
    addedAt: data.addedAt || new Date().toISOString(),
    cover: data.cover || null,
    files: {
      originalAudio: data.files?.originalAudio || null,
      playback: data.files?.playback || data.mp3Id || null,
      cifra: data.files?.cifra || null,
      pdf: data.files?.pdf || data.pdfId || null,
      stems: data.files?.stems || []
    },
    source: data.source || 'google-drive'
  };
}

export function getLocalSongs(){
  try { return JSON.parse(localStorage.getItem(LIBRARY_KEY) || '[]'); }
  catch { return []; }
}

export function saveLocalSongs(songs){
  localStorage.setItem(LIBRARY_KEY, JSON.stringify(Array.isArray(songs) ? songs : []));
}

export function upsertSong(song){
  const songs = getLocalSongs();
  const record = createSongRecord(song);
  const idx = songs.findIndex(s => s.id === record.id);
  if(idx >= 0) songs[idx] = {...songs[idx], ...record};
  else songs.push(record);
  saveLocalSongs(songs);
  return record;
}
