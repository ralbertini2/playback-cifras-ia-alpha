# Changelog

## [v2.7.3] - 2026-06-12

### Fixed

- Corrigido carregamento inválido de áudio no Player React.
- Corrigido erro de console `URI inválida. Falha no carregamento do recurso de mídia`.
- Player deixa de tentar carregar áudio vazio, nulo, `undefined`, `null` ou `[object Object]`.
- `useAudioPlayer` passa a expor `hasValidSource` e `error`.
- PlayerBar passa a exibir mensagem de erro de áudio quando necessário.

### Added

- `src/services/audioService.js`
