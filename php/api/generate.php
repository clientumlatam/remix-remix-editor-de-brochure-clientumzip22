<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json');

$body = json_decode(file_get_contents('php://input'), true) ?? [];
$action = $body['action'] ?? '';
$payload = $body['payload'] ?? [];

// Auth checks
$PUBLIC_ACTIONS = ['chatbotAnswer'];
$ADMIN_ONLY_ACTIONS = ['generateIndustryCopy', 'optimizeCopy', 'generateImage', 'translateBrochure'];

if (in_array($action, $ADMIN_ONLY_ACTIONS)) {
    requireAdmin();
} elseif (!in_array($action, $PUBLIC_ACTIONS)) {
    requireAuth();
}

$GEMINI_KEY = getenv('GEMINI_API_KEY') ?: '';
$hasGemini = !empty($GEMINI_KEY) && $GEMINI_KEY !== 'MY_GEMINI_API_KEY';

function callGemini(string $prompt, bool $jsonMode = false, array $schema = []): ?string {
    global $GEMINI_KEY, $hasGemini;
    if (!$hasGemini) return null;

    $models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-2.5-flash-lite'];
    $generationConfig = [];
    if ($jsonMode) {
        $generationConfig['responseMimeType'] = 'application/json';
    }

    foreach ($models as $model) {
        for ($attempt = 1; $attempt <= 3; $attempt++) {
            $url = "https://generativelanguage.googleapis.com/v1beta/models/{$model}:generateContent?key={$GEMINI_KEY}";
            $data = [
                'contents' => [['parts' => [['text' => $prompt]]]],
            ];
            if (!empty($generationConfig)) {
                $data['generationConfig'] = $generationConfig;
            }

            $ch = curl_init($url);
            curl_setopt_array($ch, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => json_encode($data),
                CURLOPT_HTTPHEADER => ['Content-Type: application/json'],
                CURLOPT_TIMEOUT => 60,
            ]);
            $response = curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            if ($httpCode === 200 && $response) {
                $json = json_decode($response, true);
                $text = $json['candidates'][0]['content']['parts'][0]['text'] ?? null;
                if ($text !== null) return $text;
            }

            if (in_array($httpCode, [429, 503]) && $attempt < 3) {
                sleep($attempt * 2);
            } else {
                break;
            }
        }
    }
    return null;
}

