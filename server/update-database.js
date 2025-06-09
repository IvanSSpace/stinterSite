import { Database } from "./database.js"

// Новые данные для базы данных
const newContentBlocks = [
  {
    title: "Важная информация и приветствие",
    content: `<div class="notice">
      <h3>⚡ Срочных новостей нет. Работаем.</h3>
      <p><strong>Привет, всем привет! Добро пожаловать!</strong> ✋</p>
      <p>Икра: <a href="/viewtopic.php?t=379486">/viewtopic.php?t=379486</a></p>
      <p><em>В чужой монастырь со своим уставом не ходят</em> (с) Русская пословица</p>
      <p>📢 Закрытый канал в Telegram: <a href="#">[внешняя ссылка]</a></p>

      <div class="important-links">
        <p>📋 Ответы на остальные вопросы здесь: <a href="#">(нажми)</a></p>
        <p>💱 Про TRADE IN и скупку БУ здесь: <a href="#">(нажми)</a></p>
        <p>🤝 Про взаимоуважение и черный список здесь: <a href="#">(нажми)</a></p>
        <p>🛡️ Про гарантию на устройства здесь: <a href="#">(нажми)</a></p>
      </div>
    </div>`,
    block_type: "notice",
    position: 1,
  },

  {
    title: "Контакты и связь",
    content: `<div class="contacts-main">
      <h3>📞 Контактная информация</h3>

      <div class="contact-block primary">
        <h4>🔥 Связь #1:</h4>
        <p class="phone-number"><strong>+7-908-318-5381</strong></p>
        <p><strong>Время:</strong> 11-00 - 20-00 (Без выходных!)</p>
        <div class="contact-details">
          <p>⚠️ Перед звонком ВНИМАТЕЛЬНО изучите и осмыслите информацию внизу.</p>
          <p>Тогда не будет никаких проблем и все пройдёт безопасно.</p>
          <p>Затем, если готовы к заказу - ЗВОНИТЕ.</p>
          <p>📋 Коротко и по делу: модель, объем, цвет. Далее - считаю, а далее да-да, нет-нет.</p>
          <p>🚫 НЕ переписываюсь НИГДЕ, ни на какие темы и ни в каких месенджерах. Не тратьте время зря.</p>
          <p>⚡ Всегда высокая загруженность. Внимательно читайте информацию ниже.</p>
          <p>Здесь есть ответ на любой ваш вопрос, касаемо нашего направления.</p>
        </div>
      </div>

      <div class="contact-block secondary">
        <h4>💬 Связь #2:</h4>
        <p class="phone-number"><strong>+7-905-941-9159</strong></p>
        <p>📱 ВКонтакте / Telegram / WhatsApp</p>
        <p><strong>Время:</strong> ПИСАТЬ можно хоть КРУГЛОСУТОЧНО и БЕЗ выходных. ПОЗДНО звонить НЕ НУЖНО.</p>
        <div class="contact-details">
          <p>По каким-то причинам лень изучать и читать информацию здесь? Тебе на второй номер.</p>
          <p>Здесь ответят вежливо, все расскажут и выслушают. Есть мессенджеры: WhatsApp/iMessage/Telegram и даже Viber.</p>
          <p>💰 Всё как вы любите, НО <strong>+500р к ценам прайса!</strong></p>
          <p>🚚 Есть доставка по городу, но по договоренности и ЗА ОТДЕЛЬНУЮ ПЛАТУ!</p>
          <p>💳 Теперь здесь возможна оплата по безналу для ЮР. ЛИЦ!</p>
        </div>
      </div>

      <div class="warning">
        <p>⚠️ <strong>ВАЖНО:</strong> Если Вы сначала пишите/звоните/узнаёте/расспрашиваете/интересуетесь на втором номере ТО НА ПЕРВЫЙ звонить ПО этому же вопросу уже НЕ НУЖНО. Таких индивидов отслеживаем. Скотское отношение к нам - в БАН!</p>
      </div>
    </div>`,
    block_type: "contacts",
    position: 2,
  },

  {
    title: "iPhone 16 серии",
    content: `<div class="products-section">
      <h3>📱 iPhone 16 / iPhone 16 Plus / iPhone 16 Pro / iPhone 16 Pro Max / iPhone 16E</h3>

      <div class="product-info">
        <p>💰 Цены и список "под заказ" ПРИМЕРНЫЕ и постоянно меняются в течение дня от курса доллара и спроса.</p>
        <p>⏰ Прайс на день всегда после 14-00. Точную цену посчитаю и при заказе по телефону в разговоре озвучу.</p>
        <p>🚚 Доставка в Омск 4-5 дней.</p>
        <p>🔍 Под заказ возможны и другие модели, которых нет в этом списке, но нужно искать и возможно цена будет ДОРОЖЕ.</p>
      </div>

      <div class="country-info">
        <h4>🌍 Регионы и особенности:</h4>
        <p>🇩🇪 / 🇸🇦 / 🇧🇷 / 🇰🇿 / 🇹🇼 / 🇨🇦 / 🇯🇵 / 🇦🇺 / 🇦🇪 / 🇬🇧 / 🇪🇺 / 🇸🇬 / 🇮🇳 - Для рынка Японии/Эмиратов/Европы и прочих стран. 1Sim + ESIM.</p>
        <p>🇰🇷 - Корея. Звук затвора камеры не отключаем. Какие-то ограничения в приложении "локатор".</p>
        <p>🇨🇳 / 🇭🇰 - Китай и Гонконг. Две физические сим-карты, без ESIM. Вырезан аудиовызов FaceTime, видеовызов есть.</p>
        <p>🇺🇸 - США. Только ESIM, БЕЗ ФИЗИЧЕСКИХ СИМ-карт. В России работает со всеми операторами.</p>
      </div>

      <div class="products-grid">
        <div class="product-category">
          <h4>⚫️ iPhone 16E ⚫️</h4>
          <div class="product-item"><span class="model">16E 128GB Black 🇮🇳</span><span class="price">47 000 ₽</span></div>
          <div class="product-item"><span class="model">16E 128GB White 🇮🇳</span><span class="price">46 800 ₽</span></div>
          <div class="product-item"><span class="model">16E 256GB White 🇮🇳</span><span class="price">57 500 ₽</span></div>
        </div>

        <div class="product-category">
          <h4>⚫️ iPhone 16 ⚫️</h4>
          <div class="product-item"><span class="model">16 128GB Black 🇨🇳</span><span class="price">61 400 ₽</span></div>
          <div class="product-item"><span class="model">16 128GB Black 🇮🇳</span><span class="price">65 000 ₽</span></div>
          <div class="product-item"><span class="model">16 128GB White 🇨🇳</span><span class="price">60 300 ₽</span></div>
          <div class="product-item"><span class="model">16 128GB White 🇮🇳</span><span class="price">61 300 ₽</span></div>
          <div class="product-item"><span class="model">16 128GB Pink 🇮🇳</span><span class="price">61 100 ₽</span></div>
          <div class="product-item"><span class="model">16 128GB Teal 🇮🇳</span><span class="price">61 000 ₽</span></div>
          <div class="product-item"><span class="model">16 128GB Ultramarine 🇮🇳</span><span class="price">61 200 ₽</span></div>
          <div class="product-item"><span class="model">16 256GB Black 🇮🇳</span><span class="price">73 000 ₽</span></div>
          <div class="product-item"><span class="model">16 256GB White 🇮🇳</span><span class="price">74 000 ₽</span></div>
          <div class="product-item"><span class="model">16 256GB Pink 🇮🇳</span><span class="price">72 000 ₽</span></div>
          <div class="product-item"><span class="model">16 256GB Teal 🇮🇳</span><span class="price">71 200 ₽</span></div>
          <div class="product-item"><span class="model">16 512GB Black 🇦🇪</span><span class="price">87 000 ₽</span></div>
          <div class="product-item"><span class="model">16 512GB Teal 🇦🇪</span><span class="price">86 500 ₽</span></div>
        </div>

        <div class="product-category">
          <h4>⚫️ iPhone 16 Plus ⚫️</h4>
          <div class="product-item"><span class="model">16 Plus 128GB Black 🇮🇳</span><span class="price">73 500 ₽</span></div>
          <div class="product-item"><span class="model">16 Plus 128GB White 🇮🇳</span><span class="price">69 800 ₽</span></div>
          <div class="product-item"><span class="model">16 Plus 128GB Pink 🇺🇸</span><span class="price">66 000 ₽</span></div>
          <div class="product-item"><span class="model">16 Plus 128GB Teal 🇮🇳</span><span class="price">70 500 ₽</span></div>
          <div class="product-item"><span class="model">16 Plus 128GB Ultramarine 🇮🇳</span><span class="price">69 200 ₽</span></div>
          <div class="product-item"><span class="model">16 Plus 256GB White 🇮🇳</span><span class="price">81 000 ₽</span></div>
          <div class="product-item"><span class="model">16 Plus 256GB Teal 🇮🇳</span><span class="price">80 000 ₽</span></div>
          <div class="product-item"><span class="model">16 Plus 256GB Pink 🇦🇪</span><span class="price">83 500 ₽</span></div>
          <div class="product-item"><span class="model">16 Plus 512GB все цвета 🇦🇪</span><span class="price">95 000 ₽</span></div>
        </div>

        <div class="product-category pro">
          <h4>🫧 iPhone 16 Pro 🫧</h4>
          <div class="product-item"><span class="model">16 Pro 128GB Black 🇨🇳</span><span class="price">75 000 ₽</span></div>
          <div class="product-item"><span class="model">16 Pro 128GB Black 🇦🇪</span><span class="price">83 500 ₽</span></div>
          <div class="product-item"><span class="model">16 Pro 128GB White 🇨🇳</span><span class="price">74 900 ₽</span></div>
          <div class="product-item"><span class="model">16 Pro 128GB Natural 🇪🇺</span><span class="price">83 500 ₽</span></div>
          <div class="product-item"><span class="model">16 Pro 128GB Desert 🇨🇳</span><span class="price">73 900 ₽</span></div>
          <div class="product-item"><span class="model">16 Pro 256GB Black 🇨🇳</span><span class="price">86 900 ₽</span></div>
          <div class="product-item"><span class="model">16 Pro 256GB Natural 🇦🇪</span><span class="price">95 000 ₽</span></div>
          <div class="product-item"><span class="model">16 Pro 512GB Black 🇯🇵</span><span class="price">107 700 ₽</span></div>
          <div class="product-item"><span class="model">16 Pro 512GB White 🇯🇵</span><span class="price">115 000 ₽</span></div>
          <div class="product-item"><span class="model">16 Pro 1TB Black 🇯🇵</span><span class="price">132 500 ₽</span></div>
        </div>

        <div class="product-category pro">
          <h4>🫧 iPhone 16 Pro Max 🫧</h4>
          <div class="product-item"><span class="model">16 Pro Max 256GB Black 🇯🇵</span><span class="price">99 000 ₽</span></div>
          <div class="product-item"><span class="model">16 Pro Max 256GB White 🇦🇪</span><span class="price">99 000 ₽</span></div>
          <div class="product-item"><span class="model">16 Pro Max 256GB Natural 🇦🇪</span><span class="price">99 800 ₽</span></div>
          <div class="product-item"><span class="model">16 Pro Max 512GB White 🇦🇪</span><span class="price">116 000 ₽</span></div>
          <div class="product-item"><span class="model">16 Pro Max 1TB Black 🇦🇪</span><span class="price">133 800 ₽</span></div>
          <div class="product-item"><span class="model">16 Pro Max 1TB Natural 🇯🇵</span><span class="price">137 300 ₽</span></div>
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
          <h4>📱 iPhone 15 📱</h4>
          <div class="product-item"><span class="model">15 128GB Midnight 🇮🇳</span><span class="price">54 600 ₽</span></div>
          <div class="product-item"><span class="model">15 128GB Pink 🇮🇳</span><span class="price">54 600 ₽</span></div>
          <div class="product-item"><span class="model">15 128GB Blue 🇮🇳</span><span class="price">54 200 ₽</span></div>
          <div class="product-item"><span class="model">15 128GB Yellow 🇦🇪</span><span class="price">54 400 ₽</span></div>
          <div class="product-item"><span class="model">15 128GB Green 🇮🇳</span><span class="price">54 100 ₽</span></div>
          <div class="product-item"><span class="model">15 256GB Pink 🇮🇳</span><span class="price">63 600 ₽</span></div>
          <div class="product-item"><span class="model">15 256GB Green 🇦🇪</span><span class="price">63 200 ₽</span></div>
          <div class="product-item"><span class="model">15 256GB Yellow 🇦🇪</span><span class="price">63 500 ₽</span></div>
        </div>

        <div class="product-category">
          <h4>📱 iPhone 15 Plus 📱</h4>
          <div class="product-item"><span class="model">15 Plus 128GB Green 🇮🇳</span><span class="price">63 700 ₽</span></div>
          <div class="product-item"><span class="model">15 Plus 128GB Yellow 🇮🇳</span><span class="price">63 700 ₽</span></div>
        </div>

        <div class="product-category pro">
          <h4>🪩 iPhone 15 Pro 🪩</h4>
          <div class="product-item"><span class="model">15 Pro 128GB Blue 🇭🇰</span><span class="price">70 500 ₽</span></div>
          <div class="product-item"><span class="model">15 Pro 256GB Blue 🇭🇰</span><span class="price">80 500 ₽</span></div>
          <div class="product-item"><span class="model">15 Pro 512GB Natural 🇦🇪</span><span class="price">97 800 ₽</span></div>
        </div>

        <div class="product-category pro">
          <h4>🪩 iPhone 15 Pro Max 🪩</h4>
          <div class="product-item"><span class="model">15 Pro Max 256GB Black 🇦🇪</span><span class="price">93 700 ₽</span></div>
          <div class="product-item"><span class="model">15 Pro Max 256GB Blue 🇦🇪</span><span class="price">90 500 ₽</span></div>
          <div class="product-item"><span class="model">15 Pro Max 256GB Natural 🇦🇪</span><span class="price">89 600 ₽</span></div>
          <div class="product-item"><span class="model">15 Pro Max 512GB White 🇦🇪</span><span class="price">98 600 ₽</span></div>
          <div class="product-item"><span class="model">15 Pro Max 512GB Blue 🇦🇪</span><span class="price">98 600 ₽</span></div>
          <div class="product-item"><span class="model">15 Pro Max 1TB Black 🇦🇪</span><span class="price">118 000 ₽</span></div>
        </div>
      </div>
    </div>`,
    block_type: "iphone15",
    position: 4,
  },

  {
    title: "MacBook и iMac",
    content: `<div class="products-section">
      <h3>💻 MacBook / iMac</h3>

      <div class="product-info">
        <p>⌨️ У всех ноутбуков английские буквы на клавиатуре.</p>
        <p>🔧 Решается гравировкой. Делается в Омске. Время работы 10 минут, цена вопроса 1000р.</p>
        <p>🔍 Для быстрого поиска и заказа нужен заводской номер модели. Например: MKGP3, MK183, MKGQ3</p>
      </div>

      <div class="products-grid">
        <div class="product-category">
          <h4>🖥️ iMac</h4>
          <div class="product-item"><span class="model">iMac 24" M3 10GPU 8/512 (MQRR3) Blue</span><span class="price">155 000 ₽</span></div>
          <div class="product-item"><span class="model">iMac 24" M4 10GPU 16/256 (MD3H4) Silver</span><span class="price">165 000 ₽</span></div>
        </div>

        <div class="product-category">
          <h4>💻 MacBook Air 13"</h4>
          <div class="product-item"><span class="model">Air 13" M1 8/256 (MGN63) Gray</span><span class="price">56 000 ₽</span></div>
          <div class="product-item"><span class="model">Air 13" M3 8/256 (MRXV3) Midnight</span><span class="price">78 000 ₽</span></div>
          <div class="product-item"><span class="model">Air 13" M3 8/256 (MRXT3) Starlight</span><span class="price">78 000 ₽</span></div>
          <div class="product-item"><span class="model">Air 13" M4 16/256 (MW123) Midnight</span><span class="price">88 000 ₽</span></div>
          <div class="product-item"><span class="model">Air 13" M4 16/256 (MW0Y3) Starlight</span><span class="price">86 500 ₽</span></div>
          <div class="product-item"><span class="model">Air 13" M4 16/256 (MW0W3) Silver</span><span class="price">86 000 ₽</span></div>
          <div class="product-item"><span class="model">Air 13" M4 16/256 (MC6T4) Sky Blue</span><span class="price">86 500 ₽</span></div>
          <div class="product-item"><span class="model">Air 13" M4 24/512 (MC6C4) Midnight</span><span class="price">117 000 ₽</span></div>
          <div class="product-item"><span class="model">Air 13" M4 24/512 (MC6V4) Sky Blue</span><span class="price">116 500 ₽</span></div>
        </div>

        <div class="product-category">
          <h4>💻 MacBook Air 15"</h4>
          <div class="product-item"><span class="model">Air 15" M3 8/256 (MRYR3) Starlight</span><span class="price">82 000 ₽</span></div>
          <div class="product-item"><span class="model">Air 15" M3 8/512 (MRYV3) Midnight</span><span class="price">104 000 ₽</span></div>
          <div class="product-item"><span class="model">Air 15" M3 16/512 (MXD43) Midnight</span><span class="price">117 500 ₽</span></div>
          <div class="product-item"><span class="model">Air 15" M3 24/512 (MC9L4) Midnight</span><span class="price">126 500 ₽</span></div>
          <div class="product-item"><span class="model">Air 15" M3 24/512 (MC9K4) Starlight</span><span class="price">128 000 ₽</span></div>
          <div class="product-item"><span class="model">Air 15" M4 16/256 (MW1G3) Silver</span><span class="price">101 500 ₽</span></div>
          <div class="product-item"><span class="model">Air 15" M4 (MC7D4) Sky Blue</span><span class="price">135 000 ₽</span></div>
        </div>

        <div class="product-category pro">
          <h4>💻 MacBook Pro</h4>
          <div class="product-item"><span class="model">Pro 14" M3 8/1TB (MTL83) Gray</span><span class="price">117 000 ₽</span></div>
          <div class="product-item"><span class="model">Pro 16" M1 Max 32/1TB (MK1A3) Gray</span><span class="price">180 000 ₽</span></div>
          <div class="product-item"><span class="model">Pro 16" M1 16/512 (MK183) Gray</span><span class="price">124 000 ₽</span></div>
        </div>
      </div>
    </div>`,
    block_type: "macbook",
    position: 5,
  },

  {
    title: "iPad и Apple Watch",
    content: `<div class="products-section">
      <h3>📱 iPad / ⌚ Apple Watch</h3>

      <div class="products-grid">
        <div class="product-category">
          <h4>📱 iPad</h4>
          <div class="product-item"><span class="model">iPad 10 256GB Blue Wi-Fi 🇺🇸</span><span class="price">33 000 ₽</span></div>
          <div class="product-item"><span class="model">iPad 11 256GB Blue Wi-Fi 🇺🇸</span><span class="price">38 100 ₽</span></div>
          <div class="product-item"><span class="model">iPad Mini 6 256GB Pink LTE 🇺🇸</span><span class="price">66 700 ₽</span></div>
          <div class="product-item"><span class="model">iPad Mini 7 256GB Purple Wi-Fi 🇺🇸</span><span class="price">48 500 ₽</span></div>
          <div class="product-item"><span class="model">iPad Air 11" M2 128GB Blue Wi-Fi 🇺🇸</span><span class="price">44 700 ₽</span></div>
          <div class="product-item"><span class="model">iPad Air 13" M2 256GB Starlight Wi-Fi 🇺🇸</span><span class="price">69 000 ₽</span></div>
          <div class="product-item"><span class="model">iPad Air 11" M3 128GB Purple Wi-Fi 🇺🇸</span><span class="price">48 000 ₽</span></div>
          <div class="product-item"><span class="model">iPad Air 13" M3 128GB Gray Wi-Fi 🇺🇸</span><span class="price">63 800 ₽</span></div>
          <div class="product-item"><span class="model">iPad Pro 11" M4 256GB Silver Wi-Fi 🇺🇸</span><span class="price">81 000 ₽</span></div>
          <div class="product-item"><span class="model">iPad Pro 13" M4 256GB Black Wi-Fi 🇺🇸</span><span class="price">98 000 ₽</span></div>
        </div>

        <div class="product-category">
          <h4>🖊️ Apple Pencil</h4>
          <div class="product-item"><span class="model">Apple Pencil 1 🇪🇺</span><span class="price">10 000 ₽</span></div>
          <div class="product-item"><span class="model">Apple Pencil 2 🇪🇺</span><span class="price">8 000 ₽</span></div>
          <div class="product-item"><span class="model">Apple Pencil Type-C 🇪🇺</span><span class="price">6 800 ₽</span></div>
          <div class="product-item"><span class="model">Apple Pencil Pro 🇪🇺</span><span class="price">10 400 ₽</span></div>
        </div>

        <div class="product-category">
          <h4>⌚ Apple Watch</h4>
          <div class="product-item"><span class="model">Apple Watch SE2 40mm Midnight (2024) 🇺🇸</span><span class="price">16 900 ₽</span></div>
          <div class="product-item"><span class="model">Apple Watch SE2 44mm Midnight (2024) 🇺🇸</span><span class="price">19 100 ₽</span></div>
          <div class="product-item"><span class="model">Apple Watch S9 45mm Midnight 🇺🇸</span><span class="price">27 000 ₽</span></div>
          <div class="product-item"><span class="model">Apple Watch S10 42mm Jet Black 🇺🇸</span><span class="price">28 300 ₽</span></div>
          <div class="product-item"><span class="model">Apple Watch S10 46mm Rose Gold 🇺🇸</span><span class="price">31 200 ₽</span></div>
          <div class="product-item"><span class="model">Apple Watch Ultra Black Gray 🇺🇸</span><span class="price">56 700 ₽</span></div>
          <div class="product-item"><span class="model">Apple Watch Ultra 2 Black/Dark Green (2024) 🇺🇸</span><span class="price">63 500 ₽</span></div>
        </div>

        <div class="product-category">
          <h4>🎧 AirPods</h4>
          <div class="product-item"><span class="model">AirPods 4</span><span class="price">10 600 ₽</span></div>
          <div class="product-item"><span class="model">AirPods 4 ANC</span><span class="price">15 000 ₽</span></div>
          <div class="product-item"><span class="model">AirPods Pro 2 Type-C</span><span class="price">17 400 ₽</span></div>
          <div class="product-item"><span class="model">AirPods Max USB-C Midnight</span><span class="price">45 000 ₽</span></div>
          <div class="product-item"><span class="model">AirPods Max USB-C Blue</span><span class="price">43 900 ₽</span></div>
          <div class="product-item"><span class="model">AirPods Max USB-C Orange</span><span class="price">43 800 ₽</span></div>
        </div>
      </div>
    </div>`,
    block_type: "ipad_watch",
    position: 6,
  },

  {
    title: "Прочие товары",
    content: `<div class="products-section">
      <h3>📱 Samsung / Xiaomi / Sony / Meta / Другие</h3>

      <div class="products-grid">
        <div class="product-category">
          <h4>📱 Samsung Galaxy</h4>
          <div class="product-item"><span class="model">Samsung S25 12/128GB Navy 🇪🇺</span><span class="price">49 200 ₽</span></div>
          <div class="product-item"><span class="model">Samsung S25+ 12/256GB Mint 🇦🇪</span><span class="price">58 200 ₽</span></div>
          <div class="product-item"><span class="model">Samsung S25 Ultra 12/256GB Black 🇦🇪</span><span class="price">68 500 ₽</span></div>
          <div class="product-item"><span class="model">Samsung S24 Ultra 12/256GB Black 🇿🇦</span><span class="price">65 000 ₽</span></div>
          <div class="product-item"><span class="model">Samsung Z Flip6 12/256GB Blue 🇪🇺</span><span class="price">55 500 ₽</span></div>
          <div class="product-item"><span class="model">Samsung Z Fold6 12/256GB Navy 🇪🇺</span><span class="price">90 500 ₽</span></div>
          <div class="product-item"><span class="model">Samsung A55 8/256GB Navy 🇰🇿</span><span class="price">27 000 ₽</span></div>
          <div class="product-item"><span class="model">Samsung Galaxy Buds 3 Pro Silver</span><span class="price">8 900 ₽</span></div>
        </div>

        <div class="product-category">
          <h4>📱 Google Pixel</h4>
          <div class="product-item"><span class="model">Pixel 6 128GB Black 🇬🇧</span><span class="price">22 500 ₽</span></div>
          <div class="product-item"><span class="model">Pixel 7 128GB Obsidian 🇺🇸</span><span class="price">26 000 ₽</span></div>
          <div class="product-item"><span class="model">Pixel 8 256GB Rose 🇺🇸</span><span class="price">41 600 ₽</span></div>
          <div class="product-item"><span class="model">Pixel 9 Pro XL 1TB Obsidian 🇨🇦</span><span class="price">98 000 ₽</span></div>
        </div>

        <div class="product-category">
          <h4>📱 Xiaomi</h4>
          <div class="product-item"><span class="model">Xiaomi 14T Pro 12/256GB Titan Blue 🇪🇺</span><span class="price">39 000 ₽</span></div>
          <div class="product-item"><span class="model">Xiaomi 15 12/512GB Black 🇪🇺</span><span class="price">57 200 ₽</span></div>
          <div class="product-item"><span class="model">Xiaomi Mix Flip 12/512GB Black 🇬🇧</span><span class="price">81 500 ₽</span></div>
          <div class="product-item"><span class="model">Redmi Note 14 Pro 12/256GB Black 🇰🇿</span><span class="price">20 100 ₽</span></div>
          <div class="product-item"><span class="model">POCO F6 Pro 12/512GB Black 🇪🇺</span><span class="price">31 100 ₽</span></div>
        </div>

        <div class="product-category">
          <h4>🎧 Sony</h4>
          <div class="product-item"><span class="model">Sony WH-1000XM5 Black 🇯🇵</span><span class="price">19 000 ₽</span></div>
          <div class="product-item"><span class="model">Sony WF-1000XM5 Black 🇯🇵</span><span class="price">15 300 ₽</span></div>
          <div class="product-item"><span class="model">Sony DualSense (разные цвета)</span><span class="price">6 000 ₽</span></div>
        </div>

        <div class="product-category">
          <h4>🎮 Игровые консоли</h4>
          <div class="product-item"><span class="model">Meta Oculus Quest 3S 128GB + Batman 🇪🇺</span><span class="price">27 000 ₽</span></div>
          <div class="product-item"><span class="model">Steam Deck OLED 512GB 🇬🇧</span><span class="price">46 000 ₽</span></div>
          <div class="product-item"><span class="model">Xbox Series S 1TB Carbon Black 🇬🇧</span><span class="price">32 300 ₽</span></div>
        </div>

        <div class="product-category">
          <h4>📷 Экшн-камеры</h4>
          <div class="product-item"><span class="model">GoPro Hero 13 Black + 64GB 🇪🇺</span><span class="price">27 000 ₽</span></div>
          <div class="product-item"><span class="model">Insta360 X3 🇪🇺</span><span class="price">27 000 ₽</span></div>
          <div class="product-item"><span class="model">Insta360 X4 🇪🇺</span><span class="price">34 300 ₽</span></div>
        </div>

        <div class="product-category">
          <h4>⌚ Garmin</h4>
          <div class="product-item"><span class="model">Garmin Epix Pro Gen 2 42mm Silver 🇪🇺</span><span class="price">65 400 ₽</span></div>
          <div class="product-item"><span class="model">Garmin Epix Pro Gen 2 51mm Titanium 🇪🇺</span><span class="price">85 500 ₽</span></div>
          <div class="product-item"><span class="model">Garmin MARQ Golfer Gen 2 Carbon 🇪🇺</span><span class="price">205 500 ₽</span></div>
        </div>
      </div>

      <div class="product-info">
        <p>🔍 Можно найти продукцию Дайсон, Гармин и Sony PS5, но нужно запрашивать!</p>
        <p>✅ Разумеется, все оригинал.</p>
        <p><strong>🏪 С ув. Стингер</strong></p>
      </div>
    </div>`,
    block_type: "other_products",
    position: 7,
  },
]

