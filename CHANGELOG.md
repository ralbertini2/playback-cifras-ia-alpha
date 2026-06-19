# Changelog

## v4.1.2 - Perfil e Google Drive

- Reorganiza o menu Perfil como ponto central de credenciamento, Google Drive e sincronização.
- Adiciona indicação visual do fluxo: Credenciamento, Pasta Google Drive e Biblioteca.
- Adiciona ações de trocar pasta, atualizar biblioteca e remover pasta deste dispositivo no menu Perfil.
- Mantém Login, Sair e Google Drive dentro do Perfil, preservando a navegação estilo Moises.ai.
- Preserva PDF, MP3, Modo Estudo, Modo Palco, IndexedDB e parser de acordes.

## v4.1.1 - Sidebar estilo Moises

- Atualiza a sidebar para uma navegação visual mais próxima do Moises.ai.
- Move Login, Sair e Seleção da pasta do Google Drive para o menu Perfil.
- Adiciona navegação lateral com Produtos, Biblioteca, Modo Estudo e Modo Palco.
- Mantém a sidebar como uma única área rolável.
- Preserva PDF, MP3, Google Drive, IndexedDB, Modo Estudo e Modo Palco sem recriar fluxo.

## v4.1.0 - Shadcn Foundation

- Adiciona configuração inicial do Shadcn/UI.
- Adiciona Tailwind, PostCSS e tokens de tema compatíveis com Shadcn/UI.
- Cria componentes base em `src/components/ui`: Button, Card, Dialog, DropdownMenu, Sheet e ScrollArea.
- Cria utilitário `cn` em `src/lib/utils.js`.
- Define tema escuro base com fundo preto e destaque branco.
- Preserva PDF, MP3, Google Drive, Google Picker, IndexedDB, Modo Estudo e Modo Palco sem alteração de fluxo.

## v4.0.14 - Parser harmônico robusto

- Cria serviço central `chordParserService.js` para reconhecimento de cifras.
- Remove dependência de lista fixa de acordes no Modo Palco.
- Reconhece acordes com sustenido, bemol, inversões, tensões, diminutos, meio-diminutos, aumentados, sus, add, maj, 7M, Δ, alterações entre parênteses e N.C.
- Integra o parser ao `stageTextService.js` para reduzir acordes não destacados.
- Mantém PDF, DOCX, Google Docs, MP3, sidebar e Modo Estudo sem recriar fluxo.

## v4.0.13.6 - Sidebar única e grade do palco

- Corrige a sidebar para funcionar como uma única área rolável.
- Remove rolagem interna da biblioteca/lista de músicas dentro da sidebar.
- Mantém logo, login, estilos, repertórios, filtros e lista subindo juntos.
- Melhora o Modo Palco usando coordenadas percentuais verticais e horizontais extraídas do PDF.
- Mantém o Modo Estudo, Google Drive, DOCX, Google Docs, PDF e MP3 sem recriação de fluxo.

## v4.0.13.5 - Stage alignment scroll

- Ajusta renderização do Modo Palco para usar acordes posicionados por coordenadas percentuais do PDF.
- Melhora a fidelidade do alinhamento horizontal das cifras em relação ao PDF original.
- Corrige scroll da sidebar para permitir rolagem completa da lista de músicas.
- Adiciona controles de tamanho de fonte para documentos no Modo Estudo, exceto PDF.
- Melhora o auto scroll com passos de 5 px/s e suporte a velocidades abaixo de 30 px/s.
- Atualiza versão para v4.0.13.5.
