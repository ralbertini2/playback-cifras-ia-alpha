# Changelog

## [v2.8.5] - 2026-06-13

### Fixed

- Corrigido fluxo React do botão **Escolher** pasta.
- `openFolderPicker()` passa a forçar `gapi.load('picker')` no clique.
- Corrigida dependência de `window.google.picker` pré-carregado.

### Changed

- `src/services/googlePickerService.js`
- `src/services/googleDriveService.js`
- `src/config/appVersion.js`
