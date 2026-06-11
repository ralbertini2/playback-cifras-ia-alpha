# Playback Cifras+ Business Beta

Base preservada da v12-2 / Business Alpha, com novas camadas comerciais e de produtividade.

## Implementado

1. Favoritos reais
   - Marcar/desmarcar músicas como favoritas.
   - Aba/atalho inferior "Favoritos".
   - Salvamento local no dispositivo.

2. Setlists reais
   - Criar setlists/eventos.
   - Adicionar música atual à setlist.
   - Filtrar por setlist.
   - Mover música para cima/baixo dentro da setlist.
   - Salvamento local no dispositivo.

3. Histórico
   - Lista das últimas músicas abertas.
   - Acesso rápido pelo menu lateral.
   - Botão para limpar histórico.

4. PWA mais profissional
   - Manifest atualizado para Playback Cifras+.
   - Ícones 192px e 512px.
   - start_url apontando para player.html.
   - Service worker com cache de páginas estáticas e config.js fora do cache.

5. Página de captura
   - Novo arquivo capture.html.
   - Links para e-mail de interesse/feedback.

## Arquivos alterados

- player.html
- app.js
- styles.css
- manifest.webmanifest
- service-worker.js
- index.html
- landing.html
- about.html
- help.html

## Arquivos criados

- capture.html
- assets/icon-192.png
- assets/icon-512.png
- README-business-beta.md

## Não alterado

- Login Google
- Google Drive API
- Google Picker
- Leitura das pastas
- Abertura dos PDFs
- Execução dos MP3
- Sincronização de biblioteca
- config.js

## Atenção

Depois de publicar no GitHub, recoloque ou confira as credenciais no config.js:

- GOOGLE_CLIENT_ID
- GOOGLE_API_KEY
