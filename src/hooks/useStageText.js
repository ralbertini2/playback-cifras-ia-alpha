import { useCallback, useEffect, useState } from 'react';
import { extractStagePagesFromPdf } from '../services/stageTextService.js';

const MIN_STAGE_SCALE = 0.9;
const MAX_STAGE_SCALE = 2.2;
const STAGE_STEP = 0.1;

function clamp(value) {
  return Math.min(MAX_STAGE_SCALE, Math.max(MIN_STAGE_SCALE, Number(value.toFixed(2))));
}

export function useStageText(source) {
  const [pages, setPages] = useState([]);
  const [scale, setScale] = useState(1.18);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setPages([]);
    setError('');
    setStatus(source ? 'loading' : 'idle');

    if (!source) return undefined;

    extractStagePagesFromPdf(source)
      .then((nextPages) => {
        if (cancelled) return;
        setPages(nextPages);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[Playback Cifras IA] Erro ao gerar Modo Palco:', err);
        setError(err?.message || 'Não foi possível gerar o Modo Palco deste PDF.');
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [source]);

  const increaseScale = useCallback(() => {
    setScale((current) => clamp(current + STAGE_STEP));
  }, []);

  const decreaseScale = useCallback(() => {
    setScale((current) => clamp(current - STAGE_STEP));
  }, []);

  const resetScale = useCallback(() => {
    setScale(1.18);
  }, []);

  return {
    pages,
    scale,
    status,
    error,
    increaseScale,
    decreaseScale,
    resetScale,
  };
}
