# Changelog

## [v2.8] - 2026-06-13

### Fixed

- Corrigido estado falso de “Google Drive conectado”.
- Corrigido fluxo quando `ROOT_FOLDER_ID` está vazio.
- Google Drive passa a exigir seleção de pasta pelo usuário.
- Pasta escolhida no Google Picker é salva localmente.
- `loadDriveLibrary` passa a retornar biblioteca real somente com token e pasta válidos.
- `useGoogleDrive` passa a expor estados claros: não configurado, pronto, autenticado, precisa de pasta, carregando, conectado e erro.

### Added

- `public/config.example.js`
- Persistência local da pasta selecionada.
- Agrupamento inicial de arquivos PDF/áudio por nome base.

### Changed

- `public/config.js` atualizado com credenciais Google informadas.
