# Cuiping.js

[![github-workflow](https://img.shields.io/github/actions/workflow/status/ForkKILLET/cuiping.js/deploy_page.yml?logo=github)](https://github.com/ForkKILLET/cuiping.js/actions)
![npm:cuiping](https://img.shields.io/npm/v/cuiping?label=cuiping&logo=npm)
![npm:cuiping-component](https://img.shields.io/npm/v/cuiping-component?label=cuiping-component&logo=npm)
![npm:cuiping-monaco](https://img.shields.io/npm/v/cuiping-monaco?label=cuiping-monaco&logo=npm)

English | [简体中文](./README.zh-Hans.md)

**Table of Contents**

- [Brief](#brief)
- [Experience](#experience)
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

You can experience the demo at [icelava.top](https://icelava.top/cuiping.js/):
- Try to input _Cuiping formula_ and view rendered results in real time
- Save the formulas you tried to browser
- Modify the rendering configuration at any time
- Check some preset examples and edit them
- Hover over the rendering result to copy _Cuiping formula_ or download SVG images

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

1. Use your familiar package manager to install the component package `cuiping-component`.
    ```shell
    $ pnpm i cuiping-component
    $ yarn add cuiping-component
    $ npm i cuiping-component
    ```

2. Import and use the component (You may refer to our [Demo page](./frontend/src/App.vue)).
    ```vue
    <!-- App.vue -->

    <script lang="ts">
    import { Cuiping } from 'cuiping-component'
    import 'cuiping-component/dist/style.css' /* Don't forget the style */
    </script>

    <template>
        <Cuiping :molecule="..." :render-options="..." />
    </template>
    ```

## Contribution

### Welcome PR!

At present, the project doen't have any linters configured. Just keep the code style similar.

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
3. You may set `cuipingDebug` in `localStorage` to enable debug.
    ```javascript
    localStorage.cuipingDebug = 1
    ```

### Commit your changes

Please use ng style for commit message.
You may refer to `git log`.

### Happy coding!

## License

This project is open source under [MIT](./LICENSE.md) license.
