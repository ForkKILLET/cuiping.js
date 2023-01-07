/// <reference types="vite/client" />

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

type ImportMetaEnv = {
    readonly VITE_BUILD_TIME?: string
    readonly VITE_BUILD_ENV?: string
    readonly VITE_LAST_COMMIT?: string
}

type ImportMeta = {
    readonly env: ImportMetaEnv
}
