# Changelog

Todas as mudanças relevantes do Playback Cifras IA serão documentadas neste arquivo.

## [v2.6.1] - 2026-06-12

### Fixed

- Corrigido processo de publicação da aplicação React/Vite no GitHub Pages.
- Adicionado workflow dedicado para build e deploy do React.
- Corrigida configuração `base` do Vite para o repositório `/playback-cifras-ia-alpha/`.
- Corrigido problema de tela em branco ao tentar publicar React usando `/root`.

### Added

- `.github/workflows/deploy-react-pages.yml`

### Changed

- `vite.config.js` passa a declarar explicitamente:
  - `base: '/playback-cifras-ia-alpha/'`
  - `outDir: 'dist'`
