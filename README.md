# Playback Cifras IA

## v2.7.3 — Audio Source Validation Fix

Correção funcional do Player React.

## Problema

No desktop e no iPad, o console passou a exibir:

```text
URI inválida. Falha no carregamento do recurso de mídia.
```

O botão Play ficava indisponível porque o navegador recebia uma origem de áudio inválida.

## Correção

- Adicionado `audioService.js`.
- `useAudioPlayer` passa a validar a origem antes de carregar.
- Player não tenta carregar áudio vazio, nulo ou inválido.
- Player exibe estado seguro quando não há MP3 válido.
- Botão Play fica desabilitado apenas quando não existe fonte válida.
- Mensagem de erro controlada no PlayerBar quando o áudio é inválido.

## Branch

```text
feature/v2-7-3-audio-source-validation-fix
```
