export function isValidAudioSource(source) {
  if (!source || typeof source !== 'string') {
    return false;
  }

  const value = source.trim();

  if (!value) {
    return false;
  }

  if (value === 'undefined' || value === 'null' || value === '[object Object]') {
    return false;
  }

  if (value.startsWith('blob:')) {
    return true;
  }

  if (value.startsWith('data:audio/')) {
    return true;
  }

  try {
    const url = new URL(value, window.location.href);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function normalizeAudioSource(source) {
  if (!isValidAudioSource(source)) {
    return '';
  }

  return source.trim();
}

export function createEmptyAudioState() {
  return {
    source: '',
    title: 'Nenhum áudio selecionado',
    isValid: false,
  };
}
