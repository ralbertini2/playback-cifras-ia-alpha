# Changelog

Todas as mudanças relevantes do Playback Cifras IA serão documentadas neste arquivo.

---


## [v2.6] - 2026-06-12

### Added

- Contadores funcionais de biblioteca: todas, favoritas e recentes.
- Ação de limpar busca e filtro da Biblioteca.
- Botão de busca da Toolbar conectado à abertura da Sidebar.
- `STORAGE.recents` padronizado para histórico local.
- Funções utilitárias reais em `libraryService.js` para busca, favoritos e recentes.

### Changed

- `useLibrary` passa a usar `libraryService.js` em vez de concentrar toda a lógica internamente.
- Biblioteca exibe total geral e total filtrado de músicas.
- Filtros de favoritos e recentes ficam mais visíveis na interface.
- Versão atualizada para `v2.6`.
- `package.json` atualizado para `2.6.0`.

### Preserved

- PDF Viewer React.
- Player React.
- Google Drive React.
- Repertórios React.
- React Build Validation.


## [v2.5] - 2026-06-12

### Added

- Componente `Library` para biblioteca musical React.
- Componente `Setlists` para repertórios/eventos.
- Hook `useLibrary` para busca, favoritos, recentes e filtros de coleção.
- Service `libraryService.js` para ordenação, agrupamento e estatísticas da biblioteca.
- Busca por música, artista, estilo e nome de arquivo.
- Filtros de biblioteca: todas, favoritas e recentes.
- Favoritos persistidos localmente.
- Histórico local de músicas recentes.
- Botão de favorito integrado à toolbar.

### Changed

- Sidebar passa a usar componentes dedicados `Library` e `Setlists`.
- Lista de músicas passa a respeitar busca, favoritos, recentes, estilo e repertório selecionado.
- Versão atualizada para `v2.5`.
- `package.json` atualizado para `2.5.0`.

### Preserved

- PDF Viewer React.
- Player React.
- Integração inicial Google Drive React.
- React Build Validation.


## [v2.3.1] - 2026-06-12

### Added

- Workflow `React Build Validation` para validar a aplicação React/Vite.
- Script `validate` no `package.json`.
- Arquivo `public/config.js` com configuração segura inicial.
- Arquivo `.gitignore` para `node_modules`, `dist` e arquivos locais.

### Changed

- Versão atualizada para `v2.3.1`.
- `APP_VERSION` atualizado para `v2.3.1`.

### Fixed

- Reduzido risco de erro de runtime por ausência de `config.js` no build Vite.

## [v2.3] - 2026-06-12

### Added

- Player React componentizado.
- Componente `PlaybackControls`.
- Componente `ProgressBar`.
- Componente `VolumeControl`.
- Service `audioService.js` para utilitários de áudio.
- Controle de volume e mute.
- Avançar e voltar 10 segundos.
- Estado de áudio persistindo volume e mute no navegador.

### Changed

- `PlayerBar` passa a compor controles menores e reutilizáveis.
- Hook `useAudioPlayer` passa a expor volume, mute, source, seek incremental e status `hasSource`.
- Versão atualizada para `v2.3`.

---

## [v2.2] - 2026-06-12

### Added

- Visualizador PDF React baseado em PDF.js.
- Hook `usePdfViewer` para controle de documento, página e zoom.
- Service `pdfService.js` para carregamento do PDF.js e worker.
- Controles de zoom, ajuste à largura e navegação de páginas.
- PDF de exemplo para validação inicial do viewer.

### Changed

- Área central passa a usar o novo componente `PdfViewer`.
- Controles de zoom foram movidos da toolbar principal para o viewer.
- Versão atualizada para `v2.2`.

## [v2.1] - 2026-06-12

### Added

- Criado shell visual principal em React.
- Adicionado componente `AppLayout`.
- Adicionado componente `Sidebar`.
- Adicionado componente `Toolbar`.
- Adicionado componente `Viewer`.
- Adicionado componente `PlayerBar`.
- Adicionado componente `VersionFooter`.
- Adicionados CSS Modules por componente.
- Aplicado layout Tablet First para a nova arquitetura React.

### Changed

- Atualizada versão exibida para `Playback Cifras IA v2.1`.
- Atualizado `package.json` para `2.1.0`.
- Atualizados `README.md` e `VERSION.md`.

### Fixed

- Corrigida estrutura React inicial que importava componentes ainda inexistentes.

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
