const ROOT_PATTERN = /^[A-G](?:#|b)?/i;
const BASS_PATTERN = /\/[A-G](?:#|b)?$/i;
const STANDALONE_PATTERN = /^(?:N\.?C\.?|NC|%|\||\(|\)|:|-|bis|x\d+)$/i;
const TRAILING_PUNCTUATION_PATTERN = /[,:;.]$/g;
const LEADING_PUNCTUATION_PATTERN = /^[{[|]+/g;
const CLOSING_PUNCTUATION_PATTERN = /[}\]|]+$/g;
const ALLOWED_SUFFIX_PATTERN = /^[0-9mmajindugsothelprø°Δ+#b()/-]*$/i;
const KNOWN_QUALITY_PATTERN = /(maj|min|dim|aug|sus|add|alt|omit|no|m|M|ø|°|Δ|\+|-)/i;
const LETTER_GROUP_PATTERN = /[a-z]+/gi;
const VALID_LETTER_GROUP_PATTERN = /^(?:maj|min|dim|aug|sus|add|alt|omit|no|m)$/i;

function normalizeAccidentals(value = '') {
  return String(value || '')
    .replace(/♯/g, '#')
    .replace(/♭/g, 'b');
}

function hasBalancedParentheses(value = '') {
  let depth = 0;
  for (const char of value) {
    if (char === '(') depth += 1;
    if (char === ')') depth -= 1;
    if (depth < 0) return false;
  }
  return depth === 0;
}

function hasOnlyKnownLetterGroups(value = '') {
  const inspectValue = value.replace(/[#b](?:2|4|5|6|7|9|11|13)/gi, '');
  const groups = inspectValue.match(LETTER_GROUP_PATTERN) || [];
  return groups.every((group) => VALID_LETTER_GROUP_PATTERN.test(group));
}

export function normalizeChordToken(value = '') {
  return normalizeAccidentals(value)
    .trim()
    .replace(TRAILING_PUNCTUATION_PATTERN, '')
    .replace(LEADING_PUNCTUATION_PATTERN, '')
    .replace(CLOSING_PUNCTUATION_PATTERN, '')
    .replace(/\s+/g, '');
}

export function isChordToken(value = '') {
  const token = normalizeChordToken(value);
  if (!token) return false;
  if (STANDALONE_PATTERN.test(token)) return true;

  const rootMatch = token.match(ROOT_PATTERN);
  if (!rootMatch) return false;

  let suffix = token.slice(rootMatch[0].length);
  suffix = suffix.replace(BASS_PATTERN, '');

  if (!hasBalancedParentheses(suffix)) return false;
  if (!ALLOWED_SUFFIX_PATTERN.test(suffix)) return false;
  if (!hasOnlyKnownLetterGroups(suffix)) return false;

  if (!suffix) return true;
  if (/^\d+(?:M)?$/i.test(suffix)) return true;
  if (/^[ø°Δ+-]\d*$/i.test(suffix)) return true;
  if (KNOWN_QUALITY_PATTERN.test(suffix)) return true;
  if (/[#b](?:5|9|11|13)/i.test(suffix)) return true;
  if (/\((?:[^)]*(?:\d|#|b|maj|min|dim|aug|sus|add|alt|omit|no)[^)]*)\)/i.test(suffix)) return true;

  return false;
}

export function splitChordLine(value = '') {
  return String(value || '')
    .trim()
    .split(/\s+/)
    .map((token) => normalizeChordToken(token))
    .filter(Boolean);
}

export function isChordLine(value = '') {
  const clean = String(value || '').replace(/\s+/g, ' ').trim();
  if (!clean || clean.length > 96) return false;

  const tokens = splitChordLine(clean);
  if (!tokens.length || tokens.length > 32) return false;

  const chordCount = tokens.filter((token) => isChordToken(token)).length;
  if (chordCount === tokens.length) return true;

  if (tokens.length <= 10 && chordCount >= Math.max(1, Math.ceil(tokens.length * 0.72))) return true;
  return chordCount >= Math.max(2, Math.ceil(tokens.length * 0.55));
}

export function extractChordTokens(value = '') {
  return splitChordLine(value).filter((token) => isChordToken(token));
}

export function joinChordFragments(previousText = '', nextText = '') {
  const left = normalizeChordToken(previousText);
  const right = normalizeChordToken(nextText);
  if (!left || !right) return '';

  const merged = `${left}${right}`;
  return isChordToken(merged) ? merged : '';
}
