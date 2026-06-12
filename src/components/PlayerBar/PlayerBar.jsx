import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import styles from './PlayerBar.module.css';

export default function PlayerBar({ audioRef, isPlaying, currentTimeLabel, durationLabel, progress, onToggle, onSeek, onPrevious, onNext }) {
  return (
    <footer className={styles.player}>
      <audio ref={audioRef} preload="metadata" />
      <div className={styles.timeline}>
        <span>{currentTimeLabel}</span>
        <input
          className={styles.seek}
          type="range"
          min="0"
          max="1000"
          value={Math.round(progress * 1000)}
          onChange={(event) => onSeek(Number(event.target.value) / 1000)}
          aria-label="Progresso da música"
        />
        <span>{durationLabel}</span>
      </div>
      <div className={styles.controls}>
        <button className={styles.controlButton} onClick={onPrevious}><SkipBack size={28} /><span>Voltar</span></button>
        <button className={`${styles.controlButton} ${styles.playButton}`} onClick={onToggle}>{isPlaying ? <Pause size={34} /> : <Play size={34} />}<span>{isPlaying ? 'Pausar' : 'Tocar'}</span></button>
        <button className={styles.controlButton} onClick={onNext}><SkipForward size={28} /><span>Próxima</span></button>
      </div>
    </footer>
  );
}
