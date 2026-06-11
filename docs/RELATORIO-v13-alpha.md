# Playback Cifras v13 Alpha — Biblioteca Inteligente + Arquitetura IA

## Base analisada
Base utilizada: Playback Cifras+ Focus Stage v2.

## Estrutura identificada
- **Rotas/páginas:** `index.html` (landing), `player.html` (app), `about.html`, `help.html`, `privacy.html`, `terms.html`, `capture.html`.
- **Layout principal:** `player.html` com sidebar, visualizador PDF, topbar e player inferior.
- **Componentes:** login Google, seletor Drive, filtros por estilo/playlist, lista de músicas, player MP3, zoom, rolagem, favoritos, playlists.
- **Autenticação:** Google Identity Services via OAuth token client em `app.js`.
- **Google Drive:** Google Drive API e Google Picker API em `app.js`.
- **Biblioteca atual:** montada a partir de pares PDF + áudio com mesmo nome no Drive.
- **Player:** elemento `<audio>` com arquivos privados carregados via API autenticada.
- **Armazenamento:** `localStorage` e Cache API para token, pasta, biblioteca, favoritos, playlists, histórico, zoom e arquivos.
- **Estilos:** `styles.css` para o app e `landing.css` para páginas comerciais.

## Branch sugerida
`v13-biblioteca-inteligente`

## Impactos mapeados
- Mantido o fluxo estável atual de Drive/PDF/MP3.
- Corrigida a consulta do Drive para detectar MP3s mesmo quando o Google retorna MIME type diferente.
- Adicionada arquitetura em arquivos separados, sem acoplar processamento real ao app principal.
- Nenhuma cobrança, banco remoto ou IA real foi implementada.

## Arquivos modificados
- `app.js`
- `README.md`

## Arquivos criados
- `add-music.html`
- `subscription.html`
- `editor.html`
- `ai-lab.html`
- `docs/RELATORIO-v13-alpha.md`
- `docs/ROADMAP-v14.md`
- `schemas/entities.json`
- `services/permissions/permissions.service.js`
- `services/library/library.service.js`
- `services/billing/plans.service.js`
- `services/billing/credits.service.js`
- `services/billing/payment-providers.interface.js`
- `services/ai-processing/stem-separation.service.js`
- `services/ai-processing/transcription.service.js`
- `services/ai-processing/chord-detection.service.js`
- `services/ai-processing/key-detection.service.js`
- `services/ai-processing/lyrics-generation.service.js`
- `services/ai-processing/pdf-generation.service.js`
- `services/ai-processing/ai-flow.mock.js`

## Estrutura dos planos
- **Free:** biblioteca limitada, setlists limitadas, sem IA.
- **Essencial:** biblioteca ilimitada, backup, Google Drive, setlists ilimitadas, sem IA.
- **Pro:** Essencial + IA, exportações avançadas, geração automática de cifras e processamento musical.

## Estrutura dos créditos
- Separação de stems: 1 crédito.
- Transcrição: 1 crédito.
- Detecção de acordes: 1 crédito.
- Detecção de tom: 1 crédito.
- Geração completa de cifra: 2 créditos.
- Geração PDF: 1 crédito.

## Estrutura IA
Módulo criado em `services/ai-processing/` com serviços mockados. Nenhuma IA real é executada nesta versão.

## Testes realizados
- Verificação de sintaxe JavaScript com `node --check app.js`.
- Conferência estática dos arquivos HTML principais.
- Validação de empacotamento ZIP.

## Possíveis riscos
- As páginas estruturais são demonstrativas e ainda não executam importação real fora do Drive.
- O app continua dependente das políticas do Google OAuth/Drive para acesso aos arquivos.
- A detecção de arquivos depende de extensões corretas nos nomes dos arquivos.
