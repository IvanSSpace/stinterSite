<script lang="ts">
	import { browser } from '$app/environment';
	import '../app.css';
	import { API_URL } from '../config.js';

	let { children } = $props();

	// Состояние аутентификации
	let isAuthenticated = false;
	let user: { username: string; role: string } | null = null;
	let token: string | null = null;

	const checkAuth = async () => {
		if (browser) {
			const authToken = localStorage.getItem('stiner_token');
			if (authToken) {
				try {
					const response = await fetch(`${API_URL}/api/auth/verify`, {
						headers: {
							'Authorization': `Bearer ${authToken}`
						}
					});

					if (response.ok) {
						const data = await response.json();
						isAuthenticated = true;
						user = data.user;
						token = authToken;
					} else {
						localStorage.removeItem('stiner_token');
						token = null;
					}
				} catch (error) {
					console.error('Ошибка проверки токена:', error);
					localStorage.removeItem('stiner_token');
					token = null;
				}
			}
		}
	};

	// Проверяем авторизацию при загрузке
	checkAuth();

	// Функция выхода
	const logout = () => {
		localStorage.removeItem('stiner_token');
		isAuthenticated = false;
		user = null;
		token = null;
		window.location.reload();
	};
</script>

<nav class="nav">
	<div class="nav-content container">
		<a href="/" class="nav-brand">
			🍎 StiNGer Apple Store
		</a>

		<div class="nav-links">
			<a href="/" class="nav-link">Главная</a>

			{#if isAuthenticated && user?.role === 'admin'}
				<span class="nav-link">👤 Привет, {user.username}!</span>
				<button class="btn btn-secondary" onclick={logout}>
					Выйти
				</button>
			{:else}
				<a href="/login" class="nav-link">Войти</a>
			{/if}
		</div>
	</div>
</nav>

<main>
	{@render children()}
</main>

<style>
	main {
		min-height: calc(100vh - 120px);
	}
</style>
