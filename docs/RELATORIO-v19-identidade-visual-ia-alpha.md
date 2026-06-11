# Playback Cifras v19 — Nova Identidade Visual Oficial IA Alpha

## Objetivo
Aplicar nova identidade visual oficial baseada no mockup aprovado, preservando a base funcional atual.

## Arquivos alterados/criados
- `player.html`
- `styles-v19-ia-alpha.css`
- `docs/RELATORIO-v19-identidade-visual-ia-alpha.md`

## Arquivos não alterados
- `app.js`
- `config.js`
- integração Google Drive
- player lógico
- leitura de PDF
- reprodução MP3
- estrutura de dados

## Estratégia
O `player.html` mantém todos os IDs funcionais utilizados pelo `app.js`:
- login Google
- seleção/atualização do Drive
- filtros
- lista de músicas
- PDF viewer
- áudio/player
- controles de zoom e rolagem

A nova identidade visual é aplicada por CSS adicional:
- layout premium escuro;
- sidebar musical;
- área central com foco no PDF/cifra;
- painel direito de IA mockada;
- player inferior visual premium;
- paleta oficial roxa IA Alpha.

## Compatibilidade
Esta versão foi desenhada para GitHub Pages e não inclui `config.js`.
Após publicar, manter o `config.js` atual do repositório.

## Observações
A IA permanece mockada. Nenhuma IA real, backend ou pagamento foi implementado.
