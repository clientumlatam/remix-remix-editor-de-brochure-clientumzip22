<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../config/session.php';

header('Content-Type: application/json');
requireAuth();

$method = $_SERVER['REQUEST_METHOD'];
$entity = $_GET['entity'] ?? '';
$id = $_GET['id'] ?? null;

// ── DEALS ──
if ($entity === 'deals') {
    if ($method === 'GET') {
        $db = getDB();
        $rows = $db->query("SELECT * FROM crm_deals ORDER BY updated_at DESC")->fetchAll();
        foreach ($rows as &$r) {
            $r['meddicNextActions'] = $r['meddic_next_actions'] ? json_decode($r['meddic_next_actions'], true) : [];
            $r['outreachLinkedIn'] = $r['outreach_linkedin'] ? json_decode($r['outreach_linkedin'], true) : [];
        }
        echo json_encode(['deals' => $rows]);
        exit;
    }

    if ($method === 'POST') {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $dealId = $b['id'] ?? bin2hex(random_bytes(9));
        $db = getDB();
        $stmt = $db->prepare("INSERT INTO crm_deals (id,company,amount,stage,industry,city,address,phone,contact,contact_title,pain_point,guiacores_url,meddic_metrics,meddic_buyer,meddic_criteria,meddic_process,meddic_pain,meddic_champion,meddic_score,meddic_red_flags,meddic_next_actions,outreach_email1,outreach_email2,outreach_email3,outreach_linkedin,outreach_phone_script)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
            ON DUPLICATE KEY UPDATE company=VALUES(company),amount=VALUES(amount),stage=VALUES(stage),industry=VALUES(industry),city=VALUES(city),address=VALUES(address),phone=VALUES(phone),contact=VALUES(contact),contact_title=VALUES(contact_title),pain_point=VALUES(pain_point),guiacores_url=VALUES(guiacores_url),meddic_metrics=VALUES(meddic_metrics),meddic_buyer=VALUES(meddic_buyer),meddic_criteria=VALUES(meddic_criteria),meddic_process=VALUES(meddic_process),meddic_pain=VALUES(meddic_pain),meddic_champion=VALUES(meddic_champion),meddic_score=VALUES(meddic_score),meddic_red_flags=VALUES(meddic_red_flags),meddic_next_actions=VALUES(meddic_next_actions),outreach_email1=VALUES(outreach_email1),outreach_email2=VALUES(outreach_email2),outreach_email3=VALUES(outreach_email3),outreach_linkedin=VALUES(outreach_linkedin),outreach_phone_script=VALUES(outreach_phone_script),updated_at=NOW()");
        $stmt->execute([
            $dealId, $b['company'] ?? 'Sin nombre', $b['amount'] ?? 0, $b['stage'] ?? 'leads',
            $b['industry'] ?? '', $b['city'] ?? '', $b['address'] ?? '', $b['phone'] ?? '',
            $b['contact'] ?? '', $b['contactTitle'] ?? '', $b['painPoint'] ?? '', $b['guiacoresUrl'] ?? '',
            $b['meddicMetrics'] ?? 0, $b['meddicBuyer'] ?? 0, $b['meddicCriteria'] ?? 0,
            $b['meddicProcess'] ?? 0, $b['meddicPain'] ?? 0, $b['meddicChampion'] ?? 0,
            $b['meddicScore'] ?? 0, $b['meddicRedFlags'] ?? '',
            json_encode($b['meddicNextActions'] ?? []),
            $b['outreachEmail1'] ?? '', $b['outreachEmail2'] ?? '', $b['outreachEmail3'] ?? '',
            json_encode($b['outreachLinkedIn'] ?? []), $b['outreachPhoneScript'] ?? '',
        ]);
        echo json_encode(['id' => $dealId, 'ok' => true]);
        exit;
    }

    if ($method === 'PATCH' && $id) {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $db = getDB();
        $sets = [];
        $vals = [];
        $map = [
            'company'=>'company','amount'=>'amount','stage'=>'stage','industry'=>'industry',
            'city'=>'city','address'=>'address','phone'=>'phone','contact'=>'contact',
            'contactTitle'=>'contact_title','painPoint'=>'pain_point','guiacoresUrl'=>'guiacores_url',
            'meddicMetrics'=>'meddic_metrics','meddicBuyer'=>'meddic_buyer','meddicCriteria'=>'meddic_criteria',
            'meddicProcess'=>'meddic_process','meddicPain'=>'meddic_pain','meddicChampion'=>'meddic_champion',
            'meddicScore'=>'meddic_score','meddicRedFlags'=>'meddic_red_flags',
            'outreachEmail1'=>'outreach_email1','outreachEmail2'=>'outreach_email2','outreachEmail3'=>'outreach_email3',
            'outreachPhoneScript'=>'outreach_phone_script',
        ];
        foreach ($map as $jsKey => $col) {
            if (array_key_exists($jsKey, $b)) {
                $sets[] = "{$col} = ?";
                $vals[] = $b[$jsKey];
            }
        }
        if (isset($b['meddicNextActions'])) { $sets[] = 'meddic_next_actions = ?'; $vals[] = json_encode($b['meddicNextActions']); }
        if (isset($b['outreachLinkedIn'])) { $sets[] = 'outreach_linkedin = ?'; $vals[] = json_encode($b['outreachLinkedIn']); }
        if (empty($sets)) { echo json_encode(['ok' => true]); exit; }
        $vals[] = $id;
        $db->prepare("UPDATE crm_deals SET " . implode(',', $sets) . ", updated_at=NOW() WHERE id = ?")->execute($vals);
        echo json_encode(['ok' => true]);
        exit;
    }

    if ($method === 'DELETE' && $id) {
        getDB()->prepare("DELETE FROM crm_deals WHERE id = ?")->execute([$id]);
        echo json_encode(['ok' => true]);
        exit;
    }
}

// ── PRODUCTS ──
if ($entity === 'products') {
    $db = getDB();
    if ($method === 'GET') {
        echo json_encode(['products' => $db->query("SELECT * FROM products ORDER BY id")->fetchAll()]);
        exit;
    }
    if ($method === 'POST') {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $stmt = $db->prepare("INSERT INTO products (code,name,description,price,monthly,category,active) VALUES (?,?,?,?,?,?,?)");
        $stmt->execute([$b['code']??'',$b['name']??'',$b['description']??'',$b['price']??0,$b['monthly']??0,$b['category']??'',$b['active']??1]);
        echo json_encode(['id' => $db->lastInsertId(), 'ok' => true]);
        exit;
    }
    if ($method === 'PUT' && $id) {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $db->prepare("UPDATE products SET code=?,name=?,description=?,price=?,monthly=?,category=?,active=? WHERE id=?")->execute([$b['code']??'',$b['name']??'',$b['description']??'',$b['price']??0,$b['monthly']??0,$b['category']??'',$b['active']??1,$id]);
        echo json_encode(['ok' => true]);
        exit;
    }
    if ($method === 'DELETE' && $id) {
        $db->prepare("DELETE FROM products WHERE id=?")->execute([$id]);
        echo json_encode(['ok' => true]);
        exit;
    }
}

// ── SELLERS ──
if ($entity === 'sellers') {
    $db = getDB();
    if ($method === 'GET') { echo json_encode(['sellers' => $db->query("SELECT * FROM sellers ORDER BY id")->fetchAll()]); exit; }
    if ($method === 'POST') {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $db->prepare("INSERT INTO sellers (name,phone,email,specialty,active) VALUES (?,?,?,?,?)")->execute([$b['name']??'',$b['phone']??'',$b['email']??'',$b['specialty']??'',$b['active']??1]);
        echo json_encode(['id' => $db->lastInsertId(), 'ok' => true]); exit;
    }
    if ($method === 'PUT' && $id) {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $db->prepare("UPDATE sellers SET name=?,phone=?,email=?,specialty=?,active=? WHERE id=?")->execute([$b['name']??'',$b['phone']??'',$b['email']??'',$b['specialty']??'',$b['active']??1,$id]);
        echo json_encode(['ok' => true]); exit;
    }
    if ($method === 'DELETE' && $id) { $db->prepare("DELETE FROM sellers WHERE id=?")->execute([$id]); echo json_encode(['ok' => true]); exit; }
}

// ── BRANCHES ──
if ($entity === 'branches') {
    $db = getDB();
    if ($method === 'GET') { echo json_encode(['branches' => $db->query("SELECT * FROM branches ORDER BY id")->fetchAll()]); exit; }
    if ($method === 'POST') {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $db->prepare("INSERT INTO branches (name,address,phone,manager,active) VALUES (?,?,?,?,?)")->execute([$b['name']??'',$b['address']??'',$b['phone']??'',$b['manager']??'',$b['active']??1]);
        echo json_encode(['id' => $db->lastInsertId(), 'ok' => true]); exit;
    }
    if ($method === 'PUT' && $id) {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $db->prepare("UPDATE branches SET name=?,address=?,phone=?,manager=?,active=? WHERE id=?")->execute([$b['name']??'',$b['address']??'',$b['phone']??'',$b['manager']??'',$b['active']??1,$id]);
        echo json_encode(['ok' => true]); exit;
    }
    if ($method === 'DELETE' && $id) { $db->prepare("DELETE FROM branches WHERE id=?")->execute([$id]); echo json_encode(['ok' => true]); exit; }
}

// ── CONVERSATIONS ──
if ($entity === 'conversations') {
    $db = getDB();
    if ($method === 'GET') { echo json_encode(['conversations' => $db->query("SELECT c.*,s.name as seller_name FROM conversations c LEFT JOIN sellers s ON c.assigned_seller_id=s.id ORDER BY c.updated_at DESC")->fetchAll()]); exit; }
    if ($method === 'POST') {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $db->prepare("INSERT INTO conversations (customer_name,status,query_type,channel,assigned_seller_id,notes) VALUES (?,?,?,?,?,?)")->execute([$b['customer_name']??'',$b['status']??'activa',$b['query_type']??'',$b['channel']??'whatsapp',$b['assigned_seller_id']??null,$b['notes']??'']);
        echo json_encode(['id' => $db->lastInsertId(), 'ok' => true]); exit;
    }
    if ($method === 'PUT' && $id) {
        $b = json_decode(file_get_contents('php://input'), true) ?? [];
        $db->prepare("UPDATE conversations SET customer_name=?,status=?,query_type=?,channel=?,assigned_seller_id=?,notes=?,updated_at=NOW() WHERE id=?")->execute([$b['customer_name']??'',$b['status']??'activa',$b['query_type']??'',$b['channel']??'whatsapp',$b['assigned_seller_id']??null,$b['notes']??'',$id]);
        echo json_encode(['ok' => true]); exit;
    }
    if ($method === 'DELETE' && $id) { $db->prepare("DELETE FROM conversations WHERE id=?")->execute([$id]); echo json_encode(['ok' => true]); exit; }
}

http_response_code(404);
echo json_encode(['error' => 'Endpoint no encontrado.']);
