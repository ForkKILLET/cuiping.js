import { defineConfig, Alias } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ command }) => {
	const alias: Alias[] = [
		{
			find: 'vue-i18n',
			replacement: 'vue-i18n/dist/vue-i18n.cjs.js',
		}
	]

	if (command === 'serve') alias.push({
		find: /cuiping-component$/,
		replacement: 'cuiping-component/lib/main.ts'
	}, {
		find: /cuiping$/,
		replacement: 'cuiping/core/index.ts'
	})

	return {
		plugins: [
			vue()
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
