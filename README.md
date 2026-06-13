# Playback Cifras IA

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

- O botão "Escolher" passa a ser habilitado quando o status é:
  - `need-folder`
  - `authenticated`
  - `connected`
- A Sidebar passa a mostrar "Google autenticado" quando o login foi feito mas a pasta ainda não foi selecionada.
- Footer atualizado para v2.8.4.

## Branch

```text
feature/v2-8-4-folder-picker-unlock-fix
```
