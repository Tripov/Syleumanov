const express = require('express');
const router = express.Router();
const { Folder, Article } = require('../models/index');
const auth = require('../middleware/auth');

router.get('/tree', async (req, res) => {
    try {
        const allFolders = await Folder.findAll({ raw: true });
        // ДОБАВИЛИ 'type' в attributes
        const allArticles = await Article.findAll({ 
            attributes: ['id', 'title', 'folderId', 'type'], 
            raw: true 
        });

        const buildTree = (parentId = null) => {
            return allFolders
                .filter(f => f.parentId === parentId)
                .map(folder => ({
                    ...folder,
                    type: 'folder',
                    children: [
                        ...buildTree(folder.id),
                        ...allArticles
                            .filter(a => a.folderId === folder.id)
                            .map(a => ({ 
                                ...a, 
                                // type тут берется из БД (pdf или markdown)
                                name: a.title 
                            }))
                    ]
                }));
        };
        res.json(buildTree(null));
    } catch (err) { res.status(500).json({ error: err.message }); }
});

// Остальные твои роуты (put, post, delete) остаются без изменений
router.put('/:id', auth, async (req, res) => {
    try {
        await Folder.update(req.body, { where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', auth, async (req, res) => {
    try {
        const { name, parentId } = req.body;
        const existing = await Folder.findOne({ where: { name, parentId: parentId || null } });
        if (existing) {
            return res.status(400).json({ error: "Папка с таким названием уже существует в этом разделе" });
        }
        const folder = await Folder.create({ name, parentId: parentId || null });
        res.json(folder);
    } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
    try {
        await Folder.destroy({ where: { id: req.params.id } });
        res.json({ message: "Папка удалена" });
    } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;