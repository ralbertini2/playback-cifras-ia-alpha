let pdfjsLibPromise = null;

export async function getPdfJs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = Promise.all([
      import('pdfjs-dist'),
      import('pdfjs-dist/build/pdf.worker.mjs?url')
    ]).then(([pdfjs, worker]) => {
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjs;
    });
  }
  return pdfjsLibPromise;
}

export async function loadPdfDocument(source) {
  if (!source) return null;

  const pdfjs = await getPdfJs();
  const documentSource = typeof source === 'string' ? { url: source } : source;
  const loadingTask = pdfjs.getDocument(documentSource);
  return loadingTask.promise;
}
