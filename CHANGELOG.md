# v4.0.13 - Stage Doc Scroll

- Adiciona suporte inicial a documentos Google Docs/Word convertidos pelo Drive no Modo Palco.
- Adiciona auto scroll com controle fino de velocidade.
- Remove logo da sidebar em tablet/iPad/iPhone/mobile.
- Corrige scroll travado da sidebar no iPhone.
- Isola touch/scroll da sidebar para não movimentar a área do PDF.

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
