# Playback Cifras IA Alpha — Correção da Sidebar + Destaque da Lista de Músicas

## Arquivos alterados

- `player.html`

## Arquivos criados

- `sidebar-hotfix.css`
- `sidebar-hotfix.js`
- `docs/RELATORIO-SIDEBAR-HOTFIX.md`

## Solução aplicada

A área do Google Drive foi convertida em um painel recolhível/expansível usando `<details>` e `<summary>`, preservando os IDs originais usados por `app.js`:

- `googleBtn`
- `logoutBtn`
- `loginStatus`
- `folderIdInput`
- `pickFolderBtn`
- `refreshBtn`
- `clearFolderBtn`

Após o login, o painel é recolhido automaticamente e exibe apenas um resumo compacto com status do Google Drive. Os botões de ação permanecem acessíveis ao expandir o painel.

A lista de músicas foi movida para uma área dedicada (`songs-panel`) com rolagem própria, tornando-se o elemento principal da sidebar no iPad/tablet.

Os botões “Modo palco” e “Tela cheia” foram removidos visualmente da barra superior. Para evitar quebra de listeners antigos em `app.js`, os elementos `stageBtn` e `fullscreenBtn` foram mantidos ocultos fora da interface.

## O que não foi alterado

- `config.js`
- lógica de login Google
- leitura de arquivos no Google Drive
- player
- PDF viewer
- estrutura de dados
- planos/créditos
- IA mockada

## Testes recomendados

1. Abrir o app no iPad/tablet.
2. Entrar com Google.
3. Confirmar que a área do Drive fica compacta após conectar.
4. Expandir/recolher o painel do Drive.
5. Confirmar que a lista de músicas ocupa a maior parte da sidebar.
6. Selecionar uma música.
7. Tocar MP3.
8. Trocar música.
9. Confirmar que os botões “Modo palco” e “Tela cheia” não aparecem.
10. Confirmar que zoom e rolagem continuam visíveis.
11. Confirmar que a cifra/PDF continua abrindo.

## Observação

Esta é uma correção de interface e usabilidade. Nenhuma funcionalidade nova foi adicionada.
