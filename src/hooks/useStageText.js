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
      .catch((stageError) => {
        if (cancelled) return;
        console.error('[Playback Cifras IA] Erro no Modo Palco:', stageError);
        setError(stageError?.message || 'Não foi possível montar o Modo Palco.');
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
    loading: status === 'loading',
  };
}
