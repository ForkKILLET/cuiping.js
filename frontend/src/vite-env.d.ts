/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_BUILD_TIME?: string
  readonly VITE_BUILD_ENV?: string
  readonly VITE_LAST_COMMIT?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}