function getMockIndustryCopy(string $industry): array {
    $n = strtolower($industry);
    $isAgro = str_contains($n, 'agr') || str_contains($n, 'campo') || str_contains($n, 'logist') || str_contains($n, 'distribu');
    $isGastro = str_contains($n, 'gastr') || str_contains($n, 'rest') || str_contains($n, 'caf') || str_contains($n, 'comid');
    $isInmob = str_contains($n, 'inmob') || str_contains($n, 'prop') || str_contains($n, 'real estate');
    $isSalud = str_contains($n, 'salu') || str_contains($n, 'med') || str_contains($n, 'clin') || str_contains($n, 'odont');

    return [
        'cover' => [
            'slogan' => "Automatizá tu {$industry} con IA de Clientum.",
            'sub' => "Bot WhatsApp 24/7, CRM inteligente y facturación AFIP para {$industry}. Sin código, en pesos, operativo en una semana.",
        ],
        'chatbot' => [
            'title' => "Tu negocio de {$industry} atiende solo, las 24 horas.",
            'features' => [
                ['title' => 'Respuesta instantánea', 'desc' => "Responde consultas de {$industry} al instante sin intervención humana."],
                ['title' => 'Agendamiento automático', 'desc' => 'Agenda citas y reuniones directamente desde WhatsApp.'],
                ['title' => 'Cotizaciones automáticas', 'desc' => 'Genera presupuestos personalizados para cada cliente al instante.'],
                ['title' => 'Calificación de leads', 'desc' => 'Clasifica cada consulta por intención de compra automáticamente.'],
            ],
            'flowSteps' => [
                "El cliente escribe al WhatsApp preguntando por {$industry}",
                'El bot responde al instante con información y cotiza según catálogo',
                'Si necesita asesor, deriva al CRM con historial completo',
                'Tu equipo cierra la venta con toda la información lista',
            ],
        ],
        'crm' => [
            'title' => "Nunca más pierdas una venta de {$industry}.",
            'features' => [
                ['title' => 'Pipeline visual', 'desc' => 'Arrastrá oportunidades entre etapas en tiempo real.'],
                ['title' => 'Historial completo', 'desc' => 'Cada cliente con su historial de interacciones centralizado.'],
                ['title' => 'Seguimiento automático', 'desc' => 'Recordatorios automáticos post-venta.'],
            ],
        ],
        'services' => [
            ['title' => "Consultoría para {$industry}", 'desc' => "Optimización de procesos específicos del rubro {$industry}.", 'bullets' => ['Diagnóstico gratuito', 'ROI garantizado', 'Soporte personalizado']],
            ['title' => 'CRM + Chatbot WhatsApp', 'desc' => 'Plataforma completa con bot 24/7 y CRM drag-drop.', 'bullets' => ['Conversaciones ilimitadas', 'Integración WhatsApp Business', 'Panel en tiempo real']],
            ['title' => 'Facturación AFIP Integrada', 'desc' => 'Facturas A, B y C con CAE directo desde el CRM.', 'bullets' => ['CAE automático', 'Sin salir del sistema', 'Liquidaciones en pesos']],
        ],
        'testimonial' => [
            'text' => "Implementamos Clientum en 5 días. El bot generó 40% más consultas sin contratar nadie. Los reportes cambiaron cómo tomamos decisiones.",
            'author' => 'Martín R.',
            'company' => "Empresa del rubro {$industry} — Patagonia",
        ],
        'outreachEmail' => "Asunto: Automatización WhatsApp + CRM para tu empresa de {$industry} 🚀\n\nHola,\n\nEspero que estés muy bien. Me pongo en contacto porque en el rubro de {$industry} la atención rápida de consultas y la coordinación comercial es clave.\n\nCon Clientum creamos un Chatbot WhatsApp 24/7 + CRM automatizado que ayuda a empresas de tu rubro a responder al instante y cerrar más ventas.\n\n¿Tenés 15 minutos esta semana para una charla rápida?\n\nSaludos!",
    ];
}

// === ACTION HANDLERS ===

if ($action === 'generateIndustryCopy') {
    $industry = $payload['industry'] ?? 'General';
    $prompt = "Actúa como experto redactor para PyMEs argentinas. Genera contenido para el brochure de Clientum 2026 para el rubro: \"{$industry}\". Usa voseo rioplatense. Devuelve SOLO JSON con esta estructura: {\"cover\":{\"slogan\":\"...\",\"sub\":\"...\"},\"chatbot\":{\"title\":\"...\",\"features\":[{\"title\":\"...\",\"desc\":\"...\"}],\"flowSteps\":[\"...\"]},\"crm\":{\"title\":\"...\",\"features\":[{\"title\":\"...\",\"desc\":\"...\"}]},\"services\":[{\"title\":\"...\",\"desc\":\"...\",\"bullets\":[\"...\"]}],\"testimonial\":{\"text\":\"...\",\"author\":\"...\",\"company\":\"...\"},\"outreachEmail\":\"...\"}";

    $result = callGemini($prompt, true);
    if ($result) {
        $parsed = json_decode($result, true);
        if ($parsed) {
            echo json_encode(['result' => $parsed]);
            exit;
        }
    }
    echo json_encode(['result' => getMockIndustryCopy($industry), 'isFallback' => true]);
    exit;
}

if ($action === 'chatbotAnswer') {
    $bd = $payload['brochureData'] ?? [];
    $message = $payload['message'] ?? '';
    $history = $payload['history'] ?? [];
    $slogan = $bd['cover']['slogan'] ?? 'Clientum CRM';
    $prompt = "Sos un asesor comercial de Clientum 2026. Responde con voseo argentino, máximo 3 párrafos, de forma persuasiva y enfocada en automatización. El brochure activo tiene: Lema: \"{$slogan}\". Servicios: " . json_encode($bd['services'] ?? []) . ". Pregunta: \"{$message}\"";

    $result = callGemini($prompt);
    if ($result) {
        echo json_encode(['result' => trim($result)]);
        exit;
    }
    // Fallback
    echo json_encode(['result' => "¡Hola! Gracias por tu consulta. Clientum es la plataforma de automatización de ventas y atención al cliente más completa para PyMEs argentinas. Te ayudamos a automatizar tu WhatsApp, gestionar tu CRM y facturar de forma sencilla. ¿Querés saber más sobre algún servicio en particular?", 'isFallback' => true]);
    exit;
}

