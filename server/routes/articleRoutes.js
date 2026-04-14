/* routes/articleRoutes.js */
const express = require('express');
const router = express.Router();
const { Article, Folder } = require('../models/index'); 
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// --- 1. ПОИСК ---
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
            attributes: ['id', 'title', 'folderId', 'type']
        });
        res.json(articles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// --- 2. СПИСОК ВСЕХ СТАТЕЙ ---
router.get('/', async (req, res) => {
    try {
        const articles = await Article.findAll({ 
            order: [['updatedAt', 'DESC']],
            attributes: ['id', 'title', 'updatedAt', 'folderId', 'type']
        });
        res.json(articles);
    } catch (err) { 
        res.status(500).json({ error: err.message }); 
    }
});

// --- 3. ПОЛУЧИТЬ КАРТОЧКУ СТАТЬИ / PDF ---
router.get('/:id', async (req, res) => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) return res.status(404).json({ message: 'Запись не найдена' });

        // Сборка Breadcrumbs
        const breadcrumbs = [];
        let curId = article.folderId;
        let depth = 0; 
        while (curId && depth < 10) {
            const folder = await Folder.findByPk(curId, { attributes: ['id', 'name', 'parentId'] });
            if (folder) {
                breadcrumbs.unshift({ id: folder.id, name: folder.name, isFolder: true });
                curId = folder.parentId;
            } else { curId = null; }
            depth++;
        }
        breadcrumbs.push({ id: article.id, name: article.title, isFolder: false, type: article.type });

        // Соседи по папке
        const siblings = await Article.findAll({
            where: { folderId: article.folderId },
            order: [['id', 'ASC']], 
            attributes: ['id', 'title', 'type']
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

// --- 4. СОЗДАТЬ СТАТЬЮ / PDF (AUTH) ---
router.post('/', auth, async (req, res) => {
    try {
        const { title, content, folderId, type, fileUrl, order } = req.body;
        if (!title || !folderId) {
            return res.status(400).json({ message: "Заголовок и папка обязательны" });
        }
        const article = await Article.create({ 
            title, 
            content: content || '', 
            folderId, 
            type: type || 'markdown',
            fileUrl: fileUrl || null,
            order: order || 0 
        });
        res.status(201).json(article);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 5. ОБНОВИТЬ (AUTH) ---
router.put('/:id', auth, async (req, res) => {
    try {
        const { title, content, folderId, order, fileUrl } = req.body;
        const article = await Article.findByPk(req.params.id);
        if (!article) return res.status(404).json({ message: 'Запись не найдена' });

        await article.update({
            title: title || article.title,
            content: content || article.content,
            folderId: folderId || article.folderId,
            fileUrl: fileUrl || article.fileUrl,
            order: order !== undefined ? order : article.order
        });
        res.json({ message: "Обновлено", article });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- 6. УДАЛИТЬ (AUTH) ---
router.delete('/:id', auth, async (req, res) => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) return res.status(404).json({ message: 'Запись не найдена' });
        await article.destroy();
        res.json({ message: "Удалено" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;