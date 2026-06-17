import { useEffect, useState } from 'react';
import { extractStagePages } from '../services/stageTextService.js';

export function useStageText(source) {
  const [status, setStatus] = useState(source ? 'loading' : 'idle');
  const [pages, setPages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    if (!source) {
      setStatus('idle');
      setPages([]);
      setError('');
      return undefined;
    }

    setStatus('loading');
    setError('');
    setPages([]);

    extractStagePages(source)
      .then((nextPages) => {
        if (cancelled) return;
        setPages(Array.isArray(nextPages) ? nextPages : []);
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('[Playback Cifras Beta] Falha no Modo Palco.', err);
        setError(err?.message || 'Não foi possível ler o documento.');
        setStatus('error');
      });

    return () => {
      cancelled = true;
    };
  }, [source]);

  return { status, pages, error };
}
