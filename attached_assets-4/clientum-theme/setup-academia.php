<?php
/**
 * Clientum — Setup Academia: categorías + borrado de cursos obsoletos
 *
 * USO:
 *   1. Subí este archivo a la raíz de WordPress (public_html o similar)
 *   2. Hacé un BACKUP de la base de datos antes de correr
 *   3. Accedé vía: https://tusitioweb.com/setup-academia.php?key=clientum2025
 *   4. Usá ?mode=dry para revisar qué se borraría SIN borrar nada
 *   5. Usá ?mode=run para ejecutar el borrado real (en lotes de 50)
 *   6. ELIMINÁ este archivo después de usarlo
 *
 * El script:
 *   A) Crea las 11 categorías de cursos (taxonomy: course_cat si LearnDash/LifterLMS; sino category)
 *   B) Borra los 347 IDs obsoletos en lotes seguros de 50
 */

define('ABSPATH', dirname(__FILE__) . '/');
$secret = $_GET['key'] ?? '';
$mode   = $_GET['mode'] ?? 'dry';   // 'dry' o 'run'
$offset = (int)($_GET['offset'] ?? 0);

if ($secret !== 'clientum2025') {
    die('Acceso denegado. Usá ?key=clientum2025&mode=dry');
}

require_once(ABSPATH . 'wp-load.php');

if (!current_user_can('manage_options')) {
    wp_die('Solo administradores pueden ejecutar este script.');
}

/* ── A. Categorías de cursos ─────────────────────────────────── */
$course_categories = [
    ['Marketing Digital',                'marketing-digital-cursos',     'Métricas, SEO y estrategias de marketing para PyMEs'],
    ['E-commerce',                       'e-commerce-cursos',            'Tiendas online, WooCommerce y automatización de ventas'],
    ['Automatización y Software de Gestión','automatizacion-gestion-cursos','ERP, CRM, Zapier y herramientas para eficiencia operativa'],
    ['Ciberseguridad',                   'ciberseguridad-cursos',        'Protección digital para empresas sin área de IT dedicada'],
    ['Ventas y Comunicación',            'ventas-comunicacion-cursos',   'Técnicas de venta, comunicación y negociación profesional'],
    ['Desarrollo Personal y Liderazgo', 'liderazgo-personal-cursos',    'Productividad, inteligencia emocional y liderazgo de equipos'],
    ['Tecnología y Desarrollo',          'tecnologia-desarrollo-cursos', 'Apps móviles, programación web y desarrollo de software'],
    ['Finanzas',                         'finanzas-cursos',              'Finanzas personales y empresariales para emprendedores'],
    ['Gestión de Proyectos',             'gestion-proyectos-cursos',     'Metodologías ágiles, PMI y calidad de gestión'],
    ['Recursos Humanos',                 'recursos-humanos-cursos',      'Talento, RRHH y gestión del capital humano para PyMEs'],
    ['Estrategia de Negocios',           'estrategia-negocios-cursos',   'Planeamiento, innovación y estrategia competitiva'],
];

/* Detectar taxonomía disponible */
$tax = 'category';
foreach (['course_cat','ld_course_category','course-category'] as $t) {
    if (taxonomy_exists($t)) { $tax = $t; break; }
}

$cat_results = [];
foreach ($course_categories as $cat) {
    $existing = get_term_by('slug', $cat[1], $tax);
    if (!$existing) {
        $result = wp_insert_term($cat[0], $tax, [
            'slug'        => $cat[1],
            'description' => $cat[2],
        ]);
        $cat_results[] = $result instanceof WP_Error
            ? ['❌', "{$cat[0]}: " . $result->get_error_message()]
            : ['✅', "Categoría creada: {$cat[0]} (taxonomía: {$tax})"];
    } else {
        $cat_results[] = ['⚠️', "Ya existe: {$cat[0]}"];
    }
}