if ($action === 'optimizeCopy') {
    $text = $payload['text'] ?? '';
    $goal = $payload['goal'] ?? 'persuasivo y profesional';
    $prompt = "Optimiza este texto de brochure para que sea más {$goal}. Mantén español rioplatense si aplica. Devuelve solo el texto optimizado, sin comillas externas:\n\n\"{$text}\"";

    $result = callGemini($prompt);
    if ($result) {
        echo json_encode(['result' => trim($result)]);
        exit;
    }
    echo json_encode(['result' => $text . ' (Optimizado para mayor impacto comercial y claridad.)', 'isFallback' => true]);
    exit;
}

if ($action === 'prospectLeads') {
    $city = $payload['city'] ?? 'General Roca';
    $industry = $payload['industry'] ?? 'Comercio';
    $gmpKey = $payload['googleMapsPlatformKey'] ?? getenv('GOOGLE_MAPS_PLATFORM_KEY') ?? '';

    // Try Google Places API if key available
    if (!empty($gmpKey) && $gmpKey !== 'YOUR_API_KEY') {
        $url = 'https://places.googleapis.com/v1/places:searchText';
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode(['textQuery' => "{$industry} en {$city}", 'maxResultCount' => 20, 'languageCode' => 'es']),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                "X-Goog-Api-Key: {$gmpKey}",
                'X-Goog-FieldMask: places.displayName,places.formattedAddress,places.nationalPhoneNumber,places.rating,places.websiteUri,places.id',
            ],
            CURLOPT_TIMEOUT => 30,
        ]);
        $resp = curl_exec($ch);
        $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($code === 200 && $resp) {
            $data = json_decode($resp, true);
            $places = $data['places'] ?? [];
            $contactNames = ['Luciana Silva','Carlos Benítez','Mariano Gómez','Sofía Rodriguez','Gustavo B.','Andrés Martínez','Gabriela López','Facundo Peralta'];
            $prospects = array_map(function($p, $i) use ($industry, $city, $contactNames) {
                $name = $p['displayName']['text'] ?? "Comercio en {$city}";
                $hasWeb = !empty($p['websiteUri']);
                $rating = $p['rating'] ?? null;
                $phone = $p['nationalPhoneNumber'] ?? 'Sin teléfono';
                if (!$hasWeb) {
                    $painPoint = 'No cuenta con página web institucional ni catálogo digital.';
                    $score = 9;
                } elseif ($rating && $rating < 4.2) {
                    $painPoint = "Calificación {$rating}★ — necesita bot WhatsApp para mejorar atención.";
                    $score = 8;
                } else {
                    $painPoint = 'Excelente presencia en Google pero carece de CRM automatizado.';
                    $score = 6;
                }
                return [
                    'company' => $name,
                    'industry' => $industry,
                    'city' => $city,
                    'address' => $p['formattedAddress'] ?? $city,
                    'phone' => $phone,
                    'contact' => $contactNames[$i % count($contactNames)],
                    'painPoint' => $painPoint,
                    'amount' => 180000 + ($i * 15000),
                    'score' => $score,
                    'rating' => $rating,
                    'guiacoresUrl' => "https://www.google.com/search?q=" . urlencode($name . ' ' . $city),
                    'website' => $p['websiteUri'] ?? '',
                ];
            }, $places, array_keys($places));
            echo json_encode(['result' => ['prospects' => $prospects], 'isRealScraped' => true, 'isGooglePlaces' => true]);
            exit;
        }
    }

    // Gemini grounding fallback
    $prompt = "Soy un agente de ventas para la Patagonia Argentina. Busca y lista 15 empresas REALES del rubro \"{$industry}\" ubicadas en \"{$city}\" (Río Negro o Neuquén). Para cada una devuelve JSON con: company, industry, city, address, phone, contact (nombre ficticio), painPoint (dolor digital), amount (entre 120000 y 480000 ARS), score (1-10), guiacoresUrl (URL de búsqueda en guiacores.com.ar o Google). Devuelve solo el JSON array de prospects.";

    $result = callGemini($prompt, true);
    if ($result) {
        $parsed = json_decode($result, true);
        $prospects = is_array($parsed) ? $parsed : ($parsed['prospects'] ?? []);
        if (!empty($prospects)) {
            echo json_encode(['result' => ['prospects' => $prospects], 'isRealScraped' => false, 'isGemini' => true]);
            exit;
        }
    }

    // Local fallback
    $mockProspects = [];
    $companies = ["Distribuidora {$city} S.A.", "Comercio El Progreso", "Empresa Regional {$industry}", "PyME {$industry} Patagonia", "Servicios del Sur"];
    $contactNames = ['Luciana Silva','Carlos Benítez','Mariano Gómez','Sofía Rodriguez','Gustavo B.'];
    foreach ($companies as $i => $name) {
        $mockProspects[] = [
            'company' => $name,
            'industry' => $industry,
            'city' => $city,
            'address' => "Av. Principal 123, {$city}",
            'phone' => '+54 299 400-' . str_pad($i * 1000, 4, '0'),
            'contact' => $contactNames[$i % count($contactNames)],
            'painPoint' => 'Falta de automatización en respuesta de consultas comerciales de WhatsApp.',
            'amount' => 180000 + ($i * 25000),
            'score' => 7 + ($i % 3),
            'guiacoresUrl' => "https://www.google.com/search?q=" . urlencode($name . ' ' . $city),
            'website' => '',
        ];
    }
    echo json_encode(['result' => ['prospects' => $mockProspects], 'isFallback' => true]);
    exit;
}

