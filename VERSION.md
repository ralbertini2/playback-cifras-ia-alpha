# Playback Cifras IA v3.0.5-drive-style-sidebar-fix

Correção de fluxo visual e estilos após estabilização do PDF/MP3.

## Alterações

- Corrige o envio da lista de estilos para a Sidebar (`styleList`).
- Faz o dropdown de Estilo exibir as pastas/subpastas detectadas pelo Google Drive.
- Substitui textos duplicados de status por indicador visual ao lado do logo.
- Remove o bloco visual de status `connected/authenticating` da lateral.
- Ajusta o Google Picker para abrir em modo lista a partir da raiz do Drive, com título orientado à seleção da pasta Playback Cifras.

## Escopo preservado

- Não altera package.json.
- Não altera vite.config.js.
- Não altera GitHub Actions.
- Não altera PDF.js.
- Não altera player de áudio.
