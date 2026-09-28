<?php
/**
 * SAPatcher Guest Review Relay Gateway
 * Developed for PixelSmith Studio (pixelsmith.ru)
 *
 * This endpoint allows users without a GitHub account to submit reviews.
 * It verifies the mandatory contact (Email / VK / Discord) and creates
 * a GitHub Issue on PassatB5By/SAPatch tagged with label 'review'.
 */

// Enable CORS for the official website
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed. Use POST.']);
    exit;
}

// Configuration: Place your GitHub Personal Access Token (Fine-Grained with issues:write permission)
// You can set it in environment variables or define it here.
$GITHUB_TOKEN = getenv('GITHUB_TOKEN') ?: 'ghp_YOUR_TOKEN_HERE';
$GITHUB_REPO = 'PassatB5By/SAPatch';

$rawInput = file_get_contents('php://input');
$data = json_decode($rawInput, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON payload.']);
    exit;
}

$author = 'Anonymous';
$contactType = trim($data['contactType'] ?? 'Email');
$contactValue = trim($data['contactValue'] ?? '');
$rating = intval($data['rating'] ?? 5);
if ($rating < 1 || $rating > 5) $rating = 5;

$category = trim($data['category'] ?? 'GTA SA & Modding');
$title = trim($data['title'] ?? 'Отзыв о SAPatcher');
$pros = trim($data['pros'] ?? '');
$comment = trim($data['comment'] ?? '');

// Mandatory contact validation
if (empty($contactValue)) {
    http_response_code(422);
    echo json_encode(['error' => 'Contact handle (Email, VK, or Discord) is required.']);
    exit;
}

if (empty($comment)) {
    http_response_code(422);
    echo json_encode(['error' => 'Review comment cannot be empty.']);
    exit;
}

$starString = str_repeat('★', $rating) . str_repeat('☆', 5 - $rating);

$issueBody = "### Rating: {$starString} ({$rating}/5)\n"
    . "**Category:** {$category}\n"
    . "**Author:** Anonymous\n"
    . "**Contact ({$contactType}):** `{$contactValue}`\n\n";

if (!empty($pros)) {
    $issueBody .= "**Pros:**\n{$pros}\n\n";
}

$issueBody .= "### Detailed Review:\n{$comment}\n\n"
    . "---\n"
    . "_Submitted via Guest Form (without GitHub account) on [SAPatcher Official Website](https://passatb5by.github.io/SAPatch/) by [PixelSmith Studio](https://pixelsmith.ru)_";

$payload = [
    'title' => "[REVIEW] {$title}",
    'body' => $issueBody,
    'labels' => ['review']
];

$ch = curl_init("https://api.github.com/repos/{$GITHUB_REPO}/issues");
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($payload),
    CURLOPT_HTTPHEADER => [
        'User-Agent: PixelSmith-Review-Bot',
        'Authorization: Bearer ' . $GITHUB_TOKEN,
        'Accept: application/vnd.github+json',
        'Content-Type: application/json'
    ]
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($httpCode >= 200 && $httpCode < 300) {
    http_response_code(201);
    echo $response;
} else {
    http_response_code($httpCode ?: 500);
    echo json_encode([
        'error' => 'GitHub API error',
        'details' => $curlError ?: $response
    ]);
}
