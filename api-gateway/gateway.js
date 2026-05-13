const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000;
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3002';

app.use(cors());
app.use(express.json());

// Logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(`${USER_SERVICE_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(`${USER_SERVICE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify
app.get('/api/auth/verify', async (req, res) => {
    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(`${USER_SERVICE_URL}/verify`, {
            method: 'GET',
            headers: { 'Authorization': req.headers.authorization || '' }
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create order
app.post('/api/orders/orders', async (req, res) => {
    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(`${ORDER_SERVICE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': req.headers.authorization || ''
            },
            body: JSON.stringify(req.body)
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Get my orders
app.get('/api/orders/orders/my', async (req, res) => {
    try {
        const fetch = await import('node-fetch');
        const response = await fetch.default(`${ORDER_SERVICE_URL}/orders/my`, {
            method: 'GET',
            headers: {
                'Authorization': req.headers.authorization || ''
            }
        });
        const data = await response.json();
        res.status(response.status).json(data);
    } catch (error) {
        console.error('Proxy error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        gateway: 'running',
        services: {
            user_service: USER_SERVICE_URL,
            order_service: ORDER_SERVICE_URL
        }
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`API Gateway running on port ${PORT}`);
});