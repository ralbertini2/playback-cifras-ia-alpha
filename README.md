# Playback Cifras IA

## v2.8.7 — Real Pick Folder Fix

Correção real do botão **Escolher** pasta do Google Drive.

## Diagnóstico

A varredura do branch `develop-react` mostrou que o problema não era mais a API Google.

O teste manual confirmou:

```js
window.gapi.load('picker', ...)
```

funciona corretamente e carrega:

```js
window.google.picker
```

O problema real estava entre `App.jsx` e `useGoogleDrive.js`:

```jsx
onPickFolder={drive.pickFolder}
```

mas o hook não retornava:

```js
pickFolder
```

Ele retornava apenas:

```js
chooseFolder
selectFolder
openPicker
openFolderPicker
```

## Correção

- Adicionado `pickFolder: chooseFolder` no retorno do hook.
- `App.jsx` passa a usar fallback seguro:
  - `drive.pickFolder`
  - `drive.chooseFolder`
  - `drive.openPicker`
  - `drive.openFolderPicker`
- `chooseFolder` passa a ter tratamento de erro e mensagens claras.
- Footer atualizado para v2.8.7.

## Resultado esperado

- Após login Google, botão **Escolher** deve chamar o Google Picker.
- O console deve mostrar:
  - `[Playback Cifras IA] Carregando Google Picker...`
  - `[Playback Cifras IA] Google Picker carregado.`
  - `[Playback Cifras IA] Abrindo Google Picker...`
- O seletor de pasta do Google Drive deve abrir.

## Branch

```text
feature/v2-8-7-real-pick-folder-fix
```