// Функция для обновления базы данных
async function updateDatabase() {
  const db = new Database()

  try {
    // Ждем инициализации базы данных
    await new Promise((resolve) => setTimeout(resolve, 2000))

    console.log("🗑️ Очищаем старые данные...")

    // Очищаем старые данные
    await new Promise((resolve, reject) => {
      db.db.run("DELETE FROM content_blocks", (err) => {
        if (err) {
          console.error("Ошибка очистки content_blocks:", err)
          reject(err)
        } else {
          console.log("✅ Таблица content_blocks очищена")
          resolve()
        }
      })
    })

    await new Promise((resolve, reject) => {
      db.db.run("DELETE FROM forum_info", (err) => {
        if (err) {
          console.error("Ошибка очистки forum_info:", err)
          reject(err)
        } else {
          console.log("✅ Таблица forum_info очищена")
          resolve()
        }
      })
    })

    // Добавляем новую информацию о форуме
    console.log("📊 Добавляем новую информацию о форуме...")
    await new Promise((resolve, reject) => {
      db.db.run(
        `INSERT INTO forum_info (
          id, section, topic_title, created_date, messages_count, views_count, participants_count
        ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          1,
          "Объявления и реклама",
          "StiNGer - Официальный прайс-лист Apple техники в Омске",
          "12 Марта 2014",
          16071,
          10436345,
          808,
        ],
        (err) => {
          if (err) {
            console.error("Ошибка добавления forum_info:", err)
            reject(err)
          } else {
            console.log("✅ Информация о форуме добавлена")
            resolve()
          }
        }
      )
    })

    // Добавляем новые контентные блоки
    console.log("📝 Добавляем новые контентные блоки...")
    for (const block of newContentBlocks) {
      await new Promise((resolve, reject) => {
        db.db.run(
          `INSERT INTO content_blocks (title, content, block_type, position, is_active)
           VALUES (?, ?, ?, ?, 1)`,
          [block.title, block.content, block.block_type, block.position],
          (err) => {
            if (err) {
              console.error(`Ошибка добавления блока "${block.title}":`, err)
              reject(err)
            } else {
              console.log(`✅ Блок "${block.title}" добавлен`)
              resolve()
            }
          }
        )
      })
    }

    console.log("🎉 База данных успешно обновлена!")
    console.log(`📊 Добавлено ${newContentBlocks.length} контентных блоков`)
  } catch (error) {
    console.error("❌ Ошибка обновления базы данных:", error)
  } finally {
    db.close()
  }
}

// Запускаем обновление
updateDatabase()
