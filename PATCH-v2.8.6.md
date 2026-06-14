# v2.8.6 — Pick Folder Prop Fix

## Correção exata

No arquivo:

```text
src/hooks/useGoogleDrive.js
```

No objeto retornado pelo hook `useGoogleDriveLibrary`, adicionar:

```js
pickFolder: chooseFolder,
```

Logo após:

```js
chooseFolder,
```

Trecho esperado:

```js
chooseFolder,
pickFolder: chooseFolder,
setFolder: chooseFolder,
openPicker: chooseFolder,
openFolderPicker: chooseFolder,
```

## Motivo

O `App.jsx` chama:

```jsx
onPickFolder={drive.pickFolder}
```

Mas o hook só expõe:

```js
chooseFolder
setFolder
openPicker
openFolderPicker
```

Resultado:

```text
drive.pickFolder === undefined
```

Então o botão "Escolher" não executa nada.
