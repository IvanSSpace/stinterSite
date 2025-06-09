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

  // Очистка всех данных
  async clearAllData() {
    try {
      await new Promise((resolve, reject) => {
        this.db.run("DELETE FROM content_blocks", (err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      await new Promise((resolve, reject) => {
        this.db.run("DELETE FROM forum_info", (err) => {
          if (err) reject(err)
          else resolve()
        })
      })

      console.log("🗑️ Все данные очищены из базы")
    } catch (error) {
      console.error("❌ Ошибка очистки данных:", error)
      throw error
    }
  }

  // Заполнение данными форума
  async seedForumData() {
    try {
      // Сначала очищаем все данные
      await this.clearAllData()

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
            "Техника Apple от StiNGer - Официальный прайс-лист",
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

      // Контентные блоки с реальными данными
      const contentBlocks = [
        {
          title: "Важная информация",
          content: `<div class="notice">
            <h3>⚡ Срочных новостей нет. Работаем!</h3>
            <p><strong>Привет, всем привет! Добро пожаловать!</strong> ✋</p>
            <p><em>В чужой монастырь со своим уставом не ходят</em> (с) Русская пословица</p>
          </div>`,
          block_type: "notice",
          position: 1,
        },
        {
          title: "Контакты и связь",
          content: `<div class="contacts-main">
            <h3>📞 Контактная информация</h3>

            <div class="contact-block">
              <h4>🔥 Связь #1 (Основной номер):</h4>
              <p><strong>+7-908-318-5381</strong></p>
              <p><strong>Время:</strong> 11:00 - 20:00 (Без выходных!)</p>
              <p>⚠️ Перед звонком ВНИМАТЕЛЬНО изучите информацию ниже!</p>
              <p>📋 Коротко и по делу: модель, объем, цвет. Далее - считаю, а далее да-да, нет-нет.</p>
              <p>🚫 НЕ переписываюсь НИГДЕ, ни на какие темы и ни в каких мессенджерах.</p>
            </div>

            <div class="contact-block">
              <h4>💬 Связь #2 (Консультации):</h4>
              <p><strong>+7-905-941-9159</strong></p>
              <p>📱 ВКонтакте / Telegram / WhatsApp</p>
              <p><strong>Время:</strong> КРУГЛОСУТОЧНО и БЕЗ выходных</p>
              <p>💰 <em>НО +500р к ценам прайса!</em></p>
              <p>🚚 Есть доставка по городу по договоренности и ЗА ОТДЕЛЬНУЮ ПЛАТУ!</p>
              <p>💳 Оплата по безналу для ЮР. ЛИЦ!</p>
            </div>

            <div class="warning">
              <p>⚠️ <strong>ВАЖНО:</strong> Если Вы сначала пишете/звоните на втором номере, то на первый звонить по этому же вопросу уже НЕ НУЖНО!</p>
            </div>
          </div>`,
          block_type: "contacts",
          position: 2,
        },
        {
          title: "iPhone 16 серии",
          content: `<div class="products-section">
            <h3>📱 iPhone 16 / iPhone 16 Plus / iPhone 16 Pro / iPhone 16 Pro Max</h3>

            <div class="product-info">
              <p>💰 Цены ПРИМЕРНЫЕ и постоянно меняются от курса доллара и спроса</p>
              <p>⏰ Прайс на день всегда после 14:00</p>
              <p>🚚 Доставка в Омск 4-5 дней</p>
            </div>

            <div class="country-info">
              <h4>🌍 Регионы и особенности:</h4>
              <p>🇩🇪🇸🇦🇧🇷🇰🇿🇹🇼🇨🇦🇯🇵🇦🇺🇦🇪🇬🇧🇪🇺🇸🇬🇮🇳 - 1Sim + ESIM</p>
              <p>🇰🇷 - Корея. Звук затвора камеры не отключается</p>
              <p>🇨🇳🇭🇰 - Китай/Гонконг. Две физические сим-карты, без ESIM</p>
              <p>🇺🇸 - США. Только ESIM, БЕЗ ФИЗИЧЕСКИХ СИМ-карт</p>
            </div>

            <div class="products-grid">
              <div class="product-category">
                <h4>📱 iPhone 16E</h4>
                <div class="product-item">
                  <span class="model">16E 128GB Black 🇮🇳</span>
                  <span class="price">47 000 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">16E 128GB White 🇮🇳</span>
                  <span class="price">46 800 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">16E 256GB White 🇮🇳</span>
                  <span class="price">57 500 ₽</span>
                </div>
              </div>

              <div class="product-category">
                <h4>📱 iPhone 16</h4>
                <div class="product-item">
                  <span class="model">16 128GB Black 🇨🇳</span>
                  <span class="price">61 400 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">16 128GB Black 🇮🇳</span>
                  <span class="price">65 000 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">16 128GB White 🇨🇳</span>
                  <span class="price">60 300 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">16 128GB Teal 🇮🇳</span>
                  <span class="price">61 000 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">16 256GB Black 🇮🇳</span>
                  <span class="price">73 000 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">16 512GB Black 🇦🇪</span>
                  <span class="price">87 000 ₽</span>
                </div>
              </div>

              <div class="product-category">
                <h4>📱 iPhone 16 Plus</h4>
                <div class="product-item">
                  <span class="model">16 Plus 128GB Black 🇮🇳</span>
                  <span class="price">73 500 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">16 Plus 128GB White 🇮🇳</span>
                  <span class="price">69 800 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">16 Plus 256GB White 🇮🇳</span>
                  <span class="price">81 000 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">16 Plus 512GB Black 🇦🇪</span>
                  <span class="price">95 000 ₽</span>
                </div>
              </div>

              <div class="product-category">
                <h4>🫧 iPhone 16 Pro</h4>
                <div class="product-item">
                  <span class="model">16 Pro 128GB Black 🇨🇳</span>
                  <span class="price">75 000 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">16 Pro 128GB Natural 🇪🇺</span>
                  <span class="price">83 500 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">16 Pro 256GB Natural 🇦🇪</span>
                  <span class="price">95 000 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">16 Pro 512GB Black 🇯🇵</span>
                  <span class="price">107 700 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">16 Pro 1TB Black 🇯🇵</span>
                  <span class="price">132 500 ₽</span>
                </div>
              </div>

              <div class="product-category">
                <h4>🫧 iPhone 16 Pro Max</h4>
                <div class="product-item">
                  <span class="model">16 Pro Max 256GB Black 🇦🇪</span>
                  <span class="price">99 100 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">16 Pro Max 256GB White 🇯🇵</span>
                  <span class="price">99 900 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">16 Pro Max 512GB White 🇦🇪</span>
                  <span class="price">116 000 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">16 Pro Max 1TB Black 🇦🇪</span>
                  <span class="price">133 800 ₽</span>
                </div>
              </div>
            </div>
          </div>`,
          block_type: "iphone16",
          position: 3,
        },
        {
          title: "iPhone 15 серии",
          content: `<div class="products-section">
            <h3>📱 iPhone 15 / iPhone 15 Plus / iPhone 15 Pro / iPhone 15 Pro Max</h3>

            <div class="products-grid">
              <div class="product-category">
                <h4>📱 iPhone 15</h4>
                <div class="product-item">
                  <span class="model">15 128GB Midnight 🇮🇳</span>
                  <span class="price">54 600 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">15 128GB Pink 🇮🇳</span>
                  <span class="price">54 600 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">15 128GB Blue 🇮🇳</span>
                  <span class="price">54 200 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">15 256GB Pink 🇮🇳</span>
                  <span class="price">63 600 ₽</span>
                </div>
              </div>

              <div class="product-category">
                <h4>📱 iPhone 15 Plus</h4>
                <div class="product-item">
                  <span class="model">15 Plus 128GB Green 🇮🇳</span>
                  <span class="price">63 700 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">15 Plus 128GB Yellow 🇮🇳</span>
                  <span class="price">63 700 ₽</span>
                </div>
              </div>

              <div class="product-category">
                <h4>🪩 iPhone 15 Pro</h4>
                <div class="product-item">
                  <span class="model">15 Pro 128GB Blue 🇭🇰</span>
                  <span class="price">70 500 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">15 Pro 256GB Blue 🇭🇰</span>
                  <span class="price">80 500 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">15 Pro 512GB Natural 🇦🇪</span>
                  <span class="price">97 800 ₽</span>
                </div>
              </div>

              <div class="product-category">
                <h4>🪩 iPhone 15 Pro Max</h4>
                <div class="product-item">
                  <span class="model">15 Pro Max 256GB Black 🇦🇪</span>
                  <span class="price">93 700 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">15 Pro Max 256GB Blue 🇦🇪</span>
                  <span class="price">90 500 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">15 Pro Max 512GB White 🇦🇪</span>
                  <span class="price">98 600 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">15 Pro Max 1TB Black 🇦🇪</span>
                  <span class="price">118 000 ₽</span>
                </div>
              </div>
            </div>
          </div>`,
          block_type: "iphone15",
          position: 4,
        },
        {
          title: "MacBook",
          content: `<div class="products-section">
            <h3>💻 MacBook Air / MacBook Pro / iMac</h3>

            <div class="product-info">
              <p>⌨️ У всех ноутбуков английские буквы на клавиатуре</p>
              <p>🔧 Решается гравировкой в Омске за 1000₽ (10 минут работы)</p>
            </div>

            <div class="products-grid">
              <div class="product-category">
                <h4>🖥 iMac</h4>
                <div class="product-item">
                  <span class="model">iMac 24" M3 8/512 Blue (MQRR3)</span>
                  <span class="price">155 000 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">iMac 24" M4 16/256 Silver (MD3H4)</span>
                  <span class="price">165 000 ₽</span>
                </div>
              </div>

              <div class="product-category">
                <h4>💻 MacBook Air 13"</h4>
                <div class="product-item">
                  <span class="model">Air 13" M1 8/256 Gray (MGN63)</span>
                  <span class="price">56 000 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">Air 13" M3 8/256 Midnight (MRXV3)</span>
                  <span class="price">78 000 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">Air 13" M4 16/256 Silver (MW0W3)</span>
                  <span class="price">86 000 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">Air 13" M4 24/512 Sky Blue (MC6V4)</span>
                  <span class="price">116 500 ₽</span>
                </div>
              </div>

              <div class="product-category">
                <h4>💻 MacBook Air 15"</h4>
                <div class="product-item">
                  <span class="model">Air 15" M3 8/256 Starlight (MRYR3)</span>
                  <span class="price">82 000 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">Air 15" M3 16/512 Midnight (MXD43)</span>
                  <span class="price">117 500 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">Air 15" M4 16/256 Silver (MW1G3)</span>
                  <span class="price">101 500 ₽</span>
                </div>
              </div>

              <div class="product-category">
                <h4>💻 MacBook Pro</h4>
                <div class="product-item">
                  <span class="model">Pro 14" M3 8/1TB Gray (MTL83)</span>
                  <span class="price">117 000 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">Pro 16" M1 Max 32/1TB Gray (MK1A3)</span>
                  <span class="price">180 000 ₽</span>
                </div>
              </div>
            </div>
          </div>`,
          block_type: "macbook",
          position: 5,
        },
        {
          title: "iPad и Apple Watch",
          content: `<div class="products-section">
            <h3>📱 iPad / Apple Watch / AirPods</h3>

            <div class="products-grid">
              <div class="product-category">
                <h4>📂 iPad</h4>
                <div class="product-item">
                  <span class="model">iPad 10 256GB Blue Wi-Fi 🇺🇸</span>
                  <span class="price">33 000 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">iPad Air 11" M3 128GB Purple Wi-Fi 🇺🇸</span>
                  <span class="price">48 000 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">iPad Air 13" M3 128GB Blue Wi-Fi 🇺🇸</span>
                  <span class="price">63 800 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">iPad Pro 11" M4 256GB Silver Wi-Fi 🇺🇸</span>
                  <span class="price">81 000 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">iPad Pro 13" M4 256GB Black Wi-Fi 🇺🇸</span>
                  <span class="price">98 000 ₽</span>
                </div>
              </div>

              <div class="product-category">
                <h4>⌚ Apple Watch</h4>
                <div class="product-item">
                  <span class="model">Apple Watch SE2 40mm Midnight (2024) 🇺🇸</span>
                  <span class="price">16 900 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">Apple Watch S10 42mm Jet Black 🇺🇸</span>
                  <span class="price">28 300 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">Apple Watch S10 46mm Rose Gold 🇺🇸</span>
                  <span class="price">31 200 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">Apple Watch Ultra 2 Black/Dark Green (2024) 🇺🇸</span>
                  <span class="price">63 500 ₽</span>
                </div>
              </div>

              <div class="product-category">
                <h4>🎧 AirPods</h4>
                <div class="product-item">
                  <span class="model">AirPods 4</span>
                  <span class="price">10 600 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">AirPods 4 ANC</span>
                  <span class="price">15 000 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">AirPods Pro 2 USB-C</span>
                  <span class="price">17 400 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">AirPods Max USB-C Midnight</span>
                  <span class="price">45 000 ₽</span>
                </div>
                <div class="product-item">
                  <span class="model">Apple Pencil Pro</span>
                  <span class="price">10 400 ₽</span>
                </div>
              </div>
            </div>
          </div>`,
          block_type: "ipad_watch",
          position: 6,
        },
        {
          title: "Дополнительная информация",
          content: `<div class="additional-info">
            <h3>📋 Дополнительная информация</h3>

            <div class="info-block">
              <h4>📄 Полезные ссылки:</h4>
              <ul>
                <li>📖 Ответы на остальные вопросы</li>
                <li>🔄 Про TRADE IN и скупку БУ</li>
                <li>🤝 Про взаимоуважение и черный список</li>
                <li>🛡️ Про гарантию на устройства</li>
              </ul>
            </div>

            <div class="info-block">
              <h4>⚠️ Важные условия:</h4>
              <ul>
                <li>💰 Цены постоянно меняются в течение дня от курса доллара</li>
                <li>⏰ Точную цену уточняйте при заказе по телефону</li>
                <li>🚚 Доставка в Омск 4-5 дней</li>
                <li>📦 Возможны другие модели под заказ</li>
                <li>💳 Для юридических лиц - безналичный расчет</li>
              </ul>
            </div>

            <div class="info-block">
              <h4>🌟 Дополнительная техника:</h4>
              <p>Также в наличии продукция:</p>
              <ul>
                <li>🎮 Sony PlayStation 5</li>
                <li>💨 Dyson (пылесосы, фены)</li>
                <li>⌚ Garmin (спортивные часы)</li>
                <li>📱 Samsung Galaxy</li>
                <li>📱 Xiaomi / Redmi</li>
                <li>🎮 Steam Deck</li>
                <li>🎮 Xbox Series</li>
              </ul>
            </div>

            <div class="signature">
              <p><strong>С уважением, StiNGer</strong></p>
              <p><em>Работаем с 2007 года!</em></p>
            </div>
          </div>`,
          block_type: "additional_info",
          position: 7,
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
