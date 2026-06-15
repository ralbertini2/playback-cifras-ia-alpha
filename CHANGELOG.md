# Changelog

## v4.0.6

### Corrigido
- Ajusta parser do Modo Palco para usar PDF.js sem worker no iPad/Safari.
- Evita uso de ArrayBuffer transferido entre Modo Estudo e Modo Palco.
- Persiste token OAuth temporário em localStorage até expirar ou o usuário clicar em Sair.
- Mantém sessão Google após refresh quando o token ainda é válido.

### Não alterado
- MP3.
- Player.
- Sidebar.
- package.json.
- GitHub Actions.
