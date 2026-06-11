# Playback Cifras v18.2a — Ajuste Seguro da Lista de Músicas + Botões Superiores

## Objetivo
Aplicar apenas ajustes visuais seguros na sidebar e nos botões superiores, sem alterar lógica do sistema.

## Arquivos alterados
- `player.html`: adicionado apenas o link para `sidebar-v18-2a-safe.css`.
- `sidebar-v18-2a-safe.css`: novo arquivo CSS com ajustes visuais.

## Arquivos não alterados
- `app.js` não foi alterado.
- `config.js` não foi incluído nem alterado.
- Integração Google Drive não foi alterada.
- Player não foi alterado.
- IDs, botões e eventos existentes foram preservados.

## Solução aplicada
A correção foi feita por CSS:
- A sidebar passou a usar `display:flex` e `flex-direction:column`.
- A lista `#songList` recebeu `flex:1`, `min-height:0` e `overflow-y:auto`.
- Os itens da lista foram limitados a `45px` de altura.
- A área Google Drive foi compactada visualmente, sem remover botões ou IDs.
- Links superiores `.app-link` receberam cor branca em todos os estados: normal, visited, hover, active e focus.

## Testes previstos
- Abrir app.
- Clicar em Reconectar/Entrar com Google.
- Confirmar que Google Drive continua funcionando.
- Confirmar que músicas aparecem.
- Confirmar rolagem da lista.
- Confirmar itens com altura máxima de 45px.
- Clicar em Dashboard IA, Biblioteca e Planos.
- Confirmar texto branco após clique.
- Tocar música.
- Confirmar cifra e player funcionando.

## Observação
Esta versão não cria nova arquitetura, não substitui componentes e não altera JavaScript funcional.
