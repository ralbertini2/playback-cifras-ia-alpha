# Playback Cifras IA

## v2.8 — Real Google Config & Drive State

Correção funcional do estado real do Google Drive.

## Problema

O app mostrava “Google Drive conectado” mesmo quando:

- `ROOT_FOLDER_ID` estava vazio;
- o usuário ainda não tinha escolhido uma pasta;
- não existia token válido;
- nenhum PDF/MP3 real havia sido carregado.

## Correção

- `ROOT_FOLDER_ID` pode ficar vazio.
- O app passa a exigir seleção de pasta após login.
- A pasta escolhida via Google Picker é salva no `localStorage`.
- O Google Drive só fica “conectado” quando há token e pasta válida.
- Biblioteca retorna vazia com mensagem correta quando o Drive ainda não está pronto.
- Estado falso de conexão é eliminado.
- `public/config.js` passa a conter as credenciais reais informadas pelo usuário.

## Branch

```text
feature/v2-8-real-google-config-and-drive-state
```

## PR

```text
fix: corrige estado real do Google Drive
```
