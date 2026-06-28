<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Koneksi ke database
$host = 'localhost';
$user = 'mahasiswa';
$password = 'akucintafik';
$database = 'service_b_db';

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    die(json_encode([
        'success' => false,
        'message' => 'Database connection failed: ' . $conn->connect_error
    ]));
}

// Parsing URL
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path_parts = explode('/', trim($path, '/'));
$endpoint = isset($path_parts[1]) ? $path_parts[1] : '';
$id = isset($path_parts[2]) ? $path_parts[2] : null;

$method = $_SERVER['REQUEST_METHOD'];

// Handle OPTIONS (CORS preflight)
if ($method === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Routing
if ($endpoint === 'items') {
    switch ($method) {
        case 'GET':
            if ($id) {
                // GET /items/{id}
                $stmt = $conn->prepare("SELECT * FROM items WHERE id = ?");
                $stmt->bind_param("i", $id);
                $stmt->execute();
                $result = $stmt->get_result();
                $data = $result->fetch_assoc();
                
                if ($data) {
                    echo json_encode(['success' => true, 'data' => $data]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'message' => 'Item not found']);
                }
            } else {
                // GET /items
                $result = $conn->query("SELECT * FROM items ORDER BY id DESC");
                $data = [];
                while ($row = $result->fetch_assoc()) {
                    $data[] = $row;
                }
                echo json_encode(['success' => true, 'data' => $data]);
            }
            break;
            
        case 'POST':
            // POST /items
            $input = json_decode(file_get_contents('php://input'), true);
            
            if (!isset($input['nama']) || empty($input['nama'])) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Nama wajib diisi']);
                break;
            }
            
            $nama = $input['nama'];
            $deskripsi = isset($input['deskripsi']) ? $input['deskripsi'] : '';
            
            $stmt = $conn->prepare("INSERT INTO items (nama, deskripsi) VALUES (?, ?)");
            $stmt->bind_param("ss", $nama, $deskripsi);
            
            if ($stmt->execute()) {
                echo json_encode([
                    'success' => true,
                    'message' => 'Item berhasil ditambahkan',
                    'data' => ['id' => $conn->insert_id, 'nama' => $nama, 'deskripsi' => $deskripsi]
                ]);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Gagal menambahkan item']);
            }
            break;
            
        case 'PUT':
            // PUT /items/{id}
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID diperlukan']);
                break;
            }
            
            $input = json_decode(file_get_contents('php://input'), true);
            $nama = isset($input['nama']) ? $input['nama'] : null;
            $deskripsi = isset($input['deskripsi']) ? $input['deskripsi'] : '';
            
            if ($nama) {
                $stmt = $conn->prepare("UPDATE items SET nama = ?, deskripsi = ? WHERE id = ?");
                $stmt->bind_param("ssi", $nama, $deskripsi, $id);
            } else {
                $stmt = $conn->prepare("UPDATE items SET deskripsi = ? WHERE id = ?");
                $stmt->bind_param("si", $deskripsi, $id);
            }
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Item berhasil diupdate']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Gagal mengupdate item']);
            }
            break;
            
        case 'DELETE':
            // DELETE /items/{id}
            if (!$id) {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID diperlukan']);
                break;
            }
            
            $stmt = $conn->prepare("DELETE FROM items WHERE id = ?");
            $stmt->bind_param("i", $id);
            
            if ($stmt->execute()) {
                echo json_encode(['success' => true, 'message' => 'Item berhasil dihapus']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Gagal menghapus item']);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    }
} else {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'Endpoint tidak ditemukan']);
}

$conn->close();
?>