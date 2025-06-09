import express from "express"
import { db } from "../index.js"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Получение всех контентных блоков (публичный доступ)
router.get("/blocks", async (req, res) => {
  try {
    const blocks = await db.getAllContentBlocks()
    const forumInfo = await db.getForumInfo()

    res.json({
      success: true,
      forumInfo,
      blocks,
    })
  } catch (error) {
    console.error("Ошибка получения контента:", error)
    res.status(500).json({ error: "Ошибка получения контента" })
  }
})

// Получение конкретного блока (только для админов)
router.get("/blocks/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Недостаточно прав доступа" })
    }

    const block = await db.getContentBlock(req.params.id)

    if (!block) {
      return res.status(404).json({ error: "Блок не найден" })
    }

    res.json({ success: true, block })
  } catch (error) {
    console.error("Ошибка получения блока:", error)
    res.status(500).json({ error: "Ошибка получения блока" })
  }
})

// Обновление блока (только для админов)
router.put("/blocks/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Недостаточно прав доступа" })
    }

    const { title, content, block_type, position, is_active } = req.body

    if (!title || !content || !block_type) {
      return res.status(400).json({ error: "Все поля обязательны" })
    }

    const changes = await db.updateContentBlock(req.params.id, {
      title,
      content,
      block_type,
      position: position || 0,
      is_active: is_active !== undefined ? is_active : 1,
    })

    if (changes === 0) {
      return res.status(404).json({ error: "Блок не найден" })
    }

    res.json({
      success: true,
      message: "Блок успешно обновлен",
      changes,
    })
  } catch (error) {
    console.error("Ошибка обновления блока:", error)
    res.status(500).json({ error: "Ошибка обновления блока" })
  }
})

// Создание нового блока (только для админов)
router.post("/blocks", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Недостаточно прав доступа" })
    }

    const { title, content, block_type, position } = req.body

    if (!title || !content || !block_type) {
      return res.status(400).json({ error: "Все поля обязательны" })
    }

    const blockId = await db.createContentBlock({
      title,
      content,
      block_type,
      position: position || 0,
    })

    res.status(201).json({
      success: true,
      message: "Блок успешно создан",
      blockId,
    })
  } catch (error) {
    console.error("Ошибка создания блока:", error)
    res.status(500).json({ error: "Ошибка создания блока" })
  }
})

// Удаление блока (только для админов)
router.delete("/blocks/:id", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Недостаточно прав доступа" })
    }

    const changes = await db.deleteContentBlock(req.params.id)

    if (changes === 0) {
      return res.status(404).json({ error: "Блок не найден" })
    }

    res.json({
      success: true,
      message: "Блок успешно удален",
    })
  } catch (error) {
    console.error("Ошибка удаления блока:", error)
    res.status(500).json({ error: "Ошибка удаления блока" })
  }
})

// Получение информации о форуме
router.get("/forum-info", async (req, res) => {
  try {
    const forumInfo = await db.getForumInfo()
    res.json({ success: true, forumInfo })
  } catch (error) {
    console.error("Ошибка получения информации о форуме:", error)
    res.status(500).json({ error: "Ошибка получения информации о форуме" })
  }
})

export { router as contentRouter }
