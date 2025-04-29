<?php
// messages.php
header('Content-Type: application/json');
require_once 'db_connection.php';

$db = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];
$path = $_SERVER['PATH_INFO'] ?? '';

// Function to verify proof - placeholder
function verifyProof($proof, $verifierData, $common, $message, $publicKeys) {
    // TODO: Implement proof verification here
    // This is a placeholder for the Plonky2 proof verification
    // You'll need to implement this based on your specific requirements
    
    return true; // For now, return true to allow message creation
}

// Get all messages
if ($method === 'GET' && $path === '/messages') {
    try {
        $messages = [];
        $query = $db->query('
            SELECT m._id, m.message, m.timestamp, m.proof, m.verifier_data, m.common 
            FROM messages m 
            ORDER BY m.timestamp DESC
        ');
        
        while ($message = $query->fetchArray(SQLITE3_ASSOC)) {
            // Get user IDs for this message
            $userQuery = $db->prepare('
                SELECT user_id FROM message_users WHERE message_id = :message_id
            ');
            $userQuery->bindValue(':message_id', $message['_id'], SQLITE3_INTEGER);
            $userResult = $userQuery->execute();
            
            $userIds = [];
            while ($user = $userResult->fetchArray(SQLITE3_ASSOC)) {
                $userIds[] = $user['user_id'];
            }
            
            $message['userIds'] = $userIds;
            $messages[] = $message;
        }
        
        echo json_encode($messages);
    } catch (Exception $e) {
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['error' => 'Failed to fetch messages: ' . $e->getMessage()]);
    }
}
// Create a new message
elseif ($method === 'POST' && $path === '/messages') {
    try {
        $data = json_decode(file_get_contents('php://input'), true);
        $userIds = $data['userIds'] ?? [];
        $message = $data['message'] ?? '';
        $proof = $data['proof'] ?? null;
        $verifierData = $data['verifierData'] ?? null;
        $common = $data['common'] ?? null;
        
        if (empty($userIds) || !is_array($userIds) || empty($message)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'UserIds array and message are required']);
            exit;
        }
        
        // Verify users exist
        $placeholders = implode(',', array_fill(0, count($userIds), '?'));
        $stmt = $db->prepare("SELECT _id, public_key FROM users WHERE _id IN ($placeholders)");
        
        foreach ($userIds as $index => $userId) {
            $stmt->bindValue($index + 1, $userId, SQLITE3_INTEGER);
        }
        
        $result = $stmt->execute();
        $users = [];
        $publicKeys = [];
        
        while ($user = $result->fetchArray(SQLITE3_ASSOC)) {
            $users[] = $user;
            if (!empty($user['public_key'])) {
                $publicKeys[] = $user['public_key'];
            }
        }
        
        if (count($users) !== count($userIds)) {
            header('HTTP/1.1 400 Bad Request');
            echo json_encode(['error' => 'One or more users do not exist']);
            exit;
        }
        
        // Verify proof if provided
        if ($proof && $verifierData && $common) {
            try {
                sort($publicKeys); // Ensure consistent order for verification
                $isValid = verifyProof($proof, $verifierData, $common, $message, $publicKeys);
                
                // If you implement the actual verification and it fails:
                // if (!$isValid) {
                //     header('HTTP/1.1 400 Bad Request');
                //     echo json_encode(['error' => 'Proof verification failed']);
                //     exit;
                // }
            } catch (Exception $e) {
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'Proof verification failed: ' . $e->getMessage()]);
                exit;
            }
        }
        
        // Begin transaction
        $db->exec('BEGIN TRANSACTION');
        
        // Insert message
        $stmt = $db->prepare('
            INSERT INTO messages (message, timestamp, proof, verifier_data, common)
            VALUES (:message, :timestamp, :proof, :verifier_data, :common)
        ');
        $stmt->bindValue(':message', $message, SQLITE3_TEXT);
        $stmt->bindValue(':timestamp', date('Y-m-d H:i:s'), SQLITE3_TEXT);
        $stmt->bindValue(':proof', $proof ? json_encode($proof) : null, $proof ? SQLITE3_TEXT : SQLITE3_NULL);
        $stmt->bindValue(':verifier_data', $verifierData ? json_encode($verifierData) : null, $verifierData ? SQLITE3_TEXT : SQLITE3_NULL);
        $stmt->bindValue(':common', $common ? json_encode($common) : null, $common ? SQLITE3_TEXT : SQLITE3_NULL);
        $stmt->execute();
        
        $messageId = $db->lastInsertRowID();
        
        // Associate users with message
        foreach ($userIds as $userId) {
            $stmt = $db->prepare('
                INSERT INTO message_users (message_id, user_id)
                VALUES (:message_id, :user_id)
            ');
            $stmt->bindValue(':message_id', $messageId, SQLITE3_INTEGER);
            $stmt->bindValue(':user_id', $userId, SQLITE3_INTEGER);
            $stmt->execute();
        }
        
        $db->exec('COMMIT');
        
        // Get the created message
        $stmt = $db->prepare('
            SELECT _id, message, timestamp, proof, verifier_data as verifierData, common
            FROM messages WHERE _id = :_id
        ');
        $stmt->bindValue(':_id', $messageId, SQLITE3_INTEGER);
        $result = $stmt->execute();
        $newMessage = $result->fetchArray(SQLITE3_ASSOC);
        $newMessage['userIds'] = $userIds;
        
        header('HTTP/1.1 201 Created');
        echo json_encode($newMessage);
    } catch (Exception $e) {
        $db->exec('ROLLBACK');
        header('HTTP/1.1 500 Internal Server Error');
        echo json_encode(['error' => 'Failed to add message: ' . $e->getMessage()]);
    }
}
else {
    header('HTTP/1.1 404 Not Found');
    echo json_encode(['error' => 'Endpoint not found']);
}
?>
