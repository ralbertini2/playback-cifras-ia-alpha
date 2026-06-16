# Changelog

## v4.0.8 - Stage iOS Text Fallback

### Corrigido
- Reforça o carregamento do PDF do Modo Palco sem worker no iPad/iPhone.
- Adiciona fallback por streamTextContent quando getTextContent falhar no Safari.
- Mantém o parser posicionado quando disponível.
- Mantém fallback textual quando a leitura posicionada não estiver disponível.

### Não alterado
- Google Drive.
- MP3.
- Player.
- Sidebar.
- package.json.
- GitHub Actions.

## v4.0.10 - Stage Readability Sync

- Sincroniza o scroll do Modo Palco com o tempo do MP3.
- Remove controles manuais de velocidade do scroll.
- Melhora reconstrução das linhas para reduzir palavras cortadas ou juntadas.
- Melhora limpeza de acordes duplicados extraídos pelo PDF.js.
- Reforça destaque visual das linhas de acordes.
- Aplica visual de palco mais limpo e legível.

