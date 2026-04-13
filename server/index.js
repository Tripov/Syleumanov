require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const { initDB } = require('./models/index');
const folderRoutes = require('./routes/folderRoutes');
const articleRoutes = require('./routes/articleRoutes');
const authRoutes = require('./routes/authRoutes');
const authMiddleware = require('./middleware/auth');
const app = express();
app.use(cors()); 
app.use(express.json());

const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|pdf/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) return cb(null, true);
        cb(new Error("Только изображения!"));
    }
});

app.post('/api/upload', authMiddleware, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: "Файл не загружен" });
    
    const imageUrl = `http://localhost:${process.env.PORT || 5000}/uploads/${req.file.filename}`;
    res.json({ url: imageUrl });
});

app.use('/api/folders', folderRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('API Системы мануалов работает v1.0');
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
    try {
        await initDB();
        
        app.listen(PORT, () => {
            console.log(`=========================================`);
            console.log(`🚀 Сервер запущен: http://localhost:${PORT}`);
            console.log(`📁 Папка загрузок: ${path.join(__dirname, 'uploads')}`);
            console.log(`=========================================`);
        });
    } catch (error) {
        console.error("Критическая ошибка при запуске:", error);
        process.exit(1);
    }
};

startServer();