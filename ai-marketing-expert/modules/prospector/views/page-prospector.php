<?php
/**
 * AI Client Prospector — Admin Page Template.
 *
 * @package WPSpace\AiMarketingExpert\Modules\Prospector
 */
if ( ! defined( 'ABSPATH' ) ) { exit; }

$username   = esc_html( wp_get_current_user()->display_name );
$back_url   = esc_url( admin_url( 'admin.php?page=ai-marketing-expert' ) );
$logout_url = esc_url( wp_logout_url( home_url() ) );

$industries = array(
	'Distribuidora Mayorista', 'Bodega de Vinos', 'Inmobiliaria & Alquileres',
	'Corralón de Construcción', 'Clínica de Salud / Estética',
	'Empaque de Fruta / Manzana', 'Gastronomía & Restorán',
	'Ferretería Industrial', 'Logística & Transporte',
);
$cities_rn = array( 'General Roca','Cipolletti','San Carlos de Bariloche','Viedma','Villa Regina','Allen','Cinco Saltos','Catriel','San Antonio Oeste' );
$cities_nq = array( 'Neuquén Capital','Plottier','Centenario','Zapala','Cutral Co','Plaza Huincul','San Martín de los Andes','Villa La Angostura','Chos Malal' );

// Helper: <option> list.
function aimp_opts( $arr, $sel = '' ) {
	$out = '';
	foreach ( $arr as $v ) {
		$out .= '<option value="' . esc_attr( $v ) . '"' . selected( $sel, $v, false ) . '>' . esc_html( $v ) . '</option>';
	}
	return $out;
}
// Helper: industry options + "Otro".
function aimp_ind_opts( $arr ) {
	$out = '';
	foreach ( $arr as $v ) {
		$out .= '<option value="' . esc_attr( $v ) . '">' . esc_html( $v ) . '</option>';
	}
	$out .= '<option value="OTRO">Otro rubro personalizado…</option>';
	return $out;
}

$meddic_criteria = array(
	array( 'key' => 'meddicMetrics',  'label' => 'M — Metrics Defined',     'desc' => '¿El cliente tiene métricas cuantificables de ahorro de tiempo y aumento de ventas que Clientum le solucionará?' ),
	array( 'key' => 'meddicBuyer',    'label' => 'E — Economic Buyer',      'desc' => '¿Hablás directamente con la persona que tiene la chequera para autorizar la compra (el Socio Gerente)?' ),
	array( 'key' => 'meddicCriteria', 'label' => 'D — Decision Criteria',   'desc' => '¿Están claros sus criterios de evaluación (integración WhatsApp, costo del plan, soporte, seguridad de datos)?' ),
	array( 'key' => 'meddicProcess',  'label' => 'D — Decision Process',    'desc' => '¿Conocés exactamente los pasos que toma para comprar (demo → aprobación de finanzas → firma → onboarding)?' ),
	array( 'key' => 'meddicPain',     'label' => 'I — Identify Pain',       'desc' => '¿Tenés confirmado el dolor profundo del negocio (ej: pérdida de $200.000 ARS por responder consultas tarde)?' ),
	array( 'key' => 'meddicChampion', 'label' => 'C — Champion Identified', 'desc' => '¿Tenés un Champion o defensor interno (ej: coordinador de ventas) presionando para cerrar la compra?' ),
);

