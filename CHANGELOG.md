# Changelog

## [v2.8.2] - 2026-06-13

### Fixed

- Corrigido botão de escolher pasta raiz do Google Drive.
- Corrigido problema em que `window.google?.picker` ficava `undefined`.
- `openFolderPicker()` passa a carregar a Google Picker API antes de abrir o seletor.

### Added

- `src/services/googlePickerService.js`
