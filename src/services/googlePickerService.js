let gapiLoadPromise = null;
let pickerLoadPromise = null;

export function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);

    if (existing) {
      existing.addEventListener('load', () => resolve(existing), { once: true });
      existing.addEventListener('error', () => reject(new Error(`Falha ao carregar ${src}`)), { once: true });

      if (existing.dataset.loaded === 'true') {
        resolve(existing);
      }

      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.defer = true;

    script.addEventListener('load', () => {
      script.dataset.loaded = 'true';
      resolve(script);
    }, { once: true });

    script.addEventListener('error', () => {
      reject(new Error(`Falha ao carregar ${src}`));
    }, { once: true });

    document.head.appendChild(script);
  });
}

export async function loadGoogleApiClient() {
  if (window.gapi) {
    return window.gapi;
  }

  if (!gapiLoadPromise) {
    gapiLoadPromise = loadScript('https://apis.google.com/js/api.js')
      .then(() => window.gapi);
  }

  return gapiLoadPromise;
}

export async function loadGooglePicker() {
  if (window.google?.picker) {
    return window.google.picker;
  }

  if (!pickerLoadPromise) {
    pickerLoadPromise = loadGoogleApiClient().then((gapi) => {
      if (!gapi?.load) {
        throw new Error('Google API Client não foi carregado corretamente.');
      }

      return new Promise((resolve, reject) => {
        try {
          gapi.load('picker', {
            callback: () => {
              if (window.google?.picker) {
                resolve(window.google.picker);
              } else {
                reject(new Error('Google Picker não ficou disponível após o carregamento.'));
              }
            },
            onerror: () => reject(new Error('Falha ao carregar Google Picker.')),
            timeout: 10000,
            ontimeout: () => reject(new Error('Tempo esgotado ao carregar Google Picker.')),
          });
        } catch (error) {
          reject(error);
        }
      });
    });
  }

  return pickerLoadPromise;
}

export function isGooglePickerReady() {
  return Boolean(window.google?.picker);
}
