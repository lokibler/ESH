<?php
// Enable error reporting
error_reporting(E_ALL);
ini_set('display_errors', 1);

header('Content-Type: application/json');

// Configuration
$upload_dir = 'uploads/';
$max_file_size = 10 * 1024 * 1024; // 10MB

// Log the current directory and upload directory path
error_log("Current directory: " . getcwd());
error_log("Upload directory: " . realpath($upload_dir));

// Ensure upload directory exists
if (!file_exists($upload_dir)) {
    error_log("Creating upload directory: " . $upload_dir);
    if (!mkdir($upload_dir, 0777, true)) {
        error_log("Failed to create upload directory");
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create upload directory']);
        exit;
    }
}

// Check directory permissions
if (!is_writable($upload_dir)) {
    error_log("Upload directory is not writable: " . $upload_dir);
    http_response_code(500);
    echo json_encode(['error' => 'Upload directory is not writable']);
    exit;
}

// Validate request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_log("Invalid request method: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

if (!isset($_FILES['photo']) || !isset($_POST['team_name']) || !isset($_POST['task_id'])) {
    error_log("Missing required fields. Files: " . print_r($_FILES, true) . ", POST: " . print_r($_POST, true));
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$file = $_FILES['photo'];
$team_name = $_POST['team_name'];
$task_id = $_POST['task_id'];

// Log the received data
error_log("Received file: " . print_r($file, true));
error_log("Team name: " . $team_name);
error_log("Task ID: " . $task_id);

// Validate file
if ($file['error'] !== UPLOAD_ERR_OK) {
    error_log("File upload error: " . $file['error']);
    http_response_code(400);
    echo json_encode(['error' => 'File upload failed: ' . $file['error']]);
    exit;
}

if ($file['size'] > $max_file_size) {
    error_log("File too large: " . $file['size'] . " bytes");
    http_response_code(400);
    echo json_encode(['error' => 'File too large. Maximum size is 10MB.']);
    exit;
}

// Sanitize team name and task ID
$team_name = preg_replace('/[^a-zA-Z0-9_-]/', '', $team_name);
$task_id = preg_replace('/[^a-zA-Z0-9_-]/', '', $task_id);

// Create team directory if it doesn't exist
$team_dir = $upload_dir . $team_name . '/';
error_log("Creating team directory: " . $team_dir);
if (!file_exists($team_dir)) {
    if (!mkdir($team_dir, 0777, true)) {
        error_log("Failed to create team directory");
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create team directory']);
        exit;
    }
}

// Check team directory permissions
if (!is_writable($team_dir)) {
    error_log("Team directory is not writable: " . $team_dir);
    http_response_code(500);
    echo json_encode(['error' => 'Team directory is not writable']);
    exit;
}

// Generate filename
$filename = $team_name . '_' . $task_id . '_' . date('Ymd_His') . '.jpg';
$filepath = $team_dir . $filename;
error_log("Attempting to save file to: " . $filepath);

// Move uploaded file
if (move_uploaded_file($file['tmp_name'], $filepath)) {
    error_log("File successfully uploaded to: " . $filepath);
    echo json_encode(['success' => true]);
} else {
    $error = error_get_last();
    error_log("Failed to move uploaded file. Error: " . print_r($error, true));
    error_log("File details - tmp_name: " . $file['tmp_name'] . ", filepath: " . $filepath);
    error_log("Directory exists: " . (file_exists($team_dir) ? 'yes' : 'no'));
    error_log("Directory writable: " . (is_writable($team_dir) ? 'yes' : 'no'));
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save file: ' . ($error['message'] ?? 'Unknown error')]);
} 