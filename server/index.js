import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { Database } from './database.js'
import { authRouter } from './routes/auth.js'
import { contentRouter } from './routes/content.js'

const app = express()
const PORT = process.env.PORT || 3001

// Инициализируем базу данных
const db = new Database()

// Middlewares
app.use(helmet())
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true
  })
)

// Rate limiting - ограничение запросов
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP за 15 минут
  message: 'Слишком много запросов с этого IP, попробуйте позже.'
})
app.use(limiter)

app.use(express.json())

// Подключаем маршруты
app.use('/api/auth', authRouter)
app.use('/api/content', contentRouter)

// Базовый маршрут
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Сервер StiNGer Forum работает!' })
})

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Что-то пошло не так!' })
})

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер StiNGer Forum запущен на порту ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`)
})

export { db }
