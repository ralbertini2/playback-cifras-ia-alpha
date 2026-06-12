# Playback Cifras IA

## v2.3 — React Player

Player React componentizado com controles de reprodução, progresso, volume e navegação entre músicas.

Stack:

```text
React
Vite
CSS Modules
Lucide Icons
PDF.js
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

## Recursos v2.3

- Player React em `PlayerBar`.
- Controles separados em `PlaybackControls`.
- Barra de progresso em `ProgressBar`.
- Volume e mute em `VolumeControl`.
- Hook `useAudioPlayer` evoluído.
- Service `audioService.js`.
- Play/Pause.
- Seek na barra de progresso.
- Avançar e voltar 10 segundos.
- Música anterior e próxima.
- Layout Tablet First.

## Recursos já existentes da linha React

- v2.0: fundação React/Vite.
- v2.1: shell visual principal.
- v2.2: visualizador PDF/Cifra com PDF.js.
