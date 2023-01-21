import { resolve } from 'path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [ vue() ],
    build: {
        lib: {
            entry: resolve(__dirname, 'lib/main.ts'),
            name: 'CuipingComponent',
            fileName: 'cuiping-component'
        },
        rollupOptions: {
            external: [ 'vue' ],
            output: {
                globals: {
                    vue: 'Vue'
                }
            }
        }
    }
})
