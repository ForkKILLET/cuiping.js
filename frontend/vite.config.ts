import { defineConfig } from 'vite'
import type { Alias, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import monacoEditor from 'vite-plugin-monaco-editor'

export default defineConfig(({ command }) => {
    const alias: Alias[] = [
        {
            find: 'vue-i18n',
            replacement: 'vue-i18n/dist/vue-i18n.cjs.js'
        }
    ]

    if (command === 'serve') alias.push({
        find: /cuiping-component$/,
        replacement: 'cuiping-component/lib/main.ts'
    }, {
        find: /cuiping$/,
        replacement: 'cuiping/core/index.ts'
    }, {
        find: /cuiping-monaco$/,
        replacement: 'cuiping-monaco/src/index.ts'
    })

    return {
        plugins: [
            vue(),
            monacoEditor({
                languageWorkers: [],
                customWorkers: [
                    {
                        label: 'editorWorkerService',
                        entry: 'monaco-editor/esm/vs/editor/editor.worker'
                    }
                ]
            }) as Plugin
        ],
        base: './',
        resolve: {
            alias
        },
        build: {
            outDir: '../dist',
            emptyOutDir: true
        }
    }
})
