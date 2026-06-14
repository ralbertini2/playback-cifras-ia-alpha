# Changelog

## [v3.0.0-pdf-fix] - 2026-06-14

### Fixed

- Estabilizado carregamento do PDF.js sem alterar dependências, Vite ou GitHub Actions.
- `pdfService.js` passa a tentar primeiro o build legacy do PDF.js, mantendo fallback para o import atual.
- Adicionado fallback por ArrayBuffer quando o carregamento direto via Blob URL falhar.
- `usePdfViewer.js` melhora limpeza de documentos/renderizações e mensagens de erro controladas.
- Escopo restrito: não altera MP3, Google Picker, layout, package.json, workflow ou vite.config.js.

## [v2.9.0] - 2026-06-13

### Fixed

- Corrigido fluxo Google Drive → Biblioteca → PDF Viewer → Player.
- `useGoogleDrive.js` passa a manter `pdfUrl` e `audioUrl` da música selecionada.
- `selectSong` carrega blobs autorizados de PDF e áudio usando `pdfFileId` e `audioFileId`.
- `App.jsx` passa a enviar o objeto `audio` correto para `PlayerBar`.
- `PlayerBar` volta a reconhecer fonte válida e habilitar o botão Tocar.
- `PdfViewer` passa a receber `drive.pdfUrl` válido.
