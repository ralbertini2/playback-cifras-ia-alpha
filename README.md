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
## v2.8.4 — Folder Picker Unlock Fix

Correção do botão de escolher pasta do Google Drive.

## Problema

O botão "Escolher" pasta ficava desabilitado porque dependia de `connected`.

Mas `connected` só fica verdadeiro depois que a pasta já foi escolhida e a biblioteca foi carregada.

Isso criava um bloqueio circular:

```text
precisa escolher pasta para conectar
mas
precisa estar conectado para escolher pasta
```

## Correção

- Adicionado `googlePickerService.js`.
- Carregamento explícito de `https://apis.google.com/js/api.js`.
- Execução de `gapi.load('picker')`.
- `openFolderPicker()` aguarda o Picker estar disponível antes de abrir.
- Mantida compatibilidade com login via Google Identity Services.
- O botão "Escolher" passa a ser habilitado quando o status é:
  - `need-folder`
  - `authenticated`
  - `connected`
- A Sidebar passa a mostrar "Google autenticado" quando o login foi feito mas a pasta ainda não foi selecionada.
- Footer atualizado para v2.8.4.

## Validação esperada

No console:

```js
window.google?.picker
```

deve retornar um objeto após carregar o Picker.

## Branch

```text
feature/v2-8-2-google-picker-loader-fix
```text
feature/v2-8-4-folder-picker-unlock-fix
```
