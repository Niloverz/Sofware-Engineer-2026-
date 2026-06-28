const amqp = require('amqplib');
const axios = require('axios');
require('dotenv').config();

const QUEUE_NAME = 'ryan_order_created';

async function consumeOrders() {
    try {
        // Koneksi ke RabbitMQ
        const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';
        const connection = await amqp.connect(RABBITMQ_URL);
        
        // Buat channel
        const channel = await connection.createChannel();
        
        await channel.assertQueue(QUEUE_NAME, { durable: true });
        
        const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3002';
        
        console.log(`
       NOTIFICATION SERVICE - RYAN AFANDI   
       Queue: ${QUEUE_NAME}
       Status: MENUNGGU PESAN...
   
        `);
        
        channel.prefetch(1);
        
        channel.consume(QUEUE_NAME, async (msg) => {
            if (msg !== null) {
                const order = JSON.parse(msg.content.toString());
                
                console.log('\n===== PESAN DITERIMA =====');
                console.log(`   Order ID    : ${order.orderId}`);
                console.log(`   Dari User   : ${order.username} (ID: ${order.userId})`);
                console.log(`   Produk      : ${order.productName}`);
                console.log(`   Jumlah      : ${order.quantity}`);
                console.log(`   Waktu       : ${order.timestamp}`);
                
                // Simulasi proses notifikasi
                console.log('\nMENGIRIM NOTIFIKASI...');
                console.log(` Email ke: ${order.username}@example.com`);
                console.log(`Pesan: "Pesanan #${order.orderId} untuk ${order.productName} sedang diproses"`);
                
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                // Update status order
                try {
                    const response = await axios.put(
                        `${ORDER_SERVICE_URL}/orders/${order.orderId}/status`,
                        { status: 'processed' }
                    );
                    
                    if (response.data.success) {
                        console.log(`\nOrder #${order.orderId} berhasil diproses`);
                        console.log(`   Status di database: processed`);
                        
                        // Acknowledge pesan (hapus dari queue)
                        channel.ack(msg);
                    } else {
                        throw new Error('Update status gagal');
                    }
                    
                } catch (error) {
                    console.error(`\nGagal update status Order #${order.orderId}:`, error.message);
                    console.log(`   Pesan akan diulang nanti...`);
                    
                    // Negative ack: pesan akan dikirim ulang
                    channel.nack(msg, false, true);
                }
                
                console.log('================================\n');
            }
        });
        
    } catch (error) {
        console.error('Consumer error:', error.message);
        console.log('Menunggu 5 detik sebelum reconnect...');
        setTimeout(consumeOrders, 5000);
    }
}

// JALANKAN CONSUMER
consumeOrders();