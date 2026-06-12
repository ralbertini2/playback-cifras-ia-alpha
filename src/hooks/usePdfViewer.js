import { useCallback, useEffect, useRef, useState } from 'react';
import { loadPdfDocument } from '../services/pdfService.js';

const MIN_SCALE = 0.7;
const MAX_SCALE = 2.2;
const STEP = 0.1;

function clampScale(value) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(value.toFixed(2))));
}

export function usePdfViewer(source) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [documentProxy, setDocumentProxy] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.15);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus(source ? 'loading' : 'idle');
    setError('');
    setDocumentProxy(null);
    setTotalPages(0);
    setPageNumber(1);

    if (!source) return undefined;

    loadPdfDocument(source)
      .then((pdf) => {
        if (cancelled) return;
        setDocumentProxy(pdf);
        setTotalPages(pdf.numPages || 0);
        setStatus('ready');
      })
      .catch((loadError) => {
        if (cancelled) return;
        setStatus('error');
        setError(loadError?.message || 'Não foi possível carregar o PDF.');
      });

    return () => {
      cancelled = true;
    };
  }, [source]);

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!documentProxy || !canvas) return undefined;

    async function renderPage() {
      setStatus('rendering');
      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
          renderTaskRef.current = null;
        }
        const page = await documentProxy.getPage(pageNumber);
        if (cancelled) return;
        const viewport = page.getViewport({ scale });
        const context = canvas.getContext('2d');
        const outputScale = window.devicePixelRatio || 1;

        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;

        context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
        context.clearRect(0, 0, viewport.width, viewport.height);

        const task = page.render({ canvasContext: context, viewport });
        renderTaskRef.current = task;
        await task.promise;
        if (!cancelled) setStatus('ready');
      } catch (renderError) {
        if (renderError?.name === 'RenderingCancelledException') return;
        if (!cancelled) {
          setStatus('error');
          setError(renderError?.message || 'Erro ao renderizar a página do PDF.');
        }
      }
    }

    renderPage();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
    };
  }, [documentProxy, pageNumber, scale]);

  const previousPage = useCallback(() => {
    setPageNumber((current) => Math.max(1, current - 1));
  }, []);

  const nextPage = useCallback(() => {
    setPageNumber((current) => Math.min(totalPages || 1, current + 1));
  }, [totalPages]);

  const zoomIn = useCallback(() => {
    setScale((current) => clampScale(current + STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((current) => clampScale(current - STEP));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.15);
  }, []);

  const fitWidth = useCallback(async () => {
    if (!documentProxy || !containerRef.current) return;
    const page = await documentProxy.getPage(pageNumber);
    const viewport = page.getViewport({ scale: 1 });
    const availableWidth = Math.max(320, containerRef.current.clientWidth - 32);
    setScale(clampScale(availableWidth / viewport.width));
  }, [documentProxy, pageNumber]);

  return {
    containerRef,
    canvasRef,
    pageNumber,
    totalPages,
    scale,
    status,
    error,
    previousPage,
    nextPage,
    zoomIn,
    zoomOut,
    resetZoom,
    fitWidth,
    canGoPrevious: pageNumber > 1,
    canGoNext: pageNumber < totalPages,
  };
}
