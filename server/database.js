import bcrypt from "bcryptjs"
import sqlite3 from "sqlite3"

export class Database {
  constructor() {
    this.db = new sqlite3.Database("./stiner_forum.db", (err) => {
      if (err) {
        console.error("❌ Ошибка подключения к базе данных:", err.message)
      } else {
        console.log("✅ Подключение к SQLite базе данных установлено")
        // Запускаем инициализацию таблиц после подключения
        setTimeout(() => this.initTables(), 100)
      }
    })
  }

  // Инициализация таблиц
  async initTables() {
    console.log("🔧 Инициализация таблиц базы данных...")

    try {
      // Создаем таблицы последовательно
      await this.createUsersTable()
      await this.createContentBlocksTable()
      await this.createForumInfoTable()

      // Создаем админа и заполняем данными
      await this.createDefaultAdmin()
      await this.seedForumData()

      console.log("✅ База данных полностью инициализирована")
    } catch (error) {
      console.error("❌ Ошибка инициализации базы данных:", error)
    }
  }

  createUsersTable() {
    return new Promise((resolve, reject) => {
      this.db.run(
        `
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT DEFAULT 'user',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
        (err) => {
          if (err) {
            console.error("❌ Ошибка создания таблицы users:", err)
            reject(err)
          } else {
            console.log("✅ Таблица users создана")
            resolve()
          }
        }
      )
    })
  }

  createContentBlocksTable() {
    return new Promise((resolve, reject) => {
      this.db.run(
        `
        CREATE TABLE IF NOT EXISTS content_blocks (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          content TEXT NOT NULL,
          block_type TEXT NOT NULL,
          position INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT 1,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
        (err) => {
          if (err) {
            console.error("❌ Ошибка создания таблицы content_blocks:", err)
            reject(err)
          } else {
            console.log("✅ Таблица content_blocks создана")
            resolve()
          }
        }
      )
    })
  }

  createForumInfoTable() {
    return new Promise((resolve, reject) => {
      this.db.run(
        `
        CREATE TABLE IF NOT EXISTS forum_info (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          section TEXT NOT NULL,
          topic_title TEXT NOT NULL,
          created_date TEXT NOT NULL,
          messages_count INTEGER DEFAULT 0,
          views_count INTEGER DEFAULT 0,
          participants_count INTEGER DEFAULT 0,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `,
        (err) => {
          if (err) {
            console.error("❌ Ошибка создания таблицы forum_info:", err)
            reject(err)
          } else {
            console.log("✅ Таблица forum_info создана")
            resolve()
          }
        }
      )
    })
  }

  // Создание админа по умолчанию
  async createDefaultAdmin() {
    try {
      const hashedPassword = await bcrypt.hash("admin123", 10)

      return new Promise((resolve, reject) => {
        this.db.run(
          `
          INSERT OR IGNORE INTO users (username, password, role)
          VALUES (?, ?, ?)
        `,
          ["admin", hashedPassword, "admin"],
          (err) => {
            if (err) {
              console.error("❌ Ошибка создания админа:", err)
              reject(err)
            } else {
              console.log("👤 Админ по умолчанию создан: login: admin, password: admin123")
              resolve()
            }
          }
        )
      })
    } catch (error) {
      console.error("❌ Ошибка хеширования пароля:", error)
      throw error
    }
  }

  // Заполнение данными форума
  async seedForumData() {
    try {
      // Основная информация о теме
      await new Promise((resolve, reject) => {
        this.db.run(
          `
          INSERT OR REPLACE INTO forum_info (
            id, section, topic_title, created_date, messages_count, views_count, participants_count
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
          [
            1,
            "Объявления и реклама",
            "Только новая техника Apple от Стингера! Работаем с 2007 года",
            "12 Марта 2014",
            16071,
            10436345,
            808,
          ],
          (err) => {
            if (err) reject(err)
            else resolve()
          }
        )
      })

      // Контентные блоки
      const contentBlocks = [
        {
          title: "Заголовок раздела",
          content: "Объявления и реклама",
          block_type: "section_header",
          position: 1,
        },
        {
          title: "Название темы",
          content: "Только новая техника Apple от Стингера! Работаем с 2007 года",
          block_type: "topic_title",
          position: 2,
        },
        {
          title: "Информация о теме",
          content:
            "Создана: 12 Марта 2014 Срд 15:13:42<br>Сообщений в теме: 16071 (+4), просмотров: 10436345<br>Всего в теме участников: 808",
          block_type: "topic_info",
          position: 3,
        },
        {
          title: "О магазине StiNGer",
          content: `<h3>🍎 Магазин техники Apple "StiNGer"</h3>
          <p><strong>Работаем с 2007 года!</strong></p>
          <p>📱 Специализируемся на продаже новой техники Apple:</p>
          <ul>
            <li>iPhone всех моделей</li>
            <li>iPad и iPad Mini</li>
            <li>MacBook и iMac</li>
            <li>Apple Watch</li>
            <li>Аксессуары Apple</li>
          </ul>
          <p>✅ Только оригинальная техника с гарантией<br>
          🚚 Быстрая доставка по Омску<br>
          💰 Конкурентные цены<br>
          🔧 Сервисное обслуживание</p>`,
          block_type: "store_info",
          position: 4,
        },
        {
          title: "Последние поступления",
          content: `<div class="products">
            <div class="product-item">
              <h4>iPhone 5S 16GB Space Gray РСТ</h4>
              <p class="price">26 000 ₽</p>
              <p class="original-price">Цена в магазине: 29 990 ₽</p>
              <span class="status sold">Продан</span>
            </div>
            <div class="product-item">
              <h4>iPhone 5 16GB Black (US)</h4>
              <p class="price">20 000 ₽</p>
              <p class="description">Американские, НЕ рефабришед, реально новые</p>
              <span class="status available">В наличии</span>
            </div>
            <div class="product-item">
              <h4>iPad Mini 4G 32GB РСТ</h4>
              <p class="price">По запросу</p>
              <span class="status sold">Продан</span>
            </div>
          </div>`,
          block_type: "products",
          position: 5,
        },
        {
          title: "Контактная информация",
          content: `<div class="contacts">
            <h3>📞 Контакты</h3>
            <p><strong>Магазин:</strong> StiNGer (работаем с 2007 года)</p>
            <p><strong>Город:</strong> Омск</p>
            <p><strong>Специализация:</strong> Новая техника Apple</p>
            <p><strong>Форум:</strong> om7.com</p>
            <p class="note">⚠️ Звоните для уточнения наличия и цен!</p>
          </div>`,
          block_type: "contacts",
          position: 6,
        },
      ]

      // Вставляем блоки последовательно
      for (const block of contentBlocks) {
        await new Promise((resolve, reject) => {
          this.db.run(
            `
            INSERT OR REPLACE INTO content_blocks (title, content, block_type, position)
            VALUES (?, ?, ?, ?)
          `,
            [block.title, block.content, block.block_type, block.position],
            (err) => {
              if (err) reject(err)
              else resolve()
            }
          )
        })
      }

      console.log("📝 Данные форума загружены в базу данных")
    } catch (error) {
      console.error("❌ Ошибка заполнения данными:", error)
      throw error
    }
  }

  // Методы для работы с пользователями
  getUser(username) {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  }

  // Методы для работы с контентом
  getAllContentBlocks() {
    return new Promise((resolve, reject) => {
      this.db.all(
        "SELECT * FROM content_blocks WHERE is_active = 1 ORDER BY position ASC",
        (err, rows) => {
          if (err) reject(err)
          else resolve(rows)
        }
      )
    })
  }

  getContentBlock(id) {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM content_blocks WHERE id = ?", [id], (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  }

  updateContentBlock(id, data) {
    return new Promise((resolve, reject) => {
      const { title, content, block_type, position, is_active } = data
      this.db.run(
        `
        UPDATE content_blocks
        SET title = ?, content = ?, block_type = ?, position = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `,
        [title, content, block_type, position, is_active, id],
        function (err) {
          if (err) reject(err)
          else resolve(this.changes)
        }
      )
    })
  }

  createContentBlock(data) {
    return new Promise((resolve, reject) => {
      const { title, content, block_type, position } = data
      this.db.run(
        `
        INSERT INTO content_blocks (title, content, block_type, position)
        VALUES (?, ?, ?, ?)
      `,
        [title, content, block_type, position],
        function (err) {
          if (err) reject(err)
          else resolve(this.lastID)
        }
      )
    })
  }

  deleteContentBlock(id) {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM content_blocks WHERE id = ?", [id], function (err) {
        if (err) reject(err)
        else resolve(this.changes)
      })
    })
  }

  // Получение информации о форуме
  getForumInfo() {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM forum_info WHERE id = 1", (err, row) => {
        if (err) reject(err)
        else resolve(row)
      })
    })
  }

  // Закрытие соединения с БД
  close() {
    this.db.close((err) => {
      if (err) {
        console.error("Ошибка закрытия БД:", err.message)
      } else {
        console.log("Соединение с БД закрыто")
      }
    })
  }
}
