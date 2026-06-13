# Playback Cifras IA

## v2.8.1 — Filtered Songs Runtime Fix

Correção de runtime após v2.8.

## Problema

Após corrigir o estado real do Google Drive, o app passou a quebrar com:

```text
Cannot read property "length" of undefined
```

Causa:

```text
drive.filteredSongs
```

não estava sendo retornado pelo hook `useGoogleDriveLibrary`.

## Correção

- `filteredSongs` passa a existir sempre como array.
- `library`, `songs`, `files` e `musicLibrary` também sempre retornam arrays.
- `currentSong` e `currentIndex` passam a existir desde o estado inicial.
- `selectSong`, `selectNext` e `selectPrevious` foram restaurados para compatibilidade com `App.jsx`.
- PDF e áudio são enviados aos callbacks apenas quando existe arquivo válido.

## Branch

```text
feature/v2-8-1-filtered-songs-runtime-fix
```

## PR

```text
fix: corrige filteredSongs undefined
```
