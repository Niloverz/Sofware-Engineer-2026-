const express = require('express');
const mysql = require('mysql2');
const amqp = require('amqplib');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3002;

// Koneksi Database
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'order_db'  
});

db.connect((err) => {
    if (err) {
        console.error('Gagal konek ke database:', err);
        return;
    }
    console.log('Order Service terhubung ke MySQL');
});

// KONEKSI RABBITMQ
let channel;
async function connectRabbitMQ() {
    try {
        const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
        const connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        await channel.assertQueue('ryan_order_created', { durable: true });
        console.log('Order Service terhubung ke RabbitMQ');
        console.log('Queue: ryan_order_created');
    } catch (error) {
        console.error('RabbitMQ error:', error.message);
    }
}

// VERIFIKASI TOKEN (panggil user service)
async function verifyToken(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token tidak disediakan' 
        });
    }
    
    try {
        const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
        const response = await axios.get(`${USER_SERVICE_URL}/verify`, {
            headers: { Authorization: token }
        });
        req.user = response.data.user;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: 'Token tidak valid' 
        });
    }
}

// CREATE ORDER
app.post('/orders', verifyToken, async (req, res) => {
    const { product_name, quantity } = req.body;
    const user_id = req.user.userId;
    const username = req.user.username;
    
    if (!product_name || !quantity) {
        return res.status(400).json({ 
            success: false, 
            message: 'product_name dan quantity wajib diisi' 
        });
    }
    
    if (quantity <= 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'Quantity harus lebih dari 0' 
        });
    }
    
    const query = 'INSERT INTO orders (user_id, product_name, quantity, status) VALUES (?, ?, ?, ?)';
    db.query(query, [user_id, product_name, quantity, 'pending'], async (err, result) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: err.message 
            });
        }
        
        const orderData = {
            orderId: result.insertId,
            userId: user_id,
            username: username,
            productName: product_name,
            quantity: quantity,
            timestamp: new Date().toISOString()
        };
        
        if (channel) {
            try {
                channel.sendToQueue('ryan_order_created', Buffer.from(JSON.stringify(orderData)));
                console.log(`Event sent: Order #${result.insertId} dari ${username}`);
            } catch (err) {
                console.error('Gagal kirim ke RabbitMQ:', err);
            }
        } else {
            console.log('RabbitMQ tidak terhubung');
        }
        
        res.json({ 
            success: true, 
            message: 'Order berhasil dibuat',
            data: {
                orderId: result.insertId,
                product_name: product_name,
                quantity: quantity,
                status: 'pending'
            }
        });
    });
});

// GET MY ORDERS
app.get('/orders/my', verifyToken, (req, res) => {
    const query = 'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC';
    db.query(query, [req.user.userId], (err, results) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: err.message 
            });
        }
        res.json({ 
            success: true, 
            data: results 
        });
    });
});

// UPDATE STATUS (dipanggil notification service)
app.put('/orders/:id/status', (req, res) => {
    const { status } = req.body;
    const validStatus = ['pending', 'processed', 'failed'];
    
    if (!validStatus.includes(status)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Status tidak valid' 
        });
    }
    
    const query = 'UPDATE orders SET status = ? WHERE id = ?';
    db.query(query, [status, req.params.id], (err) => {
        if (err) {
            return res.status(500).json({ 
                success: false, 
                message: err.message 
            });
        }
        res.json({ 
            success: true, 
            message: 'Status updated' 
        });
    });
});

// JALANKAN SERVER
connectRabbitMQ();
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Order Service running on port ${PORT}`);
});