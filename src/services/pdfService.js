import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export function normalizePdfSource(source) {
  if (!source) return null;

  if (typeof source === 'string') {
    const value = source.trim();
    return value ? { url: value } : null;
  }

  if (source instanceof ArrayBuffer || source instanceof Uint8Array) {
    return { data: source };
  }

  if (source.url && typeof source.url === 'string' && source.url.trim()) {
    return { url: source.url.trim() };
  }

  if (source.data) {
    return { data: source.data };
  }

  if (source.range) {
    return { range: source.range };
  }

  return null;
}

export async function loadPdfDocument(source) {
  const normalizedSource = normalizePdfSource(source);

  if (!normalizedSource) {
    return null;
  }

  const loadingTask = pdfjsLib.getDocument(normalizedSource);
  return loadingTask.promise;
}

export async function renderPdfPage({ pdf, pageNumber, canvas, scale = 1 }) {
  if (!pdf || !canvas) return null;

  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale });
  const context = canvas.getContext('2d');

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({
    canvasContext: context,
    viewport,
  }).promise;

  return {
    width: viewport.width,
    height: viewport.height,
  };
}
