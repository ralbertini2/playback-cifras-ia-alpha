# Changelog

## [v3.0.2] - 2026-06-14

### Fixed

- Mantém o player fixo no rodapé da área principal quando o PDF renderiza páginas grandes.
- Define altura fixa da aplicação em `100dvh`, evitando que o PDF empurre os controles para baixo.
- Remove o carregamento de música como bloqueio do menu lateral, mantendo o fluxo de pasta independente do PDF/MP3.
- Carrega automaticamente a biblioteca quando o usuário já está autenticado e há pasta selecionada.
- Após escolher uma pasta no Google Drive, a biblioteca é carregada automaticamente sem exigir clique manual em Atualizar.
- Lista arquivos em pastas e subpastas do Google Drive, usando o caminho da pasta como estilo.
- Adiciona filtro real por estilo/pasta no seletor de Estilo.

## [v3.0.1] - 2026-06-14

### Fixed

- Corrige troca de áudio ao selecionar outra música, limpando o player anterior antes de carregar o novo MP3.
- Evita que carregamentos antigos de PDF/MP3 sobrescrevam a música atual quando o usuário troca rapidamente de música.
- Altera o carregamento do PDF vindo do Google Drive para `Uint8Array`, evitando leitura frágil por Blob URL no PDF.js.
- Adiciona validação da assinatura `%PDF-` no arquivo retornado pelo Google Drive antes de enviar ao PDF Viewer.
- Mantém escopo restrito: sem alteração de package.json, Vite, workflows, Google Picker ou layout.

## [v3.0.0] - 2026-06-14

### Fixed

- Estabilizado o carregamento do PDF.js usando build legacy compatível com Vite/Safari.
- Adicionado tratamento de erro mais claro para falhas de PDF, worker, permissão e arquivo inválido.
- Mantido o escopo restrito ao PDF Viewer, sem alterar MP3, Google Picker ou layout.

## [v2.9.0] - 2026-06-13

### Fixed

- Corrigido fluxo Google Drive → Biblioteca → PDF Viewer → Player.
- `useGoogleDrive.js` passa a manter `pdfUrl` e `audioUrl` da música selecionada.
- `selectSong` carrega blobs autorizados de PDF e áudio usando `pdfFileId` e `audioFileId`.
- `App.jsx` passa a enviar o objeto `audio` correto para `PlayerBar`.
- `PlayerBar` volta a reconhecer fonte válida e habilitar o botão Tocar.
- `PdfViewer` passa a receber `drive.pdfUrl` válido.
