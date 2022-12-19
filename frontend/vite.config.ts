import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
	base: './',
	resolve: {
		alias: [
			{
				find: 'vue-i18n',
				replacement: 'vue-i18n/dist/vue-i18n.cjs.js',
			}
		]
	},
	build: {
		outDir: '../dist',
		emptyOutDir: true
	},
	plugins: [vue()]
})
