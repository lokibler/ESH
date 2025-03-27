<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT');
header('Access-Control-Allow-Headers: Content-Type');

// Configuration
$data_file = 'teams.json';

// Ensure data file exists
if (!file_exists($data_file)) {
    file_put_contents($data_file, json_encode([]));
}

// Get all teams
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $teams = json_decode(file_get_contents($data_file), true) ?? [];
    echo json_encode($teams);
    exit;
}

// Update team data
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['teamName']) || !isset($data['teamData'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    $teams = json_decode(file_get_contents($data_file), true) ?? [];
    $teams[$data['teamName']] = $data['teamData'];
    
    if (file_put_contents($data_file, json_encode($teams))) {
        echo json_encode(['success' => true]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save team data']);
    }
    exit;
}

// Get specific team
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($data['teamName'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing team name']);
        exit;
    }

    $teams = json_decode(file_get_contents($data_file), true) ?? [];
    $teamData = $teams[$data['teamName']] ?? ['points' => 0, 'completedTasks' => []];
    
    echo json_encode($teamData);
    exit;
} 