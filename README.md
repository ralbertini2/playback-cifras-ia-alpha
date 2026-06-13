# Playback Cifras IA

## v2.6.1 — GitHub Pages React Deploy Fix

Correção de deploy da linha React/Vite no GitHub Pages.

## Problema corrigido

A aplicação React estava sendo publicada via:

```text
Deploy from a branch
Folder: / root
```

Esse fluxo funciona para HTML/CSS/JS puro, mas não para Vite.

React/Vite precisa ser compilado com:

```bash
npm run build
```

e publicado a partir da pasta:

```text
dist/
```

## Alterações

- Adicionado workflow de deploy React para GitHub Pages.
- Configurado build Vite para gerar `dist/`.
- Configurado `base` do Vite para `/playback-cifras-ia-alpha/`.
- Mantido deploy automático apenas para a branch `develop-react`.

## Configuração necessária no GitHub

Após o merge desta versão em `develop-react`, vá em:

```text
Settings → Pages → Build and deployment
```

Altere:

```text
Source: Deploy from a branch
```

para:

```text
Source: GitHub Actions
```

Depois acesse:

```text
https://ralbertini2.github.io/playback-cifras-ia-alpha/
```

## Branch

```text
feature/v2-6-1-github-pages-react-deploy
```

## PR

```text
fix: corrige deploy React no GitHub Pages
```
