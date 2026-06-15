
## v4.0.1

- Move alternância Modo Estudo / Modo Palco para o topo principal.
- Mantém o controle de volume alinhado à direita.
- Remove alternância de modo da área do PDF/Palco.
- Corrige reabertura do PDF ao voltar do Modo Palco.
- Evita reutilização de ArrayBuffer destacado pelo PDF.js.
- Melhora a fluidez do zoom por pinça no PDF.

# v4.0.0 - Modo Palco V1

- Adiciona alternância Modo Estudo / Modo Palco na área de visualização.
- Mantém o Modo Estudo com o PDF original.
- Adiciona StageViewer para teleprompter cifrado sem IA.
- Extrai texto do PDF preservando coordenadas X/Y.
- Destaca acordes e mantém posição horizontal em relação à letra.
- Mantém sidebar, player e layout principal visíveis.
- Não altera Google Drive, MP3, package.json, Vite ou GitHub Actions.

# Changelog

## v3.0.12-pdf-pages-touch

### Corrigido
- Renderização sequencial vertical de todas as páginas do PDF.
- Zoom por pinça aplicado somente na área do PDF.
- Scroll/touch da sidebar isolado para não afetar a interface abaixo.

### Mantido
- Controles de paginação continuam removidos.
- Desktop preservado.
- Google Drive, MP3 e player não foram alterados.

## v3.0.11-header-actions-cleanup

### Corrigido
- Remove definitivamente os botões de busca e favorito do topo principal.
- Mantém somente informações da música, botão de menu mobile/tablet e volume no topo.
- Garante o volume alinhado à direita sem afetar o desktop.

### Não alterado
- package.json
- Vite
- GitHub Actions
- PDF.js
- Google Drive
- Player inferior
- Sidebar
