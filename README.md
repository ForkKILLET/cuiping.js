# Cuiping.js

_English document WIP_

<p align="center"><img width="200" alt="logo" src="./docs/logo.svg" /></p>

## 简介

在浏览器中渲染 SVG 格式的化学结构式，使用便于用户输入而精准的[「Cuiping 式」语法](./docs/syntax.md)。

## 体验

你可以在 [icelava.top](https://icelava.top/cuiping.js/) 体验 Demo：

- 尝试输入「Cuiping 式」并实时查看渲染结果
- 将尝试保存到浏览器中
- 随时更改渲染配置
- 查看准备好的一些示例，并编辑它们
- 将鼠标悬停在渲染结果上，可以复制「Cuiping 式」和下载 SVG 图片。

## 使用

### 仅使用后端（包含解析、展开和渲染）

1. 使用你熟悉的包管理器安装 Cuiping.js 核心包 `cuiping`

    ```shell
    $ pnpm i cuiping
    $ yarn add cuiping
    $ npm i cuiping
    ```

2. 在 TypeScript 中使用

    ```typescript
    import { ChemParser, expand, renderSVG } from 'cuiping'

    const molecule = getMolecule() // 假定从用户输入获取「Cuiping 式」

    const parser = new ChemParser(molecule) // 获得 ChemParser 实例
    const chem = parser.parse((err) => { // 开始解析并处理解析错误
        showError(err) // 假定将错误信息反馈给用户
        return true // 返回 true 则不再抛出解析错误
    })

    if (chem) { // 如无出错，将获得 Chem 对象
        const chemEx = expand(chem!) // 展开 Chem 中的简写等
        const svg = renderSVG(chemEx, { // 渲染 SVG
            // 渲染配置对象，见下文
        })
    }
    ```

### 渲染配置

| 选项                  | 类型   | 描述
| :-------------------- | :----- | :--- 
| `unitLen`             | 数值   | 单位长度
| `paddingX`            | 数值   | 横向留白
| `paddingY`            | 数值   | 纵向留白
| `displayBonds`        | 布尔   | 显示键
| `bondGap`             | 数值   | 键间距
| `lineBaseColor`       | 字符串 | 线基色
| `textBaseColor`       | 字符串 | 文字基色
| `halfFontSize`        | 数值   | 半字号
| `halfTextBoxWidth`    | 数值   | 半字框宽
| `halfTextBoxHeight`   | 数值   | 半字框高
| `displayTextBox`      | 布尔   | 显示字框

### 在浏览器中使用 Vue 组件

1. 使用你熟悉的包管理器安装 Cuiping.js 组件包 `cuiping-component`
    ```shell
    $ pnpm i cuiping-component
    $ yarn add cuiping-component
    $ npm i cuiping-component
    ```

2. 在 TypeScript 或 JavaScript 引入并加载插件到 Vue App
    ```typescript
    // main

    import CuipingVue from 'cuiping-component/src'
    // JS 中，使用以下引入方式 (dist)
    // import CuipingVue from 'cuiping'
    import 'cuiping-component/dist/style.css' // 记得引入样式

    import App from './App.vue'

    createApp(App)
        .use(CuipingVue)
        .mount('#app')
    ```

3. 使用组件（可以参考 [Demo 页面](./frontend/src/App.vue)）
    ```vue
    <!-- App.vue -->

    <template>
        <Cuiping :molecule="..." :render-options="..." />
    </template>
    ```

## 贡献


1. 欢迎 PR！本项目目前没有配置 linter，保持代码风格相近即可
2. 本项目的开发计划可以在 [Notion](https://humdrum-zinc-834.notion.site/2b432da8fd0c4fe0adcbb6b459307a89?v=2a44c1c6a88141d7b89429eea437289d) 上查看
3. 构建本项目的流程：
    1. 用你熟悉的方式克隆代码仓库
        ```shell
        $ git clone https://github.com/ForkKILLET/Cuiping.js
        $ gh repo clone ForkKILLET/Cuiping.js
        ```
    2. 使用 pnpm 安装依赖。
        ```shell
        $ pnpm i
        ```
4. 提交你的更改，提交信息请使用 ng style，可参考 `git log`
5. 编码快乐！

## 许可证

本项目使用 [GPL-v3.0](./LICENSE) 协议开源。