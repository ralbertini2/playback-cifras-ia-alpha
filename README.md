# Playback Cifras IA

## v2.0 — React Foundation

Nova fundação técnica do Playback Cifras IA construída com:

```text
React
Vite
CSS Modules
Lucide Icons
```

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Configuração Google

Copie:

```text
public/config.example.js
```

para:

```text
public/config.js
```

Preencha:

```js
GOOGLE_CLIENT_ID
GOOGLE_API_KEY
ROOT_FOLDER_ID
```

## Branches

```text
main           → versão estável atual
develop        → manutenção v1.x
develop-react  → linha React/v2
```

## Deploy GitHub Pages

A v2 usa Vite. Portanto, o deploy deve ser feito via GitHub Actions.

O workflow está em:

```text
.github/workflows/deploy-pages.yml
```
