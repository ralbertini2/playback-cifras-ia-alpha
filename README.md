# Playback Cifras IA

## v2.8.6 — Pick Folder Prop Fix

Correção mínima para o botão **Escolher** pasta.

## Problema

O `App.jsx` passa:

```jsx
onPickFolder={drive.pickFolder}
```

Mas o hook `useGoogleDriveLibrary()` não retorna `pickFolder`.

## Correção

Adicionar no retorno do hook:

```js
pickFolder: chooseFolder,
```

## Trecho correto

```js
chooseFolder,
pickFolder: chooseFolder,
setFolder: chooseFolder,
openPicker: chooseFolder,
openFolderPicker: chooseFolder,
```
