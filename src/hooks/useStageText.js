import { useEffect, useState } from 'react';
import { extractStagePages } from '../services/stageTextService.js';

export function useStageText(source) {
  const [pages, setPages] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    setPages([]);
    setError('');
    setStatus(source ? 'loading' : 'idle');

    if (!source) return undefined;

    extractStagePages(source)
      .then((nextPages) => {
        if (cancelled) return;
        setPages(nextPages);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[Playback Cifras IA] Erro ao ler texto do PDF para Modo Palco:', err);
        setError(err?.message || 'Não foi possível ler o texto deste PDF.');
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [source]);

  return {
    pages,
    status,
    error,
  };
}
