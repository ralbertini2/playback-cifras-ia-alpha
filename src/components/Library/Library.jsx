import { Clock3, Search, Star } from 'lucide-react';
import styles from './Library.module.css';

export default function Library({
  songs = [],
  currentSongId,
  loading = false,
  searchQuery,
  setSearchQuery,
  collectionFilter,
  setCollectionFilter,
  favoriteCount = 0,
  recentCount = 0,
  isFavorite,
  onToggleFavorite,
  onSelectSong,
}) {
  return (
    <section className={styles.library} aria-label="Biblioteca de músicas">
      <div className={styles.header}>
        <div>
          <label>Biblioteca</label>
          <span>{songs.length} música(s) visível(is)</span>
        </div>
      </div>

      <div className={styles.searchBox}>
        <Search size={16} />
        <input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Buscar música, artista ou estilo"
          aria-label="Buscar na biblioteca"
        />
      </div>

      <div className={styles.filters} role="tablist" aria-label="Filtros da biblioteca">
        <button className={collectionFilter === 'all' ? styles.activeFilter : ''} onClick={() => setCollectionFilter('all')}>Todas</button>
        <button className={collectionFilter === 'favorites' ? styles.activeFilter : ''} onClick={() => setCollectionFilter('favorites')}><Star size={14} /> Favoritas {favoriteCount ? `(${favoriteCount})` : ''}</button>
        <button className={collectionFilter === 'recent' ? styles.activeFilter : ''} onClick={() => setCollectionFilter('recent')}><Clock3 size={14} /> Recentes {recentCount ? `(${recentCount})` : ''}</button>
      </div>

      <div className={styles.songList}>
        {loading ? (
          <div className={styles.empty}>Atualizando biblioteca...</div>
        ) : songs.length === 0 ? (
          <div className={styles.empty}>Nenhuma música encontrada. Atualize o Drive ou ajuste os filtros.</div>
        ) : songs.map((song, index) => {
          const favorite = isFavorite?.(song);
          return (
            <div key={song.id || `${song.title}-${index}`} className={`${styles.songItem} ${song.id === currentSongId ? styles.activeSong : ''}`}>
              <button className={styles.songButton} onClick={() => onSelectSong(index)}>
                <span>{song.title}</span>
                <small>{song.artist || song.style || 'Sem metadados'}</small>
              </button>
              <button
                className={`${styles.favoriteButton} ${favorite ? styles.favoriteActive : ''}`}
                onClick={() => onToggleFavorite?.(song)}
                aria-label={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                title={favorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Star size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
