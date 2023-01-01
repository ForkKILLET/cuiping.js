# Cuiping.js

English | [简体中文](./README.zh-Hans.md)

<p align="center"><img width="200" alt="logo" src="./docs/logo.svg" /></p>

## Brief

Render the chemical formula of SVG format in the browser, and use the accurate ["Cuiping formula" syntax](./docs/syntax.md).

## Experience

You can experience the demo at [icelava.top](https://icelava.top/cuiping.js/):
- Try to input "Cuiping formula" and view rendered results in real time.
- Save the formulas you tried to browser.
- Modify the rendering configuration at any time.
- Check some preset examples and edit them.
- Hover over the rendering result to copy "Cuiping formula" or download SVG images.

## Usage

### Only use back-end (including parsing and rendering)

1. Use your familiar package manager to install the core package `cuiping`.

    ```shell
    $ pnpm i cuiping
    $ yarn add cuiping
    $ npm i cuiping
    ```

2. Use TypeScript.

    ```typescript
    import { render } from 'cuiping'

    const molecule = getMolecule()      // Assume to obtain "Cuiping formula" from user input.

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
| `unitLen`           | int     | Unit length
| `paddingX`          | int     | X padding
| `paddingY`          | int     | Y padding
| `displayBonds`      | boolean | Whether to display bonds
| `bondGap`           | int     | Gap between double/triple bonds
| `lineBaseColor`     | string  | Base color of lines
| `textBaseColor`     | string  | Base color of text
| `halfFontSize`      | int     | Half font size
| `halfTextBoxWidth`  | int     | Half width of text boxes
| `halfTextBoxHeight` | int     | Half height of text boxes
| `displayTextBox`    | boolean | Whether to show text boxes

### Using the Vue component in the browser

1. Use your familiar package manager to install the component package `cuiping-component`.
    ```shell
    $ pnpm i cuiping-component
    $ yarn add cuiping-component
    $ npm i cuiping-component
    ```

2. Import and load plugins into Vue App in TypeScript or JavaScript.
    ```typescript
    // main

    import CuipingVue from 'cuiping-component/src'
    // In JS, use the following import method (dist).
    // import CuipingVue from 'cuiping'.
    import 'cuiping-component/dist/style.css' // remember to import the style.

    import App from './App.vue'

    createApp(App)
        .use(CuipingVue)
        .mount('#app')
    ```

3. Use the component (You may refer to our [Demo page](./frontend/src/App.vue)).
    ```vue
    <!-- App.vue -->

    <template>
        <Cuiping :molecule="..." :render-options="..." />
    </template>
    ```

## Contribution

1. Welcome PR! At present, the project doen't have any linters configured. Just keep the code style similar.
2. The development plan of this project can be found on [Notion](https://humdrum-zinc-834.notion.site/2b432da8fd0c4fe0adcbb6b459307a89?v=2a44c1c6a88141d7b89429eea437289d).
3. The process of building this project:
    1. Clone the code repository in your familiar way.
        ```shell
        $ git clone https://github.com/ForkKILLET/Cuiping.js
        $ gh repo clone ForkKILLET/Cuiping.js
        ```
    2. Use pnpm to install dependencies.
        ```shell
        $ pnpm i
        ```
4. Submit your changes. Please use ng style for submitting information. You may refer to `git log`.
5. Happy coding!

## License

This project is open source under [GPL-v3.0](./LICENSE) license.
