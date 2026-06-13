# Playback Cifras IA

## v2.8.2 — Google Picker Loader Fix

Correção do botão de escolha da pasta raiz do Google Drive.

## Problema

O login Google funcionava, mas o botão de escolher pasta não abria o seletor porque:

```js
window.google?.picker
```

retornava:

```text
undefined
```

## Correção

- Adicionado `googlePickerService.js`.
- Carregamento explícito de `https://apis.google.com/js/api.js`.
- Execução de `gapi.load('picker')`.
- `openFolderPicker()` aguarda o Picker estar disponível antes de abrir.
- Mantida compatibilidade com login via Google Identity Services.

## Validação esperada

No console:

```js
window.google?.picker
```

deve retornar um objeto após carregar o Picker.

## Branch

```text
feature/v2-8-2-google-picker-loader-fix
```
