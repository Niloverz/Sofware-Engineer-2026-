const express = require('express');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || 'ryan_afandi_secret_key_2026';
const PORT = process.env.PORT || 3001;

const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'user_db'
});

db.connect((err) => {
    if (err) {
        console.error('Gagal konek ke database:', err);
        return;
    }
    console.log('User Service terhubung ke MySQL (user_db)');
});

// REGISTER
app.post('/register', async (req, res) => {
    const { username, password, role = 'user' } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username dan password wajib diisi' 
        });
    }
    
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const query = 'INSERT INTO users (username, password, role) VALUES (?, ?, ?)';
        db.query(query, [username, hashedPassword, role], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(409).json({ 
                        success: false, 
                        message: 'Username sudah terdaftar' 
                    });
                }
                return res.status(500).json({ 
                    success: false, 
                    message: err.message 
                });
            }
            
            res.json({ 
                success: true, 
                message: 'Registrasi berhasil', 
                userId: result.insertId 
            });
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: error.message 
        });
    }
});

// LOGIN
app.post('/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ 
            success: false, 
            message: 'Username dan password wajib diisi' 
        });
    }
    
    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, users) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: err.message 
            });
        }
        
        if (users.length === 0) {
            return res.status(401).json({ 
                success: false, 
                message: 'Username atau password salah' 
            });
        }
        
        const user = users[0];
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ 
                success: false, 
                message: 'Username atau password salah' 
            });
        }
        
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username, 
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.json({ 
            success: true, 
            message: 'Login berhasil',
            token: token,
            user: { 
                id: user.id, 
                username: user.username, 
                role: user.role 
            }
        });
    });
});

// VERIFY TOKEN
const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token tidak disediakan' 
        });
    }
    
    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Format token salah. Gunakan: Bearer <token>' 
        });
    }
    
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token tidak valid' 
        });
    }
};

app.get('/verify', verifyToken, (req, res) => {
    res.json({ 
        success: true, 
        valid: true, 
        user: req.user 
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`User Service running on port ${PORT}`);
});
