# Playback Cifras v18.2c — Correções Visuais Seguras da Sidebar

## Objetivo
Aplicar somente ajustes visuais seguros na sidebar e nos botões superiores, preservando todas as funcionalidades existentes.

## Arquivos alterados
- `player.html`: apenas inclusão do CSS `sidebar-v18-2c.css` no `<head>`.
- `sidebar-v18-2c.css`: novo arquivo de correções visuais.

## Arquivos não alterados
- `app.js`
- `config.js`
- serviços Google Drive
- player
- estrutura de dados
- IA mockada
- planos/créditos

## Correções aplicadas
1. Textos na sidebar com `line-height`, `white-space`, `overflow` e `text-overflow` ajustados.
2. Botões `Modo palco` e `Tela cheia` ocultados apenas por CSS, sem remoção de IDs ou funções JavaScript.
3. Lista de músicas compactada para aproximadamente 44px a 48px de altura por item.
4. Lista com rolagem própria e maior prioridade visual dentro da sidebar.
5. Botões superiores `Dashboard IA`, `Biblioteca` e `Planos` forçados para texto branco nos estados normal, hover, focus, active e visited.

## Confirmações de segurança
- `config.js` não foi incluído nem alterado.
- `app.js` não foi incluído nem alterado.
- Nenhum ID funcional foi removido.
- Nenhum listener/evento foi alterado.
- Nenhuma função Google Drive foi alterada.
- Player e PDF não foram alterados.

## Testes recomendados
1. Abrir app.
2. Clicar em Reconectar/Entrar com Google.
3. Confirmar Google Drive conectado.
4. Selecionar pasta.
5. Atualizar biblioteca.
6. Verificar lista de músicas com rolagem.
7. Confirmar células compactas.
8. Selecionar música.
9. Tocar música.
10. Usar zoom A-/A+.
11. Usar rolagem.
12. Clicar em Dashboard IA, Biblioteca e Planos.
13. Confirmar que os textos continuam brancos.
