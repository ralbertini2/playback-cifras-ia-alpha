let gapiLoadPromise = null;

export function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);

    if (existing) {
      if (window.gapi) {
        resolve(existing);
        return;
      }

      existing.addEventListener('load', () => resolve(existing), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Falha ao carregar ${src}`)), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;

    script.addEventListener('load', () => resolve(script), { once: true });
    script.addEventListener('error', () => reject(new Error(`Falha ao carregar ${src}`)), { once: true });

    document.head.appendChild(script);
  });
}

export async function loadGoogleApiClient() {
  if (window.gapi?.load) {
    return window.gapi;
  }

  if (!gapiLoadPromise) {
    gapiLoadPromise = loadScript('https://apis.google.com/js/api.js').then(() => {
      if (!window.gapi?.load) {
        throw new Error('Google API Client carregou, mas gapi.load não ficou disponível.');
      }

      return window.gapi;
    });
  }

  return gapiLoadPromise;
}

export async function forceLoadGooglePicker() {
  if (window.google?.picker) {
    return window.google.picker;
  }

  const gapi = await loadGoogleApiClient();

  return new Promise((resolve, reject) => {
    try {
      console.info('[Playback Cifras IA] Carregando Google Picker...');

      gapi.load('picker', {
        callback: () => {
          if (window.google?.picker) {
            console.info('[Playback Cifras IA] Google Picker carregado.');
            resolve(window.google.picker);
          } else {
            reject(new Error('Google Picker não ficou disponível após gapi.load("picker").'));
          }
        },
        onerror: () => reject(new Error('Erro ao carregar Google Picker.')),
        timeout: 10000,
        ontimeout: () => reject(new Error('Tempo esgotado ao carregar Google Picker.')),
      });
    } catch (error) {
      reject(error);
    }
  });
}

export function isGooglePickerReady() {
  return Boolean(window.google?.picker);
}
