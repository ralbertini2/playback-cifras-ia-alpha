import { useCallback, useEffect, useRef, useState } from 'react';
import { loadPdfDocument } from '../services/pdfService.js';

const MIN_SCALE = 0.7;
const MAX_SCALE = 2.4;
const STEP = 0.1;

function clampScale(value) {
  return Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(value.toFixed(2))));
}

function getErrorMessage(error, fallback) {
  const message = error?.message || fallback;

  if (/worker/i.test(message)) {
    return 'Erro ao inicializar o leitor de PDF. Recarregue a página e tente novamente.';
  }

  if (/invalid|pdf/i.test(message)) {
    return 'O arquivo carregado não pôde ser lido como PDF válido.';
  }

  return message;
}

function clearPages(container) {
  if (!container) return;
  container.replaceChildren();
}

export function usePdfViewer(source) {
  const containerRef = useRef(null);
  const renderTasksRef = useRef([]);
  const documentRef = useRef(null);
  const pinchRef = useRef({ active: false, distance: 0, scale: 1, frame: 0 });
  const [documentProxy, setDocumentProxy] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');

  const cancelRenderTasks = useCallback(() => {
    renderTasksRef.current.forEach((task) => {
      try { task?.cancel?.(); } catch (_) {}
    });
    renderTasksRef.current = [];
  }, []);

  useEffect(() => {
    let cancelled = false;

    cancelRenderTasks();
    clearPages(containerRef.current);
    setStatus(source ? 'loading' : 'idle');
    setError('');
    setDocumentProxy(null);
    setTotalPages(0);
    setScale(1);

    if (documentRef.current?.destroy) {
      documentRef.current.destroy().catch(() => {});
      documentRef.current = null;
    }

    if (!source) return undefined;

    loadPdfDocument(source)
      .then((pdf) => {
        if (cancelled) {
          if (pdf?.destroy) pdf.destroy().catch(() => {});
          return;
        }

        documentRef.current = pdf;
        setDocumentProxy(pdf);
        setTotalPages(pdf.numPages || 0);
        setStatus('ready');
      })
      .catch((loadError) => {
        if (cancelled) return;
        console.error('[Playback Cifras IA] Erro ao carregar PDF:', loadError);
        setStatus('error');
        setError(getErrorMessage(loadError, 'Não foi possível carregar o PDF.'));
      });

    return () => {
      cancelled = true;
      cancelRenderTasks();
    };
  }, [source, cancelRenderTasks]);

  useEffect(() => {
    let cancelled = false;
    const container = containerRef.current;

    if (!documentProxy || !container) return undefined;

    async function renderAllPages() {
      setStatus('rendering');
      cancelRenderTasks();
      clearPages(container);

      try {
        const fragment = document.createDocumentFragment();
        const outputScale = window.devicePixelRatio || 1;

        for (let pageNumber = 1; pageNumber <= documentProxy.numPages; pageNumber += 1) {
          if (cancelled) return;

          const page = await documentProxy.getPage(pageNumber);
          if (cancelled) return;

          const viewport = page.getViewport({ scale });
          const pageWrap = document.createElement('div');
          pageWrap.className = 'pdf-rendered-page';
          pageWrap.dataset.page = String(pageNumber);

          const canvas = document.createElement('canvas');
          canvas.className = 'pdf-rendered-canvas';
          canvas.width = Math.floor(viewport.width * outputScale);
          canvas.height = Math.floor(viewport.height * outputScale);
          canvas.style.width = `${Math.floor(viewport.width)}px`;
          canvas.style.height = `${Math.floor(viewport.height)}px`;

          pageWrap.appendChild(canvas);
          fragment.appendChild(pageWrap);

          const context = canvas.getContext('2d');
          context.setTransform(outputScale, 0, 0, outputScale, 0, 0);
          context.clearRect(0, 0, viewport.width, viewport.height);

          const task = page.render({ canvasContext: context, viewport });
          renderTasksRef.current.push(task);
          await task.promise;
        }

        if (cancelled) return;
        container.appendChild(fragment);
        renderTasksRef.current = [];
        setStatus('ready');
      } catch (renderError) {
        if (renderError?.name === 'RenderingCancelledException') return;

        if (!cancelled) {
          console.error('[Playback Cifras IA] Erro ao renderizar PDF:', renderError);
          setStatus('error');
          setError(getErrorMessage(renderError, 'Erro ao renderizar as páginas do PDF.'));
        }
      }
    }

    renderAllPages();

    return () => {
      cancelled = true;
      cancelRenderTasks();
    };
  }, [documentProxy, scale, cancelRenderTasks]);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return undefined;

    const distance = (touches) => {
      const [a, b] = touches;
      return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    };

    const onTouchStart = (event) => {
      if (event.touches.length !== 2) return;
      pinchRef.current = {
        active: true,
        distance: distance(event.touches),
        scale,
        frame: 0,
      };
    };

    const onTouchMove = (event) => {
      if (!pinchRef.current.active || event.touches.length !== 2) return;
      event.preventDefault();
      const nextDistance = distance(event.touches);
      const ratio = nextDistance / Math.max(1, pinchRef.current.distance);
      const nextScale = clampScale(pinchRef.current.scale * ratio);

      if (pinchRef.current.frame) {
        cancelAnimationFrame(pinchRef.current.frame);
      }

      pinchRef.current.frame = requestAnimationFrame(() => {
        setScale(nextScale);
      });
    };

    const onTouchEnd = () => {
      if (pinchRef.current.frame) {
        cancelAnimationFrame(pinchRef.current.frame);
      }
      if (pinchRef.current.active) {
        pinchRef.current = { active: false, distance: 0, scale, frame: 0 };
      }
    };

    element.addEventListener('touchstart', onTouchStart, { passive: true });
    element.addEventListener('touchmove', onTouchMove, { passive: false });
    element.addEventListener('touchend', onTouchEnd, { passive: true });
    element.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', onTouchStart);
      element.removeEventListener('touchmove', onTouchMove);
      element.removeEventListener('touchend', onTouchEnd);
      element.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [scale]);

  const zoomIn = useCallback(() => {
    setScale((current) => clampScale(current + STEP));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((current) => clampScale(current - STEP));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1);
  }, []);

  const fitWidth = useCallback(async () => {
    if (!documentProxy || !containerRef.current) return;
    const page = await documentProxy.getPage(1);
    const viewport = page.getViewport({ scale: 1 });
    const availableWidth = Math.max(320, containerRef.current.clientWidth - 32);
    setScale(clampScale(availableWidth / viewport.width));
  }, [documentProxy]);

  return {
    containerRef,
    totalPages,
    scale,
    status,
    error,
    zoomIn,
    zoomOut,
    resetZoom,
    fitWidth,
  };
}
