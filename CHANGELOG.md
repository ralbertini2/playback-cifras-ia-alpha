# Changelog

## [v2.8.2] - 2026-06-13

### Fixed

- Corrigido botão de escolher pasta raiz do Google Drive.
- Corrigido problema em que `window.google?.picker` ficava `undefined`.
- `openFolderPicker()` passa a carregar a Google Picker API antes de abrir o seletor.

### Added

- `src/services/googlePickerService.js`
## [v2.8.4] - 2026-06-13

### Fixed

- Corrigido bloqueio circular do botão de escolher pasta.
- Botão "Escolher" agora funciona quando o usuário está autenticado e o sistema está em `need-folder`.
- Sidebar passa a diferenciar "Google autenticado" de "Google Drive conectado".
- Footer atualizado para v2.8.4.
