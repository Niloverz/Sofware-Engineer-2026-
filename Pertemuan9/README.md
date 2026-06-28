## Marketplace Order System
Muhammad Ryan Afandi (2410511062)

## Cara Menjalankan dengan Docker
### Prasyarat
Pastikan sudah terinstall di server/laptop:
- Docker
- Docker Compose
- Git (opsional)

## Langkah-langkah:
1. Clone atau Upload Project
2. SSH ke Server
ssh -p 8989 mahasiswa@103.147.92.134
cd ~/MuhammadRyanAfandi_2410511062
3. Jalankan dengan Docker Compose
sudo docker-compose up -d --build
4. Cek Semua Container Berjalan
sudo docker ps
5. Verifikasi Service Berjalan
curlk http://103.147.92.134:35000/health

## Endpoint 
| Service | Port (Host) | Port (Internal) | Deskripsi |
|---------|-------------|-----------------|-----------|
| API Gateway | 35000 | 3000 | Entry point, routing, proxy |
| User Service | 35001 | 3001 | Register, login, JWT |
| Order Service | 35002 | 3002 | CRUD + RabbitMQ publisher |
| Notification Service | - | - | RabbitMQ consumer |
| MySQL | 35005 | 3306 | Database |
| RabbitMQ | 35006, 35007 | 5672, 15672 | Message broker + UI |
 
 
