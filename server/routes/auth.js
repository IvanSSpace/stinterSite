import bcrypt from "bcryptjs"
import express from "express"
import jwt from "jsonwebtoken"
import { db } from "../index.js"
import { JWT_SECRET } from "../middleware/auth.js"

const router = express.Router()

// Авторизация пользователя
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body

    if (!username || !password) {
      return res.status(400).json({ error: "Логин и пароль обязательны" })
    }

    // Поиск пользователя в базе данных
    const user = await db.getUser(username)

    if (!user) {
      return res.status(401).json({ error: "Неверный логин или пароль" })
    }

    // Проверка пароля
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return res.status(401).json({ error: "Неверный логин или пароль" })
    }

    // Создание JWT токена
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "24h" }
    )

    res.json({
      message: "Авторизация успешна",
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Ошибка авторизации:", error)
    res.status(500).json({ error: "Ошибка сервера" })
  }
})

// Проверка токена
router.get("/verify", (req, res) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Токен не предоставлен" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Недействительный токен" })
    }

    res.json({
      valid: true,
      user: {
        userId: user.userId,
        username: user.username,
        role: user.role,
      },
    })
  })
})

export { router as authRouter }
