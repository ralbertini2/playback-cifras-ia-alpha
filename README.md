# Playback Cifras IA

## v2.6 — Library Integration

Integração funcional da Biblioteca, Favoritos e Recentes ao fluxo principal React do Playback Cifras IA.

Stack:

```text
React
Vite
CSS Modules
Lucide Icons
PDF.js
Google Drive API
Google Picker
Google Identity Services
```

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Preview

```bash
npm run preview
```

## Branches

```text
main           → versão estável atual
develop        → manutenção v1.x
develop-react  → linha React/v2
```

## GitHub Pages

A linha React usa Vite. Quando a v2 for publicada, o deploy deve ser feito via GitHub Actions.

## Configuração Google

Copie:

```text
public/config.example.js
```

para:

```text
public/config.js
```

Preencha:

```text
GOOGLE_CLIENT_ID
GOOGLE_API_KEY
ROOT_FOLDER_ID
```

## Recursos v2.6

- Biblioteca conectada à Sidebar.
- Busca funcional por música, artista, estilo e arquivo.
- Filtros funcionais: Todas, Favoritas e Recentes.
- Contadores de total, favoritas e recentes.
- Favoritos persistidos localmente.
- Recentes registrados automaticamente ao abrir uma música.
- Botão de busca da Toolbar abre a biblioteca.
- Service `libraryService.js` centraliza filtros e chaves de músicas.
- Hook `useLibrary` centraliza busca, filtros, favoritos e recentes.
- Atualização da versão para `v2.6`.

## Recursos já existentes da linha React

- v2.0: fundação React/Vite.
- v2.1: shell visual principal.
- v2.2: visualizador PDF/Cifra com PDF.js.
- v2.3: Player React.
- v2.3.1: validação automática de build React/Vite.
- v2.4: integração inicial Google Drive React.
- v2.5: biblioteca e repertórios React.
