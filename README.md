# Playback Cifras IA

## v2.7.2 — React Black Screen Fix

Correção emergencial para tela preta na aplicação React publicada.

## Problema

Após a restauração do build, a aplicação passou a abrir com tela preta no runtime.

Erro identificado no console:

```text
Uncaught TypeError: can't access property "then", gt(...) is null
```

## Causa provável

Alguma função do `googleDriveService.js` estava retornando `null`, enquanto algum hook/componente chamava `.then()` sobre esse retorno.

## Correção

O arquivo `src/services/googleDriveService.js` foi ajustado para que funções assíncronas/sensíveis retornem sempre `Promise`, `false`, `''` ou `[]`, nunca `null` em fluxos encadeados.

Funções protegidas:

```text
initGoogleAuth
requestAccessToken
logoutGoogle
loadDriveLibrary
openFolderPicker
getAuthorizedMediaUrl
fetchDriveBlobUrl
```

## Branch

```text
feature/v2-7-2-react-black-screen-fix
```

## PR

```text
fix: corrige tela preta no runtime React
```
