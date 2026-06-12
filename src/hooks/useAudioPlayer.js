import { useEffect, useRef, useState } from 'react';

function formatTime(totalSeconds) {
  const safe = Math.max(0, Math.floor(totalSeconds || 0));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function useAudioPlayer() {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;
    const sync = () => {
      setCurrentTime(Number.isFinite(audio.currentTime) ? audio.currentTime : 0);
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    };
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    audio.addEventListener('timeupdate', sync);
    audio.addEventListener('loadedmetadata', sync);
    audio.addEventListener('durationchange', sync);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onPause);
    return () => {
      audio.removeEventListener('timeupdate', sync);
      audio.removeEventListener('loadedmetadata', sync);
      audio.removeEventListener('durationchange', sync);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onPause);
    };
  }, []);

  function setSource(url, autoplay = false) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.src = url || '';
    audio.load();
    setIsPlaying(false);
    setCurrentTime(0);
    if (autoplay && url) setTimeout(() => audio.play().catch(() => {}), 150);
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
    audio.currentTime = progress * duration;
  }

  return {
    audioRef,
    isPlaying,
    currentTime,
    duration,
    currentTimeLabel: formatTime(currentTime),
    durationLabel: formatTime(duration),
    progress: duration ? currentTime / duration : 0,
    setSource,
    toggle,
    seek
  };
}
