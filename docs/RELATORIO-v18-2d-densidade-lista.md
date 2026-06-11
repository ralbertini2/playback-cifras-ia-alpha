# Playback Cifras v18.2d — Densidade da Lista de Músicas

## Objetivo
Corrigir especificamente a densidade visual da lista de músicas e compactar filtros, sem alterar lógica, IDs, eventos, Google Drive, player, biblioteca ou `config.js`.

## Arquivos entregues
- `styles-v18-2d-lista-compacta.patch.css`
- `docs/RELATORIO-v18-2d-densidade-lista.md`

## Aplicação segura
Copiar todo o conteúdo de `styles-v18-2d-lista-compacta.patch.css` e colar no final do `styles.css` atual.

## Alterações feitas
- Gap máximo de 4px entre células da lista.
- Itens com altura entre 40px e 48px.
- Título e categoria com `ellipsis`, `line-height` compacto e sem quebra estranha.
- Lista com rolagem própria e `flex: 1`.
- Painéis da sidebar compactados por CSS.
- Filtros reduzidos para ocupar menos altura.
- Botões superiores com texto branco em todos os estados.

## Arquivos não alterados
- `app.js`
- `config.js`
- serviços Google Drive
- player
- biblioteca
- estrutura de dados

## Testes recomendados
1. Abrir app no iPad/tablet.
2. Reconectar Google.
3. Confirmar leitura das músicas.
4. Verificar que a lista ocupa a maior parte da sidebar.
5. Confirmar itens entre 40px e 48px.
6. Verificar gap visual de até 4px entre células.
7. Selecionar música ativa.
8. Tocar música.
9. Confirmar PDF/cifra.
10. Clicar em Dashboard IA, Biblioteca e Planos e confirmar texto branco após clique.
