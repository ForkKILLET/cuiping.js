
# Cuiping.js Component

[English](./README.md) | 简体中文

## 使用

1. 使用你熟悉的包管理器安装 Cuiping.js 组件包 `cuiping-component`
    ```shell
    $ pnpm i cuiping-component
    $ yarn add cuiping-component
    $ npm i cuiping-component
    ```

2. 引入并使用组件（可以参考 [Demo 页面](../frontend/src/App.vue)）
    ```vue
    <!-- App.vue -->

    <script lang="ts">
    import { Cuiping } from 'cuiping-component'
    import 'cuiping-component/dist/style.css' /* 别忘了样式 */
    </script>

    <template>
        <Cuiping :molecule="..." :render-options="..." />
    </template>
    ```
