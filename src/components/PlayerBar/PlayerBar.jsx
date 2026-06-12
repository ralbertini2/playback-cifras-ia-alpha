import { Pause, Play, SkipBack, SkipForward } from 'lucide-react';
import styles from './PlayerBar.module.css';

export default function PlayerBar({ audioRef, isPlaying, currentTimeLabel, durationLabel, progress, onToggle, onSeek, onPrevious, onNext }) {
  return (
    <div className={styles.playerBar}>
      <audio ref={audioRef} />
      <div className={styles.timeline}>
        <span>{currentTimeLabel}</span>
        <input type="range" min="0" max="100" value={Math.round((progress || 0) * 100)} onChange={(event) => onSeek(Number(event.target.value) / 100)} aria-label="Progresso do áudio" />
        <span>{durationLabel}</span>
      </div>
      <div className={styles.buttons}>
        <button onClick={onPrevious}><SkipBack size={24} />Voltar</button>
        <button className={styles.playButton} onClick={onToggle}>{isPlaying ? <Pause size={30} /> : <Play size={30} />}Tocar</button>
        <button onClick={onNext}><SkipForward size={24} />Próxima</button>
      </div>
    </div>
  );
}
