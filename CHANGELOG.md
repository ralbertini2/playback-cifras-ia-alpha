# Changelog

## v3.0.6-drive-login-fix

### Corrigido
- Habilita o botão Escolher após o primeiro login Google.
- Atualiza o estado de autenticação assim que o token OAuth é recebido.
- Pré-carrega o Google Picker depois da autenticação.
- Evita a necessidade de realizar login duas vezes para escolher a pasta.

### Não alterado
- package.json.
- Vite.
- GitHub Actions.
- PDF.js.
- Player de áudio.
- Layout principal.

## v3.0.10-sidebar-touch-fix

### Corrigido
- Ajusta z-index da sidebar em tablet e celular.
- Garante que o menu lateral fique acima do viewer e player.
- Corrige área de toque da sidebar e do backdrop no iPad.
- Preserva o comportamento atual do desktop.

### Escopo
- Não altera PDF.
- Não altera MP3.
- Não altera Google Drive.
- Não altera package.json.
- Não altera GitHub Actions.
