# Changelog

## [v3.0.1] - 2026-06-14

### Fixed

- Corrigido o ambiente de build React/Vite no GitHub Actions.
- Substituídas dependências `latest` por versões fixas e previsíveis.
- Movidos `vite` e `@vitejs/plugin-react` para `devDependencies`.
- Adicionado `package-lock.json` para builds reproduzíveis.
- Atualizados workflows para usar `npm ci` com cache npm.
- Mantido o escopo restrito ao build; não altera PDF, MP3, Google Picker ou layout.

## [v3.0.0] - 2026-06-14

### Fixed

- Estabilizado o carregamento do PDF.js usando build legacy compatível com Vite/Safari.
- Fixada a versão do `pdfjs-dist` para evitar regressões por instalação com `latest`.
- Ajustado o carregamento do worker do PDF.js via `pdf.worker.min.mjs?url`.
- Adicionado tratamento de erro mais claro para falhas de PDF, worker, permissão e arquivo inválido.
- Mantido o escopo restrito ao PDF Viewer, sem alterar MP3, Google Picker ou layout.

## [v2.9.0] - 2026-06-13

### Fixed

- Corrigido fluxo Google Drive → Biblioteca → PDF Viewer → Player.
- `useGoogleDrive.js` passa a manter `pdfUrl` e `audioUrl` da música selecionada.
- `selectSong` carrega blobs autorizados de PDF e áudio usando `pdfFileId` e `audioFileId`.
- `App.jsx` passa a enviar o objeto `audio` correto para `PlayerBar`.
- `PlayerBar` volta a reconhecer fonte válida e habilitar o botão Tocar.
- `PdfViewer` passa a receber `drive.pdfUrl` válido.
