import { useCallback, useEffect, useRef, useState } from 'react';

export function useAudioPlayer(initialSource = '') {
  const audioRef = useRef(null);
  const [source, setSourceState] = useState(initialSource);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.playsInline = true;
    audioRef.current = audio;

    const onLoaded = () => setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
    const onTime = () => setCurrentTime(audio.currentTime || 0);
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  const setSource = useCallback((nextSource) => {
    const audio = audioRef.current;
    const safeSource = typeof nextSource === 'string' ? nextSource : '';

    setSourceState(safeSource);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    if (!audio) return;

    audio.pause();
    audio.removeAttribute('src');

    if (safeSource) {
      audio.src = safeSource;
      audio.load();
    }
  }, []);

  const play = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !source) return false;

    try {
      await audio.play();
      setIsPlaying(true);
      return true;
    } catch {
      setIsPlaying(false);
      return false;
    }
  }, [source]);

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(async () => {
    if (isPlaying) {
      pause();
      return false;
    }

    return play();
  }, [isPlaying, pause, play]);

  const seek = useCallback((time) => {
    const audio = audioRef.current;
    if (!audio) return;

    const nextTime = Math.max(0, Math.min(Number(time) || 0, duration || 0));
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, [duration]);

  const skip = useCallback((seconds) => {
    seek(currentTime + seconds);
  }, [currentTime, seek]);

  const setVolume = useCallback((nextVolume) => {
    const value = Math.max(0, Math.min(1, Number(nextVolume)));
    setVolumeState(Number.isFinite(value) ? value : 0.8);
  }, []);

  const toggleMute = useCallback(() => {
    setMuted((value) => !value);
  }, []);

  return {
    source,
    setSource,
    isPlaying,
    play,
    pause,
    toggle,
    duration,
    currentTime,
    seek,
    skip,
    volume,
    setVolume,
    muted,
    toggleMute,
  };
}
