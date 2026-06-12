import { useCallback, useEffect, useRef, useState } from 'react';
import { clampProgress, clampVolume, formatAudioTime } from '../services/audioService.js';

export function useAudioPlayer() {
  const audioRef = useRef(null);
  const [source, setSourceState] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(() => {
    const saved = Number(localStorage.getItem('pc_ia_audio_volume'));
    return Number.isFinite(saved) ? clampVolume(saved) : 1;
  });
  const [muted, setMuted] = useState(() => localStorage.getItem('pc_ia_audio_muted') === '1');

  const sync = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentTime(Number.isFinite(audio.currentTime) ? audio.currentTime : 0);
    setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);

    audio.volume = volume;
    audio.muted = muted;

    audio.addEventListener('timeupdate', sync);
    audio.addEventListener('loadedmetadata', sync);
    audio.addEventListener('durationchange', sync);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', sync);
      audio.removeEventListener('loadedmetadata', sync);
      audio.removeEventListener('durationchange', sync);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [muted, sync, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.volume = volume;
    localStorage.setItem('pc_ia_audio_volume', String(volume));
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) audio.muted = muted;
    localStorage.setItem('pc_ia_audio_muted', muted ? '1' : '0');
  }, [muted]);

  function setSource(url, autoplay = false) {
    const audio = audioRef.current;
    setSourceState(url || '');
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    if (!audio) return;

    audio.pause();
    audio.src = url || '';
    audio.load();

    if (autoplay && url) {
      window.setTimeout(() => audio.play().catch(() => {}), 150);
    }
  }

  function toggle() {
    const audio = audioRef.current;
    if (!audio?.src) return;
    if (audio.paused) audio.play().catch(() => {});
    else audio.pause();
  }

  function seek(progress) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = clampProgress(progress) * duration;
    sync();
  }

  function seekBy(seconds) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = Math.min(duration, Math.max(0, audio.currentTime + seconds));
    sync();
  }

  function setVolume(nextVolume) {
    setVolumeState(clampVolume(nextVolume));
    if (Number(nextVolume) > 0 && muted) setMuted(false);
  }

  function toggleMute() {
    setMuted((current) => !current);
  }

  return {
    audioRef,
    source,
    hasSource: Boolean(source),
    isPlaying,
    currentTime,
    duration,
    currentTimeLabel: formatAudioTime(currentTime),
    durationLabel: formatAudioTime(duration),
    progress: duration ? currentTime / duration : 0,
    volume,
    muted,
    setSource,
    toggle,
    seek,
    seekBy,
    setVolume,
    toggleMute,
  };
}
