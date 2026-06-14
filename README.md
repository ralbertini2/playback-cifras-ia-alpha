# Playback Cifras IA

## v2.9.0 — Drive Library Source Fix

Correção funcional para a biblioteca real do Google Drive.

### Corrige

- Montagem de músicas a partir dos arquivos reais da pasta selecionada.
- Associação de PDF e MP3 por nome base.
- Envio do PDF selecionado para o PdfViewer.
- Envio do MP3 selecionado para o PlayerBar.
- Integração correta entre `useGoogleDrive.js`, `App.jsx`, `PdfViewer` e `PlayerBar`.

### Estrutura suportada

```text
ROCK/
├── So Far Away.pdf
├── So Far Away.mp3
```

### Resultado esperado

- A biblioteca exibe `So Far Away`.
- Ao selecionar a música, o PDF abre.
- O MP3 é carregado no player.
- O botão Tocar fica habilitado.