$delegated_sections = array(
	'conversaciones' => array( 'icon' => '💬', 'title' => 'Conversaciones',  'desc' => 'Historial de conversaciones y mensajes de WhatsApp con leads. Disponible en el CRM Express completo.' ),
	'bot'            => array( 'icon' => '🤖', 'title' => 'Bot',             'desc' => 'Configuración del chatbot de WhatsApp con respuestas automáticas y flujos personalizados.' ),
	'productos'      => array( 'icon' => '📦', 'title' => 'Productos',       'desc' => 'Gestión del catálogo de productos y servicios del CRM.' ),
	'vendedores'     => array( 'icon' => '👤', 'title' => 'Vendedores',      'desc' => 'Gestión del equipo de ventas, territorios y comisiones.' ),
	'sucursales'     => array( 'icon' => '🏢', 'title' => 'Sucursales',      'desc' => 'Gestión de sucursales, direcciones y territorios asignados.' ),
	'brochure'       => array( 'icon' => '📄', 'title' => 'Brochure',        'desc' => 'Editor de propuesta comercial PDF con preview en vivo y exportación vectorial.' ),
	'config'         => array( 'icon' => '⚙️', 'title' => 'Configuración',   'desc' => 'Configuración general del CRM: colores, contacto, plantillas y visibilidad de secciones.' ),
	'contenido'      => array( 'icon' => '✏️', 'title' => 'Contenido',       'desc' => 'Editor de páginas y contenido del brochure comercial.' ),
	'copiloto'       => array( 'icon' => '✨', 'title' => 'Copiloto IA',     'desc' => 'Asistente de IA para generar y editar contenido del brochure. Powered by Gemini.' ),
	'actividad'      => array( 'icon' => '🕐', 'title' => 'Actividad',       'desc' => 'Registro de actividad del CRM: movimientos de etapa, leads creados y acciones realizadas.' ),
	'quickcreate'    => array( 'icon' => '⚡', 'title' => 'Creación Rápida', 'desc' => 'Creación rápida de deals/leads sincronizada en tiempo real al pipeline.' ),
);
?>
<div id="aime-prospector-wrap">

  <!-- ══════════════════════════ HEADER ══════════════════════════ -->
  <header class="aimp-header">
    <div class="aimp-header-brand">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
      AI CLIENT PROSPECTOR
      <span class="aimp-badge">v2.0 PRO</span>
    </div>
    <div class="aimp-header-sub">Sistema B2B · Calificación MEDDIC · Outreach IA · Patagonia</div>
    <div class="aimp-header-actions">
      <button class="aimp-btn aimp-btn-ghost aimp-export-csv-btn">⬇ CSV</button>
      <a href="<?php echo $back_url; ?>" class="aimp-btn aimp-btn-ghost">← Editor</a>
      <a href="<?php echo $logout_url; ?>" class="aimp-btn aimp-btn-danger" onclick="return confirm('¿Cerrar sesión como <?php echo $username; ?>?')">Salir</a>
    </div>
  </header>

  <!-- ══════════════════════════ BODY ════════════════════════════ -->
  <div class="aimp-body">

    <!-- ── SIDEBAR ─────────────────────────────────────────────── -->
    <nav class="aimp-sidebar">

      <div class="aimp-sidebar-group">Pipeline</div>
      <div class="aimp-nav-item active" data-section="pipeline">
        <span class="aimp-nav-icon">📊</span><span>CRM Pipeline</span>
      </div>

      <div class="aimp-sidebar-group">Prospección</div>
      <div class="aimp-nav-item" data-section="icp">
        <span class="aimp-nav-icon">🎯</span><span>ICP Builder</span>
      </div>
      <div class="aimp-nav-item" data-section="research">
        <span class="aimp-nav-icon">🔍</span><span>Patagonia Explorer</span>
      </div>
      <div class="aimp-nav-item" data-section="meddic">
        <span class="aimp-nav-icon">🏅</span><span>Calificación MEDDIC</span>
      </div>
      <div class="aimp-nav-item" data-section="outreach">
        <span class="aimp-nav-icon">✉️</span><span>Outreach Campaigns</span>
      </div>

      <div class="aimp-sidebar-group">CRM Completo</div>
      <div class="aimp-nav-item" data-section="conversaciones"><span class="aimp-nav-icon">💬</span><span>Conversaciones</span></div>
      <div class="aimp-nav-item" data-section="bot"><span class="aimp-nav-icon">🤖</span><span>Bot</span></div>
      <div class="aimp-nav-item" data-section="productos"><span class="aimp-nav-icon">📦</span><span>Productos</span></div>
      <div class="aimp-nav-item" data-section="vendedores"><span class="aimp-nav-icon">👤</span><span>Vendedores</span></div>
      <div class="aimp-nav-item" data-section="sucursales"><span class="aimp-nav-icon">🏢</span><span>Sucursales</span></div>

      <div class="aimp-sidebar-group">Herramientas</div>
      <div class="aimp-nav-item" data-section="brochure"><span class="aimp-nav-icon">📄</span><span>Brochure</span></div>
      <div class="aimp-nav-item" data-section="config"><span class="aimp-nav-icon">⚙️</span><span>Configuración</span></div>
      <div class="aimp-nav-item" data-section="contenido"><span class="aimp-nav-icon">✏️</span><span>Contenido</span></div>
      <div class="aimp-nav-item" data-section="copiloto"><span class="aimp-nav-icon">✨</span><span>Copiloto IA</span></div>
      <div class="aimp-nav-item" data-section="actividad"><span class="aimp-nav-icon">🕐</span><span>Actividad</span></div>
      <div class="aimp-nav-item" data-section="quickcreate"><span class="aimp-nav-icon">⚡</span><span>Creación Rápida</span></div>
    </nav>

    <!-- ── MAIN ─────────────────────────────────────────────────── -->
    <main class="aimp-main">

      <!-- ════════════════════════════════════════════════════════
           PIPELINE (shown by default)
      ════════════════════════════════════════════════════════ -->
      <div id="sec-pipeline" class="aimp-section active">

        <div class="aimp-page-header">
          <div>
            <h1 class="aimp-page-title">📊 Tablero Kanban de Ventas v2.0</h1>
            <p class="aimp-page-desc">Pipeline visual con métricas ejecutivas, checklist de acciones y alertas estratégicas en tiempo real.</p>
          </div>
          <button id="new-deal-toggle" class="aimp-btn aimp-btn-primary">＋ Nuevo Lead Manual</button>
        </div>

        <!-- Metrics strip -->
        <div class="aimp-stats-grid">
          <div class="aimp-stat"><span class="aimp-stat-val" id="stat-total">$0</span><span class="aimp-stat-lbl">Valor Total Pipeline</span></div>
          <div class="aimp-stat"><span class="aimp-stat-val" id="stat-won">$0</span><span class="aimp-stat-lbl">Facturación Ganada</span></div>
          <div class="aimp-stat"><span class="aimp-stat-val" id="stat-active">0</span><span class="aimp-stat-lbl">Prospectos Activos</span></div>
          <div class="aimp-stat"><span class="aimp-stat-val" id="stat-rate">0%</span><span class="aimp-stat-lbl">Tasa de Conversión</span></div>
        </div>

        <!-- New deal form (hidden by default) -->
        <div id="new-deal-form" class="aimp-form">
          <div class="aimp-card-title">➕ Registrar Nuevo Lead</div>
          <div class="aimp-form-grid">
            <div class="aimp-field"><label>Empresa *</label><input id="nd-company" type="text" placeholder="Ej. Distribuidora Comahue SRL"></div>
            <div class="aimp-field"><label>Valor Estimado ARS</label><input id="nd-amount" type="number" placeholder="180000" value="180000"></div>
            <div class="aimp-field"><label>Contacto Directo</label><input id="nd-contact" type="text" placeholder="Ej. Marcos Ramirez (Dueño)"></div>
            <div class="aimp-field"><label>Teléfono Local</label><input id="nd-phone" type="text" placeholder="Ej. +54 298 4432120"></div>
            <div class="aimp-field">
              <label>Rubro Comercial</label>
              <select id="nd-industry"><?php echo aimp_opts( $industries, 'Distribuidora Mayorista' ); ?></select>
            </div>
            <div class="aimp-field">
              <label>Etapa del Embudo</label>
              <select id="nd-stage">
                <option value="leads">Nuevos Leads</option>
                <option value="bot_contact">WhatsApp Bot</option>
                <option value="proposed">Propuesta</option>
                <option value="closed">Ganados</option>
              </select>
            </div>
          </div>
          <div style="display:flex;gap:8px">
            <button id="save-new-deal" class="aimp-btn aimp-btn-primary">💾 Guardar Lead</button>
            <button id="cancel-new-deal" class="aimp-btn aimp-btn-outline">Cancelar</button>
          </div>
        </div>

        <!-- Kanban + Checklist -->
        <div class="aimp-kanban-grid">

          <div class="aimp-kanban-col aimp-col-leads">
            <div class="aimp-col-head">Nuevos Leads <span class="aimp-col-count" data-stage="leads">0</span></div>
            <div class="aimp-col-body" data-stage="leads">
              <div class="aimp-col-empty">Sin leads en esta etapa</div>
            </div>
          </div>

          <div class="aimp-kanban-col aimp-col-bot">
            <div class="aimp-col-head">WhatsApp Bot <span class="aimp-col-count" data-stage="bot_contact">0</span></div>
            <div class="aimp-col-body" data-stage="bot_contact">
              <div class="aimp-col-empty">Sin leads en esta etapa</div>
            </div>
          </div>

          <div class="aimp-kanban-col aimp-col-prop">
            <div class="aimp-col-head">Propuesta <span class="aimp-col-count" data-stage="proposed">0</span></div>
            <div class="aimp-col-body" data-stage="proposed">
              <div class="aimp-col-empty">Sin leads en esta etapa</div>
            </div>
          </div>

          <!-- Checklist column -->
          <div>
            <div class="aimp-checklist-panel">
              <div class="aimp-checklist-head">📋 Plan de Acción Diario</div>
              <div class="aimp-checklist-body" id="checklist-items"></div>
            </div>
            <div class="aimp-kanban-col aimp-col-won" style="margin-top:12px">
              <div class="aimp-col-head">Ganados ✓ <span class="aimp-col-count" data-stage="closed">0</span></div>
              <div class="aimp-col-body" data-stage="closed">
                <div class="aimp-col-empty">Sin cierres aún</div>
              </div>
            </div>
          </div>

        </div><!-- /kanban grid -->

        <div class="aimp-alert aimp-alert-warning" style="margin-top:16px">
          ⚠️ <strong>Alerta de Riesgo:</strong> Los leads en "Propuesta" sin calificación MEDDIC ≥40% no deberían avanzar sin auditoría previa.
        </div>

      </div><!-- /sec-pipeline -->


      <!-- ════════════════════════════════════════════════════════
           ICP BUILDER
      ════════════════════════════════════════════════════════ -->
      <div id="sec-icp" class="aimp-section" style="display:none">

        <div class="aimp-page-header">
          <div>
            <h1 class="aimp-page-title">🎯 Ideal Customer Profile (ICP) Builder</h1>
            <p class="aimp-page-desc">Definí tu cliente ideal. La IA analizará facturación, tamaño corporativo y tomadores de decisiones para generar un perfil MEDDIC detallado en segundos.</p>
          </div>
        </div>

        <div class="aimp-2col" style="align-items:start">
          <div class="aimp-card">
            <div class="aimp-card-title">Configurar ICP</div>
            <div class="aimp-field" style="margin-bottom:12px">
              <label>Rubro de la Empresa</label>
              <select id="icp-industry" style="margin-top:5px"><?php echo aimp_ind_opts( $industries ); ?></select>
            </div>
            <div class="aimp-field" id="icp-custom-wrap" style="display:none;margin-bottom:12px">
              <label>Rubro personalizado</label>
              <input id="icp-custom" type="text" placeholder="Ej. Veterinaria o Taller" style="margin-top:5px">
            </div>
            <div class="aimp-field" style="margin-bottom:16px">
              <label>Monto de Contrato Promedio ACV</label>
              <input id="icp-acv" type="text" value="$180.000 ARS/mes" style="margin-top:5px">
            </div>
            <button id="gen-icp-btn" class="aimp-btn aimp-btn-ai">✨ Generar Perfil ICP</button>
            <p style="font-size:10px;color:#94a3b8;margin-top:8px">Powered by Gemini AI · Persiste en el navegador</p>
          </div>

          <div id="icp-empty-state" style="text-align:center;padding:60px 20px;color:#94a3b8">
            <div style="font-size:48px;margin-bottom:12px">🎯</div>
            <div style="font-weight:700;font-size:15px;color:#1e293b;margin-bottom:6px">Todavía no generaste un ICP</div>
            <div style="font-size:12px">Seleccioná un rubro y hacé clic en "Generar Perfil ICP" para comenzar.</div>
          </div>
        </div>

        <div id="icp-output" style="display:none;margin-top:16px"></div>

      </div><!-- /sec-icp -->


      <!-- ════════════════════════════════════════════════════════
           PATAGONIA EXPLORER
      ════════════════════════════════════════════════════════ -->
      <div id="sec-research" class="aimp-section" style="display:none">

        <div class="aimp-page-header">
          <div>
            <h1 class="aimp-page-title">🔍 Buscador Patagónico Satelital</h1>
            <p class="aimp-page-desc">Encontrá y calificá prospectos de Río Negro y Neuquén. Datos de Google Maps y Guía Cores integrados.</p>
          </div>
          <div id="explorer-status-badge" class="aimp-badge" style="background:#475569;padding:5px 10px;font-size:10px">MODO SIMULADO ⚠️</div>
        </div>

        <div class="aimp-explorer-layout">

          <!-- Search panel -->
          <div>
            <div class="aimp-card">
              <div class="aimp-card-title">Configurar Búsqueda</div>

              <div style="margin-bottom:12px">
                <div style="font-size:11px;font-weight:600;color:#374151;margin-bottom:6px">Provincia</div>
                <div class="aimp-filter-row">
                  <button class="aimp-filter-chip active aimp-prov-btn" data-prov="RN">🏔 Río Negro</button>
                  <button class="aimp-filter-chip aimp-prov-btn" data-prov="NQ">🌿 Neuquén</button>
                </div>
              </div>

              <div class="aimp-field" style="margin-bottom:12px">
                <label>Ciudad Local</label>
                <select id="exp-city" style="margin-top:5px"><?php echo aimp_opts( $cities_rn, 'General Roca' ); ?></select>
              </div>

              <div class="aimp-field" style="margin-bottom:12px">
                <label>Rubro de Negocio</label>
                <select id="exp-industry" style="margin-top:5px"><?php echo aimp_ind_opts( $industries ); ?></select>
              </div>
              <div id="exp-custom-wrap" style="display:none;margin-bottom:12px">
                <div class="aimp-field">
                  <label>Rubro personalizado</label>
                  <input id="exp-custom" type="text" placeholder="Ej. Taller Mecánico, Farmacia" style="margin-top:5px">
                </div>
              </div>

              <div style="font-size:10px;font-weight:600;color:#374151;margin-bottom:6px">Distancia Máxima</div>
              <div class="aimp-filter-row" style="margin-bottom:12px">
                <button class="aimp-filter-chip active" data-filter="dist" data-val="any">Cualquiera</button>
                <button class="aimp-filter-chip" data-filter="dist" data-val="2">&lt;2 km</button>
                <button class="aimp-filter-chip" data-filter="dist" data-val="5">&lt;5 km</button>
                <button class="aimp-filter-chip" data-filter="dist" data-val="10">&lt;10 km</button>
              </div>

              <div style="font-size:10px;font-weight:600;color:#374151;margin-bottom:6px">Calificación Mínima</div>
              <div class="aimp-filter-row" style="margin-bottom:16px">
                <button class="aimp-filter-chip active" data-filter="rating" data-val="0">Todos</button>
                <button class="aimp-filter-chip" data-filter="rating" data-val="3.5">3.5★</button>
                <button class="aimp-filter-chip" data-filter="rating" data-val="4.0">4.0★</button>
                <button class="aimp-filter-chip" data-filter="rating" data-val="4.5">4.5★</button>
              </div>

              <button id="exp-search-btn" class="aimp-btn aimp-btn-primary" style="width:100%;justify-content:center">
                🔍 Buscar Leads en General Roca
              </button>
            </div>

            <div class="aimp-map-box" id="exp-map">
              <div style="color:#94a3b8;text-align:center">
                <div style="font-size:36px;margin-bottom:8px">🗺️</div>
                <div style="font-weight:600;font-size:13px;color:#475569">Seleccioná un prospecto</div>
                <div style="font-size:10px;margin-top:4px">Clientum Lead Mining v2.0</div>
              </div>
            </div>
          </div>

          <!-- Results -->
          <div>
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px">
              <div id="exp-results-count" style="font-size:13px;font-weight:600;color:#374151">Sin búsquedas activas</div>
            </div>
            <div id="prospect-grid" class="aimp-prospect-grid">
              <div style="grid-column:1/-1;text-align:center;padding:60px;color:#94a3b8">
                <div style="font-size:36px;margin-bottom:10px">🔍</div>
                <div style="font-weight:700;font-size:14px;color:#475569">No se encontraron búsquedas activas</div>
                <div style="font-size:12px;margin-top:4px">Elegí la localidad y el rubro para buscar leads.</div>
              </div>
            </div>
          </div>

        </div><!-- /explorer layout -->
      </div><!-- /sec-research -->


      <!-- ════════════════════════════════════════════════════════
           MEDDIC SCORECARD
      ════════════════════════════════════════════════════════ -->
      <div id="sec-meddic" class="aimp-section" style="display:none">

        <div class="aimp-page-header">
          <div>
            <h1 class="aimp-page-title">🏅 MEDDIC Qualification Scorecard</h1>
            <p class="aimp-page-desc">Puntaje de 6 criterios (1–5 estrellas) para auditar el potencial de conversión de cada lead del pipeline.</p>
          </div>
        </div>

        <div class="aimp-field" style="max-width:400px;margin-bottom:20px">
          <label>Lead a calificar</label>
          <select id="meddic-sel" style="margin-top:5px"><option value="">— Seleccioná un lead activo —</option></select>
        </div>

        <div id="meddic-no-lead" style="text-align:center;padding:40px;color:#94a3b8">
          <div style="font-size:36px;margin-bottom:8px">🏅</div>
          <div style="font-size:14px;font-weight:700;color:#475569">Seleccioná un lead para auditar su calificación MEDDIC</div>
        </div>

        <div id="meddic-content" style="display:none">
          <div class="aimp-meddic-layout">
            <div class="aimp-card">
              <?php foreach ( $meddic_criteria as $c ) : ?>
              <div class="aimp-criterion">
                <div class="aimp-criterion-label"><?php echo esc_html( $c['label'] ); ?></div>
                <div class="aimp-criterion-desc"><?php echo esc_html( $c['desc'] ); ?></div>
                <div class="aimp-stars" data-key="<?php echo esc_attr( $c['key'] ); ?>">
                  <span class="aimp-star on">★</span><span class="aimp-star on">★</span><span class="aimp-star on">★</span><span class="aimp-star">★</span><span class="aimp-star">★</span>
                </div>
              </div>
              <?php endforeach; ?>

              <div class="aimp-field" style="margin-top:8px">
                <label>Red Flags / Deal Breakers</label>
                <textarea id="meddic-redflags" rows="3" style="margin-top:5px" placeholder="Riesgos técnicos, retrasos presupuestarios o competidores…">Aún no se ha identificado un Champion clave dentro de la PyME.</textarea>
              </div>
              <button id="save-meddic-btn" class="aimp-btn aimp-btn-primary" style="margin-top:14px">💾 Guardar Calificación MEDDIC</button>
            </div>

            <div class="aimp-gauge">
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#94a3b8">Score MEDDIC</div>
              <div class="aimp-gauge-num" id="meddic-score-num">60</div>
              <div class="aimp-gauge-status aimp-meddic-pill stable" id="meddic-score-status">STABLE</div>
              <div class="aimp-gauge-bar-bg">
                <div class="aimp-gauge-bar" id="meddic-score-bar" style="width:60%;background:#3b82f6"></div>
              </div>
              <div id="meddic-temp" style="font-size:12px;font-weight:600;color:#374151;margin-bottom:14px">⚡ WARM — Medianamente Calificado</div>
              <div class="aimp-next-actions">
                <h4>⚡ Next Best Actions</h4>
                <div id="meddic-actions">
                  <div class="aimp-next-action">Seleccioná un lead para ver acciones recomendadas</div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div><!-- /sec-meddic -->


      <!-- ════════════════════════════════════════════════════════
           OUTREACH CAMPAIGNS
      ════════════════════════════════════════════════════════ -->
      <div id="sec-outreach" class="aimp-section" style="display:none">

        <div class="aimp-page-header">
          <div>
            <h1 class="aimp-page-title">✉️ Outreach Campaigns — Secuencias de Contacto</h1>
            <p class="aimp-page-desc">Generá automáticamente campañas multi-canal (3 emails + LinkedIn + llamada) para cada lead usando IA.</p>
          </div>
        </div>

        <div style="display:flex;gap:12px;align-items:flex-end;margin-bottom:20px">
          <div class="aimp-field" style="flex:1;max-width:380px">
            <label>Seleccioná un lead del pipeline</label>
            <select id="outreach-sel" style="margin-top:5px"><option value="">— Seleccioná un lead —</option></select>
          </div>
          <button id="gen-outreach-btn" class="aimp-btn aimp-btn-ai">✨ Generar Campaña Outreach</button>
        </div>

        <div id="outreach-empty" style="text-align:center;padding:60px;color:#94a3b8">
          <div style="font-size:36px;margin-bottom:10px">✉️</div>
          <div style="font-size:14px;font-weight:700;color:#475569">Ningún lead seleccionado para la campaña de Outreach</div>
          <div style="font-size:12px;margin-top:4px">Elegí un prospecto y generá la campaña con IA.</div>
        </div>

        <div id="outreach-result" style="display:none">
          <div class="aimp-card">
            <div class="aimp-card-title">📧 Secuencias de Email & Comunicación</div>
            <div class="aimp-tabs">
              <button class="aimp-tab active" data-tab="email1">Email 1 — Apertura</button>
              <button class="aimp-tab" data-tab="email2">Email 2 — Seguimiento</button>
              <button class="aimp-tab" data-tab="email3">Email 3 — Cierre</button>
              <button class="aimp-tab" data-tab="linkedin">LinkedIn</button>
              <button class="aimp-tab" data-tab="phone">Guion Telefónico</button>
            </div>

            <div class="aimp-tab-panel active" data-panel="email1">
              <div style="font-size:11px;font-weight:700;color:#374151;margin-bottom:6px">Asunto: <span id="out-e1-subj" style="font-weight:400;color:#1e293b"></span></div>
              <pre class="aimp-email-pre" id="out-e1-body"></pre>
              <button class="aimp-btn aimp-btn-outline aimp-btn-sm aimp-copy-btn" data-copy="out-e1-body">📋 Copiar Email</button>
            </div>

            <div class="aimp-tab-panel" data-panel="email2">
              <div style="font-size:11px;font-weight:700;color:#374151;margin-bottom:6px">Asunto: <span id="out-e2-subj" style="font-weight:400;color:#1e293b"></span></div>
              <pre class="aimp-email-pre" id="out-e2-body"></pre>
              <button class="aimp-btn aimp-btn-outline aimp-btn-sm aimp-copy-btn" data-copy="out-e2-body">📋 Copiar Email</button>
            </div>

            <div class="aimp-tab-panel" data-panel="email3">
              <div style="font-size:11px;font-weight:700;color:#374151;margin-bottom:6px">Asunto: <span id="out-e3-subj" style="font-weight:400;color:#1e293b"></span></div>
              <pre class="aimp-email-pre" id="out-e3-body"></pre>
              <button class="aimp-btn aimp-btn-outline aimp-btn-sm aimp-copy-btn" data-copy="out-e3-body">📋 Copiar Email</button>
            </div>

            <div class="aimp-tab-panel" data-panel="linkedin">
              <div id="out-linkedin-steps"></div>
              <button class="aimp-btn aimp-btn-outline aimp-btn-sm aimp-copy-btn" data-copy="out-linkedin-steps">📋 Copiar Secuencia</button>
            </div>

            <div class="aimp-tab-panel" data-panel="phone">
              <pre class="aimp-email-pre" id="out-phone"></pre>
              <button class="aimp-btn aimp-btn-outline aimp-btn-sm aimp-copy-btn" data-copy="out-phone">📋 Copiar Guion</button>
            </div>
          </div>
        </div>

      </div><!-- /sec-outreach -->


      <!-- ════════════════════════════════════════════════════════
           DELEGATED SECTIONS
      ════════════════════════════════════════════════════════ -->
      <?php foreach ( $delegated_sections as $id => $d ) : ?>
      <div id="sec-<?php echo esc_attr( $id ); ?>" class="aimp-section" style="display:none">
        <div class="aimp-delegated">
          <span class="aimp-delegated-icon"><?php echo esc_html( $d['icon'] ); ?></span>
          <div class="aimp-delegated-title"><?php echo esc_html( $d['title'] ); ?></div>
          <p class="aimp-delegated-desc"><?php echo esc_html( $d['desc'] ); ?></p>
          <a href="<?php echo esc_url( admin_url( 'admin.php?page=ai-marketing-expert' ) ); ?>" class="aimp-btn aimp-btn-primary">
            Abrir en CRM Editor →
          </a>
        </div>
      </div>
      <?php endforeach; ?>

    </main><!-- /aimp-main -->
  </div><!-- /aimp-body -->
