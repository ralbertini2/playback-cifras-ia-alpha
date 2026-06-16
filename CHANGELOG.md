# v4.0.13.1 - Scroll, DOCX e offline

## Corrigido
- Corrige velocidade do auto scroll abaixo de 32 px/s.
- Altera incremento/decremento de velocidade para passos de 5 px/s.
- Mantém auto scroll fluido com requestAnimationFrame.
- Adiciona visualizador de documento para Modo Estudo.
- Mantém documentos Word/Google Docs integrados ao fluxo Estudo/Palco.
- Ao alternar para Modo Palco, documentos usam o parser textual do palco.
- Pré-carrega arquivos da biblioteca para uso offline usando IndexedDB.
- Limpa biblioteca, mídia carregada, pasta selecionada e dados offline no logout.
- Reforça isolamento de touch/scroll da sidebar no iPhone.

## Observação
- Arquivos Google Docs são exportados como texto pelo Drive.
- Arquivos .doc/.docx binários são detectados; para renderização direta completa sem backend, a melhor compatibilidade continua sendo converter para Google Docs no Drive.

## Não alterado
- MP3/player.
- GitHub Actions.
- package.json.
