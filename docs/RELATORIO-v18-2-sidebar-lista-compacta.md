# Playback Cifras IA Alpha v18.2 — Sidebar com Lista Compacta + Ajuste de Botões

## Objetivo

Ajustar a sidebar no layout tablet/iPad para priorizar a lista de músicas, reduzindo o espaço ocupado por Google Drive, filtros e configurações.

## Arquivos alterados/criados

- `player.html`
- `sidebar-v18-2.css`
- `sidebar-v18-2.js`
- `docs/RELATORIO-v18-2-sidebar-lista-compacta.md`

## Solução aplicada

### Sidebar

- A sidebar passou a usar layout em coluna com `display:flex`.
- A lista `#songList` usa `flex:1`, `min-height:0` e `overflow-y:auto`.
- Os controles do Google Drive foram compactados para os ícones `📁` e `↻`.
- Os filtros foram movidos para um painel recolhível chamado `Filtros`.
- O campo de busca permanece oculto.

### Lista de músicas

- Itens da lista foram compactados para altura máxima de `45px`.
- Foi criado destaque visual para item ativo.
- O item ativo tenta permanecer visível por meio do script `sidebar-v18-2.js`.

### Botões superiores

- Links `.app-link` agora mantêm texto branco em todos os estados: normal, hover, active e visited.

### Botões removidos

- `Modo palco` removido da barra superior.
- `Tela cheia` removido da barra superior.

## O que não foi alterado

- `config.js`
- lógica do Google Drive
- login Google
- leitura de arquivos
- player
- PDF/cifra
- IA mockada
- planos/créditos
- estrutura de dados

## Testes recomendados

1. Abrir app em iPad/tablet.
2. Confirmar Google conectado.
3. Confirmar sidebar compacta.
4. Expandir/recolher filtros.
5. Verificar que a lista ocupa a maior parte da sidebar.
6. Confirmar itens com altura máxima de 45px.
7. Selecionar música.
8. Tocar música.
9. Trocar música.
10. Clicar em Dashboard IA, Biblioteca e Planos.
11. Confirmar que os links permanecem brancos.
12. Confirmar PDF e player funcionando.

## Observação de publicação

O arquivo `config.js` não está incluído neste pacote para evitar sobrescrever as chaves do Google já publicadas no repositório.
