import { getPdfJs } from './pdfService.js';

const CHORD_TOKEN_PATTERN = /^([A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add)?\d*(?:\([^)]*\))?(?:\/[A-G](?:#|b)?)?|N\.?C\.?|NC|%|\||\(|\)|:|-)(?:[,;.]?)$/i;
const CHORD_LINE_PATTERN = /^(\s*(?:[A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add)?\d*(?:\([^)]*\))?(?:\/[A-G](?:#|b)?)?|N\.?C\.?|NC|%|\||\(|\)|:|-)+\s*)+$/i;

function copyBytes(view) {
  const length = Number(view?.byteLength ?? view?.length ?? 0);
  const next = new Uint8Array(Math.max(0, length));
  for (let index = 0; index < next.length; index += 1) next[index] = view[index];
  return next;
}

function clonePdfData(data) {
  try {
    if (data instanceof Uint8Array) return copyBytes(data);
    if (data instanceof ArrayBuffer) return copyBytes(new Uint8Array(data));
    if (ArrayBuffer.isView(data)) return copyBytes(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
  } catch (error) {
    console.warn('[Playback Cifras IA] Falha ao clonar PDF para o Modo Palco.', error);
  }
  return data;
}

function clonePdfSource(source) {
  if (!source) return source;
  if (typeof source === 'string') return { url: source, withCredentials: false };
  if (source instanceof Uint8Array) return { data: clonePdfData(source) };
  if (source instanceof ArrayBuffer) return { data: clonePdfData(source) };
  if (typeof source === 'object' && source.data) return { ...source, data: clonePdfData(source.data) };
  return source;
}

async function loadStagePdfDocument(source) {
  const pdfjs = await getPdfJs();
  const normalizedSource = clonePdfSource(source);

  const loadingTask = pdfjs.getDocument({
    ...normalizedSource,
    disableWorker: true,
    disableAutoFetch: true,
    disableStream: true,
    isEvalSupported: false,
  });

  return loadingTask.promise;
}

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function multiplyTransforms(a = [1, 0, 0, 1, 0, 0], b = [1, 0, 0, 1, 0, 0]) {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

function getPdfTransform(viewport, item) {
  return multiplyTransforms(viewport?.transform || [1, 0, 0, 1, 0, 0], item?.transform || [1, 0, 0, 1, 0, 0]);
}

function getFontSize(transform, item) {
  const [, b, , d] = transform;
  const size = Math.max(Math.abs(b), Math.abs(d), item?.height || 10);
  return Number.isFinite(size) && size > 0 ? size : 10;
}

function safeDestroyPdf(pdf) {
  try {
    if (!pdf || typeof pdf.destroy !== 'function') return;
    const result = pdf.destroy();
    if (result && typeof result.catch === 'function') result.catch(() => {});
  } catch (_) {
    // Cleanup must not break Stage rendering.
  }
}

function isChordToken(token) {
  return CHORD_TOKEN_PATTERN.test(String(token || '').trim());
}

function isChordLike(text) {
  const clean = normalizeText(text);
  if (!clean || clean.length > 80) return false;

  const tokens = clean.split(/\s+/).filter(Boolean);
  if (!tokens.length || tokens.length > 28) return false;

  const chordTokens = tokens.filter((token) => isChordToken(token.replace(/[,:;]/g, '')));
  if (chordTokens.length === tokens.length) return true;

  return CHORD_LINE_PATTERN.test(clean) && chordTokens.length >= Math.max(1, Math.ceil(tokens.length * 0.55));
}

function horizontalOverlap(a, b) {
  return Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left));
}

function isSameTextPosition(a, b) {
  return Math.abs(a.left - b.left) <= 3
    && Math.abs(a.top - b.top) <= Math.max(3, Math.min(a.fontSize, b.fontSize) * 0.38)
    && normalizeText(a.text).toLowerCase() === normalizeText(b.text).toLowerCase();
}

function isContainedFragment(fragment, candidate) {
  if (fragment.id === candidate.id) return false;
  if (Math.abs(fragment.top - candidate.top) > Math.max(4, fragment.fontSize * 0.55)) return false;
  if (candidate.text.length <= fragment.text.length) return false;

  const fragmentText = normalizeText(fragment.text).toLowerCase();
  const candidateText = normalizeText(candidate.text).toLowerCase();
  if (!fragmentText || !candidateText.includes(fragmentText)) return false;

  return horizontalOverlap(fragment, candidate) >= Math.min(fragment.width, candidate.width) * 0.45;
}

function removeDuplicateFragments(items) {
  const sorted = [...items].sort((a, b) => {
    const yDiff = a.top - b.top;
    if (Math.abs(yDiff) > 4) return yDiff;
    return b.text.length - a.text.length || a.left - b.left;
  });

  const kept = [];
  sorted.forEach((item) => {
    const duplicated = kept.some((candidate) => isSameTextPosition(item, candidate));
    const contained = kept.some((candidate) => isContainedFragment(item, candidate));
    if (!duplicated && !contained) kept.push(item);
  });

  return kept.sort((a, b) => {
    const yDiff = a.top - b.top;
    if (Math.abs(yDiff) > 4) return yDiff;
    return a.left - b.left;
  });
}

function averageCharWidth(items) {
  const widths = items
    .map((item) => item.width / Math.max(1, item.text.length))
    .filter((value) => Number.isFinite(value) && value > 1 && value < 40);

  if (!widths.length) return 7;
  const sorted = widths.sort((a, b) => a - b);
  return Math.max(5, sorted[Math.floor(sorted.length / 2)] || 7);
}

function shouldJoinChordFragments(previous, text, item) {
  if (!previous || !text) return false;
  const closeToPrevious = item.left - previous.right <= Math.max(6, item.fontSize * 0.9);
  if (!closeToPrevious) return false;

  const previousText = String(previous.text || '');
  if (/^[A-G](#|b)?$/i.test(previousText) && /^(m|maj|min|dim|aug|sus|add)\d*$/i.test(text)) return true;
  if (/^[A-G](#|b)?m?$/i.test(previousText) && /^\d+$/i.test(text)) return true;
  if (/^[A-G](#|b)?(?:m|maj|min|dim|aug|sus|add)?\d*$/i.test(previousText) && /^\([^)]*\)$/i.test(text)) return true;

  return false;
}

function cleanupChordItems(items) {
  const sortedItems = removeDuplicateFragments(items).sort((a, b) => a.left - b.left);
  const chordItems = [];

  sortedItems.forEach((item) => {
    const text = normalizeText(item.text).replace(/[,:;]/g, '');
    if (!text) return;

    const previous = chordItems[chordItems.length - 1];
    if (shouldJoinChordFragments(previous, text, item)) {
      previous.text = `${previous.text}${text}`;
      previous.right = Math.max(previous.right, item.right);
      previous.width = previous.right - previous.left;
      return;
    }

    if (!isChordToken(text)) return;

    const duplicated = chordItems.some((candidate) => (
      candidate.text.toLowerCase() === text.toLowerCase()
      && Math.abs(candidate.left - item.left) <= Math.max(10, item.fontSize * 0.9)
    ));

    if (!duplicated) chordItems.push({ ...item, text });
  });

  return chordItems;
}

function createPlainTextFromItems(items) {
  const sortedItems = removeDuplicateFragments(items).sort((a, b) => a.left - b.left);
  if (!sortedItems.length) return '';

  const charWidth = averageCharWidth(sortedItems);
  let output = '';
  let previous = null;

  sortedItems.forEach((item) => {
    const text = normalizeText(item.text);
    if (!text) return;

    if (!previous) {
      output = text;
      previous = item;
      return;
    }

    const gap = item.left - previous.right;
    const needsSpace = gap > Math.max(1.5, charWidth * 0.35);
    const alreadySpaced = /\s$/.test(output) || /^\s/.test(text);

    output += needsSpace && !alreadySpaced ? ` ${text}` : text;
    previous = item;
  });

  return output.replace(/\s+/g, ' ').trim();
}

function buildPositionedItems(textContent, viewport) {
  const rawItems = [];

  (textContent?.items || []).forEach((item, index) => {
    const text = normalizeText(item?.str);
    if (!text) return;

    const transform = getPdfTransform(viewport, item);
    const fontSize = getFontSize(transform, item);
    const left = transform[4];
    const baseline = transform[5];
    const top = baseline - fontSize;
    const width = Math.max(1, item.width || text.length * Math.max(4, fontSize * 0.45));

    if (!Number.isFinite(left) || !Number.isFinite(top)) return;

    rawItems.push({
      id: `item-${index}`,
      text,
      left,
      top,
      right: left + width,
      width,
      fontSize: Math.max(8, fontSize),
    });
  });

  return rawItems;
}


function isChordLineFromItems(items, sourceText) {
  const clean = normalizeText(sourceText);
  if (!clean || clean.length > 90) return false;

  const tokenCount = clean.split(/\s+/).filter(Boolean).length;
  const chordItems = cleanupChordItems(items);
  if (!chordItems.length) return false;

  if (isChordLike(clean)) return true;
  if (tokenCount <= 10 && chordItems.length >= Math.max(1, Math.ceil(tokenCount * 0.45))) return true;
  if (chordItems.length >= 2 && clean.length <= 42) return true;

  return false;
}

function attachPercentPositions(lineItems, pageLeft, pageWidth) {
  const width = Math.max(1, Number(pageWidth) || 1);
  return lineItems.map((item, index) => ({
    id: `${item.id}-${index}`,
    text: item.text,
    leftPct: Math.max(0, Math.min(100, ((item.left - pageLeft) / width) * 100)),
  }));
}

function buildRawLines(items, viewport) {
  const sorted = removeDuplicateFragments(items).sort((a, b) => {
    const yDiff = a.top - b.top;
    if (Math.abs(yDiff) > 4) return yDiff;
    return a.left - b.left;
  });

  if (!sorted.length) return [];

  const pageLeft = Math.max(0, Math.min(...sorted.map((item) => item.left)));
  const pageRight = Math.min(
    Number(viewport?.width || Math.max(...sorted.map((item) => item.right))),
    Math.max(...sorted.map((item) => item.right)),
  );
  const pageWidth = Math.max(1, pageRight - pageLeft);
  const groups = [];

  sorted.forEach((item) => {
    const tolerance = Math.max(4, item.fontSize * 0.34);
    let line = groups.find((candidate) => Math.abs(candidate.top - item.top) <= tolerance);
    if (!line) {
      line = { top: item.top, items: [] };
      groups.push(line);
    }
    line.items.push(item);
    line.top = (line.top + item.top) / 2;
  });

  return groups
    .sort((a, b) => a.top - b.top)
    .map((line, index) => {
      const sourceText = line.items.map((item) => item.text).join(' ');
      const chord = isChordLineFromItems(line.items, sourceText);
      const cleanItems = chord ? cleanupChordItems(line.items) : removeDuplicateFragments(line.items).sort((a, b) => a.left - b.left);
      const text = chord ? cleanItems.map((item) => item.text).join(' ') : createPlainTextFromItems(cleanItems);

      return {
        id: `line-${index}`,
        text,
        isChord: chord || isChordLike(text),
        items: chord ? attachPercentPositions(cleanItems, pageLeft, pageWidth) : [],
      };
    })
    .filter((line) => line.text.trim() || line.items.length);
}

function extractPlainLines(textContent) {
  const lines = [];
  let current = [];

  (textContent?.items || []).forEach((item) => {
    const text = normalizeText(item?.str);
    if (text) current.push(text);
    if (item?.hasEOL && current.length) {
      const raw = current.join(' ').trim();
      const chord = isChordLike(raw);
      lines.push({ id: `line-${lines.length}`, text: raw, isChord: chord, items: [] });
      current = [];
    }
  });

  if (current.length) {
    const raw = current.join(' ').trim();
    const chord = isChordLike(raw);
    lines.push({ id: `line-${lines.length}`, text: raw, isChord: chord, items: [] });
  }

  return lines.filter((line) => line.text.trim());
}

async function readTextContentWithFallback(page) {
  if (page && typeof page.getTextContent === 'function') {
    try {
      return await page.getTextContent({ normalizeWhitespace: false, disableCombineTextItems: false });
    } catch (primaryError) {
      console.warn('[Playback Cifras IA] getTextContent falhou. Tentando streamTextContent.', primaryError);
    }
  }

  if (page && typeof page.streamTextContent === 'function') {
    const stream = page.streamTextContent({ normalizeWhitespace: false, disableCombineTextItems: false });
    const reader = stream && typeof stream.getReader === 'function' ? stream.getReader() : null;
    if (!reader) throw new Error('PDF text stream indisponível neste navegador.');

    const textContent = { items: [], styles: {} };
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value?.items?.length) textContent.items.push(...value.items);
      if (value?.styles) textContent.styles = { ...textContent.styles, ...value.styles };
    }
    return textContent;
  }

  throw new Error('PDF.js não disponibilizou extração de texto neste navegador.');
}

async function getPageStageLines(page) {
  const viewport = page.getViewport({ scale: 1 });
  const textContent = await readTextContentWithFallback(page);

  try {
    const positioned = buildPositionedItems(textContent, viewport);
    const lines = buildRawLines(positioned, viewport);
    if (lines.length) return { lines, viewport };
  } catch (error) {
    console.warn('[Playback Cifras IA] Parser posicionado falhou. Usando fallback textual.', error);
  }

  return { lines: extractPlainLines(textContent), viewport };
}

export async function extractStagePages(source) {
  if (!source) return [];

  const pdf = await loadStagePdfDocument(source);
  const pages = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const { lines, viewport } = await getPageStageLines(page);

      pages.push({
        pageNumber,
        width: viewport.width,
        height: viewport.height,
        lines,
      });
    }
  } finally {
    safeDestroyPdf(pdf);
  }

  return pages;
}

export async function extractStagePagesFromPdf(source) {
  return extractStagePages(source);
}

export async function extractStageText(source) {
  return extractStagePages(source);
}
