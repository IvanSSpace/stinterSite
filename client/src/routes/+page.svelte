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
    is_active?: number;
    created_at?: string;
    updated_at?: string;
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
  // Интерфейс для элементов конструктора
  interface ContentElement {
    id: string;
    type: 'heading' | 'paragraph' | 'contact' | 'warning' | 'product';
    [key: string]: any;
  }

  let contentElements = $state<ContentElement[]>([]);

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

    // Парсим HTML контент в элементы конструктора
    parseContentToElements(block.content);

    showEditModal = true;
  };

  // Парсинг HTML в элементы конструктора
  function parseContentToElements(htmlContent: string) {
    contentElements = [];
    // Простой парсер для существующего контента
    // В будущем можно улучшить для более сложных случаев
    if (htmlContent.includes('contacts-main')) {
      // Пример парсинга контактов
      contentElements.push({
        id: generateId(),
        type: 'heading',
        level: 'h3',
        text: 'Контактная информация',
        emoji: '📞'
      });
    }
  }

  // Генерация уникального ID
  function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Добавление нового блока в конструктор
  function addContentBlock(type: ContentElement['type']) {
    const newElement: ContentElement = {
      id: generateId(),
      type: type
    };

    switch (type) {
      case 'heading':
        Object.assign(newElement, {
          level: 'h3',
          text: '',
          emoji: ''
        });
        break;
      case 'paragraph':
        Object.assign(newElement, {
          text: '',
          bold: false
        });
        break;
      case 'contact':
        Object.assign(newElement, {
          title: '',
          phone: '',
          time: '',
          description: ''
        });
        break;
      case 'warning':
        Object.assign(newElement, {
          text: ''
        });
        break;
      case 'product':
        Object.assign(newElement, {
          name: '',
          price: '',
          region: '',
          description: ''
        });
        break;
    }

    contentElements.push(newElement);
  }

  // Перемещение элемента
  function moveElement(index: number, direction: 'up' | 'down') {
    if (direction === 'up' && index > 0) {
      [contentElements[index], contentElements[index - 1]] = [contentElements[index - 1], contentElements[index]];
    } else if (direction === 'down' && index < contentElements.length - 1) {
      [contentElements[index], contentElements[index + 1]] = [contentElements[index + 1], contentElements[index]];
    }
  }

  // Удаление элемента
  function removeElement(index: number) {
    contentElements.splice(index, 1);
  }

  // Рендеринг элемента в HTML
  function renderElement(element: ContentElement): string {
    switch (element.type) {
      case 'heading':
        const emoji = element.emoji ? `${element.emoji} ` : '';
        return `<${element.level}>${emoji}${element.text}</${element.level}>`;

      case 'paragraph':
        const content = element.bold ? `<strong>${element.text}</strong>` : element.text;
        return `<p>${content}</p>`;

      case 'contact':
        return `
          <div class="contact-block">
            <h4>${element.title}</h4>
            ${element.phone ? `<p><strong>${element.phone}</strong></p>` : ''}
            ${element.time ? `<p><strong>Время:</strong> ${element.time}</p>` : ''}
            ${element.description ? `<p>${element.description}</p>` : ''}
          </div>
        `;

      case 'warning':
        return `<div class="warning"><p>⚠️ <strong>ВАЖНО:</strong> ${element.text}</p></div>`;

      case 'product':
        return `
          <div class="product-item">
            <h4>${element.name}</h4>
            ${element.price ? `<p><strong>Цена:</strong> ${element.price}</p>` : ''}
            ${element.region ? `<p><strong>Регион:</strong> ${element.region}</p>` : ''}
            ${element.description ? `<p>${element.description}</p>` : ''}
          </div>
        `;

      default:
        return '';
    }
  }

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
      // Генерируем HTML из элементов конструктора
      const generatedContent = generateHTMLFromElements();

      const response = await fetch(`http://localhost:3001/api/content/blocks/${editingBlock.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editForm.title,
          content: generatedContent,
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

  // Генерация HTML из элементов конструктора
  function generateHTMLFromElements(): string {
    if (contentElements.length === 0) {
      return editForm.content; // Возвращаем исходное содержимое если элементов нет
    }

    let html = '';
    const hasContacts = contentElements.some(el => el.type === 'contact');

    if (hasContacts) {
      html += '<div class="contacts-main">\n';
    }

    contentElements.forEach(element => {
      html += renderElement(element) + '\n';
    });

    if (hasContacts) {
      html += '</div>';
    }

    return html;
  }

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

  const createNewBlock = () => {
    // Создаем новый блок с пустыми элементами конструктора
    const newBlock: ContentBlock = {
      id: 0,
      title: 'Новый блок',
      content: '',
      block_type: 'custom',
      position: contentBlocks.length + 1,
      is_active: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    editingBlock = newBlock;
    editForm.title = newBlock.title;
    editForm.content = newBlock.content;
    editForm.block_type = newBlock.block_type;
    editForm.position = newBlock.position;

    // Очищаем элементы конструктора для нового блока
    contentElements = [];

    showEditModal = true;
  };

  const saveNewBlock = async () => {
    const token = localStorage.getItem('stiner_token');
    if (!token) {
      error = 'Не авторизован';
      return;
    }

    try {
      // Генерируем HTML из элементов конструктора
      const generatedContent = generateHTMLFromElements();

      const response = await fetch('http://localhost:3001/api/content/blocks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: editForm.title,
          content: generatedContent,
          block_type: editForm.block_type,
          position: editForm.position
        })
      });

      if (response.ok) {
        await loadContent();
        closeEditModal();
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
    tabindex="0"
    onkeydown={(e) => {
      if (e.key === 'Escape') {
        closeEditModal();
      }
    }}
  >
    <div
      class="modal"
      onclick={(e) => e.stopPropagation()}
      onkeydown={(e) => {
        if (e.key === 'Escape') {
          closeEditModal();
        }
      }}
      role="document"
    >
      <div class="modal-header">
        <h3 id="modal-title" class="modal-title">✏️ Редактирование блока</h3>
        <button class="modal-close" onclick={closeEditModal} aria-label="Закрыть модальное окно">×</button>
      </div>

      <form onsubmit={(e) => {
        e.preventDefault();
        if (editingBlock?.id === 0) {
          saveNewBlock();
        } else {
          saveBlock();
        }
      }}>
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
          <label class="form-label">Содержимое:</label>
          <div class="content-builder">
            <div class="builder-toolbar">
              <button type="button" class="builder-btn" onclick={() => addContentBlock('heading')}>
                📝 Заголовок
              </button>
              <button type="button" class="builder-btn" onclick={() => addContentBlock('paragraph')}>
                📄 Абзац
              </button>
              <button type="button" class="builder-btn" onclick={() => addContentBlock('contact')}>
                📞 Контакт
              </button>
              <button type="button" class="builder-btn" onclick={() => addContentBlock('warning')}>
                ⚠️ Предупреждение
              </button>
              <button type="button" class="builder-btn" onclick={() => addContentBlock('product')}>
                📱 Товар
              </button>
            </div>

            <div class="builder-content">
              {#each contentElements as element, index (element.id)}
                <div class="builder-element">
                  <div class="element-controls">
                    <button type="button" class="control-btn move-up" onclick={() => moveElement(index, 'up')}>↑</button>
                    <button type="button" class="control-btn move-down" onclick={() => moveElement(index, 'down')}>↓</button>
                    <button type="button" class="control-btn delete" onclick={() => removeElement(index)}>🗑️</button>
                  </div>

                  {#if element.type === 'heading'}
                    <div class="element-editor">
                      <select bind:value={element.level} class="form-select">
                        <option value="h2">Заголовок 2</option>
                        <option value="h3">Заголовок 3</option>
                        <option value="h4">Заголовок 4</option>
                      </select>
                      <input type="text" bind:value={element.text} placeholder="Введите заголовок" class="form-input" />
                      <input type="text" bind:value={element.emoji} placeholder="Эмодзи (опционально)" class="form-input emoji-input" />
                    </div>
                  {:else if element.type === 'paragraph'}
                    <div class="element-editor">
                      <textarea bind:value={element.text} placeholder="Введите текст" class="form-textarea" rows="3"></textarea>
                      <label class="checkbox-label">
                        <input type="checkbox" bind:checked={element.bold} />
                        Жирный текст
                      </label>
                    </div>
                  {:else if element.type === 'contact'}
                    <div class="element-editor contact-editor">
                      <input type="text" bind:value={element.title} placeholder="Название контакта" class="form-input" />
                      <input type="text" bind:value={element.phone} placeholder="Номер телефона" class="form-input" />
                      <input type="text" bind:value={element.time} placeholder="Время работы" class="form-input" />
                      <textarea bind:value={element.description} placeholder="Дополнительная информация" class="form-textarea" rows="2"></textarea>
                    </div>
                  {:else if element.type === 'warning'}
                    <div class="element-editor">
                      <textarea bind:value={element.text} placeholder="Текст предупреждения" class="form-textarea" rows="2"></textarea>
                    </div>
                  {:else if element.type === 'product'}
                    <div class="element-editor product-editor">
                      <input type="text" bind:value={element.name} placeholder="Название товара" class="form-input" />
                      <input type="text" bind:value={element.price} placeholder="Цена" class="form-input" />
                      <input type="text" bind:value={element.region} placeholder="Регион" class="form-input" />
                      <textarea bind:value={element.description} placeholder="Описание" class="form-textarea" rows="2"></textarea>
                    </div>
                  {/if}

                  <div class="element-preview">
                    <strong>Предварительный просмотр:</strong>
                    <div class="preview-content">
                      {@html renderElement(element)}
                    </div>
                  </div>
                </div>
              {/each}

              {#if contentElements.length === 0}
                <div class="empty-builder">
                  <p>Выберите тип блока выше для начала создания контента</p>
                </div>
              {/if}
            </div>
          </div>
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
            💾 {editingBlock?.id === 0 ? 'Создать' : 'Сохранить'}
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

  /* Стили для конструктора контента */
  .content-builder {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
  }

  .builder-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 12px;
    background: #f7fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .builder-btn {
    padding: 8px 12px;
    background: #4299e1;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.2s;
  }

  .builder-btn:hover {
    background: #3182ce;
  }

  .builder-content {
    padding: 16px;
    max-height: 400px;
    overflow-y: auto;
  }

  .builder-element {
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    background: #fafafa;
    position: relative;
  }

  .element-controls {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    gap: 4px;
  }

  .control-btn {
    width: 28px;
    height: 28px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .control-btn.move-up,
  .control-btn.move-down {
    background: #4299e1;
    color: white;
  }

  .control-btn.delete {
    background: #e53e3e;
    color: white;
  }

  .control-btn:hover {
    opacity: 0.8;
  }

  .element-editor {
    margin-bottom: 12px;
  }

  .element-editor .form-input,
  .element-editor .form-textarea,
  .element-editor .form-select {
    margin-bottom: 8px;
  }

  .emoji-input {
    width: 60px !important;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
  }

  .element-preview {
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    padding: 12px;
    margin-top: 12px;
  }

  .preview-content {
    margin-top: 8px;
  }

  .empty-builder {
    text-align: center;
    padding: 40px;
    color: #718096;
    font-style: italic;
  }

  .contact-editor,
  .product-editor {
    display: grid;
    gap: 8px;
  }
</style>
