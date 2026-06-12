# Changelog

Todas as mudanças relevantes do Playback Cifras IA serão documentadas neste arquivo.

---

## [v2.0] - 2026-06-12

### Added

- Fundação React do Playback Cifras IA.
- Configuração Vite.
- Estrutura com CSS Modules.
- Lucide Icons como biblioteca oficial de ícones.
- Componentização inicial da tela principal:
  - Layout
  - Sidebar
  - Toolbar
  - Viewer
  - PlayerBar
  - VersionFooter
- Service inicial para Google Drive.
- Hook inicial para áudio.
- Workflow de deploy para GitHub Pages via GitHub Actions.
- Pasta `legacy/` com arquivos da v1.4 para referência técnica.

### Changed

- A publicação futura da v2 passa a depender de build Vite.
- A linha React deve ser desenvolvida a partir de `develop-react`.

### Preserved

- A versão v1.x permanece segura fora da linha React.
- A arquitetura antiga foi mantida em `legacy/` apenas como referência.