/* ── B. IDs a borrar (347 cursos obsoletos) ─────────────────── */
$ids_to_delete = [
    341,362,1184,1185,1186,1187,1188,1189,1190,1191,1192,1193,1194,1195,1196,1197,
    1198,1199,1200,1201,1202,1203,1204,1205,1206,1207,1208,1209,1210,1211,1212,1213,
    1214,1215,1216,1217,1231,1232,1233,1234,1235,1236,1237,1238,1239,1240,1241,1242,
    1243,1244,1245,1246,1247,1248,1249,1250,1251,1252,1253,1254,1255,1256,1257,1258,
    1259,1260,1261,1262,1263,1264,1291,1292,1293,1294,1295,1296,1297,1298,1299,1300,
    1301,1302,1303,1304,1305,1306,1307,1308,1309,1310,1312,1313,1314,1315,1316,1317,
    1318,1319,1320,1321,1322,1323,1324,1325,1326,1327,1328,1329,1330,1331,1332,1333,
    1334,1335,1336,1337,1338,1339,1340,1341,1342,1343,1344,1345,1346,1347,1348,1349,
    1350,1351,1352,1353,1354,1355,1356,1357,1358,1359,1360,1361,1362,1363,1364,1365,
    1366,1367,1368,1369,1370,1371,1372,1373,1374,1375,1376,1377,1378,1379,1380,1381,
    1382,1383,1384,1385,1386,1387,1388,1389,1390,1391,1392,1393,1394,1395,1396,1397,
    1398,1399,1400,1401,1402,1403,1404,1405,1406,1407,1408,1409,1410,1411,1412,1413,
    1414,1415,1416,1417,1418,1419,1420,1421,1422,1423,1424,1425,1426,1427,1428,1429,
    1430,1431,1432,1433,1434,1435,1436,1437,1438,1439,1440,1441,1442,1443,1444,1445,
    1446,1447,1448,1449,1450,1451,1452,1453,1454,1455,1456,1457,1458,1459,1460,1461,
    1462,1463,1464,1465,1466,1467,1468,1469,1470,1471,1472,1473,1474,1475,1476,1477,
    1478,1479,1480,1481,1482,1483,1484,1485,1486,1487,1488,1489,1490,1491,1492,1493,
    1494,1495,1496,1497,1498,1499,1500,1501,1502,1503,1504,1505,1506,1507,1508,1509,
    1510,1511,1512,1513,1514,1515,1516,1517,1518,1519,1520,1521,1522,1523,1524,1525,
    1526,1527,1528,1529,1530,1531,1532,1533,1534,1535,1536,1537,1538,1539,1540,1541,
    1542,1543,1544,1545,1546,1547,1548,1549,1550,1551,1552,1553,1554,1555,1556,1557,
    1558,1559,1560,1561,1562,1563,1564,1565,1566,
];

$total      = count($ids_to_delete);
$batch_size = 50;
$batch      = array_slice($ids_to_delete, $offset, $batch_size);
$next_offset= $offset + $batch_size;
$has_more   = $next_offset < $total;

$delete_results = [];
$deleted_count  = 0;
$skipped_count  = 0;
$error_count    = 0;

if ($mode === 'run') {
    foreach ($batch as $id) {
        $post = get_post($id);
        if (!$post) {
            $delete_results[] = ['⚠️', "ID {$id}: no existe o ya fue borrado"];
            $skipped_count++;
            continue;
        }
        /* Doble verificación: solo borrar courses */
        if ($post->post_type !== 'courses' && $post->post_type !== 'course') {
            $delete_results[] = ['🛑', "ID {$id}: tipo '{$post->post_type}' — OMITIDO por seguridad (solo se borran posts de tipo course)"];
            $skipped_count++;
            continue;
        }
        $result = wp_delete_post($id, true); /* true = borrado definitivo, sin papelera */
        if ($result) {
            $delete_results[] = ['✅', "ID {$id} borrado: " . esc_html(substr($post->post_title, 0, 60))];
            $deleted_count++;
        } else {
            $delete_results[] = ['❌', "ID {$id}: error al borrar"];
            $error_count++;
        }
    }
} else {
    /* Modo DRY — solo mostrar qué se borraría */
    foreach ($batch as $id) {
        $post = get_post($id);
        if (!$post) {
            $delete_results[] = ['⚠️', "ID {$id}: no existe"];
        } else {
            $delete_results[] = ['🔍', "ID {$id} [{$post->post_type}]: " . esc_html(substr($post->post_title, 0, 70))];
        }
    }
}

