# Changelog

## [v3.0.0] - 2026-06-13

### Corrigido
- Corrigido carregamento de PDF no PDF.js usando fonte explícita `{ url }`.
- Mantido fluxo funcional do MP3 via URL autorizada do Google Drive.
- Limpas URLs de mídia ao desconectar, trocar/remover pasta ou quando a biblioteca fica vazia.

## [v2.9.0] - 2026-06-13

### Fixed

- Corrigido fluxo Google Drive → Biblioteca → PDF Viewer → Player.
- `useGoogleDrive.js` passa a manter `pdfUrl` e `audioUrl` da música selecionada.
- `selectSong` carrega blobs autorizados de PDF e áudio usando `pdfFileId` e `audioFileId`.
- `App.jsx` passa a enviar o objeto `audio` correto para `PlayerBar`.
- `PlayerBar` volta a reconhecer fonte válida e habilitar o botão Tocar.
- `PdfViewer` passa a receber `drive.pdfUrl` válido.
