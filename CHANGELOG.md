# Changelog

## [v2.8.1] - 2026-06-13

### Fixed

- Corrigido erro `Cannot read property "length" of undefined`.
- `useGoogleDriveLibrary` volta a expor `filteredSongs`.
- `filteredSongs`, `library`, `songs`, `files` e `musicLibrary` sempre retornam array.
- Restaurados `currentSong`, `currentIndex`, `selectSong`, `selectNext` e `selectPrevious`.
- Seleção de música passa a enviar PDF/áudio apenas quando existe mídia válida.
