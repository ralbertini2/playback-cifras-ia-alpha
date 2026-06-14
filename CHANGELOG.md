# Changelog

## v3.0.2 — Build Recovery sem lockfile

Correção emergencial para estabilizar o GitHub Actions antes das alterações do PDF Viewer.

### Alterações

- Remove o uso obrigatório de `npm ci` no workflow.
- Usa `npm install --include=dev --no-package-lock` para evitar travamento por lockfile inconsistente.
- Mantém versões fixas de React, React DOM, Vite, plugin React, Lucide e PDF.js.
- Mantém o escopo restrito ao ambiente de build.

### Não altera

- PDF Viewer.
- MP3 Player.
- Google Picker.
- Layout iPad.
