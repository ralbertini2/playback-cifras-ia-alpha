import { getPdfJs } from './pdfService.js';

const CHORD_TOKEN_PATTERN = /^([A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add)?\d*(?:\([^)]*\))?(?:\/[A-G](?:#|b)?)?|N\.?C\.?|NC|%|\||\(|\)|:|-)(?:[,;.]?)$/i;
const CHORD_LINE_PATTERN = /^(\s*(?:[A-G](?:#|b)?(?:m|maj|min|dim|aug|sus|add)?\d*(?:\([^)]*\))?(?:\/[A-G](?:#|b)?)?|N\.?C\.?|NC|%|\||\(|\)|:|-)+\s*)+$/i;

function copyBytes(view) {
  const next = new Uint8Array(view.byteLength || view.length || 0);
  for (let index = 0; index < next.length; index += 1) {
    next[index] = view[index];
  }
  return next;
}

function clonePdfData(data) {
  try {
    if (data instanceof Uint8Array) return copyBytes(data);
    if (data instanceof ArrayBuffer) return copyBytes(new Uint8Array(data));
    if (ArrayBuffer.isView(data)) {
      return copyBytes(new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
    }
  } catch (error) {
    console.warn('[Playback Cifras IA] Falha ao clonar dados do PDF para o Modo Palco.', error);
  }

  return data;
}

function clonePdfSource(source) {
  if (!source) return source;
  if (typeof source === 'string') return { url: source, withCredentials: false };
  if (source instanceof Uint8Array) return { data: clonePdfData(source) };
  if (source instanceof ArrayBuffer) return { data: clonePdfData(source) };
  if (typeof source === 'object' && source.data) {
    return {
      ...source,
      data: clonePdfData(source.data),
    };
  }
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
  const viewportTransform = viewport?.transform || [1, 0, 0, 1, 0, 0];
  const itemTransform = item?.transform || [1, 0, 0, 1, 0, 0];
  return multiplyTransforms(viewportTransform, itemTransform);
}

function getFontSize(transform, item) {
  const [, b, , d] = transform;
  const height = Math.max(Math.abs(b), Math.abs(d), item?.height || 10);
  return Number.isFinite(height) && height > 0 ? height : 10;
}

function safeDestroyPdf(pdf) {
  if (!pdf?.destroy || typeof pdf.destroy !== 'function') return;

  try {
    const result = pdf.destroy();
    if (result?.catch && typeof result.catch === 'function') {
      result.catch(() => {});
    }
  } catch (_) {
    // PDF.js cleanup must never break the Stage parser.
  }
}

function horizontalOverlap(a, b) {
  const left = Math.max(a.left, b.left);
  const right = Math.min(a.right, b.right);
  return Math.max(0, right - left);
}

function isSameTextPosition(a, b) {
  return Math.abs(a.left - b.left) <= 1.5
    && Math.abs(a.top - b.top) <= Math.max(3, Math.min(a.fontSize, b.fontSize) * 0.35)
    && normalizeText(a.text).toLowerCase() === normalizeText(b.text).toLowerCase();
}

function isContainedFragment(fragment, candidate) {
  if (fragment.id === candidate.id) return false;
  if (Math.abs(fragment.top - candidate.top) > Math.max(4, fragment.fontSize * 0.45)) return false;
  if (candidate.text.length <= fragment.text.length) return false;

  const fragmentText = normalizeText(fragment.text).toLowerCase();
  const candidateText = normalizeText(candidate.text).toLowerCase();
  if (!fragmentText || !candidateText.includes(fragmentText)) return false;

  const overlap = horizontalOverlap(fragment, candidate);
  return overlap >= Math.min(fragment.width, candidate.width) * 0.55;
}

function removeDuplicateFragments(items) {
  const sortedByPriority = [...items].sort((a, b) => {
    const yDiff = a.top - b.top;
    if (Math.abs(yDiff) > 4) return yDiff;
    return b.text.length - a.text.length || a.left - b.left;
  });

  const kept = [];

  sortedByPriority.forEach((item) => {
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

function isChordToken(token) {
  return CHORD_TOKEN_PATTERN.test(String(token || '').trim());
}

function isChordLike(text) {
  const clean = normalizeText(text);
  if (!clean) return false;
  if (clean.length > 52) return false;

  const tokens = clean.split(/\s+/).filter(Boolean);
  if (!tokens.length || tokens.length > 18) return false;

  const chordTokens = tokens.filter((token) => isChordToken(token.replace(/[,:;]/g, '')));
  if (chordTokens.length === tokens.length) return true;

  return CHORD_LINE_PATTERN.test(clean) && chordTokens.length >= Math.max(1, Math.ceil(tokens.length * 0.5));
}

function averageCharWidth(items) {
  const widths = items
    .map((item) => item.width / Math.max(1, item.text.length))
    .filter((value) => Number.isFinite(value) && value > 1 && value < 40);

  if (!widths.length) return 7;

  const sorted = widths.sort((a, b) => a - b);
  return Math.max(5, sorted[Math.floor(sorted.length / 2)] || 7);
}

function createSpacedLine(items) {
  const sortedItems = removeDuplicateFragments(items).sort((a, b) => a.left - b.left);
  if (!sortedItems.length) return '';

  const minLeft = Math.min(...sortedItems.map((item) => item.left));
  const charWidth = averageCharWidth(sortedItems);
  const buffer = [];

  sortedItems.forEach((item) => {
    const text = normalizeText(item.text);
    if (!text) return;

    const targetColumn = Math.max(0, Math.round((item.left - minLeft) / charWidth));
    let column = targetColumn;

    while (buffer[column] && column < targetColumn + text.length + 4) {
      column += 1;
    }

    for (let index = 0; index < text.length; index += 1) {
      buffer[column + index] = text[index];
    }
  });

  return buffer.map((char) => char || ' ').join('').replace(/\s+$/g, '');
}

function buildRawLines(items) {
  const cleanItems = removeDuplicateFragments(items);
  const sorted = [...cleanItems].sort((a, b) => {
    const yDiff = a.top - b.top;
    if (Math.abs(yDiff) > 4) return yDiff;
    return a.left - b.left;
  });

  const lineGroups = [];

  sorted.forEach((item) => {
    const tolerance = Math.max(5, item.fontSize * 0.5);
    let line = lineGroups.find((candidate) => Math.abs(candidate.top - item.top) <= tolerance);

    if (!line) {
      line = { top: item.top, items: [] };
      lineGroups.push(line);
    }

    line.items.push(item);
    line.top = (line.top + item.top) / 2;
  });

  return lineGroups
    .sort((a, b) => a.top - b.top)
    .map((line, index) => {
      const text = createSpacedLine(line.items);
      return {
        id: `line-${index}`,
        text,
        isChord: isChordLike(text),
      };
    })
    .filter((line) => line.text.trim());
}

function extractPlainLines(textContent) {
  const lines = [];
  let current = [];

  (textContent?.items || []).forEach((item) => {
    const text = normalizeText(item?.str);
    if (text) current.push(text);
    if (item?.hasEOL && current.length) {
      const line = current.join(' ').trim();
      lines.push({ id: `line-${lines.length}`, text: line, isChord: isChordLike(line) });
      current = [];
    }
  });

  if (current.length) {
    const line = current.join(' ').trim();
    lines.push({ id: `line-${lines.length}`, text: line, isChord: isChordLike(line) });
  }

  return lines.filter((line) => line.text.trim());
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

export async function extractStagePages(source) {
  if (!source) return [];

  const pdf = await loadStagePdfDocument(source);
  const pages = [];

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale: 1 });
      const textContent = await page.getTextContent();
      let lines = [];

      try {
        lines = buildRawLines(buildPositionedItems(textContent, viewport));
      } catch (positionError) {
        console.warn('[Playback Cifras IA] Fallback textual do Modo Palco.', positionError);
        lines = extractPlainLines(textContent);
      }

      if (!lines.length) lines = extractPlainLines(textContent);

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

// Alias kept for older imports during V4 iterations.
export async function extractStageText(source) {
  return extractStagePages(source);
}
