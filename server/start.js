// Простой скрипт запуска сервера
console.log("🚀 Запуск сервера StiNGer Forum...")

import("./index.js").catch((err) => {
  console.error("❌ Ошибка запуска сервера:", err)
  process.exit(1)
})
