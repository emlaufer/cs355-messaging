<?php
// users.php
header('Content-Type: application/json');
require_once 'db_connection.php';

$db = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '';

// Get all users
if ($method === 'GET' && $path === '/users') {
    try {
        $results = $db->query('SELECT _id, name, public_key FROM users');
        $users = [];
        
        while ($row = $results->fetchArray(SQLITE3_ASSOC)) {
            $users[] = $row;
        }
        
        echo json_encode($users);
    } catch (Exception $e) {
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['error' => 'Failed to fetch users: ' . $e->getMessage()]);
    }
}
else {
    header('HTTP/1.1 404 Not Found');
    echo json_encode(['error' => 'Endpoint not found']);
}
?>
