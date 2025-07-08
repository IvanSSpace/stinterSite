import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	server: {
		allowedHosts: [
			'localhost',
			'127.0.0.1',
			'deathly-one-ling.cloudpub.ru',
			'.cloudpub.ru' // Разрешаем все поддомены cloudpub.ru
		]
	}
});
