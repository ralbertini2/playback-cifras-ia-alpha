import { useCallback, useEffect, useRef, useState } from 'react';
import { normalizeAudioSource } from '../services/audioService.js';

export function useAudioPlayer(initialSource = '') {
  const audioRef = useRef(null);
  const [source, setSourceState] = useState(() => normalizeAudioSource(initialSource));
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'metadata';
    audio.playsInline = true;
    audioRef.current = audio;

    const onLoaded = () => {
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);
      setError('');
    };

    const onTime = () => {
      setCurrentTime(audio.currentTime || 0);
    };

    const onEnded = () => {
      setIsPlaying(false);
    };

    const onError = () => {
      setIsPlaying(false);
      setError('URI inválida ou áudio indisponível.');
    };

    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);

    return () => {
      audio.pause();
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audioRef.current = null;
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  const stopAndClearAudio = useCallback(() => {
    const audio = audioRef.current;

    if (audio) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
    }

    setSourceState('');
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const setSource = useCallback((nextSource) => {
    const safeSource = normalizeAudioSource(nextSource);
    const audio = audioRef.current;

    setError('');

    if (!safeSource) {
      stopAndClearAudio();
      return false;
    }

    setSourceState(safeSource);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);

    if (!audio) {
      return true;
    }

    audio.pause();
    audio.src = safeSource;
    audio.load();

    return true;
  }, [stopAndClearAudio]);

  const play = useCallback(async () => {
    const audio = audioRef.current;

    if (!audio || !source) {
      setError('Nenhum áudio válido selecionado.');
      return false;
    }

    try {
      await audio.play();
      setIsPlaying(true);
      setError('');
      return true;
    } catch {
      setIsPlaying(false);
      setError('Não foi possível iniciar o áudio.');
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
    if (!audio || !source) return;

    const maxDuration = duration || 0;
    const nextTime = Math.max(0, Math.min(Number(time) || 0, maxDuration));
    audio.currentTime = nextTime;
    setCurrentTime(nextTime);
  }, [duration, source]);

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
    hasValidSource: Boolean(source),
    error,
    setSource,
    clearSource: stopAndClearAudio,
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
