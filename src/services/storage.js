export const STORAGE = {
  token: 'pc_token',
  folder: 'pc_root_folder_id',
  style: 'pc_selected_style',
  favorites: 'pc_favorites_v1',
  playlists: 'pc_playlists_v1',
  activePlaylist: 'pc_active_playlist',
  library: 'pc_library_cache_v1',
  connected: 'pc_google_connected'
};

export function readJson(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
