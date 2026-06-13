# Changelog

## [v2.8.7] - 2026-06-13

### Fixed

- Corrigida integração real entre `App.jsx` e `useGoogleDrive.js`.
- Adicionado alias `pickFolder: chooseFolder`.
- `App.jsx` passa a usar fallback seguro para `onPickFolder`.
- `chooseFolder` passa a tratar erros do Google Picker e exibir mensagens.
- Corrigido botão **Escolher** que não executava nenhuma ação.

### Changed

- `src/hooks/useGoogleDrive.js`
- `src/app/App.jsx`
- `src/config/appVersion.js`
