# Cuiping.js Component

English | [简体中文](./README.zh-Hans.md)

## Usage

1. Use your familiar package manager to install the component package `cuiping-component`.
    ```shell
    $ pnpm i cuiping-component
    $ yarn add cuiping-component
    $ npm i cuiping-component
    ```

2. Import and use the component (You may refer to our [Demo page](../frontend/src/App.vue)).
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