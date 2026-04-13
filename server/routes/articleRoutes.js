const express = require('express');
const router = express.Router();
const { Article, Folder } = require('../models/index'); 
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// --- 1. ПОИСК (Доступен всем) ---
router.get('/search/:query', async (req, res) => {
    try {
        const { query } = req.params;
        const articles = await Article.findAll({
            where: {
                [Op.or]: [
                    { title: { [Op.like]: `%${query}%` } },
                    { content: { [Op.like]: `%${query}%` } }
                ]
            },
            attributes: ['id', 'title', 'folderId']
        });
        res.json(articles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/', async (req, res) => {
    try {
        const articles = await Article.findAll({ 
            order: [['updatedAt', 'DESC']],
            attributes: ['id', 'title', 'updatedAt', 'folderId'] // Список полей для безопасности
        });
        res.json(articles);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// --- 3. ПОЛУЧИТЬ КОНКРЕТНУЮ СТАТЬЮ (Доступно всем) ---
router.get('/:id', async (req, res) => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) return res.status(404).json({ message: 'Статья не найдена' });

        // 1. Собираем подробный путь для Breadcrumbs (ID + Name)
        const breadcrumbs = [];
        let curId = article.folderId;
        while (curId) {
            const folder = await Folder.findByPk(curId, { attributes: ['id', 'name', 'parentId'] });
            if (folder) {
                breadcrumbs.unshift({ id: folder.id, name: folder.name });
                curId = folder.parentId;
            } else { curId = null; }
        }

        // 2. Находим соседа (Назад / Вперед) в этой же папке
        const siblings = await Article.findAll({
            where: { folderId: article.folderId },
            order: [['id', 'ASC']], 
            attributes: ['id', 'title']
        });

        const currentIndex = siblings.findIndex(s => s.id === article.id);
        const prev = siblings[currentIndex - 1] || null;
        const next = siblings[currentIndex + 1] || null;

        res.json({
            ...article.toJSON(),
            breadcrumbPath: breadcrumbs,
            navigation: { prev, next }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * МАРШРУТЫ НИЖЕ ЗАЩИЩЕНЫ 'auth' (Только для админа)
 */

// 4. СОЗДАТЬ СТАТЬЮ
router.post('/', auth, async (req, res) => {
    try {
        const { title, content, folderId, order } = req.body;
        if (!title || !content || !folderId) {
            return res.status(400).json({ message: "Заполните все поля" });
        }
        const article = await Article.create({ title, content, folderId, order: order || 0 });
        res.status(201).json(article);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. ОБНОВИТЬ СТАТЬЮ
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, content, folderId, order } = req.body;
        const article = await Article.findByPk(req.params.id);
        if (!article) return res.status(404).json({ message: 'Статья не найдена' });

        await article.update({
            title: title || article.title,
            content: content || article.content,
            folderId: folderId || article.folderId,
            order: order !== undefined ? order : article.order
        });
        res.json({ message: "Статья обновлена", article });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// 6. УДАЛИТЬ СТАТЬЮ
router.delete('/:id', auth, async (req, res) => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) return res.status(404).json({ message: 'Статья не найдена' });
        await article.destroy();
        res.json({ message: "Удалено" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;