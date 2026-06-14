let pdfjsLibPromise = null;

const PDF_IMPORT_CANDIDATES = [
  'pdfjs-dist/legacy/build/pdf.mjs',
  'pdfjs-dist'
];

const WORKER_IMPORT_CANDIDATES = [
  'pdfjs-dist/legacy/build/pdf.worker.mjs?url',
  'pdfjs-dist/build/pdf.worker.mjs?url'
];

async function importFirst(candidates = []) {
  let lastError = null;

  for (const candidate of candidates) {
    try {
      return await import(candidate);
    } catch (error) {
      lastError = error;
      console.warn(`[Playback Cifras IA] Falha ao carregar ${candidate}`, error);
    }
  }

  throw lastError || new Error('Nenhuma opção de importação do PDF.js funcionou.');
}

function getModuleNamespace(module) {
  return module?.default?.getDocument ? module.default : module;
}

function getWorkerUrl(module) {
  return module?.default || module;
}

function buildLoadingConfig(source) {
  if (source instanceof ArrayBuffer || source instanceof Uint8Array) {
    return {
      data: source,
      isEvalSupported: false,
      useSystemFonts: true,
    };
  }

  if (typeof source === 'string') {
    return {
      url: source,
      isEvalSupported: false,
      useSystemFonts: true,
      withCredentials: false,
    };
  }

  return source;
}

async function fetchPdfAsArrayBuffer(source) {
  if (typeof source !== 'string') return null;

  const response = await fetch(source);

  if (!response.ok) {
    throw new Error(`Falha ao validar PDF (${response.status}).`);
  }

  const blob = await response.blob();
  const type = String(blob.type || response.headers.get('content-type') || '').toLowerCase();

  if (type && !type.includes('pdf') && blob.size < 1024) {
    throw new Error(`Arquivo recebido não parece ser PDF (${type}).`);
  }

  return blob.arrayBuffer();
}

export async function getPdfJs() {
  if (!pdfjsLibPromise) {
    pdfjsLibPromise = Promise.all([
      importFirst(PDF_IMPORT_CANDIDATES),
      importFirst(WORKER_IMPORT_CANDIDATES)
    ]).then(([pdfjsModule, workerModule]) => {
      const pdfjs = getModuleNamespace(pdfjsModule);
      const workerUrl = getWorkerUrl(workerModule);

      if (pdfjs?.GlobalWorkerOptions && workerUrl) {
        pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
      }

      return pdfjs;
    }).catch((error) => {
      pdfjsLibPromise = null;
      throw error;
    });
  }

  return pdfjsLibPromise;
}

export async function loadPdfDocument(source) {
  if (!source) return null;

  const pdfjs = await getPdfJs();
  const config = buildLoadingConfig(source);

  try {
    const loadingTask = pdfjs.getDocument(config);
    return await loadingTask.promise;
  } catch (primaryError) {
    console.warn('[Playback Cifras IA] Falha no carregamento direto do PDF. Tentando fallback por ArrayBuffer.', primaryError);

    const arrayBuffer = await fetchPdfAsArrayBuffer(source);

    if (!arrayBuffer) {
      throw primaryError;
    }

    const fallbackTask = pdfjs.getDocument(buildLoadingConfig(arrayBuffer));
    return fallbackTask.promise;
  }
}
