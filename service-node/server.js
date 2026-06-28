const express = require('express');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Konfigurasi Service B (PHP)
const SERVICE_B_URL = 'http://localhost:8000/index.php';

// Middleware
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
    windowMs: 60 * 1000,      
    max: 5,                    
    message: {
        success: false,
        error: 'TERLALU BANYAK PERMINTAAN!',
        message: 'Anda telah melebihi batas 5 request per menit. Silakan coba lagi setelah 1 menit.'
    },
    standardHeaders: true,     
    legacyHeaders: false,
});

// Terapkan rate limiting ke SEMUA endpoint API
app.use('/api/', limiter);

app.get('/api/items', async (req, res) => {
    try {
        const response = await axios.get(`${SERVICE_B_URL}/items`);
        res.json({
            success: true,
            source: 'Service A (Node.js)',
            data: response.data.data,
            message: 'Data berhasil diambil dari Service B (PHP)'
        });
    } catch (error) {
        console.error('Error calling Service B:', error.message);
        res.status(500).json({
            success: false,
            message: 'Gagal mengambil data dari Service B',
            error: error.message
        });
    }
});

app.get('/api/items/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const response = await axios.get(`${SERVICE_B_URL}/items/${id}`);
        res.json({
            success: true,
            source: 'Service A (Node.js)',
            data: response.data.data,
            message: 'Data berhasil diambil dari Service B (PHP)'
        });
    } catch (error) {
        if (error.response && error.response.status === 404) {
            res.status(404).json({ success: false, message: 'Item tidak ditemukan' });
        } else {
            res.status(500).json({ success: false, message: error.message });
        }
    }
});

app.post('/api/items', async (req, res) => {
    const { nama, deskripsi } = req.body;
    
    if (!nama || nama.trim() === '') {
        return res.status(400).json({
            success: false,
            message: 'Nama wajib diisi'
        });
    }
    
    try {
        const response = await axios.post(`${SERVICE_B_URL}/items`, {
            nama: nama,
            deskripsi: deskripsi || ''
        });
        res.json({
            success: true,
            source: 'Service A (Node.js)',
            data: response.data.data,
            message: 'Item berhasil ditambahkan via Service B (PHP)'
        });
    } catch (error) {
        console.error('Error calling Service B:', error.message);
        res.status(500).json({
            success: false,
            message: 'Gagal menambahkan data ke Service B',
            error: error.message
        });
    }
});

app.put('/api/items/:id', async (req, res) => {
    const { id } = req.params;
    const { nama, deskripsi } = req.body;
    
    try {
        const response = await axios.put(`${SERVICE_B_URL}/items/${id}`, {
            nama: nama,
            deskripsi: deskripsi
        });
        res.json({
            success: true,
            source: 'Service A (Node.js)',
            message: 'Item berhasil diupdate via Service B (PHP)'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal mengupdate data',
            error: error.message
        });
    }
});

app.delete('/api/items/:id', async (req, res) => {
    const { id } = req.params;
    
    try {
        const response = await axios.delete(`${SERVICE_B_URL}/items/${id}`);
        res.json({
            success: true,
            source: 'Service A (Node.js)',
            message: 'Item berhasil dihapus via Service B (PHP)'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Gagal menghapus data',
            error: error.message
        });
    }
});

app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        service: 'Service A (Node.js)',
        rate_limiting: '5 requests per minute'
    });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(` PORT berjalan di: ${PORT}`);
});