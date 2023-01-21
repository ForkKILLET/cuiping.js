# Cuiping.js

[![github-workflow-deploy_page](https://img.shields.io/github/actions/workflow/status/ForkKILLET/cuiping.js/deploy_page.yml?logo=github)](https://github.com/ForkKILLET/cuiping.js/actions?query=workflow%3Adeploy_page)
[![github-workflow-test_backend](https://img.shields.io/github/actions/workflow/status/ForkKILLET/cuiping.js/test_backend.yml?logo=github&label=test)](https://github.com/ForkKILLET/cuiping.js/actions?query=workflow%3Atest_backend)
![npm:cuiping](https://img.shields.io/npm/v/cuiping?label=cuiping&logo=npm)
![npm:cuiping-component](https://img.shields.io/npm/v/cuiping-component?label=cuiping-component&logo=npm)
![npm:cuiping-monaco](https://img.shields.io/npm/v/cuiping-monaco?label=cuiping-monaco&logo=npm)

English | [简体中文](./README.zh-Hans.md)

**Table of Contents**

- [Brief](#brief)
- [Experience](#experience)
  - [Basic function](#basic-function)
  - [Monaco Editor function](#monaco-editor-function)
  - [About saving images](#about-saving-image)
  - [App configuration](#app-configuration)
  - [(advanced) URL params](#advanced-url-params)
- [Usage](#usage)
  - [Only use backend](#only-use-backend-including-parsing-and-rendering)
  - [Rendering configuration](#rendering-configuration)
  - [Using the Vue component in the browser](#using-the-vue-component-in-the-browser)
- [Contribution](#contribution)
  - [Welcome PR!](#welcome-pr)
  - [Development plan](#development-plan)
  - [Build the project](#build-the-project)
  - [Test the project](#test-the-project)
  - [Commit your changes](#commit-your-changes)
  - [Happy coding!](#happy-coding)
- [License](#license)

<p align="center"><img width="200" alt="logo" src="./docs/logo.svg" /></p>

## Brief

Render the chemical formula of SVG format in the browser, using the accurate [_Cuiping formula_ syntax](./docs/syntax.md).

## Experience

You can try the demo at [icelava.top](https://icelava.top/cuiping.js/).

### Basic function

- Try to input _Cuiping formula_ and view rendered results in real time
- Save the formulas you tried to browser
- Modify the rendering configuration at any time
- Check some preset examples and edit them
- Hover over the rendering result to zoom, copy _Cuiping formula_ or download SVG images

### Monaco Editor function

- Support syntax highlighting of _Cuiping Formula_
- Support auto-completion of _Refs_ and _Attributes_
- Support going to definition of _Refs_ (<kbd>Ctrl-Click</kbd> or <kbd>Right Click</kbd> > `Go To Definition`)
- Support marking _Groups_ (<kbd>Ctrl-M</kbd> or <kbd>Right Click</kbd> > `Toggle Group Mark`)

### About saving image

- Hover on the output and click `SVG` in the pop-up toolbar to download vector graph.
- To get non-vector images (e.g. for PPT), turn on the `Use Image` option in configuration, then you can copy or save the image by right-clicking them.

### App configuration

| Options             | Type    | Description
|:--------------------|:--------|:-----------
| `useMonacoEditor`   | boolean | Whether to use Monaco Editor
| `useImage`          | boolean | Whether to render to PNG instead of SVG
| `imageScale`        | number  | Scale of the image, only when `useImage` is on. Larger scale makes the image clearer

### (advanced) URL params

| Param        | Description
|:-------------|:-----------
| `debug`      | Enable debug
| `nohistory`  | Do not display the history
| `noexamples` | Do not display examples

## Usage

### Only use backend (including parsing and rendering)

1. Use your familiar package manager to install the core package `cuiping`.

    ```shell
    $ pnpm i cuiping
    $ yarn add cuiping
    $ npm i cuiping
    ```

2. Use TypeScript.

    ```typescript
    import { render } from 'cuiping'

    const molecule = getMolecule()      // Assume to obtain Cuiping formula from user input.

    const data = render(molecule, {
        onError: err => {
            console.warn(err)           // Handling errors.
        },
        renderer: 'svg',                // Only SVG rendering mode is supported currently.
        rendererOptions: { /*...*/ }    // Render configuration, see below.
    })

    if (data) {                         // SVG rendering results will be obtained if there is no error.
        showSvg(data.svg)               // Show SVG to the user.
    }
    ```

### Rendering configuration

| Options             | Type    | Description
|:--------------------|:--------|:-----------
| `unitLen`           | integer | Unit length
| `paddingX`          | integer | X padding
| `paddingY`          | integer | Y padding
| `displayBonds`      | boolean | Whether to display bonds
| `bondGap`           | integer | Gap between double/triple bonds
| `lineBaseColor`     | string  | Base color of lines
| `textBaseColor`     | string  | Base color of text
| `halfFontSize`      | integer | Half font size
| `halfTextBoxWidth`  | integer | Half width of text boxes
| `halfTextBoxHeight` | integer | Half height of text boxes
| `displayTextBox`    | boolean | Whether to show text boxes

### Using the Vue component in the browser

See [component document](./component/README.md#usage).

## Contribution

### Welcome PR!

We use ESLint to unify code style and run checks by Husky and GitHub Action.

### Development plan

The development plan of this project can be found on [Notion](https://humdrum-zinc-834.notion.site/2b432da8fd0c4fe0adcbb6b459307a89?v=2a44c1c6a88141d7b89429eea437289d).

### Build the project

1. Clone the code repository in your familiar way.
    ```shell
    $ git clone https://github.com/ForkKILLET/Cuiping.js
    $ gh repo clone ForkKILLET/Cuiping.js
    ```
2. Use pnpm to install dependencies.
    ```shell
    $ pnpm i
    ```
3. Start the main building job.
    ```shell
    $ pnpm build
    ```
    Or start package-level building job separately, using workspace.
    ```shell
    $ pnpm -F {cuiping,cuiping-component,cuiping-frontend}
    ```
    Or `cd` into package directories and start package-level building job.
    ```shell
    $ cd {backend,component,frontend}
    $ pnpm build
    ```

### Test the project

1. Test the backend only.
    ```shell
    $ cd backend
    $ pnpm build:run
    ```
    You may set environment variable to enable debug.
    ```shell
    $ DEBUG=1 pnpm build:run
    ```
2. Test all functions in the frontend. (recommended)  
    Development mode:
    ```shell
    $ cd frontend
    $ pnpm dev
    ```
    Production mode:
    ```shell
    $ cd frontend
    $ pnpm build
    $ pnpm preview
    ```
3. You may add `?debug` URL param to enable debug.

### Commit your changes

Please use ng style for commit message.
You may refer to `git log`.

### Happy coding!

## License

This project is open source under [MIT](./LICENSE.md) license.
