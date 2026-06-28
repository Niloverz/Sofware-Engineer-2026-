<?php
// Set header JSON & CORS (agar bisa di-proxy)
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$students = [
    1 => ["id" => 1, "name" => "Muhammad Ryan Afandi", "major" => "Informatika"],
    2 => ["id" => 2, "name" => "Sean Nicholas", "major" => "Sistem Informasi"]
];

$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '/';
$path = rtrim($path, '/');

// GET /students
if ($method === 'GET' && $path === '/students') {
    echo json_encode(array_values($students));
    exit();
}

// GET /students/{id}
if ($method === 'GET' && preg_match('/^\/students\/(\d+)$/', $path, $matches)) {
    $id = $matches[1];
    if (isset($students[$id])) {
        echo json_encode($students[$id]);
    } else {
        http_response_code(404);
        echo json_encode(["error" => "Mahasiswa tidak ditemukan"]);
    }
    exit();
}

// POST /students
if ($method === 'POST' && $path === '/students') {
    $input = json_decode(file_get_contents('php://input'), true);
    $id = max(array_keys($students)) + 1;
    $students[$id] = [
        "id" => $id,
        "name" => $input['name'] ?? '',
        "major" => $input['major'] ?? ''
    ];
    http_response_code(201);
    echo json_encode($students[$id]);
    exit();
}

http_response_code(404);
echo json_encode(["error" => "Endpoint tidak ditemukan"]);
?>