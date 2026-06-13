# Changelog

Todas as mudanças relevantes do Playback Cifras IA serão documentadas neste arquivo.

## [v2.7] - 2026-06-12

### Fixed

- Corrigido problema de camada sobreposta bloqueando toque no iPad.
- Corrigido `pointer-events` dos controles do Player e PDF Viewer.
- Corrigido `z-index` entre Sidebar, Viewer, Toolbar e Player.
- Corrigido carregamento do PDF para evitar chamada inválida ao `getDocument`.
- Corrigido fallback quando a música selecionada ainda não possui PDF carregável.
- Corrigido fluxo de áudio para maior compatibilidade com Safari/iPadOS.
- Corrigida área de leitura no layout tablet.

### Changed

- PDF Viewer passa a exibir estado vazio quando não há PDF válido.
- Player passa a aceitar fonte de áudio de forma segura.
- Layout tablet prioriza área central e controles tocáveis.