if ($action === 'researchProspect') {
    $company = $payload['company'] ?? 'empresa';
    $city = $payload['city'] ?? 'Patagonia';
    $industry = $payload['industry'] ?? 'comercio';

    $prompt = "Eres un experto en sales intelligence. Analiza la empresa \"{$company}\" del rubro \"{$industry}\" ubicada en \"{$city}\", Argentina. Devuelve JSON con: painPoints (array de 3 dolores digitales específicos), buyingSignals (array de 3 señales de compra), icpFit (number 1-10), recommendedApproach (string con estrategia de venta), estimatedRevenue (string rango ARS mensual).";

    $result = callGemini($prompt, true);
    if ($result) {
        $parsed = json_decode($result, true);
        if ($parsed) {
            echo json_encode(['result' => $parsed]);
            exit;
        }
    }
    echo json_encode(['result' => [
        'painPoints' => ['Falta de sistema de atención al cliente automatizado', 'Sin presencia digital consolidada', 'Procesos manuales de cotización'],
        'buyingSignals' => ['Búsquedas recientes de soluciones CRM', 'Expansión de personal de ventas', 'Comentarios negativos sobre demoras en atención'],
        'icpFit' => 8,
        'recommendedApproach' => "Contactar a {$company} destacando cómo el bot WhatsApp de Clientum resuelve la atención al cliente inmediata y el CRM automatiza el seguimiento de ventas.",
        'estimatedRevenue' => '$ 180.000 – $ 350.000 ARS/mes',
    ], 'isFallback' => true]);
    exit;
}

