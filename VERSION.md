# Playback Cifras IA

## Versionamento Oficial

Este documento define a política oficial de versionamento do projeto Playback Cifras IA.

---

# Versão Atual

**Versão Base:** `v1`

Data de criação: Junho/2026

Branch de desenvolvimento inicial:

```text
feature/v1-foundation
```

---

# Objetivo da v1

A versão v1 representa o reinício oficial do desenvolvimento do Playback Cifras IA.

Esta versão foi criada a partir da branch estável `main` e estabelece uma nova base para evolução do sistema.

Principais objetivos:

* Estabilizar a aplicação
* Eliminar regressões históricas
* Priorizar experiência Tablet/iPad Vertical
* Consolidar integração com Google Drive
* Simplificar a interface
* Preparar arquitetura para futuras funcionalidades

---

# Política de Versionamento

O projeto utiliza versionamento incremental simples.

## Grandes Marcos

```text
v1
v2
v3
v4
```

Utilizado quando ocorrer:

* Mudanças estruturais importantes
* Grandes refatorações
* Novas fases do produto

---

## Funcionalidades Relevantes

```text
v1.1
v1.2
v1.3
```

Utilizado quando ocorrer:

* Novos módulos
* Novas áreas da aplicação
* Recursos significativos para o usuário

---

## Melhorias e Ajustes

```text
v1.1.1
v1.1.2
```

Utilizado quando ocorrer:

* Melhorias de UX
* Melhorias visuais
* Ajustes funcionais
* Pequenas evoluções

---

## Correções Pontuais

```text
v1.1.1.1
v1.1.1.2
```

Utilizado quando ocorrer:

* Correção de bugs
* Hotfixes
* Ajustes emergenciais

---

# Prioridade de Plataformas

## 1. Tablet / iPad Vertical

Prioridade máxima do projeto.

Toda decisão de interface deve ser validada primeiro para uso em iPad vertical.

---

## 2. Desktop

Adaptação da experiência Tablet para telas maiores.

---

## 3. Mobile

Versão compacta mantendo as funcionalidades essenciais.

---

# Áreas Temporariamente Removidas

As seguintes áreas não fazem parte da v1:

* Dashboard
* Planos
* Biblioteca

Essas funcionalidades serão reconstruídas futuramente.

---

# Regras de Desenvolvimento

Nenhuma alteração deve ser realizada diretamente na branch:

```text
main
```

Fluxo oficial:

```text
main
↓
develop
↓
feature/*
```

Exemplo:

```text
feature/v1-1-google-drive-improvements
feature/v1-2-pdf-reader
feature/v1-3-setlists
```

---

# Requisitos Obrigatórios para Pull Requests

Todo Pull Request deve conter:

## Nome do Branch

```text
feature/vX-descricao
```

## Título do PR

Exemplo:

```text
feat: melhora visualização de PDFs no tablet
```

## Descrição

* Objetivo
* Arquivos alterados
* Impactos
* Testes realizados
* Riscos conhecidos

---

# Checklist de Aprovação

* [ ] Build executado com sucesso
* [ ] Sem erros de compilação
* [ ] Tablet vertical validado
* [ ] Desktop validado
* [ ] Mobile validado
* [ ] Google Drive funcionando
* [ ] Sem regressões conhecidas

---

# Visão do Produto

O Playback Cifras IA é um hub musical inteligente que centraliza:

* Cifras
* PDFs
* Playbacks
* Repertórios
* Arquivos do Google Drive
* Recursos futuros de Inteligência Artificial

O objetivo é permitir que músicos, bandas, igrejas e professores realizem estudo, ensaio e apresentação utilizando uma única plataforma.

---

**Status:** Versão Oficial Ativa

```text
Playback Cifras IA v1
```
