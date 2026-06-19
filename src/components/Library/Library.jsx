import { FileText, Music, Search, Star, X } from 'lucide-react';
import styles from './Library.module.css';

function fileBadges(song) {
  const hasText = Boolean(song?.pdfFileId || song?.documentFileId || song?.pdfUrl);
  const hasAudio = Boolean(song?.audioFileId || song?.audioUrl);

  return { hasText, hasAudio };
}

export default function Library({
  songs = [],
  currentSongId,
  loading = false,
  searchQuery,
  setSearchQuery,
  clearSearch,
  collectionFilter,
  setCollectionFilter,
  favoriteCount = 0,
  totalSongs = 0,
  isFavorite,
  onToggleFavorite,
  onSelectSong,
}) {
  const visibleLabel = totalSongs > 0 ? `${songs.length} de ${totalSongs} música(s)` : `${songs.length} música(s)`;

  function changeFilter(filter) {
    setCollectionFilter(filter);
  }

  return (
    <section className={styles.library} aria-label="Biblioteca de músicas">
      <div className={styles.header}>
        <div>
          <label>Biblioteca</label>
          <span>{visibleLabel}</span>
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
        {searchQuery ? (
          <button onClick={clearSearch} aria-label="Limpar busca"><X size={15} /></button>
        ) : null}
      </div>

      <div className={styles.filters} role="tablist" aria-label="Filtros da biblioteca">
        <button className={collectionFilter === 'all' ? styles.activeFilter : ''} onClick={() => changeFilter('all')}>Todas</button>
        <button className={collectionFilter === 'favorites' ? styles.activeFilter : ''} onClick={() => changeFilter('favorites')}><Star size={14} /> Favoritas {favoriteCount ? `(${favoriteCount})` : ''}</button>
      </div>

      <div className={styles.tableHeader} aria-hidden="true">
        <span>Título</span>
        <span>Arquivos</span>
      </div>

      <div className={styles.songList}>
        {loading ? (
          <div className={styles.empty}>Atualizando biblioteca...</div>
        ) : songs.length === 0 ? (
          <div className={styles.empty}>Nenhuma música encontrada. Atualize o Drive ou ajuste os filtros.</div>
        ) : songs.map((song, index) => {
          const favorite = isFavorite?.(song);
          const { hasText, hasAudio } = fileBadges(song);
          return (
            <div key={song.id || `${song.title}-${index}`} className={`${styles.songItem} ${song.id === currentSongId ? styles.activeSong : ''}`}>
              <button className={styles.songButton} onClick={() => onSelectSong(index)}>
                <span>{song.title}</span>
                <small>{song.artist || song.style || 'Sem metadados'}</small>
              </button>
              <div className={styles.fileBadges} aria-label="Arquivos disponíveis">
                <span className={`${styles.fileBadge} ${hasText ? styles.fileBadgeActive : ''}`} title={hasText ? 'Letra cifrada disponível' : 'Sem letra cifrada'}>
                  <FileText size={14} />
                </span>
                <span className={`${styles.fileBadge} ${hasAudio ? styles.fileBadgeActive : ''}`} title={hasAudio ? 'MP3 disponível' : 'Sem MP3'}>
                  <Music size={14} />
                </span>
              </div>
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
