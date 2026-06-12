# Playback Cifras IA

## v2.4 — React Google Drive

Integração inicial do Google Drive na arquitetura React do Playback Cifras IA.

Stack:

```text
React
Vite
CSS Modules
Lucide Icons
PDF.js
Google Drive API
Google Picker
Google Identity Services
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

## Preview

```bash
npm run preview
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

```text
GOOGLE_CLIENT_ID
GOOGLE_API_KEY
ROOT_FOLDER_ID
```

## Branches

```text
main           → versão estável atual
backup/base-ia-alpha → cópia de segurança da base antiga
develop        → manutenção v1.x
develop-react  → linha React/v2
```

## GitHub Pages

A linha React usa Vite. Quando a v2 for publicada, o deploy deve ser feito via GitHub Actions.

## Recursos v2.4

- Hook `useGoogleDrive`.
- Login e logout Google.
- Seleção de pasta com Google Picker.
- Atualização da biblioteca de músicas a partir do Drive.
- Listagem de músicas por estilo.
- Carregamento autorizado de PDF do Drive.
- Carregamento autorizado de áudio do Drive.
- Integração do Drive com `PdfViewer`.
- Integração do Drive com `PlayerBar`.
- Estados de carregamento no menu e toolbar.

## Recursos já existentes da linha React

- v2.0: fundação React/Vite.
- v2.1: shell visual principal.
- v2.2: visualizador PDF/Cifra com PDF.js.
- v2.3: player React.
- v2.3.1: validação automática de build React/Vite.
