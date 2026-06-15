# Changelog

## v4.0.4-stage-parser-ipad

### Corrigido
- Corrige falha do Modo Palco no iPad/Safari durante a leitura do texto do PDF.
- Remove dependência direta de `pdfjs.Util.transform` no parser do Modo Palco.
- Adiciona transformação matricial local para calcular posições X/Y do texto.
- Torna a finalização do documento PDF segura quando `destroy()` não retorna Promise.

### Melhorado
- Ajusta a primeira identidade visual do texto bruto do Modo Palco.
- Melhora contraste, espaçamento e leitura no desktop e iPad.

### Escopo
- Não altera Google Drive.
- Não altera MP3.
- Não altera player.
- Não altera sidebar.
- Não altera package.json.
