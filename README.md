# Playback Cifras v13 Alpha — Biblioteca Inteligente + Arquitetura IA

Base: Playback Cifras+ Focus Stage v2.

## Objetivo
Transformar o Playback Cifras em uma plataforma completa de gerenciamento musical, preservando as funcionalidades atuais e preparando a arquitetura para futuras funcionalidades de Inteligência Artificial, planos e créditos.

## Importante
- Não remove funcionalidades atuais.
- Não altera o fluxo estável de Google Drive, PDF e MP3.
- Não implementa IA real.
- Não implementa cobrança real.
- Continua compatível com GitHub Pages.
- `config.js` não está incluído neste pacote para evitar sobrescrever credenciais.

## Novidades v13 Alpha
- Base de Biblioteca Própria Playback Cifras.
- Modelo de metadados por música.
- Tela estrutural `Adicionar Música`.
- Tela estrutural `Assinatura`.
- Tela estrutural `Editor de Cifras`.
- Módulo `ai-processing` com mocks.
- Camada centralizada de permissões.
- Estrutura de planos Free, Essencial e Pro.
- Estrutura de créditos IA.
- Contratos futuros de cobrança.
- Entidades preparadas para banco futuro.
- Consulta Drive mais robusta para detectar arquivos MP3 mesmo com MIME type inconsistente.

## Arquivos principais
- `player.html` — app principal.
- `app.js` — lógica atual + compatibilidade Drive aprimorada.
- `styles.css` — layout do app.
- `index.html` — landing page.
- `add-music.html` — fluxo estrutural de importação.
- `subscription.html` — tela demonstrativa de assinatura.
- `editor.html` — tela futura do editor de cifras.
- `ai-lab.html` — visualização do fluxo futuro de IA.
- `docs/RELATORIO-v13-alpha.md` — relatório técnico.
- `docs/ROADMAP-v14.md` — próximos passos.

## Publicação sugerida
Criar branch:

```bash
git checkout -b v13-biblioteca-inteligente
```

Enviar os arquivos, mantendo o `config.js` atual do repositório.