if ($action === 'generateOutreach') {
    $deal = $payload['deal'] ?? [];
    $company = $deal['company'] ?? 'empresa';
    $industry = $deal['industry'] ?? 'comercio';
    $painPoint = $deal['painPoint'] ?? 'falta de automatización';

    $prompt = "Eres un experto en ventas B2B argentino. Crea 3 correos de outreach progresivos (inicial, seguimiento, cierre) para la empresa \"{$company}\" del rubro \"{$industry}\" con dolor: \"{$painPoint}\". Usa voseo rioplatense, tono profesional y amigable. Referencia los beneficios de Clientum (bot WhatsApp 24/7, CRM automatizado). Devuelve JSON: {\"email1\":\"...\",\"email2\":\"...\",\"email3\":\"...\",\"linkedInMessages\":[\"...\",\"...\"],\"phoneScript\":\"...\"}";

    $result = callGemini($prompt, true);
    if ($result) {
        $parsed = json_decode($result, true);
        if ($parsed) {
            echo json_encode(['result' => $parsed]);
            exit;
        }
    }
    echo json_encode(['result' => [
        'email1' => "Asunto: Automatización WhatsApp + CRM para {$company}\n\nHola,\n\nEspero que estés bien. Me comunico porque en el rubro de {$industry} sé que {$painPoint} es un desafío real.\n\nCon Clientum implementamos un Chatbot WhatsApp 24/7 y CRM automatizado que resuelve exactamente esto. ¿Tenés 15 minutos esta semana?\n\nSaludos!",
        'email2' => "Hola nuevamente,\n\nTe escribo por {$company}. Quería compartirte que una empresa similar al tuyo aumentó un 40% sus consultas automatizando con Clientum.\n\n¿Tenés disponibilidad para una demo rápida?\n\nSaludos!",
        'email3' => "Último mensaje: sabemos que estás evaluando opciones. Clientum ofrece implementación en 5 días y soporte local en pesos. ¿Cerramos una charla esta semana?\n\nSaludos!",
        'linkedInMessages' => ["Hola! Vi que {$company} está creciendo en {$industry}. Tengo algo que podría interesarte. ¿Podemos hablar?", "Hola de nuevo — ¿llegaste a ver mi mensaje anterior sobre automatización para {$company}?"],
        'phoneScript' => "Hola, ¿hablo con el responsable de {$company}? Te llamo de Clientum — somos especialistas en automatización de ventas para {$industry}. Te llevo solo 2 minutos. ¿Tenés un momento?",
    ], 'isFallback' => true]);
    exit;
}

if ($action === 'generateICP') {
    $industry = $payload['industry'] ?? 'comercio';
    $acv = $payload['acv'] ?? '$180.000 ARS/mes';

    $prompt = "Eres un experto en estrategia de ventas B2B para PyMEs argentinas. Crea un Perfil de Cliente Ideal (ICP) para una empresa de {$industry} con ticket promedio de {$acv}. Devuelve JSON: {\"targetProfile\":\"...\",\"painPoints\":[\"...\"],\"decisionMakers\":[\"...\"],\"budgetRange\":\"...\",\"timeToClose\":\"...\",\"idealCities\":[\"...\"],\"redFlags\":[\"...\"],\"qualifyingQuestions\":[\"...\"]}";

    $result = callGemini($prompt, true);
    if ($result) {
        $parsed = json_decode($result, true);
        if ($parsed) {
            echo json_encode(['result' => $parsed]);
            exit;
        }
    }
    echo json_encode(['result' => [
        'targetProfile' => "PyME de {$industry} con 5-50 empleados, facturación mensual entre $500K y $5M ARS, con canal de ventas activo en WhatsApp.",
        'painPoints' => ['Demoras en responder consultas de WhatsApp', 'Sin sistema CRM para seguimiento de ventas', 'Cotizaciones manuales que demoran horas'],
        'decisionMakers' => ['Dueño / Gerente General', 'Gerente Comercial', 'Jefe de Ventas'],
        'budgetRange' => $acv,
        'timeToClose' => '15-30 días',
        'idealCities' => ['General Roca', 'Neuquén Capital', 'Bariloche', 'Cipolletti', 'Plottier'],
        'redFlags' => ['Empresa sin presencia digital', 'Menos de 3 empleados', 'Sin interés en tecnología'],
        'qualifyingQuestions' => ['¿Cuántas consultas de WhatsApp reciben por día?', '¿Usan algún CRM actualmente?', '¿Cuánto tiempo tarda en responder una cotización?'],
    ], 'isFallback' => true]);
    exit;
}

if ($action === 'validateGooglePlacesKey') {
    $apiKey = $payload['apiKey'] ?? '';
    if (empty(trim($apiKey))) {
        echo json_encode(['success' => false, 'error' => 'La clave provista está vacía.']);
        exit;
    }
    $ch = curl_init('https://places.googleapis.com/v1/places:searchText');
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode(['textQuery' => 'Hotel Bariloche', 'maxResultCount' => 1]),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json', "X-Goog-Api-Key: {$apiKey}", 'X-Goog-FieldMask: places.id'],
        CURLOPT_TIMEOUT => 10,
    ]);
    $resp = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    if ($code === 200) {
        echo json_encode(['success' => true]);
    } else {
        $err = json_decode($resp, true);
        echo json_encode(['success' => false, 'error' => $err['error']['message'] ?? 'Clave no válida.']);
    }
    exit;
}

http_response_code(400);
echo json_encode(['error' => "Acción '{$action}' no reconocida."]);
