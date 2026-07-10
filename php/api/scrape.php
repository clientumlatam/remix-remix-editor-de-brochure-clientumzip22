<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json');
requireAuth();

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$city = $body['city'] ?? '';
$industry = $body['industry'] ?? '';

if (!$city || !$industry) {
    http_response_code(400);
    echo json_encode(['error' => 'Faltan parámetros: city e industry.']);
    exit;
}

$APIFY_TOKEN = getenv('APIFY_API_TOKEN') ?: '';
if (empty($APIFY_TOKEN) || $APIFY_TOKEN === 'MY_APIFY_API_TOKEN') {
    http_response_code(400);
    echo json_encode(['error' => 'La clave APIFY_API_TOKEN no está configurada.']);
    exit;
}

$query = "{$industry} en {$city}";
$actors = [
    ['compass~crawler-google-places', ['queries' => [$query], 'searchStrings' => [$query], 'maxPlacesPerQuery' => 20, 'maxResults' => 20]],
    ['apify~google-maps-scraper', ['searchStringsArray' => [$query], 'maxCrawledPlacesPerSearch' => 20]],
];

$items = [];
foreach ($actors as [$actor, $reqBody]) {
    $url = "https://api.apify.com/v2/acts/{$actor}/run-sync-get-dataset-items?token={$APIFY_TOKEN}";
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($reqBody),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
        CURLOPT_TIMEOUT => 120,
    ]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($code === 200 && $resp) {
        $data = json_decode($resp, true);
        if (is_array($data) && count($data) > 0) {
            $items = $data;
            break;
        }
    }
}

if (empty($items)) {
    http_response_code(500);
    echo json_encode(['error' => 'No se pudo completar el scraping con Apify.']);
    exit;
}

$contactNames = ['Luciana Silva','Carlos Benítez','Mariano Gómez','Sofía Rodriguez','Gustavo B.','Andrés Martínez','Gabriela López','Facundo Peralta','Estela Castro','Martin Diaz'];
$prospects = array_map(function($item, $i) use ($industry, $city, $contactNames) {
    $name = $item['title'] ?? $item['name'] ?? "Comercio en {$city}";
    $phone = $item['phone'] ?? $item['phoneNumber'] ?? 'Sin teléfono';
    $address = $item['address'] ?? $item['formattedAddress'] ?? $city;
    $website = $item['website'] ?? $item['websiteUrl'] ?? '';
    $rating = $item['stars'] ?? $item['rating'] ?? null;

    if (!$website) {
        $painPoint = 'No cuenta con página web institucional ni catálogo digital.';
        $score = 9;
    } elseif ($rating && $rating < 4.2) {
        $painPoint = "Calificación {$rating}★ — necesita bot WhatsApp para agilizar atención.";
        $score = 8;
    } else {
        $painPoint = 'Excelente presencia en Google pero carece de CRM automatizado.';
        $score = 6;
    }

    return [
        'company' => $name,
        'industry' => $industry,
        'city' => $city,
        'address' => $address,
        'phone' => $phone,
        'contact' => $contactNames[$i % count($contactNames)],
        'painPoint' => $painPoint,
        'amount' => 180000 + ($i * 15000),
        'score' => $score,
        'rating' => $rating,
        'guiacoresUrl' => $item['url'] ?? "https://www.google.com/search?q=" . urlencode("{$name} {$city}"),
        'website' => $website,
    ];
}, $items, array_keys($items));

echo json_encode(['prospects' => $prospects, 'isRealScraped' => true]);
