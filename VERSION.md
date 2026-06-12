# Playback Cifras IA — VERSION

Versão atual: `v2.4`

Linha de desenvolvimento: `develop-react`

Branch da versão:

```text
feature/v2-4-google-drive-react
```

## v2.4 — Google Drive React

Integração inicial do Google Drive na arquitetura React.

Inclui:

- Hook `useGoogleDriveLibrary` para centralizar estado e ações do Google Drive.
- Login/logout Google via Google Identity Services.
- Seleção de pasta via Google Picker.
- Atualização da biblioteca de músicas a partir do Drive.
- Carregamento autorizado de PDFs e áudios.
- Integração do Google Drive com `PdfViewer` e `PlayerBar`.
- Estados de carregamento para biblioteca e música selecionada.
- Atualização do footer para `Playback Cifras IA v2.4`.

## Fora do escopo desta versão

- Favoritos finais.
- Repertórios avançados.
- IA.
- Sincronização PDF ↔ áudio.
- Publicação da v2 em produção.
