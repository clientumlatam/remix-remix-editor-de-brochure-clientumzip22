/* ============================================================
   AI Client Prospector v2.0 — SPA JavaScript
   ============================================================ */
(function () {
  'use strict';

  const cfg   = window.aimeProspector || {};
  const REST  = cfg.restUrl || '/wp-json/aime/v1/prospector/';
  const NONCE = cfg.nonce  || '';

  /* ── State ─────────────────────────────────────────────── */
  let deals        = [];
  let icpData      = null;
  let prospects    = [];
  let meddicLead   = null;
  let outreachLead = null;
  let outreachData = null;
  let researchCache= {};
  let checklist    = JSON.parse(localStorage.getItem('aimp_checklist') || '[]');

  const STAGES = ['leads','bot_contact','proposed','closed'];
  const STAGE_LABELS = { leads:'Nuevos Leads', bot_contact:'WhatsApp Bot', proposed:'Propuesta', closed:'Ganados ✓' };
  const INDUSTRIES = ['Distribuidora Mayorista','Bodega de Vinos','Inmobiliaria & Alquileres','Corralón de Construcción','Clínica de Salud / Estética','Empaque de Fruta / Manzana','Gastronomía & Restorán','Ferretería Industrial','Logística & Transporte'];

  const MEDDIC_CRITERIA = [
    { key:'meddicMetrics',  label:'M — Metrics Defined' },
    { key:'meddicBuyer',    label:'E — Economic Buyer' },
    { key:'meddicCriteria', label:'D — Decision Criteria' },
    { key:'meddicProcess',  label:'D — Decision Process' },
    { key:'meddicPain',     label:'I — Identify Pain' },
    { key:'meddicChampion', label:'C — Champion Identified' },
  ];

  const DEFAULT_CHECKLIST = [
    { text:'Buscar 5 nuevos prospectos locales de acopio o logística', done:false },
    { text:'Investigar señales de compra de los top 3 leads', done:false },
    { text:'Calificar con MEDDIC los contactos en etapa Propuesta', done:true },
    { text:'Generar secuencias de outreach personalizadas', done:false },
    { text:'Enviar correos de seguimiento a leads fríos', done:false },
  ];
  if (!checklist.length) checklist = DEFAULT_CHECKLIST;

  /* ── API helpers ────────────────────────────────────────── */
  async function api(path, opts = {}) {
    const res = await fetch(REST + path, {
      headers: { 'Content-Type':'application/json', 'X-WP-Nonce':NONCE },
      ...opts,
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  }
  const get  = path          => api(path, { method:'GET' });
  const post = (path, body)  => api(path, { method:'POST',   body:JSON.stringify(body) });
  const put  = (path, body)  => api(path, { method:'PUT',    body:JSON.stringify(body) });
  const del  = path          => api(path, { method:'DELETE' });

  /* ── Helpers ────────────────────────────────────────────── */
  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }
  function fmtARS(n) {
    n = +n || 0;
    if (n >= 1000000) return '$' + (n/1000000).toFixed(1) + 'M';
    if (n >= 1000)    return '$' + Math.round(n/1000) + 'K';
    return '$' + n;
  }
  function meddicClass(s) {
    return s < 40 ? 'critical' : s < 60 ? 'at-risk' : s < 80 ? 'stable' : 'optimized';
  }
  function meddicLabel(s) {
    return s < 40 ? 'CRITICAL' : s < 60 ? 'AT RISK' : s < 80 ? 'STABLE' : 'OPTIMIZED';
  }
  function kv(k, v) {
    return `<div class="aimp-kv"><span class="aimp-kv-k">${k}</span><span class="aimp-kv-v">${esc(String(v||'—'))}</span></div>`;
  }

  /* ── Routing ────────────────────────────────────────────── */
  function showSection(id) {
    document.querySelectorAll('.aimp-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.aimp-nav-item').forEach(n => n.classList.remove('active'));
    const sec = document.getElementById('sec-' + id);
    if (sec) sec.classList.add('active');
    const nav = document.querySelector(`[data-section="${id}"]`);
    if (nav) nav.classList.add('active');
    if (id === 'pipeline') renderPipeline();
    if (id === 'meddic')   populateMeddicSel();
    if (id === 'outreach') populateOutreachSel();

    /* Lazy-load iframe for AI Marketing Suite modules */
    if (sec && sec.classList.contains('aimp-iframe-section')) {
      const iframe  = sec.querySelector('.aimp-module-iframe');
      const loader  = sec.querySelector('.aimp-iframe-loader');
      const ifreSrc = sec.dataset.iframeSrc;
      if (iframe && ifreSrc && !iframe.src) {
        iframe.addEventListener('load', function onLoad() {
          if (loader) loader.style.display = 'none';
          iframe.style.display = 'block';
          iframe.removeEventListener('load', onLoad);
        });
        iframe.src = ifreSrc;
      } else if (iframe && iframe.src) {
        /* Already loaded — just make sure loader is hidden */
        if (loader) loader.style.display = 'none';
        iframe.style.display = 'block';
      }
    }
  }

  document.querySelectorAll('.aimp-nav-item').forEach(el => {
    el.addEventListener('click', () => showSection(el.dataset.section));
  });

  /* ── PIPELINE ───────────────────────────────────────────── */
  async function loadDeals() {
    try { deals = await get('deals'); } catch(e) { deals = []; }
    renderPipeline();
  }

  function renderPipeline() {
    renderStats();
    STAGES.forEach(stage => {
      const col   = document.querySelector(`.aimp-col-body[data-stage="${stage}"]`);
      const badge = document.querySelector(`.aimp-col-count[data-stage="${stage}"]`);
      if (!col) return;
      const stageDeal = deals.filter(d => d.stage === stage);
      if (badge) badge.textContent = stageDeal.length;
      if (!stageDeal.length) {
        col.innerHTML = `<div class="aimp-col-empty">Sin leads en esta etapa</div>`;
        return;
      }
      col.innerHTML = stageDeal.map(dealCard).join('');
      col.querySelectorAll('[data-action]').forEach(btn => btn.addEventListener('click', handleDealAction));
    });
    // Populate selectors.
    populateMeddicSel();
    populateOutreachSel();
  }

  function renderStats() {
    const total  = deals.reduce((s,d) => s+d.amount, 0);
    const won    = deals.filter(d => d.stage==='closed').reduce((s,d) => s+d.amount, 0);
    const active = deals.filter(d => d.stage!=='closed').length;
    const rate   = deals.length ? Math.round(deals.filter(d=>d.stage==='closed').length/deals.length*100) : 0;
    const q = id => document.getElementById(id);
    if (q('stat-total'))  q('stat-total').textContent  = fmtARS(total);
    if (q('stat-won'))    q('stat-won').textContent    = fmtARS(won);
    if (q('stat-active')) q('stat-active').textContent = active;
    if (q('stat-rate'))   q('stat-rate').textContent   = rate + '%';
  }

  function dealCard(d) {
    const si   = STAGES.indexOf(d.stage);
    const prev = si > 0 ? STAGES[si-1] : null;
    const next = si < STAGES.length-1 ? STAGES[si+1] : null;
    const mc   = meddicClass(d.meddicScore||40);
    return `
      <div class="aimp-deal" data-id="${d.id}">
        <div class="aimp-deal-company">${esc(d.company)}</div>
        <div class="aimp-deal-meta">${esc(d.industry||'')}${d.city?' · '+esc(d.city):''}</div>
        <div class="aimp-deal-amount">${fmtARS(d.amount)} ARS/mes</div>
        ${d.contact?`<div style="font-size:10px;color:#64748b;margin-bottom:5px">👤 ${esc(d.contact)}</div>`:''}
        <span class="aimp-meddic-pill ${mc}">MEDDIC ${d.meddicScore||40}%</span>
        ${d.stage==='proposed'&&(d.meddicScore||40)<40?'<div style="font-size:10px;color:#b45309;margin:4px 0">⚠️ Requiere calificación MEDDIC</div>':''}
        <div class="aimp-deal-actions">
          ${prev?`<button class="aimp-deal-action" data-action="back" data-id="${d.id}" data-stage="${prev}" title="${STAGE_LABELS[prev]}">← Atrás</button>`:''}
          ${next?`<button class="aimp-deal-action" data-action="next" data-id="${d.id}" data-stage="${next}" title="${STAGE_LABELS[next]}">${STAGE_LABELS[next]} →</button>`:''}
          <button class="aimp-deal-action" data-action="meddic"   data-id="${d.id}">MEDDIC</button>
          <button class="aimp-deal-action" data-action="outreach" data-id="${d.id}">Outreach</button>
          <button class="aimp-deal-action del" data-action="delete" data-id="${d.id}">✕</button>
        </div>
      </div>`;
  }

  async function handleDealAction(e) {
    const btn    = e.currentTarget;
    const id     = +btn.dataset.id;
    const action = btn.dataset.action;

    if (action === 'back' || action === 'next') {
      const d = deals.find(x => x.id===id); if (!d) return;
      try { const upd = await put(`deals/${id}`,{stage:btn.dataset.stage}); Object.assign(d,upd); renderPipeline(); } catch {}
    }
    if (action === 'delete') {
      if (!confirm(`¿Eliminar "${deals.find(x=>x.id===id)?.company}"?`)) return;
      try { await del(`deals/${id}`); } catch {}
      deals = deals.filter(x=>x.id!==id);
      renderPipeline();
    }
    if (action === 'meddic') {
      showSection('meddic');
      setTimeout(() => { const s=document.getElementById('meddic-sel'); if(s){s.value=id;s.dispatchEvent(new Event('change'));} }, 120);
    }
    if (action === 'outreach') {
      showSection('outreach');
      setTimeout(() => { const s=document.getElementById('outreach-sel'); if(s){s.value=id;s.dispatchEvent(new Event('change'));} }, 120);
    }
  }

  /* ── New Deal Form ──────────────────────────────────────── */
  // Toggle handled in page inline script; just bind the save button.
  const saveNewDealBtn = document.getElementById('save-new-deal');
  if (saveNewDealBtn) {
    saveNewDealBtn.addEventListener('click', async () => {
      const v    = id => document.getElementById(id)?.value || '';
      const company = v('nd-company');
      if (!company) { alert('Ingresá el nombre de la empresa'); return; }
      saveNewDealBtn.disabled = true;
      try {
        const d = await post('deals', {
          company, amount:+v('nd-amount')||180000, contact:v('nd-contact'),
          phone:v('nd-phone'), industry:v('nd-industry'), stage:v('nd-stage')||'leads',
          meddicScore:40, meddicRedFlags:'Aún no se ha identificado un Champion clave dentro de la PyME.',
        });
        deals.push(d);
        renderPipeline();
        const form   = document.getElementById('new-deal-form');
        const toggle = document.getElementById('new-deal-toggle');
        if (form)   form.classList.remove('open');
        if (toggle) toggle.textContent = '＋ Nuevo Lead Manual';
        ['nd-company','nd-contact','nd-phone'].forEach(id => { const el=document.getElementById(id); if(el) el.value=''; });
        document.getElementById('nd-amount') && (document.getElementById('nd-amount').value = '180000');
      } catch(e) { alert('Error al guardar: ' + e.message); }
      saveNewDealBtn.disabled = false;
    });
  }

  /* ── ICP BUILDER ────────────────────────────────────────── */
  const genIcpBtn = document.getElementById('gen-icp-btn');
  if (genIcpBtn) {
    genIcpBtn.addEventListener('click', async () => {
      const industryEl = document.getElementById('icp-industry');
      const customEl   = document.getElementById('icp-custom');
      const acvEl      = document.getElementById('icp-acv');
      const ind = (industryEl?.value === 'OTRO' ? customEl?.value : industryEl?.value) || INDUSTRIES[0];
      const acv = acvEl?.value || '$180.000 ARS/mes';
      if (!ind) { alert('Seleccioná un rubro'); return; }

      genIcpBtn.disabled = true;
      genIcpBtn.innerHTML = '<span class="aimp-spin"></span> Analizando con IA…';

      try {
        icpData = await post('generate', { action:'buildICP', industry:ind, acv });
        renderICP(icpData);
        const emptyState = document.getElementById('icp-empty-state');
        if (emptyState) emptyState.style.display = 'none';
      } catch(e) { alert('Error IA: ' + e.message); }

      genIcpBtn.disabled = false;
      genIcpBtn.innerHTML = '✨ Generar Perfil ICP';
    });
  }

  function renderICP(d) {
    const out = document.getElementById('icp-output');
    if (!out) return;
    out.style.display = 'block';
    out.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
        <h2 style="font-size:16px;font-weight:800;margin:0;color:#0f172a">ICP — ${esc(d.industry||'')}</h2>
        <span class="aimp-ai-badge">✨ Generado por IA v2.0</span>
      </div>
      <div class="aimp-icp-grid">
        <div class="aimp-icp-card">
          <div class="aimp-icp-card-title">🏢 Perfil Corporativo</div>
          ${kv('Rubros Verticales',  d.industry)}
          ${kv('ARR Estimado',       d.arrRange)}
          ${kv('Empleados',          d.employeeCount)}
          ${kv('Etapa del Negocio',  d.stage)}
          ${kv('Tasa Crecimiento',   d.growthRate)}
        </div>
        <div class="aimp-icp-card">
          <div class="aimp-icp-card-title">👤 Tomador de Decisiones</div>
          ${kv('Rol Principal',      d.decisionMakerRole)}
          ${kv('Seniority',          d.decisionMakerSeniority)}
          ${kv('Autoridad Presupuesto', d.budgetAuthority)}
          ${kv('Dolores Críticos', Array.isArray(d.painPoints)?d.painPoints.join('; '):d.painPoints)}
        </div>
        <div class="aimp-icp-card">
          <div class="aimp-icp-card-title">💰 Impacto Financiero</div>
          ${kv('Valor Contrato Promedio', d.avgContractValue)}
          ${kv('Ciclo de Venta',     d.salesCycle)}
          ${kv('Potencial Conversión', d.winRatePotential)}
          ${kv('LTV:CAC Objetivo',   d.ltvToCac)}
        </div>
        <div class="aimp-icp-card">
          <div class="aimp-icp-card-title">📍 Foco Geográfico</div>
          ${kv('Regiones', Array.isArray(d.regions)?d.regions.join(', '):d.regions)}
          ${kv('Husos Horarios', Array.isArray(d.timeZones)?d.timeZones.join(', '):d.timeZones)}
        </div>
      </div>
      <div class="aimp-card" style="margin-top:12px">
        <div class="aimp-card-title">✅ Criterios MEDDIC de Conversión</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">
          ${kv('M — Metrics',             d.meddicMetrics)}
          ${kv('E — Economic Buyer',      d.meddicEconomicBuyer)}
          ${kv('D — Decision Criteria',   d.meddicDecisionCriteria)}
          ${kv('D — Decision Process',    d.meddicDecisionProcess)}
          ${kv('I — Identify Pain',       d.meddicIdentifyPain)}
          ${kv('C — Champion',            d.meddicChampion)}
        </div>
      </div>
      ${d._fallback?'<div class="aimp-alert aimp-alert-warning" style="margin-top:12px">⚠️ Datos de plantilla local. Configurá un proveedor de IA para resultados personalizados.</div>':''}
    `;
    localStorage.setItem('aimp_icp_data', JSON.stringify(d));
  }

  /* ── PATAGONIA EXPLORER ─────────────────────────────────── */
  const CITIES_RN = ['General Roca','Cipolletti','San Carlos de Bariloche','Viedma','Villa Regina','Allen','Cinco Saltos','Catriel','San Antonio Oeste'];
  const CITIES_NQ = ['Neuquén Capital','Plottier','Centenario','Zapala','Cutral Co','Plaza Huincul','San Martín de los Andes','Villa La Angostura','Chos Malal'];
  let selectedCity = CITIES_RN[0];

  const expSearchBtn = document.getElementById('exp-search-btn');
  if (expSearchBtn) {
    expSearchBtn.addEventListener('click', async () => {
      const cityEl    = document.getElementById('exp-city');
      const indEl     = document.getElementById('exp-industry');
      const customEl  = document.getElementById('exp-custom');
      const city      = cityEl?.value || selectedCity;
      const industry  = (indEl?.value === 'OTRO' ? customEl?.value : indEl?.value) || INDUSTRIES[0];
      selectedCity = city;

      expSearchBtn.disabled = true;
      expSearchBtn.innerHTML = '<span class="aimp-spin"></span> Analizando Patagonia…';

      try {
        const res   = await post('generate', { action:'prospectLeads', city, industry });
        prospects   = res.prospects || [];
        renderProspects(prospects);
        renderExplorerMap(city);
        const cnt = document.getElementById('exp-results-count');
        if (cnt) cnt.textContent = prospects.length + ' prospectos encontrados en ' + city;
      } catch(e) { alert('Error IA: ' + e.message); }

      expSearchBtn.disabled = false;
      expSearchBtn.textContent = '🔍 Buscar Leads en ' + city;
    });
  }

  function renderProspects(list) {
    const grid = document.getElementById('prospect-grid');
    if (!grid) return;
    if (!list.length) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:50px;color:#94a3b8"><div style="font-size:36px;margin-bottom:10px">🔍</div><div style="font-size:14px;font-weight:700;color:#475569">No se encontraron prospectos</div></div>`;
      return;
    }
    grid.innerHTML = list.map((p,i) => `
      <div class="aimp-prospect-card" data-idx="${i}">
        <div class="aimp-prospect-name">${esc(p.company)}</div>
        <div class="aimp-prospect-meta">📍 ${esc(p.address||p.city||'')} · 📞 ${esc(p.phone||'—')} · ⭐ ${p.rating||'—'} · ${p.distance?p.distance+' km':'—'}</div>
        <div class="aimp-score-chip">🎯 Fit Score ${p.score||7}/10</div>
        ${p.painPoint?`<div class="aimp-pain-chip">💡 ${esc(p.painPoint)}</div>`:''}
        <div class="aimp-prospect-actions">
          <button class="aimp-btn aimp-btn-primary aimp-btn-sm" onclick="aimpAddToCRM(${i})">+ CRM</button>
          <button class="aimp-btn aimp-btn-outline aimp-btn-sm" onclick="aimpResearch(${i})">🔍 Investigar</button>
          ${p.guiacoresUrl?`<a class="aimp-btn aimp-btn-outline aimp-btn-sm" href="${esc(p.guiacoresUrl)}" target="_blank">Guía ↗</a>`:''}
        </div>
        <div id="res-${i}" style="margin-top:8px"></div>
      </div>`).join('');
  }

  window.aimpAddToCRM = async function(idx) {
    const p = prospects[idx]; if (!p) return;
    try {
      const d = await post('deals', {
        company:p.company, industry:p.industry||INDUSTRIES[0], amount:p.amount||180000,
        city:p.city, address:p.address, phone:p.phone, contact:p.contact,
        painPoint:p.painPoint, fitScore:p.score||7, guiacoresUrl:p.guiacoresUrl||'',
        rating:p.rating||'', priceLevel:p.priceLevel||'', distance:p.distance||null,
        stage:'leads', meddicScore:(p.score||7)>=8?50:40,
      });
      deals.push(d);
      alert(`✅ "${p.company}" agregado al CRM en "Nuevos Leads"`);
    } catch(e) { alert('Error: '+e.message); }
  };

  window.aimpResearch = async function(idx) {
    const p = prospects[idx]; if (!p) return;
    const el = document.getElementById('res-'+idx); if (!el) return;
    if (researchCache[p.company]) { renderResearch(el, researchCache[p.company]); return; }
    el.innerHTML = '<span class="aimp-spin aimp-spin-dark"></span> Investigando…';
    try {
      const res = await post('generate', { action:'researchProspect', company:p.company, industry:p.industry, city:p.city });
      researchCache[p.company] = res;
      renderResearch(el, res);
    } catch(e) { el.innerHTML = `<span style="color:#dc2626;font-size:11px">Error: ${e.message}</span>`; }
  };

  function renderResearch(el, d) {
    el.innerHTML = `
      <div class="aimp-research-result">
        <div style="font-weight:700;color:#0369a1;margin-bottom:6px">📋 Fit ${d.fitScore||'?'}/10 — ${esc(d.fitReasoning||'')}</div>
        ${(d.buyingSignals||[]).map(s=>`<div style="color:#15803d;font-size:10px">✓ ${esc(s)}</div>`).join('')}
        ${(d.keyContacts||[]).map(c=>`<div style="color:#374151;font-size:10px;margin-top:3px">👤 ${esc(c.name)} (${esc(c.title)}) — ${esc(c.email)}</div>`).join('')}
      </div>`;
  }

  function renderExplorerMap(city) {
    const map = document.getElementById('exp-map');
    if (!map) return;
    const cityMap = {
      'General Roca':          { emoji:'🏔', color:'#1e40af', sub:'Río Negro' },
      'San Carlos de Bariloche':{ emoji:'🏔', color:'#1e40af', sub:'Lago Nahuel Huapi' },
      'Viedma':                { emoji:'🌊', color:'#0369a1', sub:'Río Negro' },
      'Neuquén Capital':       { emoji:'🌿', color:'#15803d', sub:'Confluencia' },
    };
    const m = cityMap[city] || { emoji:'🗺️', color:'#64748b', sub:'Patagonia' };
    map.innerHTML = `
      <div style="text-align:center;padding:20px;width:100%">
        <div style="font-size:32px;margin-bottom:8px">${m.emoji}</div>
        <div style="font-weight:800;font-size:16px;color:${m.color}">${esc(city)}</div>
        <div style="font-size:11px;color:#64748b;margin-top:3px">${m.sub}</div>
        <div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:4px;justify-content:center">
          ${prospects.slice(0,6).map(p=>`<span style="background:#fff;border:1px solid #e2e8f0;border-radius:4px;padding:2px 7px;font-size:9px;font-weight:600">📍 ${esc(p.company)}</span>`).join('')}
        </div>
        <div style="margin-top:10px;font-size:9px;color:#94a3b8">Clientum Lead Mining v2.0${prospects.length?' · MODO SIMULADO ⚠️':''}</div>
      </div>`;
  }

  /* ── MEDDIC ─────────────────────────────────────────────── */
  let meddicValues = { meddicMetrics:3, meddicBuyer:3, meddicCriteria:3, meddicProcess:3, meddicPain:3, meddicChampion:3 };

  function populateMeddicSel() {
    const sel = document.getElementById('meddic-sel');
    if (!sel) return;
    const active = deals.filter(d => d.stage !== 'closed');
    sel.innerHTML = '<option value="">— Seleccioná un lead activo —</option>' +
      active.map(d=>`<option value="${d.id}">${esc(d.company)} (MEDDIC ${d.meddicScore||40}%)</option>`).join('');
    if (meddicLead) sel.value = meddicLead.id;
  }

  const meddicSelEl = document.getElementById('meddic-sel');
  if (meddicSelEl) {
    meddicSelEl.addEventListener('change', () => {
      const id = +meddicSelEl.value;
      meddicLead = id ? (deals.find(d=>d.id===id)||null) : null;
      const noLead  = document.getElementById('meddic-no-lead');
      const content = document.getElementById('meddic-content');
      if (noLead)  noLead.style.display  = meddicLead ? 'none'  : 'block';
      if (content) content.style.display = meddicLead ? 'block' : 'none';
      if (meddicLead) loadMeddicValues();
    });
  }

  function loadMeddicValues() {
    if (!meddicLead) return;
    MEDDIC_CRITERIA.forEach(c => {
      meddicValues[c.key] = meddicLead[c.key] || 3;
      renderStars(c.key, meddicValues[c.key]);
    });
    const rf = document.getElementById('meddic-redflags');
    if (rf) rf.value = meddicLead.meddicRedFlags || 'Aún no se ha identificado un Champion clave dentro de la PyME.';
    updateMeddicScore();
  }

  function renderStars(key, val) {
    const container = document.querySelector(`.aimp-stars[data-key="${key}"]`);
    if (!container) return;
    container.querySelectorAll('.aimp-star').forEach((s,i) => s.classList.toggle('on', i < val));
  }

  document.querySelectorAll('.aimp-stars').forEach(container => {
    container.querySelectorAll('.aimp-star').forEach((star,i) => {
      star.addEventListener('click', () => {
        const key = container.dataset.key;
        meddicValues[key] = i + 1;
        renderStars(key, i+1);
        updateMeddicScore();
      });
      star.addEventListener('mouseover', () => {
        container.querySelectorAll('.aimp-star').forEach((s,j) => s.classList.toggle('on', j<=i));
      });
      star.addEventListener('mouseout', () => {
        renderStars(container.dataset.key, meddicValues[container.dataset.key]||3);
      });
    });
  });

  function calcMeddicScore() {
    return Math.round(Object.values(meddicValues).reduce((a,b)=>a+b,0) / 30 * 100);
  }

  function updateMeddicScore() {
    const score = calcMeddicScore();
    const numEl  = document.getElementById('meddic-score-num');
    const barEl  = document.getElementById('meddic-score-bar');
    const statEl = document.getElementById('meddic-score-status');
    const tempEl = document.getElementById('meddic-temp');
    if (numEl)  numEl.textContent  = score;
    if (barEl)  { barEl.style.width = score+'%'; barEl.style.background = score>=80?'#10b981':score>=60?'#3b82f6':score>=40?'#f59e0b':'#ef4444'; }
    if (statEl) { statEl.textContent = meddicLabel(score); statEl.className = 'aimp-gauge-status aimp-meddic-pill ' + meddicClass(score); }
    if (tempEl) tempEl.textContent = score>=75?'🔥 HOT — Alta Conversión':score>=45?'⚡ WARM — Medianamente Calificado':'❄ COLD — Baja Calificación';
    renderNextActions(score);
  }

  function renderNextActions(score) {
    const actions = [];
    if ((meddicValues.meddicMetrics  ||3)<3) actions.push('Cuantificar ROI esperado (ahorro tiempo + aumento ventas)');
    if ((meddicValues.meddicBuyer    ||3)<3) actions.push('Identificar e involucrar al Economic Buyer con chequera');
    if ((meddicValues.meddicCriteria ||3)<3) actions.push('Alinear propuesta a criterios técnicos (WhatsApp, precio, soporte)');
    if ((meddicValues.meddicProcess  ||3)<3) actions.push('Agendar demo de 15 min con el Bot de WhatsApp');
    if ((meddicValues.meddicPain     ||3)<4) actions.push('Confirmar dolor profundo del negocio con el gerente');
    if ((meddicValues.meddicChampion ||3)<3) actions.push('Fidelizar al líder de ventas interno como Champion');
    if (score >= 50) {
      actions.push('Enviar propuesta comercial formal Clase A');
      actions.push('Agendar llamada de cierre esta semana');
    }
    const el = document.getElementById('meddic-actions');
    if (el) {
      el.innerHTML = (actions.length ? actions : ['Completá más criterios para ver acciones recomendadas'])
        .map(a => `<div class="aimp-next-action">${esc(a)}</div>`).join('');
    }
  }

  const saveMeddicBtn = document.getElementById('save-meddic-btn');
  if (saveMeddicBtn) {
    saveMeddicBtn.addEventListener('click', async () => {
      if (!meddicLead) { alert('Seleccioná un lead primero'); return; }
      const score = calcMeddicScore();
      const rf    = document.getElementById('meddic-redflags')?.value || '';
      saveMeddicBtn.disabled = true;
      try {
        const upd = await put(`deals/${meddicLead.id}`, { ...meddicValues, meddicScore:score, meddicRedFlags:rf });
        Object.assign(meddicLead, upd);
        const i = deals.findIndex(d=>d.id===meddicLead.id);
        if (i>=0) deals[i] = { ...deals[i], ...upd };
        alert('✅ ¡Calificación MEDDIC actualizada con éxito!');
        populateMeddicSel();
      } catch(e) { alert('Error: '+e.message); }
      saveMeddicBtn.disabled = false;
    });
  }

  /* ── OUTREACH ───────────────────────────────────────────── */
  function populateOutreachSel() {
    const sel = document.getElementById('outreach-sel');
    if (!sel) return;
    sel.innerHTML = '<option value="">— Seleccioná un lead —</option>' +
      deals.map(d=>`<option value="${d.id}">${esc(d.company)} (${d.stage==='closed'?'✓ Ganado':STAGE_LABELS[d.stage]||d.stage})</option>`).join('');
    if (outreachLead) sel.value = outreachLead.id;
  }

  const outreachSelEl = document.getElementById('outreach-sel');
  if (outreachSelEl) {
    outreachSelEl.addEventListener('change', () => {
      const id = +outreachSelEl.value;
      outreachLead = id ? (deals.find(d=>d.id===id)||null) : null;
      // If deal already has outreach cached, show it.
      if (outreachLead?.outreachEmail1) {
        outreachData = {
          email1Subject:'', email1Body:outreachLead.outreachEmail1,
          email2Subject:'', email2Body:outreachLead.outreachEmail2||'',
          email3Subject:'', email3Body:outreachLead.outreachEmail3||'',
          linkedinSequence:outreachLead.outreachLinkedin||[],
          phoneScript:outreachLead.outreachPhoneScript||'',
        };
        renderOutreach(outreachData);
      } else {
        // Reset.
        const res  = document.getElementById('outreach-result');
        const empty = document.getElementById('outreach-empty');
        if (res)   res.style.display   = 'none';
        if (empty) empty.style.display = outreachLead ? 'block' : 'block';
      }
    });
  }

  const genOutreachBtn = document.getElementById('gen-outreach-btn');
  if (genOutreachBtn) {
    genOutreachBtn.addEventListener('click', async () => {
      if (!outreachLead) { alert('Seleccioná un lead primero'); return; }
      genOutreachBtn.disabled = true;
      genOutreachBtn.innerHTML = '<span class="aimp-spin"></span> Generando con IA…';
      try {
        outreachData = await post('generate', {
          action:'generateOutreach',
          company:  outreachLead.company,
          contact:  outreachLead.contact,
          industry: outreachLead.industry,
          painPoint:outreachLead.painPoint,
        });
        renderOutreach(outreachData);
        // Persist.
        put(`deals/${outreachLead.id}`, {
          outreachEmail1:outreachData.email1Body, outreachEmail2:outreachData.email2Body,
          outreachEmail3:outreachData.email3Body, outreachLinkedin:outreachData.linkedinSequence,
          outreachPhoneScript:outreachData.phoneScript,
        }).catch(()=>{});
      } catch(e) { alert('Error IA: '+e.message); }
      genOutreachBtn.disabled = false;
      genOutreachBtn.innerHTML = '✨ Generar Campaña Outreach';
    });
  }

  function renderOutreach(d) {
    const panel = document.getElementById('outreach-result');
    const empty  = document.getElementById('outreach-empty');
    if (panel) panel.style.display = 'block';
    if (empty) empty.style.display = 'none';

    const setEl = (id,v) => { const el=document.getElementById(id); if(el) el.textContent=v||''; };
    setEl('out-e1-subj', d.email1Subject);
    setEl('out-e1-body', d.email1Body);
    setEl('out-e2-subj', d.email2Subject);
    setEl('out-e2-body', d.email2Body);
    setEl('out-e3-subj', d.email3Subject);
    setEl('out-e3-body', d.email3Body);
    setEl('out-phone',   d.phoneScript);

    const liEl = document.getElementById('out-linkedin-steps');
    if (liEl && Array.isArray(d.linkedinSequence)) {
      const stepNames = { connection:'Solicitud + Nota', value:'Contenido de Valor', pitch:'Propuesta Directa', followup:'Seguimiento Final' };
      liEl.innerHTML = d.linkedinSequence.map(s=>`
        <div class="aimp-li-step">
          <div class="aimp-li-step-head">Día +${s.day} — ${stepNames[s.type]||s.type}</div>
          <div style="font-size:12px;line-height:1.6;white-space:pre-wrap;color:#374151">${esc(s.message)}</div>
        </div>`).join('');
    }
  }

  /* Tab switching */
  document.querySelectorAll('.aimp-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const card   = btn.closest('.aimp-card');
      if (!card) return;
      card.querySelectorAll('.aimp-tab').forEach(b => b.classList.remove('active'));
      card.querySelectorAll('.aimp-tab-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const target = card.querySelector(`.aimp-tab-panel[data-panel="${btn.dataset.tab}"]`);
      if (target) target.classList.add('active');
    });
  });

  /* Copy buttons */
  document.querySelectorAll('.aimp-copy-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.copy);
      if (!target) return;
      navigator.clipboard.writeText(target.textContent||'').then(() => {
        const orig = btn.textContent;
        btn.textContent = '¡Copiado! ✓';
        setTimeout(() => btn.textContent = orig, 2000);
      });
    });
  });

  /* ── CHECKLIST ──────────────────────────────────────────── */
  function renderChecklist() {
    const el = document.getElementById('checklist-items');
    if (!el) return;
    el.innerHTML = checklist.map((item,i) => `
      <div class="aimp-check-item ${item.done?'done':''}" data-i="${i}">
        <input type="checkbox" ${item.done?'checked':''} onchange="aimpToggleCheck(${i})">
        <span class="aimp-check-text">${esc(item.text)}</span>
      </div>`).join('');
  }
  window.aimpToggleCheck = function(i) {
    checklist[i].done = !checklist[i].done;
    localStorage.setItem('aimp_checklist', JSON.stringify(checklist));
    renderChecklist();
  };

  /* ── Export CSV ─────────────────────────────────────────── */
  document.querySelectorAll('.aimp-export-csv-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = REST + 'export?_wpnonce=' + NONCE;
    });
  });

  /* ── Init ───────────────────────────────────────────────── */
  showSection('pipeline');
  loadDeals();
  renderChecklist();

  // Restore cached ICP.
  try {
    const cachedICP = localStorage.getItem('aimp_icp_data');
    if (cachedICP) {
      icpData = JSON.parse(cachedICP);
      const emptyState = document.getElementById('icp-empty-state');
      if (emptyState && icpData) {
        emptyState.style.display = 'none';
        renderICP(icpData);
      }
    }
  } catch(e) {}

})();
