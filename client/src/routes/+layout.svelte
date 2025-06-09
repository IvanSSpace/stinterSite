<script lang="ts">
	import { browser } from '$app/environment';
	import { onMount } from 'svelte';
	import '../app.css';

	let { children } = $props();

	  // Состояние аутентификации
  let isAuthenticated = $state(false);
  let user: { username: string; role: string } | null = $state(null);
  let token: string | null = $state(null);

	// Проверка аутентификации при загрузке
	onMount(async () => {
		if (browser) {
			token = localStorage.getItem('stiner_token');
			if (token) {
				try {
					const response = await fetch('http://localhost:3001/api/auth/verify', {
						headers: {
							'Authorization': `Bearer ${token}`
						}
					});

					if (response.ok) {
						const data = await response.json();
						isAuthenticated = true;
						user = data.user;
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
	});

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
