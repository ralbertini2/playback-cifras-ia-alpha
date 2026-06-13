# Playback Cifras IA

## v2.7 — iPad Touch & Drive Media Fix

Correção funcional da versão React publicada no GitHub Pages.

## Problemas corrigidos

- Controles do Player não respondiam ao toque no iPad.
- Controles do PDF Viewer não respondiam corretamente em tablet.
- Existia uma camada visual dividindo a tela no iPad.
- PDF Viewer chamava `getDocument` sem receber `url`, `data` ou `range`.
- Player funcionava no desktop, mas não no iPad.
- Seleção de música precisava enviar PDF e áudio de forma mais segura aos módulos React.

## Inclui

- Correção de `pointer-events`.
- Correção de `z-index`.
- Correção de layout tablet/iPad.
- Correção de carregamento seguro no `PdfViewer`.
- Correção do service de PDF.
- Correção do service Google Drive.
- Ajustes no hook de áudio para melhor compatibilidade iPad/Safari.
- Atualização para v2.7.

## Validação esperada

- React Build Validation verde.
- GitHub Pages deploy verde.
- Desktop abrindo a aplicação.
- iPad permitindo toque nos controles.
- Player respondendo ao botão tocar.
- PDF Viewer não exibindo erro quando não houver PDF válido.
