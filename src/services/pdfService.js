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

function toPdfJsDocumentSource(source) {
  if (!source) return null;

  if (typeof source === 'string') {
    return { url: source };
  }

  if (source instanceof URL) {
    return { url: source.toString() };
  }

  if (source instanceof ArrayBuffer || ArrayBuffer.isView(source)) {
    return { data: source };
  }

  if (typeof source === 'object') {
    if (source.url || source.data || source.range) return source;
  }

  return null;
}

export async function loadPdfDocument(source) {
  const documentSource = toPdfJsDocumentSource(source);
  if (!documentSource) return null;

  const pdfjs = await getPdfJs();
  const loadingTask = pdfjs.getDocument(documentSource);
  return loadingTask.promise;
}
