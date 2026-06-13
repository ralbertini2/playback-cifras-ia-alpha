# Playback Cifras IA

## v2.8.5 — Force Picker Load on Click

Correção isolada do Google Picker.

## Problema

O teste manual no console confirmou que:

```js
window.gapi.load('picker', ...)
```

funciona e carrega `window.google.picker`.

Portanto o problema estava no fluxo React, que não forçava o carregamento do Picker de forma confiável no clique do botão **Escolher**.

## Correção

- `openFolderPicker()` agora força o carregamento do Picker no momento do clique.
- `forceLoadGooglePicker()` carrega `api.js` e executa `gapi.load('picker')`.
- O Picker só é construído após `window.google.picker` existir.
- Adicionados logs temporários:
  - Carregando Google Picker
  - Google Picker carregado
  - Abrindo Google Picker

## Branch

```text
feature/v2-8-5-force-picker-load-on-click
```
