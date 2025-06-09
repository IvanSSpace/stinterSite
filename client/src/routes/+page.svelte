<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';

  // Типы данных
  interface ContentBlock {
    id: number;
    title: string;
    content: string;
    block_type: string;
    position: number;
  }

  interface ForumInfo {
    section: string;
    topic_title: string;
    created_date: string;
    messages_count: number;
    views_count: number;
    participants_count: number;
  }

  // Состояние
  let contentBlocks: ContentBlock[] = $state([]);
  let forumInfo: ForumInfo | null = $state(null);
  let loading = $state(true);
  let error = $state('');

  // Состояние аутентификации
  let isAuthenticated = $state(false);
  let user: { username: string; role: string } | null = $state(null);
  let editMode = $state(false);

  // Состояние модальных окон
  let showEditModal = $state(false);
  let editingBlock: ContentBlock | null = $state(null);
  let editForm = $state({
    title: '',
    content: '',
    block_type: '',
    position: 0
  });

  // Загрузка данных
  onMount(async () => {
    await loadContent();
    await checkAuth();
  });

  const loadContent = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/content/blocks');
      const data = await response.json();

      if (data.success) {
        contentBlocks = data.blocks;
        forumInfo = data.forumInfo;
      } else {
        error = 'Ошибка загрузки контента';
      }
    } catch (err) {
      error = 'Ошибка соединения с сервером';
      console.error('Ошибка загрузки контента:', err);
    } finally {
      loading = false;
    }
  };

  const checkAuth = async () => {
    if (browser) {
      const token = localStorage.getItem('stiner_token');
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
          }
        } catch (error) {
          console.error('Ошибка проверки токена:', error);
        }
      }
    }
  };

  const toggleEditMode = () => {
    editMode = !editMode;
  };

  const formatNumber = (num: number): string => {
    return num.toLocaleString('ru-RU');
  };

  // Функции редактирования
  const openEditModal = (block: ContentBlock) => {
    editingBlock = block;
    editForm.title = block.title;
    editForm.content = block.content;
    editForm.block_type = block.block_type;
    editForm.position = block.position;
    showEditModal = true;
  };

  const closeEditModal = () => {
    showEditModal = false;
    editingBlock = null;
    editForm = {
      title: '',
      content: '',
      block_type: '',
      position: 0
    };
  };

  const saveBlock = async () => {
    if (!editingBlock) return;

    const token = localStorage.getItem('stiner_token');
    if (!token) {
      error = 'Не авторизован';
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/content/blocks/${editingBlock.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editForm.title,
          content: editForm.content,
          block_type: editForm.block_type,
          position: editForm.position,
          is_active: 1
        })
      });

      if (response.ok) {
        await loadContent();
        closeEditModal();
      } else {
        const data = await response.json();
        error = data.error || 'Ошибка сохранения';
      }
    } catch (err) {
      error = 'Ошибка соединения с сервером';
      console.error('Ошибка сохранения:', err);
    }
  };

  const deleteBlock = async (blockId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот блок?')) {
      return;
    }

    const token = localStorage.getItem('stiner_token');
    if (!token) {
      error = 'Не авторизован';
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/content/blocks/${blockId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await loadContent();
      } else {
        const data = await response.json();
        error = data.error || 'Ошибка удаления';
      }
    } catch (err) {
      error = 'Ошибка соединения с сервером';
      console.error('Ошибка удаления:', err);
    }
  };

  const createNewBlock = async () => {
    const token = localStorage.getItem('stiner_token');
    if (!token) {
      error = 'Не авторизован';
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/content/blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: 'Новый блок',
          content: '<p>Содержимое нового блока...</p>',
          block_type: 'custom',
          position: contentBlocks.length + 1
        })
      });

      if (response.ok) {
        await loadContent();
      } else {
        const data = await response.json();
        error = data.error || 'Ошибка создания';
      }
    } catch (err) {
      error = 'Ошибка соединения с сервером';
      console.error('Ошибка создания:', err);
    }
  };
</script>

<svelte:head>
  <title>StiNGer Apple Store - Только новая техника Apple от Стингера!</title>
  <meta name="description" content="Магазин техники Apple в Омске. Работаем с 2007 года. iPhone, iPad, MacBook и другая оригинальная техника Apple.">
</svelte:head>

