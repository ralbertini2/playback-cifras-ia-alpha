import { useCallback, useEffect, useRef, useState } from 'react';
import { loadPdfDocument, renderPdfPage } from '../services/pdfService.js';

export function usePdfViewer(source) {
  const canvasRef = useRef(null);
  const [pdf, setPdf] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [status, setStatus] = useState(source ? 'loading' : 'empty');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!source) {
        setPdf(null);
        setPageNumber(1);
        setPageCount(0);
        setStatus('empty');
        setError('');
        return;
      }

      try {
        setStatus('loading');
        setError('');

        const document = await loadPdfDocument(source);

        if (cancelled) return;

        if (!document) {
          setPdf(null);
          setPageNumber(1);
          setPageCount(0);
          setStatus('empty');
          return;
        }

        setPdf(document);
        setPageNumber(1);
        setPageCount(document.numPages || 0);
        setStatus('ready');
      } catch (err) {
        if (cancelled) return;
        setPdf(null);
        setPageNumber(1);
        setPageCount(0);
        setStatus('error');
        setError(err?.message || 'Não foi possível abrir este PDF.');
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [source]);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      if (!pdf || !canvasRef.current) return;

      try {
        await renderPdfPage({
          pdf,
          pageNumber,
          canvas: canvasRef.current,
          scale: zoom,
        });
      } catch (err) {
        if (!cancelled) {
          setStatus('error');
          setError(err?.message || 'Erro ao renderizar PDF.');
        }
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [pdf, pageNumber, zoom]);

  const previousPage = useCallback(() => {
    setPageNumber((value) => Math.max(1, value - 1));
  }, []);

  const nextPage = useCallback(() => {
    setPageNumber((value) => Math.min(pageCount || 1, value + 1));
  }, [pageCount]);

  const zoomIn = useCallback(() => {
    setZoom((value) => Math.min(2.5, Number((value + 0.1).toFixed(2))));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom((value) => Math.max(0.5, Number((value - 0.1).toFixed(2))));
  }, []);

  const fitWidth = useCallback(() => {
    setZoom(1);
  }, []);

  return {
    canvasRef,
    status,
    error,
    pageNumber,
    pageCount,
    zoom,
    previousPage,
    nextPage,
    zoomIn,
    zoomOut,
    fitWidth,
  };
}