?><!DOCTYPE html>
<html><head>
<meta charset="utf-8">
<title>Setup Academia — Clientum</title>
<style>
body{font-family:system-ui,sans-serif;max-width:860px;margin:40px auto;padding:20px;background:#f8fafc;color:#1e293b}
h1,h2{color:#1A3461}
.box{background:white;border:1px solid #e2e8f0;border-radius:12px;padding:20px 24px;margin-bottom:20px}
.badge{display:inline-block;padding:2px 10px;border-radius:100px;font-size:.72rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
.badge-dry{background:#fef9c3;color:#854d0e}
.badge-run{background:#dcfce7;color:#166534}
ul{padding-left:0;list-style:none}
li{padding:5px 0;font-size:.84rem;border-bottom:1px solid #f1f5f9}
li:last-child{border:none}
.ok{color:#166534}.warn{color:#92400e}.err{color:#991b1b}.info{color:#1e40af}.stop{color:#7f1d1d}
.actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px}
.btn{display:inline-block;padding:10px 20px;border-radius:8px;font-weight:600;font-size:.85rem;text-decoration:none;border:none;cursor:pointer}
.btn-primary{background:#1A3461;color:white}
.btn-danger{background:#dc2626;color:white}
.btn-outline{background:white;color:#1A3461;border:1px solid #1A3461}
.progress{background:#e2e8f0;border-radius:100px;height:8px;margin:8px 0}
.progress-bar{background:#1A3461;border-radius:100px;height:8px;transition:.3s}
.warning-box{background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 18px;margin-bottom:16px;font-size:.84rem;color:#991b1b}
.success-box{background:#f0fdf4;border:1px solid #86efac;border-radius:8px;padding:14px 18px;margin-top:16px;font-size:.84rem;color:#166534;font-weight:600}
</style>
</head><body>

<h1>🎓 Clientum — Setup Academia</h1>
<p>
  Modo: <span class="badge <?php echo $mode === 'run' ? 'badge-run' : 'badge-dry'; ?>">
    <?php echo $mode === 'run' ? '▶ EJECUTANDO (borrado real)' : '🔍 DRY RUN (solo lectura)'; ?>
  </span>
  &nbsp;·&nbsp; Taxonomía detectada: <strong><?php echo esc_html($tax); ?></strong>
  &nbsp;·&nbsp; IDs totales: <strong><?php echo $total; ?></strong>
</p>

<?php if ($mode !== 'run'): ?>
<div class="warning-box">
  ⚠️ <strong>Modo DRY activo</strong> — no se borra nada. Revisá la lista y luego usá <code>?key=clientum2025&mode=run</code> para ejecutar el borrado real por lotes.
</div>
<?php endif; ?>

<!-- A. Categorías -->
<div class="box">
  <h2 style="margin-top:0">A. Categorías de cursos (11 áreas)</h2>
  <ul>
    <?php foreach ($cat_results as $r): ?>
    <li class="<?php echo $r[0]==='✅'?'ok':($r[0]==='⚠️'?'warn':'err'); ?>">
      <?php echo esc_html($r[0] . ' ' . $r[1]); ?>
    </li>
    <?php endforeach; ?>
  </ul>
</div>

<!-- B. Borrado de cursos obsoletos -->
<div class="box">
  <h2 style="margin-top:0">
    B. <?php echo $mode === 'run' ? 'Borrado' : 'Vista previa del borrado'; ?> de cursos obsoletos
  </h2>

  <!-- Progreso -->
  <p style="font-size:.82rem;color:#64748b">
    Procesando IDs <?php echo $offset + 1; ?>–<?php echo min($offset + $batch_size, $total); ?> de <?php echo $total; ?>
  </p>
  <div class="progress">
    <div class="progress-bar" style="width:<?php echo round(min($offset + $batch_size, $total) / $total * 100); ?>%"></div>
  </div>

  <ul>
    <?php foreach ($delete_results as $r): ?>
    <li class="<?php echo $r[0]==='✅'?'ok':($r[0]==='⚠️'?'warn':($r[0]==='🛑'?'stop':($r[0]==='❌'?'err':'info'))); ?>">
      <?php echo esc_html($r[0] . ' ' . $r[1]); ?>
    </li>
    <?php endforeach; ?>
  </ul>

  <?php if ($mode === 'run'): ?>
  <p style="font-size:.82rem;margin-top:12px">
    ✅ Borrados: <strong><?php echo $deleted_count; ?></strong> &nbsp;
    ⚠️ Saltados: <strong><?php echo $skipped_count; ?></strong> &nbsp;
    ❌ Errores: <strong><?php echo $error_count; ?></strong>
  </p>
  <?php endif; ?>

  <!-- Navegación entre lotes -->
  <div class="actions" style="margin-top:20px">
    <?php if ($has_more): ?>
    <a href="?key=<?php echo esc_attr($secret); ?>&mode=<?php echo esc_attr($mode); ?>&offset=<?php echo $next_offset; ?>" class="btn btn-primary">
      → Siguiente lote (<?php echo $next_offset + 1; ?>–<?php echo min($next_offset + $batch_size, $total); ?>)
    </a>
    <?php else: ?>
    <div class="success-box" style="width:100%">
      🎉 Todos los <?php echo $total; ?> IDs fueron procesados. El borrado está completo.<br>
      <strong>Eliminá setup-academia.php del servidor ahora.</strong>
    </div>
    <?php endif; ?>
    <?php if ($offset > 0): ?>
    <a href="?key=<?php echo esc_attr($secret); ?>&mode=<?php echo esc_attr($mode); ?>&offset=0" class="btn btn-outline">↩ Volver al inicio</a>
    <?php endif; ?>
  </div>
</div>

<!-- Alternativa WP-CLI -->
<div class="box">
  <h2 style="margin-top:0">Alternativa: WP-CLI (más rápido)</h2>
  <p style="font-size:.83rem;color:#64748b">Si tenés acceso SSH al servidor, estos comandos hacen lo mismo en segundos:</p>
  <pre style="background:#1e293b;color:#e2e8f0;border-radius:8px;padding:16px;font-size:.78rem;overflow-x:auto;line-height:1.6"># 1. Crear categorías de cursos
wp term create course_cat "Marketing Digital" --slug=marketing-digital-cursos --description="Métricas, SEO y marketing para PyMEs"
wp term create course_cat "E-commerce" --slug=e-commerce-cursos
wp term create course_cat "Automatización y Software de Gestión" --slug=automatizacion-gestion-cursos
wp term create course_cat "Ciberseguridad" --slug=ciberseguridad-cursos
wp term create course_cat "Ventas y Comunicación" --slug=ventas-comunicacion-cursos
wp term create course_cat "Desarrollo Personal y Liderazgo" --slug=liderazgo-personal-cursos
wp term create course_cat "Tecnología y Desarrollo" --slug=tecnologia-desarrollo-cursos
wp term create course_cat "Finanzas" --slug=finanzas-cursos
wp term create course_cat "Gestión de Proyectos" --slug=gestion-proyectos-cursos
wp term create course_cat "Recursos Humanos" --slug=recursos-humanos-cursos
wp term create course_cat "Estrategia de Negocios" --slug=estrategia-negocios-cursos

# 2. Borrar los 347 cursos obsoletos (backup primero!)
# mysqldump -u usuario -p nombre_bd wp_posts wp_postmeta > backup_posts.sql
wp post delete 341 362 1184 1185 1186 1187 1188 1189 1190 1191 1192 1193 1194 1195 1196 1197 1198 1199 1200 1201 1202 1203 1204 1205 1206 1207 1208 1209 1210 1211 1212 1213 1214 1215 1216 1217 1231 1232 1233 1234 1235 1236 1237 1238 1239 1240 1241 1242 1243 1244 1245 1246 1247 1248 1249 1250 1251 1252 1253 1254 1255 1256 1257 1258 1259 1260 1261 1262 1263 1264 1291 1292 1293 1294 1295 1296 1297 1298 1299 1300 --force --skip-trash
wp post delete 1301 1302 1303 1304 1305 1306 1307 1308 1309 1310 1312 1313 1314 1315 1316 1317 1318 1319 1320 1321 1322 1323 1324 1325 1326 1327 1328 1329 1330 1331 1332 1333 1334 1335 1336 1337 1338 1339 1340 1341 1342 1343 1344 1345 1346 1347 1348 1349 1350 1351 --force --skip-trash
wp post delete 1352 1353 1354 1355 1356 1357 1358 1359 1360 1361 1362 1363 1364 1365 1366 1367 1368 1369 1370 1371 1372 1373 1374 1375 1376 1377 1378 1379 1380 1381 1382 1383 1384 1385 1386 1387 1388 1389 1390 1391 1392 1393 1394 1395 1396 1397 1398 1399 1400 --force --skip-trash
# (continuar en más lotes si hay más IDs)</pre>
  <p style="font-size:.75rem;color:#94a3b8;margin:8px 0 0">Si la taxonomía de tu LMS no es <code>course_cat</code>, reemplazala por la correcta (ej: <code>ld_course_category</code> para LearnDash).</p>
</div>

<p style="font-size:.78rem;color:#94a3b8;margin-top:16px">⚠️ <strong>Eliminá este archivo del servidor cuando termines.</strong> No debe quedar accesible públicamente.</p>

</body></html>
