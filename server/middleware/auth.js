import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "stiner-forum-secret-key-2024"

// Middleware для проверки JWT токена
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ error: "Токен доступа требуется" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Недействительный токен" })
    }
    req.user = user
    next()
  })
}

export { JWT_SECRET }
