<script lang="ts">
  import { browser } from '$app/environment';
  import { onMount } from 'svelte';
  import { API_URL } from '../config.js';

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
  // Inline редактирование
  let editingBlockId = $state<number | null>(null);
  let editingBlockPosition = $state<number | null>(null); // Позиция для нового блока
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

  // Список стран для блока товаров
  const countries = [
    // Основные страны, используемые в товарах
    { value: 'Китай', label: '🇨🇳 Китай' },
    { value: 'Индия', label: '🇮🇳 Индия' },
    { value: 'США', label: '🇺🇸 США' },
    { value: 'ОАЭ', label: '🇦🇪 ОАЭ' },
    { value: 'Европа', label: '🇪🇺 Европа' },
    { value: 'Япония', label: '🇯🇵 Япония' }
  ];

  // Загрузка данных
  onMount(async () => {
    await loadContent();
    await checkAuth();
  });

  const loadContent = async () => {
    try {
      const response = await fetch(`${API_URL}/api/content/blocks`);
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
          const response = await fetch(`${API_URL}/api/auth/verify`, {
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

  // Функции inline редактирования
  const startEditing = (block: ContentBlock) => {
    editingBlockId = block.id;
    editForm.title = block.title;
    editForm.content = block.content;
    editForm.block_type = block.block_type;
    editForm.position = block.position;

    // Парсим HTML контент в элементы конструктора
    parseContentToElements(block.content);
  };

  const cancelEditing = () => {
    editingBlockId = null;
    editingBlockPosition = null;
    editForm = {
      title: '',
      content: '',
      block_type: '',
      position: 0
    };
    contentElements = [];
  };

  // Парсинг HTML в элементы конструктора
  function parseContentToElements(htmlContent: string) {
    contentElements = [];

    if (!htmlContent.trim()) {
      return;
    }

    // Создаем временный DOM элемент для парсинга
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Рекурсивно обходим все элементы
    parseElement(tempDiv);
  }

  function parseElement(element: Element) {
    for (const child of element.children) {
      if (child.classList.contains('contacts-main')) {
        // Парсим блок контактов
        parseContactsBlock(child);
      } else if (child.tagName.match(/^H[2-4]$/)) {
        // Парсим заголовки
        parseHeading(child);
      } else if (child.tagName === 'P') {
        // Парсим абзацы
        parseParagraph(child);
      } else if (child.classList.contains('contact-block')) {
        // Парсим отдельный контакт
        parseContact(child);
      } else if (child.classList.contains('warning')) {
        // Парсим предупреждение
        parseWarning(child);
      } else if (child.classList.contains('product-item')) {
        // Парсим товар
        parseProduct(child);
      } else {
        // Рекурсивно обрабатываем дочерние элементы
        parseElement(child);
      }
    }
  }

  function parseContactsBlock(element: Element) {
    // Ищем заголовок блока контактов
    const heading = element.querySelector('h3');
    if (heading) {
      const text = heading.textContent || '';
      const emoji = text.match(/^([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/u);

      contentElements.push({
        id: generateId(),
        type: 'heading',
        level: 'h3',
        text: text.replace(/^[\u{1F600}-\u{1F64F}][\u{1F300}-\u{1F5FF}][\u{1F680}-\u{1F6FF}][\u{1F1E0}-\u{1F1FF}][\u{2600}-\u{26FF}][\u{2700}-\u{27BF}]\s*/u, ''),
        emoji: emoji ? emoji[0] : '📞'
      });
    }

    // Парсим контакты внутри блока
    const contacts = element.querySelectorAll('.contact-block');
    contacts.forEach(contact => parseContact(contact));

    // Парсим предупреждения внутри блока
    const warnings = element.querySelectorAll('.warning');
    warnings.forEach(warning => parseWarning(warning));
  }

  function parseHeading(element: Element) {
    const text = element.textContent || '';
    const level = element.tagName.toLowerCase() as 'h2' | 'h3' | 'h4';
    const emoji = text.match(/^([\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}])/u);

    contentElements.push({
      id: generateId(),
      type: 'heading',
      level: level,
      text: text.replace(/^[\u{1F600}-\u{1F64F}][\u{1F300}-\u{1F5FF}][\u{1F680}-\u{1F6FF}][\u{1F1E0}-\u{1F1FF}][\u{2600}-\u{26FF}][\u{2700}-\u{27BF}]\s*/u, ''),
      emoji: emoji ? emoji[0] : ''
    });
  }

  function parseParagraph(element: Element) {
    const text = element.textContent || '';
    // Проверяем, что это не специальный блок (телефон, время, цена и т.д.)
    const isSpecialBlock = text.match(/^(Время:|Цена:|Регион:|⚠️)/i);
    const isBold = element.querySelector('strong') !== null || element.tagName === 'STRONG';

    if (text.trim() && !isSpecialBlock) {
      contentElements.push({
        id: generateId(),
        type: 'paragraph',
        text: text,
        bold: isBold
      });
    }
  }

  function parseContact(element: Element) {
    const title = element.querySelector('h4')?.textContent || '';
    const phoneMatch = element.innerHTML.match(/<strong>([+]?[\d\s-]+)<\/strong>/);
    const timeMatch = element.innerHTML.match(/<strong>Время:<\/strong>\s*([^<]+)/);

    const paragraphs = Array.from(element.querySelectorAll('p'))
      .map(p => p.textContent || '')
      .filter(text => !text.includes('Время:') && (!phoneMatch || !text.includes(phoneMatch[1])));

    contentElements.push({
      id: generateId(),
      type: 'contact',
      title: title,
      phone: phoneMatch ? phoneMatch[1] : '',
      time: timeMatch ? timeMatch[1].trim() : '',
      description: paragraphs.join('\n')
    });
  }

  function parseWarning(element: Element) {
    const text = element.textContent || '';
    const cleanText = text.replace(/^⚠️\s*ВАЖНО:\s*/i, '');

    contentElements.push({
      id: generateId(),
      type: 'warning',
      text: cleanText
    });
  }

  function parseProduct(element: Element) {
    // Ищем элементы model и price в структуре товара
    const modelElement = element.querySelector('.model, span.model');
    const priceElement = element.querySelector('.price, span.price');

    let name = '';
    let price = '';
    let region = '';
    let description = '';

    if (modelElement && priceElement) {
      // Новая структура с span.model и span.price
      const modelText = modelElement.textContent || '';
      const priceText = priceElement.textContent || '';

      // Извлекаем регион из модели (флаг в конце)
      const regionMatch = modelText.match(/(🇨🇳|🇮🇳|🇺🇸|🇦🇪|🇪🇺|🇯🇵)$/);
      if (regionMatch) {
        const flagToCountry: Record<string, string> = {
          '🇨🇳': 'Китай',
          '🇮🇳': 'Индия',
          '🇺🇸': 'США',
          '🇦🇪': 'ОАЭ',
          '🇪🇺': 'Европа',
          '🇯🇵': 'Япония'
        };
        region = flagToCountry[regionMatch[1]] || regionMatch[1];
        name = modelText.replace(regionMatch[1], '').trim();
      } else {
        name = modelText;
      }

      price = priceText;
    } else {
      // Старая структура с h4 и strong элементами
      const titleElement = element.querySelector('h4');
      if (titleElement) {
        name = titleElement.textContent || '';
      }

      const priceMatch = element.innerHTML.match(/<strong>Цена:<\/strong>\s*([^<]+)/);
      const regionMatch = element.innerHTML.match(/<strong>Регион:<\/strong>\s*([^<]+)/);

      price = priceMatch ? priceMatch[1].trim() : '';
      region = regionMatch ? regionMatch[1].trim() : '';

      const paragraphs = Array.from(element.querySelectorAll('p'))
        .map(p => p.textContent || '')
        .filter(text => !text.includes('Цена:') && !text.includes('Регион:'));

      description = paragraphs.join('\n');
    }

    contentElements.push({
      id: generateId(),
      type: 'product',
      name: name,
      price: price,
      region: region,
      description: description
    });
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
        // Определяем флаг по региону
        const countryToFlag: Record<string, string> = {
          'Китай': '🇨🇳',
          'Индия': '🇮🇳',
          'США': '🇺🇸',
          'ОАЭ': '🇦🇪',
          'Европа': '🇪🇺',
          'Япония': '🇯🇵'
        };

        const regionFlag = element.region ? countryToFlag[element.region] || element.region : '';
        const modelName = element.name + (regionFlag ? ` ${regionFlag}` : '');

        return `
          <div class="product-item">
            <span class="model">${modelName}</span>
            <span class="price">${element.price}</span>
          </div>
        `;

      default:
        return '';
    }
  }

  // Функция удалена - заменена на cancelEditing

  const saveBlock = async () => {
    if (!editingBlockId) return;

    const token = localStorage.getItem('stiner_token');
    if (!token) {
      error = 'Не авторизован';
      return;
    }

    try {
      // Генерируем HTML из элементов конструктора
      const generatedContent = generateHTMLFromElements();

      const response = await fetch(`${API_URL}/api/content/blocks/${editingBlockId}`, {
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
        cancelEditing();
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
    const hasProducts = contentElements.some(el => el.type === 'product');

    // Если есть контакты, оборачиваем в contacts-main
    if (hasContacts) {
      html += '<div class="contacts-main">\n';
    }

    // Если есть товары, добавляем класс products для стилизации
    if (hasProducts && !hasContacts) {
      html += '<div class="products">\n';
    }

    contentElements.forEach(element => {
      html += renderElement(element) + '\n';
    });

    if (hasContacts) {
      html += '</div>';
    } else if (hasProducts) {
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
      const response = await fetch(`${API_URL}/api/content/blocks/${blockId}`, {
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
    // Создаем новый блок для inline редактирования в конце списка
    editingBlockId = 0; // 0 означает новый блок
    editingBlockPosition = contentBlocks.length + 1; // В конце
    editForm.title = 'Новый блок';
    editForm.content = '';
    editForm.block_type = 'custom';
    editForm.position = contentBlocks.length + 1;

    // Очищаем элементы конструктора для нового блока
    contentElements = [];
  };

  const createNewBlockAtPosition = (position: number) => {
    // Создаем новый блок для inline редактирования на конкретной позиции
    editingBlockId = 0; // 0 означает новый блок
    editingBlockPosition = position; // Позиция где должен отображаться новый блок
    editForm.title = 'Новый блок';
    editForm.content = '';
    editForm.block_type = 'custom';
    editForm.position = position;

    // Очищаем элементы конструктора для нового блока
    contentElements = [];
  };

  const createBlockAfterPosition = (afterPosition: number) => {
    createNewBlockAtPosition(afterPosition + 1);
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

      const response = await fetch(`${API_URL}/api/content/blocks`, {
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
        cancelEditing();
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
    {#each contentBlocks as block, index (block.id)}
      <!-- Кнопка создания блока в самом начале -->
      {#if user && editMode && index === 0}
        <div class="create-block-divider">
          <button
            onclick={() => createNewBlockAtPosition(1)}
            class="create-block-between-btn"
            title="Создать блок в начале"
          >
            ➕ Добавить блок в начале
          </button>
        </div>
      {/if}

      <!-- Новый блок в режиме редактирования (отображается в правильной позиции) -->
      {#if editingBlockId === 0 && editingBlockPosition === block.position}
        <!-- Новый блок в режиме редактирования -->
        <div class="card fade-in">
          <div class="inline-editor">
            <div class="edit-header">
              <h3>➕ Создание нового блока</h3>
              <div class="edit-actions">
                <button class="btn btn-primary" onclick={saveNewBlock}>
                  💾 Создать
                </button>
                <button class="btn btn-secondary" onclick={cancelEditing}>
                  ❌ Отмена
                </button>
              </div>
            </div>

            <!-- Поля формы -->
            <div class="form-group">
              <label class="form-label">Название блока:</label>
              <input
                class="form-input"
                type="text"
                bind:value={editForm.title}
                placeholder="Введите название блока"
              />
            </div>

            <!-- Визуальный конструктор -->
            <div class="content-builder">
              <div class="builder-toolbar">
                <button class="builder-btn" onclick={() => addContentBlock('heading')}>
                  📝 Заголовок
                </button>
                <button class="builder-btn" onclick={() => addContentBlock('paragraph')}>
                  📄 Абзац
                </button>
                <button class="builder-btn" onclick={() => addContentBlock('contact')}>
                  📞 Контакт
                </button>
                <button class="builder-btn" onclick={() => addContentBlock('warning')}>
                  ⚠️ Предупреждение
                </button>
                <button class="builder-btn" onclick={() => addContentBlock('product')}>
                  📱 Товар
                </button>
              </div>

              <div class="builder-content">
                {#if contentElements.length === 0}
                  <div class="empty-builder">
                    <p>Нет элементов. Добавьте элементы с помощью кнопок выше.</p>
                  </div>
                {:else}
                  {#each contentElements as element, elementIndex (element.id)}
                    <div class="builder-element">
                      <div class="element-controls">
                        {#if elementIndex > 0}
                          <button class="control-btn move-up" onclick={() => moveElement(elementIndex, 'up')}>
                            ↑
                          </button>
                        {/if}
                        {#if elementIndex < contentElements.length - 1}
                          <button class="control-btn move-down" onclick={() => moveElement(elementIndex, 'down')}>
                            ↓
                          </button>
                        {/if}
                        <button class="control-btn delete" onclick={() => removeElement(elementIndex)}>
                          🗑️
                        </button>
                      </div>

                      <div class="element-editor">
                        {#if element.type === 'heading'}
                          <div style="display: flex; gap: 8px; align-items: center;">
                            <input
                              class="form-input emoji-input"
                              type="text"
                              bind:value={element.emoji}
                              placeholder="🎯"
                              maxlength="2"
                            />
                            <select class="form-select" bind:value={element.level}>
                              <option value="h2">H2 - Большой заголовок</option>
                              <option value="h3">H3 - Средний заголовок</option>
                              <option value="h4">H4 - Маленький заголовок</option>
                            </select>
                          </div>
                          <input
                            class="form-input"
                            type="text"
                            bind:value={element.text}
                            placeholder="Текст заголовка"
                          />
                        {:else if element.type === 'paragraph'}
                          <label class="checkbox-label">
                            <input type="checkbox" bind:checked={element.bold} />
                            Жирный текст
                          </label>
                          <textarea
                            class="form-textarea"
                            bind:value={element.text}
                            placeholder="Текст абзаца"
                            rows="3"
                          ></textarea>
                        {:else if element.type === 'contact'}
                          <div class="contact-editor">
                            <input
                              class="form-input"
                              type="text"
                              bind:value={element.title}
                              placeholder="Название контакта"
                            />
                            <input
                              class="form-input"
                              type="text"
                              bind:value={element.phone}
                              placeholder="Номер телефона"
                            />
                            <input
                              class="form-input"
                              type="text"
                              bind:value={element.time}
                              placeholder="Время работы"
                            />
                            <textarea
                              class="form-textarea"
                              bind:value={element.description}
                              placeholder="Описание"
                              rows="2"
                            ></textarea>
                          </div>
                        {:else if element.type === 'warning'}
                          <textarea
                            class="form-textarea"
                            bind:value={element.text}
                            placeholder="Текст предупреждения"
                            rows="2"
                          ></textarea>
                        {:else if element.type === 'product'}
                          <div class="product-editor">
                            <input
                              class="form-input"
                              type="text"
                              bind:value={element.name}
                              placeholder="Название товара"
                            />
                            <input
                              class="form-input"
                              type="text"
                              bind:value={element.price}
                              placeholder="Цена"
                            />
                            <select class="form-select" bind:value={element.region}>
                              <option value="">Выберите страну</option>
                              {#each countries as country}
                                <option value={country.value}>{country.label}</option>
                              {/each}
                            </select>
                          </div>
                        {/if}
                      </div>

                      <div class="element-preview">
                        <div class="preview-label">Предварительный просмотр:</div>
                        <div class="preview-content">
                          {@html renderElement(element)}
                        </div>
                      </div>
                    </div>
                  {/each}
                {/if}
              </div>
            </div>
          </div>
        </div>
      {/if}

      <!-- Кнопка создания блока между блоками (только для админов в режиме редактирования) -->
      {#if user && editMode && index > 0}
        <div class="create-block-divider">
          <button
            onclick={() => createBlockAfterPosition(contentBlocks[index - 1].position)}
            class="create-block-between-btn"
            title="Создать блок здесь"
          >
            ➕ Добавить блок здесь
          </button>
        </div>
      {/if}

      <div class="card fade-in">
        <div class="editable-block {editMode ? 'edit-mode' : ''}">
          {#if editingBlockId === block.id}
            <!-- Inline редактирование -->
            <div class="inline-editor">
              <div class="edit-header">
                <h3>📝 Редактирование блока</h3>
                <div class="edit-actions">
                  <button class="btn btn-primary" onclick={saveBlock}>
                    💾 Сохранить
                  </button>
                  <button class="btn btn-secondary" onclick={cancelEditing}>
                    ❌ Отмена
                  </button>
                </div>
              </div>

              <!-- Поля формы -->
              <div class="form-group">
                <label class="form-label">Название блока:</label>
                <input
                  class="form-input"
                  type="text"
                  bind:value={editForm.title}
                  placeholder="Введите название блока"
                />
              </div>

              <!-- Визуальный конструктор -->
              <div class="content-builder">
                <div class="builder-toolbar">
                  <button class="builder-btn" onclick={() => addContentBlock('heading')}>
                    📝 Заголовок
                  </button>
                  <button class="builder-btn" onclick={() => addContentBlock('paragraph')}>
                    📄 Абзац
                  </button>
                  <button class="builder-btn" onclick={() => addContentBlock('contact')}>
                    📞 Контакт
                  </button>
                  <button class="builder-btn" onclick={() => addContentBlock('warning')}>
                    ⚠️ Предупреждение
                  </button>
                  <button class="builder-btn" onclick={() => addContentBlock('product')}>
                    📱 Товар
                  </button>
                </div>

                <div class="builder-content">
                  {#if contentElements.length === 0}
                    <div class="empty-builder">
                      <p>Нет элементов. Добавьте элементы с помощью кнопок выше.</p>
                    </div>
                  {:else}
                    {#each contentElements as element, index (element.id)}
                      <div class="builder-element">
                        <div class="element-controls">
                          {#if index > 0}
                            <button class="control-btn move-up" onclick={() => moveElement(index, 'up')}>
                              ↑
                            </button>
                          {/if}
                          {#if index < contentElements.length - 1}
                            <button class="control-btn move-down" onclick={() => moveElement(index, 'down')}>
                              ↓
                            </button>
                          {/if}
                          <button class="control-btn delete" onclick={() => removeElement(index)}>
                            🗑️
                          </button>
                        </div>

                        <div class="element-editor">
                          {#if element.type === 'heading'}
                            <div style="display: flex; gap: 8px; align-items: center;">
                              <input
                                class="form-input emoji-input"
                                type="text"
                                bind:value={element.emoji}
                                placeholder="🎯"
                                maxlength="2"
                              />
                              <select class="form-select" bind:value={element.level}>
                                <option value="h2">H2 - Большой заголовок</option>
                                <option value="h3">H3 - Средний заголовок</option>
                                <option value="h4">H4 - Маленький заголовок</option>
                              </select>
                            </div>
                            <input
                              class="form-input"
                              type="text"
                              bind:value={element.text}
                              placeholder="Текст заголовка"
                            />
                          {:else if element.type === 'paragraph'}
                            <label class="checkbox-label">
                              <input type="checkbox" bind:checked={element.bold} />
                              Жирный текст
                            </label>
                            <textarea
                              class="form-textarea"
                              bind:value={element.text}
                              placeholder="Текст абзаца"
                              rows="3"
                            ></textarea>
                          {:else if element.type === 'contact'}
                            <div class="contact-editor">
                              <input
                                class="form-input"
                                type="text"
                                bind:value={element.title}
                                placeholder="Название контакта"
                              />
                              <input
                                class="form-input"
                                type="text"
                                bind:value={element.phone}
                                placeholder="Номер телефона"
                              />
                              <input
                                class="form-input"
                                type="text"
                                bind:value={element.time}
                                placeholder="Время работы"
                              />
                              <textarea
                                class="form-textarea"
                                bind:value={element.description}
                                placeholder="Описание"
                                rows="2"
                              ></textarea>
                            </div>
                          {:else if element.type === 'warning'}
                            <textarea
                              class="form-textarea"
                              bind:value={element.text}
                              placeholder="Текст предупреждения"
                              rows="2"
                            ></textarea>
                          {:else if element.type === 'product'}
                            <div class="product-editor">
                              <input
                                class="form-input"
                                type="text"
                                bind:value={element.name}
                                placeholder="Название товара"
                              />
                              <input
                                class="form-input"
                                type="text"
                                bind:value={element.price}
                                placeholder="Цена"
                              />
                              <select class="form-select" bind:value={element.region}>
                                <option value="">Выберите страну</option>
                                {#each countries as country}
                                  <option value={country.value}>{country.label}</option>
                                {/each}
                              </select>
                            </div>
                          {/if}
                        </div>

                        <div class="element-preview">
                          <div class="preview-label">Предварительный просмотр:</div>
                          <div class="preview-content">
                            {@html renderElement(element)}
                          </div>
                        </div>
                      </div>
                    {/each}
                  {/if}
                </div>
              </div>
            </div>
          {:else}
            <!-- Обычное отображение -->
            {#if editMode && isAuthenticated && user?.role === 'admin'}
              <div class="edit-controls">
                <button class="edit-btn edit" onclick={() => startEditing(block)}>✏️ Редактировать</button>
                <button class="edit-btn delete" onclick={() => deleteBlock(block.id)}>🗑️ Удалить</button>
              </div>
            {/if}

            <h2>{block.title}</h2>
            <div class="content">
              {@html block.content}
            </div>
          {/if}
        </div>
      </div>
    {/each}

    <!-- Новый блок в конце списка -->
    {#if editingBlockId === 0 && editingBlockPosition && editingBlockPosition > contentBlocks.length}
      <!-- Новый блок в режиме редактирования в конце -->
      <div class="card fade-in">
        <div class="inline-editor">
          <div class="edit-header">
            <h3>➕ Создание нового блока</h3>
            <div class="edit-actions">
              <button class="btn btn-primary" onclick={saveNewBlock}>
                💾 Создать
              </button>
              <button class="btn btn-secondary" onclick={cancelEditing}>
                ❌ Отмена
              </button>
            </div>
          </div>

          <!-- Поля формы -->
          <div class="form-group">
            <label class="form-label">Название блока:</label>
            <input
              class="form-input"
              type="text"
              bind:value={editForm.title}
              placeholder="Введите название блока"
            />
          </div>

          <!-- Визуальный конструктор -->
          <div class="content-builder">
            <div class="builder-toolbar">
              <button class="builder-btn" onclick={() => addContentBlock('heading')}>
                📝 Заголовок
              </button>
              <button class="builder-btn" onclick={() => addContentBlock('paragraph')}>
                📄 Абзац
              </button>
              <button class="builder-btn" onclick={() => addContentBlock('contact')}>
                📞 Контакт
              </button>
              <button class="builder-btn" onclick={() => addContentBlock('warning')}>
                ⚠️ Предупреждение
              </button>
              <button class="builder-btn" onclick={() => addContentBlock('product')}>
                📱 Товар
              </button>
            </div>

            <div class="builder-content">
              {#if contentElements.length === 0}
                <div class="empty-builder">
                  <p>Нет элементов. Добавьте элементы с помощью кнопок выше.</p>
                </div>
              {:else}
                {#each contentElements as element, elementIndex (element.id)}
                  <div class="builder-element">
                    <div class="element-controls">
                      {#if elementIndex > 0}
                        <button class="control-btn move-up" onclick={() => moveElement(elementIndex, 'up')}>
                          ↑
                        </button>
                      {/if}
                      {#if elementIndex < contentElements.length - 1}
                        <button class="control-btn move-down" onclick={() => moveElement(elementIndex, 'down')}>
                          ↓
                        </button>
                      {/if}
                      <button class="control-btn delete" onclick={() => removeElement(elementIndex)}>
                        🗑️
                      </button>
                    </div>

                    <div class="element-editor">
                      {#if element.type === 'heading'}
                        <div style="display: flex; gap: 8px; align-items: center;">
                          <input
                            class="form-input emoji-input"
                            type="text"
                            bind:value={element.emoji}
                            placeholder="🎯"
                            maxlength="2"
                          />
                          <select class="form-select" bind:value={element.level}>
                            <option value="h2">H2 - Большой заголовок</option>
                            <option value="h3">H3 - Средний заголовок</option>
                            <option value="h4">H4 - Маленький заголовок</option>
                          </select>
                        </div>
                        <input
                          class="form-input"
                          type="text"
                          bind:value={element.text}
                          placeholder="Текст заголовка"
                        />
                      {:else if element.type === 'paragraph'}
                        <label class="checkbox-label">
                          <input type="checkbox" bind:checked={element.bold} />
                          Жирный текст
                        </label>
                        <textarea
                          class="form-textarea"
                          bind:value={element.text}
                          placeholder="Текст абзаца"
                          rows="3"
                        ></textarea>
                      {:else if element.type === 'contact'}
                        <div class="contact-editor">
                          <input
                            class="form-input"
                            type="text"
                            bind:value={element.title}
                            placeholder="Название контакта"
                          />
                          <input
                            class="form-input"
                            type="text"
                            bind:value={element.phone}
                            placeholder="Номер телефона"
                          />
                          <input
                            class="form-input"
                            type="text"
                            bind:value={element.time}
                            placeholder="Время работы"
                          />
                          <textarea
                            class="form-textarea"
                            bind:value={element.description}
                            placeholder="Описание"
                            rows="2"
                          ></textarea>
                        </div>
                      {:else if element.type === 'warning'}
                        <textarea
                          class="form-textarea"
                          bind:value={element.text}
                          placeholder="Текст предупреждения"
                          rows="2"
                        ></textarea>
                      {:else if element.type === 'product'}
                        <div class="product-editor">
                          <input
                            class="form-input"
                            type="text"
                            bind:value={element.name}
                            placeholder="Название товара"
                          />
                          <input
                            class="form-input"
                            type="text"
                            bind:value={element.price}
                            placeholder="Цена"
                          />
                          <select class="form-select" bind:value={element.region}>
                            <option value="">Выберите страну</option>
                            {#each countries as country}
                              <option value={country.value}>{country.label}</option>
                            {/each}
                          </select>
                        </div>
                      {/if}
                    </div>

                    <div class="element-preview">
                      <div class="preview-label">Предварительный просмотр:</div>
                      <div class="preview-content">
                        {@html renderElement(element)}
                      </div>
                    </div>
                  </div>
                {/each}
              {/if}
            </div>
          </div>
        </div>
      </div>
    {:else if editMode && isAuthenticated && user?.role === 'admin' && editingBlockId !== 0}
      <!-- Кнопка добавления нового блока внизу (для общего создания) -->
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

<!-- Плавающая кнопка режима редактирования -->
{#if isAuthenticated && user?.role === 'admin'}
  <div class="floating-edit-toggle">
    <button
      class="floating-edit-btn {editMode ? 'active' : ''}"
      onclick={toggleEditMode}
      title={editMode ? 'Выйти из редактирования' : 'Режим редактирования'}
    >
      {editMode ? '❌' : '✏️'}
    </button>
  </div>
{/if}

<!-- Модальное окно удалено - используется inline редактирование -->

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

  .form-select {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    background: white;
    font-size: 14px;
    color: #2d3748;
    cursor: pointer;
  }

  .form-select:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
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

  /* Стили для основных контентных блоков */
  .content :global(.contacts-main) {
    background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
    padding: 2rem;
    border-radius: 15px;
    margin: 1.5rem 0;
    border: 1px solid #cbd5e1;
  }

  .content :global(.products) {
    background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
    padding: 2rem;
    border-radius: 15px;
    margin: 1.5rem 0;
    border: 1px solid #0891b2;
  }

  /* Стили для inline редактирования */
  .inline-editor {
    background: linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%);
    border: 2px solid #d97706;
    border-radius: 12px;
    padding: 20px;
    margin: 10px 0;
  }

  .edit-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(217, 119, 6, 0.3);
  }

  .edit-header h3 {
    margin: 0;
    color: #92400e;
    font-size: 1.25rem;
  }

  .edit-actions {
    display: flex;
    gap: 12px;
  }

  .preview-label {
    font-weight: 600;
    margin-bottom: 8px;
    color: #374151;
    font-size: 14px;
  }

  /* Кнопки создания блоков между существующими */
  .create-block-divider {
    display: flex;
    justify-content: center;
    margin: 1rem 0;
    position: relative;
  }

  .create-block-divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 2px;
    background: linear-gradient(90deg, transparent, #e2e8f0, transparent);
    z-index: 1;
  }

  .create-block-between-btn {
    background: linear-gradient(135deg, #48bb78, #38a169);
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    position: relative;
    z-index: 2;
    white-space: nowrap;
  }

  .create-block-between-btn:hover {
    background: linear-gradient(135deg, #38a169, #2f855a);
    transform: translateY(-1px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  .create-block-between-btn:active {
    transform: translateY(0);
  }

  /* Плавающая кнопка режима редактирования */
  .floating-edit-toggle {
    position: sticky;
    top: 20px;
    right: 20px;
    z-index: 1000;
    display: flex;
    justify-content: flex-end;
    pointer-events: none;
    margin-bottom: -60px; /* Компенсируем высоту кнопки */
  }

  .floating-edit-btn {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    border: none;
    background: linear-gradient(135deg, #4299e1, #3182ce);
    color: white;
    font-size: 1.25rem;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    pointer-events: auto;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .floating-edit-btn:hover {
    background: linear-gradient(135deg, #3182ce, #2c5282);
    transform: scale(1.1);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.3);
  }

  .floating-edit-btn.active {
    background: linear-gradient(135deg, #e53e3e, #c53030);
  }

  .floating-edit-btn.active:hover {
    background: linear-gradient(135deg, #c53030, #9c2626);
  }

  /* Адаптивность для плавающей кнопки */
  @media (max-width: 768px) {
    .floating-edit-toggle {
      top: 15px;
      right: 15px;
    }

    .floating-edit-btn {
      width: 45px;
      height: 45px;
      font-size: 1.1rem;
    }
  }
</style>