</div><!-- /aime-prospector-wrap -->

<script>
/* Quick inline fixes — full logic in prospector.js */
(function() {
  /* City dropdown label update */
  var cityEl = document.getElementById('exp-city');
  var searchBtn = document.getElementById('exp-search-btn');
  function updateSearchBtn() {
    if (searchBtn && cityEl) {
      searchBtn.textContent = '🔍 Buscar Leads en ' + (cityEl.options[cityEl.selectedIndex] ? cityEl.options[cityEl.selectedIndex].text : '…');
    }
  }
  if (cityEl) { cityEl.addEventListener('change', updateSearchBtn); updateSearchBtn(); }

  /* Province toggle */
  var cities = {
    RN: <?php echo json_encode( $cities_rn ); ?>,
    NQ: <?php echo json_encode( $cities_nq ); ?>
  };
  document.querySelectorAll('.aimp-prov-btn').forEach(function(btn) {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.aimp-prov-btn').forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var prov = btn.dataset.prov;
      var sel = document.getElementById('exp-city');
      if (sel) {
        sel.innerHTML = '';
        (cities[prov] || []).forEach(function(c) {
          var o = document.createElement('option'); o.value = c; o.textContent = c; sel.appendChild(o);
        });
        updateSearchBtn();
      }
    });
  });

  /* Industry custom field toggle */
  ['icp-industry|icp-custom-wrap', 'exp-industry|exp-custom-wrap'].forEach(function(pair) {
    var parts = pair.split('|');
    var sel = document.getElementById(parts[0]);
    var wrap = document.getElementById(parts[1]);
    if (sel && wrap) {
      sel.addEventListener('change', function() { wrap.style.display = sel.value === 'OTRO' ? 'block' : 'none'; });
    }
  });

  /* Cancel new deal form */
  var cancelBtn = document.getElementById('cancel-new-deal');
  var form = document.getElementById('new-deal-form');
  var toggle = document.getElementById('new-deal-toggle');
  if (cancelBtn && form && toggle) {
    cancelBtn.addEventListener('click', function() {
      form.classList.remove('open');
      toggle.textContent = '＋ Nuevo Lead Manual';
    });
  }
  if (toggle && form) {
    toggle.addEventListener('click', function() {
      var open = form.classList.contains('open');
      form.classList.toggle('open', !open);
      toggle.textContent = open ? '＋ Nuevo Lead Manual' : '✕ Cancelar';
    });
  }

  /* Filter chips (single-select within a group) */
  document.querySelectorAll('.aimp-filter-chip[data-filter]').forEach(function(chip) {
    chip.addEventListener('click', function() {
      var group = chip.dataset.filter;
      document.querySelectorAll('.aimp-filter-chip[data-filter="' + group + '"]').forEach(function(c) { c.classList.remove('active'); });
      chip.classList.add('active');
    });
  });
})();
</script>
<?php
