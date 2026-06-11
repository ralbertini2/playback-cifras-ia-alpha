# Playback Cifras v18.2e — Lista de Músicas Idêntica ao Mockup de Referência

## Branch
`feature/v18-2e-lista-musicas-densa`

## Objetivo
Corrigir a densidade visual da lista de músicas, aproximando o comportamento do mockup enviado: células compactas, praticamente encostadas, com a lista ocupando a maior parte da sidebar.

## Arquivos entregues
- `styles-v18-2e-lista-mockup.css`
- `docs/RELATORIO-v18-2e-lista-musicas-densa.md`

## Forma segura de aplicar
Copiar o conteúdo de `styles-v18-2e-lista-mockup.css` e colar no final do `styles.css` atual.

## Arquivos NÃO alterados
- `app.js`
- `config.js`
- integração Google Drive
- player
- lógica de biblioteca
- PDF/cifra
- IA mockada
- planos/créditos

## Ajustes aplicados
1. Lista de músicas com `flex: 1` e `overflow-y: auto`.
2. Cards com altura entre 40px e 48px.
3. Gap visual entre músicas reduzido para 0–2px.
4. Título e categoria com `ellipsis`, `nowrap` e line-height compacto.
5. Área Google Drive e filtros compactados visualmente.
6. Botões superiores (`Dashboard IA`, `Biblioteca`, `Planos`) forçados para texto branco em todos os estados.
7. `Modo Palco` e `Tela Cheia` ocultos visualmente por CSS seguro, sem remover IDs.

## Testes obrigatórios recomendados
- Reconectar Google.
- Atualizar Drive.
- Carregar músicas.
- Selecionar música.
- Tocar música.
- Trocar música.
- Confirmar lista compacta.
- Confirmar 10+ músicas visíveis na sidebar.
- Confirmar ausência visual de Modo Palco e Tela Cheia.
- Confirmar funcionamento de PDF/cifra e player.
