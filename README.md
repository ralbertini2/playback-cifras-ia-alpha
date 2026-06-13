# Playback Cifras IA

## v2.8.3 — Folder Picker UI & Version Fix

Correção de interface do seletor de pasta e versão exibida no footer.

## Problemas corrigidos

- O campo `ROOT_FOLDER_ID` aparecia para o usuário.
- O fluxo atual deve permitir escolher a pasta pelo Google Picker, não digitar o ID manualmente.
- O footer continuava exibindo `v2.6`.
- `src/config/appVersion.js` estava parado em `v2.6`.

## Inclui

- Remoção do input editável `ROOT_FOLDER_ID` da Sidebar.
- Exibição de estado da pasta selecionada.
- Botão `Escolher` pasta mais claro.
- Botão de pasta desabilitado quando o usuário ainda não fez login.
- Atualização de `APP_VERSION` para `v2.8.3`.

## Branch

```text
feature/v2-8-3-folder-picker-ui-version-fix
```
