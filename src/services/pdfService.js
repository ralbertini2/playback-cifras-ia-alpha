let pdfjsLibPromise = null;
let pdfWorkerSrcPromise = null;

function normalizePdfSource(source) {
  if (!source) return null;

  if (typeof source === 'string') {
    return {
      url: source,
      withCredentials: false,
    };
  }

  if (source instanceof ArrayBuffer || source instanceof Uint8Array) {
    return { data: source };
  }

  return source;
}

function getReadablePdfError(error) {
  const message = error?.message || String(error || 'Erro desconhecido ao carregar PDF.');

  if (/worker/i.test(message)) {
    return 'Falha ao inicializar o leitor de PDF. Recarregue a página e tente novamente.';
  }

  if (/invalid|corrupt|damaged|pdf/i.test(message)) {
    return 'O arquivo selecionado não parece ser um PDF válido ou está corrompido.';
  }

  if (/network|fetch|cors|403|401/i.test(message)) {
    return 'Não foi possível acessar o PDF. Verifique a permissão do arquivo no Google Drive.';
  }

  return message;
}

export async function getPdfJs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = Promise.all([
      import('pdfjs-dist/legacy/build/pdf.mjs'),
      getPdfWorkerSrc(),
    ]).then(([pdfjs, workerSrc]) => {
      pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
      return pdfjs;
    });
  }

  return pdfjsLibPromise;
}

async function getPdfWorkerSrc() {
  if (!pdfWorkerSrcPromise) {
    pdfWorkerSrcPromise = import('pdfjs-dist/legacy/build/pdf.worker.min.mjs?url')
      .then((worker) => worker.default || worker);
  }

  return pdfWorkerSrcPromise;
}

export async function loadPdfDocument(source) {
  if (!source) return null;

  try {
    const pdfjs = await getPdfJs();
    const normalizedSource = normalizePdfSource(source);

    const loadingTask = pdfjs.getDocument({
      ...normalizedSource,
      disableAutoFetch: false,
      disableStream: false,
      isEvalSupported: false,
    });

    return await loadingTask.promise;
  } catch (error) {
    console.error('[Playback Cifras IA] PDF load failed:', error);
    throw new Error(getReadablePdfError(error));
  }
}
