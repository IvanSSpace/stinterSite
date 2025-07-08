<script lang="ts">
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { onMount } from 'svelte';
  import { API_URL } from '../../config.js';

  // Состояние формы
  let username = $state('');
  let password = $state('');
  let loading = $state(false);
  let error = $state('');

  // Проверка, не авторизован ли уже пользователь
  onMount(async () => {
    if (browser) {
      const token = localStorage.getItem('stiner_token');
      if (token) {
        try {
          const response = await fetch(`${API_URL}/api/auth/verify`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            goto('/');
            return;
          }
        } catch (error) {
          console.error('Ошибка проверки токена:', error);
        }
      }
    }
  });

  const handleLogin = async (event: Event) => {
    event.preventDefault();

    if (!username || !password) {
      error = 'Введите логин и пароль';
      return;
    }

    loading = true;
    error = '';

    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Сохраняем токен
        localStorage.setItem('stiner_token', data.token);

        // Перенаправляем на главную страницу
        goto('/');
      } else {
        error = data.error || 'Ошибка авторизации';
      }
    } catch (err) {
      error = 'Ошибка соединения с сервером';
      console.error('Ошибка авторизации:', err);
    } finally {
      loading = false;
    }
  };
</script>

<svelte:head>
  <title>Вход в систему - StiNGer Apple Store</title>
</svelte:head>

<div class="container">
  <div style="max-width: 500px; margin: 5rem auto;">
    <div class="card fade-in">
      <div style="text-align: center; margin-bottom: 2rem;">
        <h1>🔐 Вход в систему</h1>
        <p>Войдите в админ-панель StiNGer Apple Store</p>
      </div>

             <form onsubmit={handleLogin}>
        <div class="form-group">
          <label for="username" class="form-label">Логин:</label>
          <input
            type="text"
            id="username"
            class="form-input"
            bind:value={username}
            placeholder="Введите логин"
            disabled={loading}
            required
          />
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Пароль:</label>
          <input
            type="password"
            id="password"
            class="form-input"
            bind:value={password}
            placeholder="Введите пароль"
            disabled={loading}
            required
          />
        </div>

        {#if error}
          <div style="background: #fed7d7; color: #742a2a; padding: 12px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #e53e3e;">
            ❌ {error}
          </div>
        {/if}

        <button
          type="submit"
          class="btn btn-primary"
          style="width: 100%;"
          disabled={loading}
        >
          {loading ? '⏳ Вход...' : '🚀 Войти'}
        </button>
      </form>

      <div style="margin-top: 2rem; padding-top: 2rem; border-top: 1px solid #e2e8f0; text-align: center;">
        <h3>💡 Для тестирования:</h3>
        <p><strong>Логин:</strong> admin</p>
        <p><strong>Пароль:</strong> admin123</p>
      </div>
    </div>

    <div style="text-align: center; margin-top: 2rem;">
      <a href="/" class="nav-link">← Вернуться на главную</a>
    </div>
  </div>
</div>

<style>
  .card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
  }
</style>