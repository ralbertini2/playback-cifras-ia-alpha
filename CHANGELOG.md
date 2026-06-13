# Changelog

## [v2.7.1] - 2026-06-12

### Fixed

- Restaurados exports esperados pelo hook `useGoogleDrive.js`.
- Corrigido erro de build causado por exports ausentes em `googleDriveService.js`.
- Preservada compatibilidade com:
  - `getAuthorizedMediaUrl`
  - `initGoogleAuth`
  - `loadDriveLibrary`
  - `logoutGoogle`
  - `openFolderPicker`
  - `requestAccessToken`

### Changed

- `googleDriveService.js` volta a expor API compatível com a arquitetura React atual.
