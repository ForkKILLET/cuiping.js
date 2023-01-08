# Cuiping.js

[![github-workflow](https://img.shields.io/github/actions/workflow/status/ForkKILLET/cuiping.js/deploy_page.yml?logo=github)](https://github.com/ForkKILLET/cuiping.js/actions)
![npm:cuiping](https://img.shields.io/npm/v/cuiping?label=cuiping&logo=npm)
![npm:cuiping-component](https://img.shields.io/npm/v/cuiping-component?label=cuiping-component&logo=npm)
![npm:cuiping-monaco](https://img.shields.io/npm/v/cuiping-monaco?label=cuiping-monaco&logo=npm)

[English](./README.md) | 简体中文

**目录**

- [简介](#简介)
- [体验](#体验)
- [使用](#使用)
  - [仅使用后端](#仅使用后端包含解析和渲染)
  - [渲染配置](#渲染配置)
  - [在浏览器中使用 Vue 组件](#在浏览器中使用-vue-组件)
- [贡献](#贡献)
  - [欢迎 PR！](#欢迎-pr)
  - [开发计划](#开发计划)
  - [构建本项目](#构建本项目)
  - [测试本项目](#测试本项目)
  - [提交更改](#提交更改)
  - [编码快乐！](#编码快乐)
- [许可证](#许可证)

<p align="center"><img width="200" alt="logo" src="./docs/logo.svg" /></p>

## 简介

在浏览器中渲染 SVG 格式的化学结构式，使用便于用户输入而精准的[「Cuiping 式」语法](./docs/syntax.zh-Hans.md)。

## 体验

你可以在 [icelava.top](https://icelava.top/cuiping.js/) 体验 Demo：

- 尝试输入「Cuiping 式」并实时查看渲染结果
- 将尝试保存到浏览器中
- 随时更改渲染配置
- 查看准备好的一些示例，并编辑它们
- 将鼠标悬停在渲染结果上，可以复制「Cuiping 式」和下载 SVG 图片

## 使用

### 仅使用后端（包含解析和渲染）

1. 使用你熟悉的包管理器安装 Cuiping.js 核心包 `cuiping`

    ```shell
    $ pnpm i cuiping
    $ yarn add cuiping
    $ npm i cuiping
    ```

2. 在 TypeScript 中使用

    ```typescript
    import { render } from 'cuiping'

    const molecule = getMolecule()      // 假定从用户输入获取「Cuiping 式」

    const data = render(molecule, {
        onError: err => {
            console.warn(err)           // 处理错误
        },
        renderer: 'svg',                // 目前仅支持 SVG 渲染模式
        rendererOptions: { /*...*/ }    // 渲染配置，见下文
    })

    if (data) {                         // 如未出错将得到 SVG 渲染结果
        showSvg(data.svg)               // 向用户展示 SVG
    }
    ```

### 渲染配置

| 选项                  | 类型   | 描述
| :-------------------- | :----- | :--- 
| `unitLen`             | 数值   | 单位长度
| `paddingX`            | 数值   | 横向留白
| `paddingY`            | 数值   | 纵向留白
| `displayBonds`        | 布尔   | 是否显示键
| `bondGap`             | 数值   | 双键、三键中键的间距
| `lineBaseColor`       | 字符串 | 线基色
| `textBaseColor`       | 字符串 | 文字基色
| `halfFontSize`        | 数值   | 半字号
| `halfTextBoxWidth`    | 数值   | 半字框宽
| `halfTextBoxHeight`   | 数值   | 半字框高
| `displayTextBox`      | 布尔   | 是否显示字框

### 在浏览器中使用 Vue 组件

请查看 [组件文档](./component/README.zh-Hans.md#使用).

## 贡献

### 欢迎 PR！

本项目目前没有配置 linter，保持代码风格相近即可

### 开发计划

本项目的开发计划可以在 [Notion](https://humdrum-zinc-834.notion.site/2b432da8fd0c4fe0adcbb6b459307a89?v=2a44c1c6a88141d7b89429eea437289d) 上查看

### 构建本项目

1. 用你熟悉的方式克隆代码仓库
    ```shell
    $ git clone https://github.com/ForkKILLET/Cuiping.js
    $ gh repo clone ForkKILLET/Cuiping.js
    ```
2. 使用 pnpm 安装依赖。
    ```shell
    $ pnpm i
    ```
3. 启动主构建任务。
    ```shell
    $ pnpm build
    ```
    或者分别启动各个包的构建任务，用 workspace 功能。
    ```shell
    $ pnpm -F {cuiping,cuiping-component,cuiping-frontend}
    ```
    或者 `cd` 进各个包对应目录，然后启动各个包的构建任务。
    ```shell
    $ cd {backend,component,frontend}
    $ pnpm build
    ```

### 测试本项目

1. 仅测试后端。
    ```shell
    $ cd backend
    $ pnpm build:run
    ```
    设置环境变量以启动调试。
    ```shell
    $ DEBUG=1 pnpm build:run
    ```
2. 在前端中测试所有功能（推荐）  
    开发模式：
    ```shell
    $ cd frontend
    $ pnpm dev
    ```
    生产模式：
    ```shell
    $ cd frontend
    $ pnpm build
    $ pnpm preview
    ```
3. 设置 `localStorage` 中的 `cuipingDebug` 以启用调试。
    ```javascript
    localStorage.cuipingDebug = 1
    ```

### 提交更改

提交信息请使用 ng style，可参考 `git log`

### 编码快乐！

## 许可证

本项目使用 [MIT](./LICENSE.md) 协议开源。
