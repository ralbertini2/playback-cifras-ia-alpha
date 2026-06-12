# Playback Cifras IA

## v2.5 — React Library

Biblioteca musical React com busca, filtros, favoritos, recentes e repertórios integrados ao fluxo Google Drive → PDF Viewer → Player.

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

## Recursos v2.5

- Componente `Library` para organização da biblioteca musical.
- Componente `Setlists` para controle de repertórios/eventos.
- Hook `useLibrary` para busca, favoritos, recentes e filtros.
- Service `libraryService.js` para utilitários da biblioteca.
- Busca por música, artista ou estilo.
- Filtro por todas, favoritas e recentes.
- Favoritar música pela lista ou toolbar.
- Registro local de músicas recentes.
- Repertórios integrados à sidebar.
- Layout híbrido: sidebar fixa no desktop e drawer em iPad/mobile.
- Atualização da versão para `v2.5`.

## Recursos já existentes da linha React

- v2.0: fundação React/Vite.
- v2.1: shell visual principal.
- v2.2: visualizador PDF/Cifra com PDF.js.
- v2.3: Player React.
- v2.3.1: validação automática de build React/Vite.
- v2.4: integração inicial Google Drive React.