<div class="container">
  {#if loading}
    <div class="card fade-in">
      <h2>⏳ Загрузка...</h2>
      <p>Загружаем контент форума...</p>
    </div>
  {:else if error}
    <div class="card fade-in">
      <h2>❌ Ошибка</h2>
      <p>{error}</p>
               <button class="btn btn-primary" onclick={loadContent}>
        Попробовать снова
      </button>
    </div>
  {:else}
    <!-- Админ панель -->
    {#if isAuthenticated && user?.role === 'admin'}
      <div class="admin-panel fade-in">
        <div class="admin-header">
          <h3 class="admin-title">🔧 Панель администратора</h3>
          <button
            class="edit-mode-toggle {editMode ? 'active' : ''}"
            onclick={toggleEditMode}
          >
            {editMode ? '❌ Выйти из редактирования' : '✏️ Режим редактирования'}
          </button>
        </div>
        <p>Добро пожаловать в админ-панель! Включите режим редактирования для изменения контента.</p>
      </div>
    {/if}

    <!-- Информация о форуме -->
    {#if forumInfo}
      <div class="card fade-in">
        <div class="editable-block {editMode ? 'edit-mode' : ''}">
          {#if editMode && isAuthenticated && user?.role === 'admin'}
            <div class="edit-controls">
              <button class="edit-btn edit">✏️ Редактировать</button>
            </div>
          {/if}

          <h1>{forumInfo.topic_title}</h1>
          <div style="margin-bottom: 1rem;">
            <strong>Раздел:</strong> {forumInfo.section}
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-top: 1rem;">
            <div>
              <strong>📅 Создана:</strong><br>
              {forumInfo.created_date}
            </div>
            <div>
              <strong>💬 Сообщений:</strong><br>
              {formatNumber(forumInfo.messages_count)}
            </div>
            <div>
              <strong>👀 Просмотров:</strong><br>
              {formatNumber(forumInfo.views_count)}
            </div>
            <div>
              <strong>👥 Участников:</strong><br>
              {formatNumber(forumInfo.participants_count)}
            </div>
          </div>
        </div>
      </div>
    {/if}

    <!-- Контентные блоки -->
    {#each contentBlocks as block (block.id)}
      <div class="card fade-in">
        <div class="editable-block {editMode ? 'edit-mode' : ''}">
          {#if editMode && isAuthenticated && user?.role === 'admin'}
            <div class="edit-controls">
              <button class="edit-btn edit" onclick={() => openEditModal(block)}>✏️ Редактировать</button>
              <button class="edit-btn delete" onclick={() => deleteBlock(block.id)}>🗑️ Удалить</button>
            </div>
          {/if}

          <h2>{block.title}</h2>
          <div class="content">
            {@html block.content}
          </div>
        </div>
      </div>
    {/each}

    <!-- Кнопка добавления нового блока для админов -->
    {#if editMode && isAuthenticated && user?.role === 'admin'}
      <div class="card fade-in">
        <div style="text-align: center; padding: 2rem;">
          <button class="btn btn-primary" onclick={createNewBlock}>
            ➕ Добавить новый блок
          </button>
        </div>
      </div>
    {/if}

    <!-- Пустое состояние -->
    {#if contentBlocks.length === 0}
      <div class="card fade-in">
        <h2>📦 Пока нет контента</h2>
        <p>Контентные блоки не найдены.</p>
      </div>
    {/if}
  {/if}
</div>

<!-- Модальное окно редактирования -->
{#if showEditModal}
  <div
    class="modal-overlay"
    onclick={closeEditModal}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
    onkeydown={(e) => {
      if (e.key === 'Escape') {
        closeEditModal();
      }
    }}
  >
    <div class="modal" onclick={(e) => e.stopPropagation()} role="document">
      <div class="modal-header">
        <h3 id="modal-title" class="modal-title">✏️ Редактирование блока</h3>
        <button class="modal-close" onclick={closeEditModal} aria-label="Закрыть модальное окно">×</button>
      </div>

      <form onsubmit={(e) => { e.preventDefault(); saveBlock(); }}>
        <div class="form-group">
          <label for="edit-title" class="form-label">Заголовок:</label>
          <input
            type="text"
            id="edit-title"
            class="form-input"
            bind:value={editForm.title}
            required
          />
        </div>

        <div class="form-group">
          <label for="edit-content" class="form-label">Содержимое (HTML):</label>
          <textarea
            id="edit-content"
            class="form-textarea"
            bind:value={editForm.content}
            rows="10"
            required
          ></textarea>
        </div>

        <div class="form-group">
          <label for="edit-type" class="form-label">Тип блока:</label>
          <input
            type="text"
            id="edit-type"
            class="form-input"
            bind:value={editForm.block_type}
            required
          />
        </div>

        <div class="form-group">
          <label for="edit-position" class="form-label">Позиция:</label>
          <input
            type="number"
            id="edit-position"
            class="form-input"
            bind:value={editForm.position}
            min="0"
            required
          />
        </div>

        <div style="display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px;">
          <button type="button" class="btn btn-secondary" onclick={closeEditModal}>
            Отмена
          </button>
          <button type="submit" class="btn btn-primary">
            💾 Сохранить
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .content :global(h3) {
    margin-top: 1.5rem;
    margin-bottom: 1rem;
  }

  .content :global(p) {
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  .content :global(ul) {
    margin: 1rem 0;
    padding-left: 2rem;
  }

  .content :global(li) {
    margin-bottom: 0.5rem;
  }

  .content :global(.products) {
    margin: 1.5rem 0;
  }

  .content :global(.product-item) {
    margin-bottom: 1.5rem;
  }

  .content :global(.contacts) {
    margin: 1.5rem 0;
  }

  .content :global(strong) {
    font-weight: 600;
    color: #2d3748;
  }
</style>
