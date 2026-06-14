# Playback Cifras IA v3.0.4-musician-flow

Versão focada no fluxo musical real após estabilização do PDF/MP3.

## Alterações

- Ajusta zoom padrão do PDF para 100%.
- Remove controles inferiores de página do PDF.
- Simplifica o player removendo botões -10s e +10s.
- Move o controle de volume para a parte superior direita do player.
- Substitui o nome textual no menu lateral pelo logo Playback Cifras.
- Remove o campo visual de pasta selecionada da barra lateral.
- Simplifica o fluxo Google Drive: Entrar → Escolher pasta → Carregar biblioteca.
- Tenta abrir o seletor de pastas automaticamente após o login quando ainda não há pasta selecionada.

## Escopo preservado

- Não altera package.json.
- Não altera vite.config.js.
- Não altera GitHub Actions.
- Não altera PDF.js.
- Não altera autenticação Google.
# Playback Cifras IA v3.0.4.1-build-fix

Correção pontual de build da v3.0.4.

## Alteração

- Restaura o export `APP_NAME` em `src/config/appVersion.js`.

## Escopo

- Não altera PDF.
- Não altera MP3.
- Não altera Google Drive.
- Não altera layout.
- Não altera package.json, Vite ou GitHub Actions.
