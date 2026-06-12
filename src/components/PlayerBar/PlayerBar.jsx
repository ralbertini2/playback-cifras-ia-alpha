import PlaybackControls from '../PlaybackControls/PlaybackControls.jsx';
import ProgressBar from '../ProgressBar/ProgressBar.jsx';
import VolumeControl from '../VolumeControl/VolumeControl.jsx';
import styles from './PlayerBar.module.css';

export default function PlayerBar({
  audioRef,
  title,
  hasSource,
  isPlaying,
  currentTimeLabel,
  durationLabel,
  progress,
  volume,
  muted,
  onToggle,
  onSeek,
  onSeekBack,
  onSeekForward,
  onPrevious,
  onNext,
  onVolumeChange,
  onToggleMute,
}) {
  const disabled = !hasSource;

  return (
    <div className={styles.playerBar} data-disabled={disabled ? 'true' : 'false'}>
      <audio ref={audioRef} preload="metadata" />

      <div className={styles.playerHeader}>
        <div className={styles.nowPlaying}>
          <span>Playback</span>
          <strong>{title || 'Nenhum áudio selecionado'}</strong>
        </div>
        <VolumeControl
          volume={volume}
          muted={muted}
          disabled={disabled}
          onVolumeChange={onVolumeChange}
          onToggleMute={onToggleMute}
        />
      </div>

      <ProgressBar
        currentTimeLabel={currentTimeLabel}
        durationLabel={durationLabel}
        progress={progress}
        disabled={disabled}
        onSeek={onSeek}
      />

      <PlaybackControls
        disabled={disabled}
        isPlaying={isPlaying}
        onToggle={onToggle}
        onPrevious={onPrevious}
        onNext={onNext}
        onSeekBack={onSeekBack}
        onSeekForward={onSeekForward}
      />
    </div>
  );
}
