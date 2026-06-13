# Changelog

## [v2.7.2] - 2026-06-12

### Fixed

- Corrigida tela preta no runtime React.
- Corrigido erro `Cannot read properties of null (reading 'then')`.
- `initGoogleAuth` passa a retornar sempre uma Promise.
- `requestAccessToken` passa a retornar sempre uma Promise.
- `logoutGoogle` passa a retornar sempre uma Promise.
- `openFolderPicker` passa a retornar sempre uma Promise.
- `loadDriveLibrary` retorna array vazio quando Google Drive ainda não está disponível.
- Adicionado fallback seguro para `crypto.randomUUID`.
