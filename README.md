# Playback Cifras IA

## v2.7.1 — Fix Build Google Drive Service

Correção mínima para restaurar o build da v2.7.

## Problema corrigido

A v2.7 substituiu `src/services/googleDriveService.js` e removeu exports ainda usados por `src/hooks/useGoogleDrive.js`.

Exports restaurados:

```text
getAuthorizedMediaUrl
initGoogleAuth
loadDriveLibrary
logoutGoogle
openFolderPicker
requestAccessToken
```

## Objetivo

Fazer o React Build Validation voltar a ficar verde antes de continuar as correções de iPad, PDF e mídia.

## Branch

```text
feature/v2-7-1-fix-build
```
