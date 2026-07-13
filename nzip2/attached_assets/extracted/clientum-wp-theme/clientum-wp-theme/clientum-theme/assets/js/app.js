/* ===== CLIENTUM CRM — Native WordPress SPA v2.0 ===== */
(function () {
  'use strict';

  const cfg = window.ClntmConfig || {};
  const API = cfg.apiBase || '';
  const NONCE = cfg.nonce || '';
  const USER = cfg.user || {};

  // ── Icons ─────────────────────────────────────────────────────────────────
  const I = {
    dashboard: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    contacts: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    companies: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
    leads: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    deals: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    activities: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>`,
    products: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>`,
    invoices: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>`,
    quotes: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>`,
    plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
    trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    search: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`,
    loader: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`,
    x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 12 4 16"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>`,
  };

  // ── API helper ─────────────────────────────────────────────────────────────
  async function api(method, path, data) {
    const opts = {
      method,
      headers: { 'Content-Type': 'application/json', 'X-WP-Nonce': NONCE },
    };
    if (data) opts.body = JSON.stringify(data);
    const res = await fetch(API + path, opts);
    if (!res.ok) throw new Error(`API ${res.status}: ${await res.text()}`);
    return res.json();
  }
  const get = (path) => api('GET', path);
  const post = (path, data) => api('POST', path, data);
  const put = (path, data) => api('PUT', path, data);
  const del = (path) => api('DELETE', path);

  // ── Toast ──────────────────────────────────────────────────────────────────
  let toastWrap;
  function toast(msg, type = 'success') {
    if (!toastWrap) {
      toastWrap = document.createElement('div');
      toastWrap.className = 'clntm-toast-wrap';
      document.body.appendChild(toastWrap);
    }
    const t = document.createElement('div');
    t.className = `clntm-toast ${type}`;
    t.innerHTML = `<span style="flex:1">${msg}</span>`;
    toastWrap.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  }

  // ── Modal ──────────────────────────────────────────────────────────────────
  function modal({ title, size = 'md', body, footer, onClose }) {
    const overlay = document.createElement('div');
    overlay.className = 'clntm-overlay';
    overlay.innerHTML = `
      <div class="clntm-modal ${size}">
        <div class="modal-header">
          <span class="modal-title">${title}</span>
          <button class="modal-close" id="modal-close-btn">✕</button>
        </div>
        <div class="modal-body">${body}</div>
        ${footer ? `<div class="modal-footer">${footer}</div>` : ''}
      </div>`;
    document.body.appendChild(overlay);
    const close = () => { overlay.remove(); if (onClose) onClose(); };
    overlay.querySelector('#modal-close-btn').onclick = close;
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    return { overlay, close };
  }

  function confirmDialog(msg, onOk) {
    const { overlay, close } = modal({
      title: 'Confirmar',
      size: 'sm',
      body: `<div class="confirm-dialog"><p>${msg}</p></div>`,
      footer: `<button class="btn btn-secondary" id="confirm-cancel">Cancelar</button><button class="btn btn-danger" id="confirm-ok">Eliminar</button>`,
    });
    overlay.querySelector('#confirm-cancel').onclick = close;
    overlay.querySelector('#confirm-ok').onclick = () => { close(); onOk(); };
  }

  // ── XSS escape helper ─────────────────────────────────────────────────────
  function esc(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // ── Format helpers ─────────────────────────────────────────────────────────
  const fmt = {
    money: (v) => '$' + parseFloat(v || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    date: (v) => v ? new Date(v).toLocaleDateString('es-AR') : '—',
    trunc: (s, n = 30) => s && s.length > n ? s.slice(0, n) + '…' : (s || '—'),
  };

  function statusBadge(status, map) {
    const m = map || {};
    const cls = m[status] || 'badge-gray';
    return `<span class="badge ${cls}">${status || '—'}</span>`;
  }

  // ── Spinner ────────────────────────────────────────────────────────────────
  const spinner = () => `<div class="clntm-spinner">${I.loader}</div>`;

  // ── Router & State ─────────────────────────────────────────────────────────
  let currentView = 'dashboard';
  const root = () => document.getElementById('clntm-root');

  // ── VIEWS ──────────────────────────────────────────────────────────────────

  // ── Dashboard ──────────────────────────────────────────────────────────────
  async function viewDashboard(el) {
    el.innerHTML = spinner();
    const [stats, pipeline, activity] = await Promise.all([
      get('/dashboard/stats'),
      get('/dashboard/pipeline'),
      get('/dashboard/activity'),
    ]);

    const maxVal = Math.max(...pipeline.map(p => p.count), 1);
    const bars = pipeline.map(p => `
      <div class="chart-bar-wrap">
        <div class="chart-bar-val">${p.count}</div>
        <div class="chart-bar" style="height:${Math.round((p.count / maxVal) * 120)}px"></div>
        <div class="chart-bar-label">${p.stage}</div>
      </div>`).join('');

    const typeIcon = { call: '📞', email: '📧', meeting: '🤝', task: '✅', note: '📝' };
    const actItems = activity.map(a => `
      <div class="timeline-item">
        <div class="timeline-icon" style="background:var(--accent-light)">${typeIcon[a.type] || '📌'}</div>
        <div class="timeline-body">
          <div class="timeline-title">${esc(a.title) || '—'}</div>
          <div class="timeline-meta">${esc(a.contact_name)} · ${fmt.date(a.activity_date || a.created_at)}</div>
        </div>
      </div>`).join('') || '<p style="color:var(--gray-400);padding:20px 0;text-align:center">Sin actividades recientes</p>';

    el.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon blue">${I.contacts}</div><div><div class="stat-value">${stats.totalContacts || 0}</div><div class="stat-label">Contactos</div></div></div>
        <div class="stat-card"><div class="stat-icon purple">${I.leads}</div><div><div class="stat-value">${stats.totalLeads || 0}</div><div class="stat-label">Leads</div></div></div>
        <div class="stat-card"><div class="stat-icon orange">${I.deals}</div><div><div class="stat-value">${stats.openDeals || 0}</div><div class="stat-label">Deals abiertos</div></div></div>
        <div class="stat-card"><div class="stat-icon green">${I.invoices}</div><div><div class="stat-value">${fmt.money(stats.totalRevenue)}</div><div class="stat-label">Facturado</div></div></div>
        <div class="stat-card"><div class="stat-icon teal">${I.deals}</div><div><div class="stat-value">${fmt.money(stats.openDealsValue)}</div><div class="stat-label">Pipeline abierto</div></div></div>
        <div class="stat-card"><div class="stat-icon pink">${I.activities}</div><div><div class="stat-value">${stats.activitiesThisWeek || 0}</div><div class="stat-label">Actividades esta semana</div></div></div>
      </div>
      <div class="dashboard-grid">
        <div class="card">
          <div class="card-header"><span class="card-title">Pipeline de Deals</span></div>
          <div class="card-body">
            <div class="chart-bars">${bars}</div>
          </div>
        </div>
        <div class="card">
          <div class="card-header"><span class="card-title">Actividad Reciente</span></div>
          <div class="card-body" style="padding-top:0">
            <div class="timeline">${actItems}</div>
          </div>
        </div>
      </div>`;
  }

  // ── Generic CRUD list view ─────────────────────────────────────────────────
  function crudView(config) {
    return async function(el) {
      el.innerHTML = spinner();
      let items = [];
      try { items = await get('/' + config.entity); } catch(e) { items = []; }
      let search = '';
      const render = () => {
        const filtered = search ? items.filter(i => config.searchFn(i, search)) : items;
        el.innerHTML = `
          <div class="view-toolbar">
            <div class="search-wrap">${I.search}<input class="search-input" placeholder="Buscar…" id="srch" value="${search}"></div>
            <button class="btn btn-primary" id="btn-new">${I.plus} Nuevo</button>
          </div>
          <div class="card">
            <div class="table-wrap">
              ${filtered.length === 0
                ? `<div class="empty-state">${I.contacts}<p>Sin resultados</p></div>`
                : `<table class="clntm-table">
                    <thead><tr>${config.cols.map(c => `<th>${c.label}</th>`).join('')}<th style="text-align:right">Acciones</th></tr></thead>
                    <tbody>${filtered.map(item => `
                      <tr data-id="${item.id}">
                        ${config.cols.map(c => `<td>${c.render(item)}</td>`).join('')}
                        <td><div class="actions">
                          <button class="btn btn-ghost btn-icon btn-edit" data-id="${item.id}" title="Editar">${I.edit}</button>
                          <button class="btn btn-ghost btn-icon btn-del" data-id="${item.id}" title="Eliminar" style="color:var(--red)">${I.trash}</button>
                        </div></td>
                      </tr>`).join('')}
                    </tbody>
                   </table>`
              }
            </div>
          </div>`;
        el.querySelector('#srch').oninput = e => { search = e.target.value; render(); };
        el.querySelector('#btn-new').onclick = () => openForm(null);
        el.querySelectorAll('.btn-edit').forEach(b => b.onclick = () => openForm(items.find(i => i.id == b.dataset.id)));
        el.querySelectorAll('.btn-del').forEach(b => b.onclick = () => {
          confirmDialog('¿Eliminar este registro?', async () => {
            await del('/' + config.entity + '/' + b.dataset.id);
            items = items.filter(i => i.id != b.dataset.id);
            toast('Eliminado correctamente');
            render();
          });
        });
      };

      const openForm = (item) => {
        const { overlay, close } = modal({
          title: item ? config.editTitle : config.newTitle,
          size: config.formSize || 'md',
          body: config.formBody(item),
          footer: `<button class="btn btn-secondary" id="form-cancel">Cancelar</button><button class="btn btn-primary" id="form-save">Guardar</button>`,
        });
        overlay.querySelector('#form-cancel').onclick = close;
        overlay.querySelector('#form-save').onclick = async () => {
          const data = config.formData(overlay);
          try {
            if (item) {
              const updated = await put('/' + config.entity + '/' + item.id, data);
              const idx = items.findIndex(i => i.id === item.id);
              if (idx >= 0) items[idx] = { ...items[idx], ...updated };
              toast('Guardado correctamente');
            } else {
              const created = await post('/' + config.entity, data);
              items.unshift(created);
              toast('Creado correctamente');
            }
            close();
            render();
          } catch(e) { toast('Error al guardar', 'error'); }
        };
        if (config.onFormOpen) config.onFormOpen(overlay, item);
      };

      render();
    };
  }

  // ── Status maps ────────────────────────────────────────────────────────────
  const contactStatusMap = { active: 'badge-green', inactive: 'badge-gray', prospect: 'badge-blue' };
  const invoiceStatusMap = { draft: 'badge-gray', sent: 'badge-blue', paid: 'badge-green', overdue: 'badge-red', cancelled: 'badge-red' };
  const leadStatusMap = { new: 'badge-blue', contacted: 'badge-teal', qualified: 'badge-purple', lost: 'badge-red', won: 'badge-green' };

  // ── Contacts ───────────────────────────────────────────────────────────────
  const viewContacts = crudView({
    entity: 'contacts',
    newTitle: 'Nuevo Contacto', editTitle: 'Editar Contacto',
    searchFn: (i, s) => [i.name, i.email, i.phone, i.company].some(v => v && v.toLowerCase().includes(s.toLowerCase())),
    cols: [
      { label: 'Nombre', render: i => `<strong>${esc(i.name)}</strong>` },
      { label: 'Email', render: i => esc(i.email) || '—' },
      { label: 'Teléfono', render: i => esc(i.phone) || '—' },
      { label: 'Empresa', render: i => esc(i.company) || '—' },
      { label: 'Estado', render: i => statusBadge(i.status, contactStatusMap) },
    ],
    formBody: (i) => `
      <div class="form-grid cols-2">
        <div class="form-group"><label class="form-label">Nombre *</label><input class="form-control" id="f-name" value="${i ? esc(i.name) : ''}"></div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-control" id="f-email" type="email" value="${i ? esc(i.email) : ''}"></div>
        <div class="form-group"><label class="form-label">Teléfono</label><input class="form-control" id="f-phone" value="${i ? esc(i.phone) : ''}"></div>
        <div class="form-group"><label class="form-label">Empresa</label><input class="form-control" id="f-company" value="${i ? esc(i.company) : ''}"></div>
        <div class="form-group"><label class="form-label">Estado</label>
          <select class="form-control" id="f-status">
            ${['active','inactive','prospect'].map(s => `<option value="${s}" ${i && i.status===s?'selected':''}>${s}</option>`).join('')}
          </select></div>
        <div class="form-group"><label class="form-label">Fuente</label><input class="form-control" id="f-source" value="${i ? esc(i.source) : ''}"></div>
        <div class="form-group" style="grid-column:1/-1"><label class="form-label">Notas</label><textarea class="form-control" id="f-notes">${i ? esc(i.notes) : ''}</textarea></div>
      </div>`,
    formData: (o) => ({ name: o.querySelector('#f-name').value, email: o.querySelector('#f-email').value, phone: o.querySelector('#f-phone').value, company: o.querySelector('#f-company').value, status: o.querySelector('#f-status').value, source: o.querySelector('#f-source').value, notes: o.querySelector('#f-notes').value }),
  });

  // ── Companies ──────────────────────────────────────────────────────────────
  const viewCompanies = crudView({
    entity: 'companies',
    newTitle: 'Nueva Empresa', editTitle: 'Editar Empresa',
    searchFn: (i, s) => [i.name, i.email, i.industry].some(v => v && v.toLowerCase().includes(s.toLowerCase())),
    cols: [
      { label: 'Nombre', render: i => `<strong>${esc(i.name)}</strong>` },
      { label: 'Industria', render: i => esc(i.industry) || '—' },
      { label: 'Email', render: i => esc(i.email) || '—' },
      { label: 'Teléfono', render: i => esc(i.phone) || '—' },
      { label: 'Sitio Web', render: i => i.website ? `<a href="${esc(i.website)}" target="_blank" rel="noopener" style="color:var(--navy-light)">${esc(fmt.trunc(i.website, 25))}</a>` : '—' },
    ],
    formBody: (i) => `
      <div class="form-grid cols-2">
        <div class="form-group"><label class="form-label">Nombre *</label><input class="form-control" id="f-name" value="${i ? esc(i.name) : ''}"></div>
        <div class="form-group"><label class="form-label">Industria</label><input class="form-control" id="f-industry" value="${i ? esc(i.industry) : ''}"></div>
        <div class="form-group"><label class="form-label">Email</label><input class="form-control" id="f-email" type="email" value="${i ? esc(i.email) : ''}"></div>
        <div class="form-group"><label class="form-label">Teléfono</label><input class="form-control" id="f-phone" value="${i ? esc(i.phone) : ''}"></div>
        <div class="form-group"><label class="form-label">Sitio Web</label><input class="form-control" id="f-website" value="${i ? esc(i.website) : ''}"></div>
        <div class="form-group"><label class="form-label">Dirección</label><input class="form-control" id="f-address" value="${i ? esc(i.address) : ''}"></div>
        <div class="form-group" style="grid-column:1/-1"><label class="form-label">Notas</label><textarea class="form-control" id="f-notes">${i ? esc(i.notes) : ''}</textarea></div>
      </div>`,
    formData: (o) => ({ name: o.querySelector('#f-name').value, industry: o.querySelector('#f-industry').value, email: o.querySelector('#f-email').value, phone: o.querySelector('#f-phone').value, website: o.querySelector('#f-website').value, address: o.querySelector('#f-address').value, notes: o.querySelector('#f-notes').value }),
  });

  // ── Leads (Kanban) ─────────────────────────────────────────────────────────
  const LEAD_STAGES = ['new', 'contacted', 'qualified', 'lost', 'won'];
  const leadStageCols = { new: 'Nuevo', contacted: 'Contactado', qualified: 'Calificado', lost: 'Perdido', won: 'Ganado' };

  async function viewLeads(el) {
    el.innerHTML = spinner();
    let items = await get('/leads');
    const render = () => {
      el.innerHTML = `
        <div class="view-toolbar" style="margin-bottom:16px">
          <span style="font-size:13px;color:var(--gray-500)">${items.length} leads</span>
          <button class="btn btn-primary" id="btn-new">${I.plus} Nuevo Lead</button>
        </div>
        <div class="kanban-board">
          ${LEAD_STAGES.map(stage => {
            const cards = items.filter(i => i.status === stage);
            return `<div class="kanban-col">
              <div class="kanban-col-header">${leadStageCols[stage]}<span class="kanban-count">${cards.length}</span></div>
              <div class="kanban-cards">
                ${cards.map(c => `<div class="kanban-card" data-id="${c.id}">
                  <div class="kanban-card-title">${esc(c.name)}</div>
                  <div class="kanban-card-meta"><span>${esc(c.company) || '—'}</span><span class="kanban-card-value">${fmt.money(c.value)}</span></div>
                  <div style="margin-top:6px;display:flex;gap:4px">
                    <button class="btn btn-ghost btn-sm btn-edit" data-id="${c.id}">${I.edit}</button>
                    <button class="btn btn-ghost btn-sm btn-del" data-id="${c.id}" style="color:var(--red)">${I.trash}</button>
                  </div>
                </div>`).join('') || '<div style="text-align:center;padding:16px;color:var(--gray-400);font-size:12px">Sin leads</div>'}
              </div>
            </div>`;
          }).join('')}
        </div>`;
      el.querySelector('#btn-new').onclick = () => openLeadForm(null);
      el.querySelectorAll('.btn-edit').forEach(b => b.onclick = (e) => { e.stopPropagation(); openLeadForm(items.find(i => i.id == b.dataset.id)); });
      el.querySelectorAll('.btn-del').forEach(b => b.onclick = (e) => { e.stopPropagation(); confirmDialog('¿Eliminar este lead?', async () => { await del('/leads/' + b.dataset.id); items = items.filter(i => i.id != b.dataset.id); toast('Eliminado'); render(); }); });
    };
    const openLeadForm = (item) => {
      const { overlay, close } = modal({
        title: item ? 'Editar Lead' : 'Nuevo Lead', size: 'md',
        body: `<div class="form-grid cols-2">
          <div class="form-group"><label class="form-label">Nombre *</label><input class="form-control" id="f-name" value="${item ? esc(item.name) : ''}"></div>
          <div class="form-group"><label class="form-label">Empresa</label><input class="form-control" id="f-company" value="${item ? esc(item.company) : ''}"></div>
          <div class="form-group"><label class="form-label">Email</label><input class="form-control" id="f-email" value="${item ? esc(item.email) : ''}"></div>
          <div class="form-group"><label class="form-label">Teléfono</label><input class="form-control" id="f-phone" value="${item ? esc(item.phone) : ''}"></div>
          <div class="form-group"><label class="form-label">Estado</label>
            <select class="form-control" id="f-status">${LEAD_STAGES.map(s => `<option value="${s}" ${item && item.status===s?'selected':''}>${leadStageCols[s]}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Valor estimado</label><input class="form-control" id="f-value" type="number" value="${item ? item.value || 0 : 0}"></div>
          <div class="form-group"><label class="form-label">Fuente</label><input class="form-control" id="f-source" value="${item ? esc(item.source) : ''}"></div>
          <div class="form-group"><label class="form-label">Notas</label><textarea class="form-control" id="f-notes">${item ? esc(item.notes) : ''}</textarea></div>
        </div>`,
        footer: `<button class="btn btn-secondary" id="fc">Cancelar</button><button class="btn btn-primary" id="fs">Guardar</button>`,
      });
      overlay.querySelector('#fc').onclick = close;
      overlay.querySelector('#fs').onclick = async () => {
        const data = { name: overlay.querySelector('#f-name').value, company: overlay.querySelector('#f-company').value, email: overlay.querySelector('#f-email').value, phone: overlay.querySelector('#f-phone').value, status: overlay.querySelector('#f-status').value, value: parseFloat(overlay.querySelector('#f-value').value) || 0, source: overlay.querySelector('#f-source').value, notes: overlay.querySelector('#f-notes').value };
        try {
          if (item) { const u = await put('/leads/' + item.id, data); const idx = items.findIndex(i => i.id === item.id); if (idx >= 0) items[idx] = { ...items[idx], ...u }; toast('Guardado'); }
          else { const c = await post('/leads', data); items.unshift(c); toast('Creado'); }
          close(); render();
        } catch(e) { toast('Error al guardar', 'error'); }
      };
    };
    render();
  }

  // ── Deals (Kanban) ─────────────────────────────────────────────────────────
  const DEAL_STAGES = ['Descubrimiento', 'Propuesta', 'Negociación', 'Contrato', 'Ganado', 'Perdido'];

  async function viewDeals(el) {
    el.innerHTML = spinner();
    let items = await get('/deals');
    const render = () => {
      el.innerHTML = `
        <div class="view-toolbar"><span style="font-size:13px;color:var(--gray-500)">${items.length} deals</span><button class="btn btn-primary" id="btn-new">${I.plus} Nuevo Deal</button></div>
        <div class="kanban-board">
          ${DEAL_STAGES.map(stage => {
            const cards = items.filter(i => i.stage === stage);
            const total = cards.reduce((a, c) => a + parseFloat(c.value || 0), 0);
            return `<div class="kanban-col">
              <div class="kanban-col-header">${esc(stage)}<span class="kanban-count">${cards.length}</span></div>
              <div style="padding:6px 14px;font-size:11.5px;color:var(--gray-500)">${fmt.money(total)}</div>
              <div class="kanban-cards">
                ${cards.map(c => `<div class="kanban-card" data-id="${c.id}">
                  <div class="kanban-card-title">${esc(c.title)}</div>
                  <div class="kanban-card-meta"><span>${esc(c.company) || '—'}</span><span class="kanban-card-value">${fmt.money(c.value)}</span></div>
                  ${c.expected_close ? `<div style="font-size:11px;color:var(--gray-400);margin-top:4px">Cierre: ${fmt.date(c.expected_close)}</div>` : ''}
                  <div style="margin-top:6px;display:flex;gap:4px">
                    <button class="btn btn-ghost btn-sm btn-edit" data-id="${c.id}">${I.edit}</button>
                    <button class="btn btn-ghost btn-sm btn-del" data-id="${c.id}" style="color:var(--red)">${I.trash}</button>
                  </div>
                </div>`).join('') || '<div style="text-align:center;padding:16px;color:var(--gray-400);font-size:12px">Sin deals</div>'}
              </div>
            </div>`;
          }).join('')}
        </div>`;
      el.querySelector('#btn-new').onclick = () => openDealForm(null);
      el.querySelectorAll('.btn-edit').forEach(b => b.onclick = (e) => { e.stopPropagation(); openDealForm(items.find(i => i.id == b.dataset.id)); });
      el.querySelectorAll('.btn-del').forEach(b => b.onclick = (e) => { e.stopPropagation(); confirmDialog('¿Eliminar este deal?', async () => { await del('/deals/' + b.dataset.id); items = items.filter(i => i.id != b.dataset.id); toast('Eliminado'); render(); }); });
    };
    const openDealForm = (item) => {
      const { overlay, close } = modal({
        title: item ? 'Editar Deal' : 'Nuevo Deal', size: 'md',
        body: `<div class="form-grid cols-2">
          <div class="form-group"><label class="form-label">Título *</label><input class="form-control" id="f-title" value="${item ? esc(item.title) : ''}"></div>
          <div class="form-group"><label class="form-label">Empresa</label><input class="form-control" id="f-company" value="${item ? esc(item.company) : ''}"></div>
          <div class="form-group"><label class="form-label">Etapa</label>
            <select class="form-control" id="f-stage">${DEAL_STAGES.map(s => `<option value="${s}" ${item && item.stage===s?'selected':''}>${s}</option>`).join('')}</select></div>
          <div class="form-group"><label class="form-label">Valor</label><input class="form-control" id="f-value" type="number" value="${item ? item.value || 0 : 0}"></div>
          <div class="form-group"><label class="form-label">Fecha cierre</label><input class="form-control" id="f-close" type="date" value="${item ? esc(item.expected_close) : ''}"></div>
          <div class="form-group"><label class="form-label">Notas</label><textarea class="form-control" id="f-notes">${item ? esc(item.notes) : ''}</textarea></div>
        </div>`,
        footer: `<button class="btn btn-secondary" id="fc">Cancelar</button><button class="btn btn-primary" id="fs">Guardar</button>`,
      });
      overlay.querySelector('#fc').onclick = close;
      overlay.querySelector('#fs').onclick = async () => {
        const data = { title: overlay.querySelector('#f-title').value, company: overlay.querySelector('#f-company').value, stage: overlay.querySelector('#f-stage').value, value: parseFloat(overlay.querySelector('#f-value').value) || 0, expected_close: overlay.querySelector('#f-close').value, notes: overlay.querySelector('#f-notes').value };
        try {
          if (item) { const u = await put('/deals/' + item.id, data); const idx = items.findIndex(i => i.id === item.id); if (idx >= 0) items[idx] = { ...items[idx], ...u }; toast('Guardado'); }
          else { const c = await post('/deals', data); items.unshift(c); toast('Creado'); }
          close(); render();
        } catch(e) { toast('Error al guardar', 'error'); }
      };
    };
    render();
  }

  // ── Activities ─────────────────────────────────────────────────────────────
  const ACTIVITY_TYPES = ['call', 'email', 'meeting', 'task', 'note'];
  const actTypeLabel = { call: 'Llamada', email: 'Email', meeting: 'Reunión', task: 'Tarea', note: 'Nota' };
  const actTypeColor = { call: 'badge-blue', email: 'badge-teal', meeting: 'badge-purple', task: 'badge-yellow', note: 'badge-gray' };

  const viewActivities = crudView({
    entity: 'activities',
    newTitle: 'Nueva Actividad', editTitle: 'Editar Actividad',
    searchFn: (i, s) => [i.title, i.notes].some(v => v && v.toLowerCase().includes(s.toLowerCase())),
    cols: [
      { label: 'Título', render: i => `<strong>${esc(i.title)}</strong>` },
      { label: 'Tipo', render: i => statusBadge(actTypeLabel[i.type] || i.type, actTypeColor) },
      { label: 'Fecha', render: i => fmt.date(i.activity_date) },
      { label: 'Estado', render: i => i.completed ? `<span class="badge badge-green">Completada</span>` : `<span class="badge badge-gray">Pendiente</span>` },
    ],
    formBody: (i) => `
      <div class="form-grid cols-2">
        <div class="form-group" style="grid-column:1/-1"><label class="form-label">Título *</label><input class="form-control" id="f-title" value="${i ? esc(i.title) : ''}"></div>
        <div class="form-group"><label class="form-label">Tipo</label>
          <select class="form-control" id="f-type">${ACTIVITY_TYPES.map(t => `<option value="${t}" ${i && i.type===t?'selected':''}>${actTypeLabel[t]}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label">Fecha</label><input class="form-control" id="f-date" type="datetime-local" value="${i && i.activity_date ? i.activity_date.replace(' ','T').slice(0,16) : ''}"></div>
        <div class="form-group" style="grid-column:1/-1"><label class="form-label">Notas</label><textarea class="form-control" id="f-notes">${i ? esc(i.notes) : ''}</textarea></div>
      </div>`,
    formData: (o) => ({ title: o.querySelector('#f-title').value, type: o.querySelector('#f-type').value, activity_date: o.querySelector('#f-date').value, notes: o.querySelector('#f-notes').value }),
  });

  // ── Products ───────────────────────────────────────────────────────────────
  const viewProducts = crudView({
    entity: 'products',
    newTitle: 'Nuevo Producto', editTitle: 'Editar Producto',
    searchFn: (i, s) => [i.name, i.sku, i.category].some(v => v && v.toLowerCase().includes(s.toLowerCase())),
    cols: [
      { label: 'Nombre', render: i => `<strong>${esc(i.name)}</strong>` },
      { label: 'SKU', render: i => esc(i.sku) || '—' },
      { label: 'Categoría', render: i => esc(i.category) || '—' },
      { label: 'Precio', render: i => fmt.money(i.price) },
      { label: 'Stock', render: i => `<span class="${parseInt(i.stock) <= 0 ? 'badge badge-red' : parseInt(i.stock) < 5 ? 'badge badge-yellow' : 'badge badge-green'}">${parseInt(i.stock) || 0}</span>` },
    ],
    formBody: (i) => `
      <div class="form-grid cols-2">
        <div class="form-group"><label class="form-label">Nombre *</label><input class="form-control" id="f-name" value="${i ? esc(i.name) : ''}"></div>
        <div class="form-group"><label class="form-label">SKU</label><input class="form-control" id="f-sku" value="${i ? esc(i.sku) : ''}"></div>
        <div class="form-group"><label class="form-label">Categoría</label><input class="form-control" id="f-category" value="${i ? esc(i.category) : ''}"></div>
        <div class="form-group"><label class="form-label">Precio</label><input class="form-control" id="f-price" type="number" step="0.01" value="${i ? parseFloat(i.price) || 0 : 0}"></div>
        <div class="form-group"><label class="form-label">Stock</label><input class="form-control" id="f-stock" type="number" value="${i ? parseInt(i.stock) || 0 : 0}"></div>
        <div class="form-group" style="grid-column:1/-1"><label class="form-label">Descripción</label><textarea class="form-control" id="f-desc">${i ? esc(i.description) : ''}</textarea></div>
      </div>`,
    formData: (o) => ({ name: o.querySelector('#f-name').value, sku: o.querySelector('#f-sku').value, category: o.querySelector('#f-category').value, price: parseFloat(o.querySelector('#f-price').value) || 0, stock: parseInt(o.querySelector('#f-stock').value) || 0, description: o.querySelector('#f-desc').value }),
  });

  // ── Invoice/Quote items helper ─────────────────────────────────────────────
  function itemsFormBody(i, isInvoice) {
    let parsedItems = [];
    try { parsedItems = JSON.parse(i ? i.items : '[]') || []; } catch(e) { parsedItems = []; }
    if (parsedItems.length === 0) parsedItems = [{ desc: '', qty: 1, price: 0 }];
    return `
      <div class="form-grid cols-2">
        <div class="form-group"><label class="form-label">Número</label><input class="form-control" id="f-number" value="${i ? esc(i.number) : ''}"></div>
        <div class="form-group"><label class="form-label">Cliente</label><input class="form-control" id="f-contact" value="${i ? esc(i.contact_name) : ''}"></div>
        <div class="form-group"><label class="form-label">Estado</label>
          <select class="form-control" id="f-status">
            ${(isInvoice ? ['draft','sent','paid','overdue','cancelled'] : ['draft','sent','accepted','rejected','expired']).map(s => `<option value="${s}" ${i && i.status===s?'selected':''}>${s}</option>`).join('')}
          </select></div>
        <div class="form-group"><label class="form-label">${isInvoice ? 'Vencimiento' : 'Válido hasta'}</label><input class="form-control" id="f-date" type="date" value="${i ? (i.due_date || i.valid_until || '') : ''}"></div>
        <div class="form-group"><label class="form-label">Notas</label><textarea class="form-control" id="f-notes" rows="2">${i ? esc(i.notes) : ''}</textarea></div>
      </div>
      <div style="margin-top:16px">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">
          <strong style="font-size:13px">Ítems</strong>
          <button class="btn btn-secondary btn-sm" id="add-item">+ Agregar ítem</button>
        </div>
        <table class="items-table" id="items-table">
          <thead><tr><th style="width:45%">Descripción</th><th style="width:12%">Cant.</th><th style="width:20%">Precio unit.</th><th style="width:18%">Total</th><th style="width:5%"></th></tr></thead>
          <tbody id="items-tbody">
            ${parsedItems.map((it, idx) => itemRow(it, idx)).join('')}
          </tbody>
        </table>
        <div class="item-total-row"><div class="totals">
          <div class="total-line"><span>Subtotal</span><span id="t-sub">-</span></div>
          <div class="total-line"><span>IVA (21%)</span><span id="t-tax">-</span></div>
          <div class="total-line grand"><span>Total</span><span id="t-total">-</span></div>
        </div></div>
      </div>`;
  }
  function itemRow(it, idx) {
    return `<tr data-idx="${idx}">
      <td><input value="${it.desc || ''}" placeholder="Descripción" class="item-desc"></td>
      <td><input value="${it.qty || 1}" type="number" min="1" class="item-qty" style="width:60px"></td>
      <td><input value="${it.price || 0}" type="number" step="0.01" class="item-price"></td>
      <td class="item-line-total" style="font-weight:600">${fmt.money((it.qty || 1) * (it.price || 0))}</td>
      <td><button class="btn btn-ghost btn-icon remove-item" style="color:var(--red);font-size:16px">×</button></td>
    </tr>`;
  }
  function onItemsFormOpen(overlay) {
    const tbody = overlay.querySelector('#items-tbody');
    const recalc = () => {
      let sub = 0;
      tbody.querySelectorAll('tr').forEach((tr, idx) => {
        const qty = parseFloat(tr.querySelector('.item-qty').value) || 1;
        const price = parseFloat(tr.querySelector('.item-price').value) || 0;
        const line = qty * price;
        tr.querySelector('.item-line-total').textContent = fmt.money(line);
        sub += line;
      });
      const tax = sub * 0.21;
      overlay.querySelector('#t-sub').textContent = fmt.money(sub);
      overlay.querySelector('#t-tax').textContent = fmt.money(tax);
      overlay.querySelector('#t-total').textContent = fmt.money(sub + tax);
    };
    tbody.addEventListener('input', recalc);
    tbody.addEventListener('click', e => { if (e.target.classList.contains('remove-item')) { e.target.closest('tr').remove(); recalc(); } });
    let idx = tbody.children.length;
    overlay.querySelector('#add-item').onclick = () => { const tr = document.createElement('tr'); tr.innerHTML = itemRow({ desc: '', qty: 1, price: 0 }, idx++).replace(/^<tr[^>]*>/, '').replace(/<\/tr>$/, ''); tbody.appendChild(document.createElement('tr')); tbody.lastChild.outerHTML = itemRow({ desc: '', qty: 1, price: 0 }, idx - 1); tbody.appendChild(tr.firstChild ? tr : tbody.lastChild); recalc(); };
    overlay.querySelector('#add-item').onclick = () => {
      const newTr = document.createElement('tr');
      newTr.innerHTML = `<td><input value="" placeholder="Descripción" class="item-desc"></td><td><input value="1" type="number" min="1" class="item-qty" style="width:60px"></td><td><input value="0" type="number" step="0.01" class="item-price"></td><td class="item-line-total" style="font-weight:600">$0</td><td><button class="btn btn-ghost btn-icon remove-item" style="color:var(--red);font-size:16px">×</button></td>`;
      tbody.appendChild(newTr);
      newTr.querySelector('input').focus();
    };
    recalc();
  }
  function getItemsFormData(overlay, isInvoice) {
    const rows = [];
    overlay.querySelectorAll('#items-tbody tr').forEach(tr => {
      rows.push({ desc: tr.querySelector('.item-desc').value, qty: parseFloat(tr.querySelector('.item-qty').value) || 1, price: parseFloat(tr.querySelector('.item-price').value) || 0 });
    });
    const sub = rows.reduce((a, r) => a + r.qty * r.price, 0);
    const tax = sub * 0.21;
    return {
      number: overlay.querySelector('#f-number').value,
      contact_name: overlay.querySelector('#f-contact').value,
      status: overlay.querySelector('#f-status').value,
      [isInvoice ? 'due_date' : 'valid_until']: overlay.querySelector('#f-date').value,
      notes: overlay.querySelector('#f-notes').value,
      items: JSON.stringify(rows),
      subtotal: sub,
      tax,
      total: sub + tax,
    };
  }

  // ── Invoices ───────────────────────────────────────────────────────────────
  const viewInvoices = crudView({
    entity: 'invoices',
    newTitle: 'Nueva Factura', editTitle: 'Editar Factura',
    formSize: 'lg',
    searchFn: (i, s) => [i.number, i.contact_name].some(v => v && v.toLowerCase().includes(s.toLowerCase())),
    cols: [
      { label: 'Número', render: i => `<strong>${esc(i.number) || '—'}</strong>` },
      { label: 'Cliente', render: i => esc(i.contact_name) || '—' },
      { label: 'Total', render: i => fmt.money(i.total) },
      { label: 'Estado', render: i => statusBadge(i.status, invoiceStatusMap) },
      { label: 'Vencimiento', render: i => fmt.date(i.due_date) },
    ],
    formBody: (i) => itemsFormBody(i, true),
    formData: (o) => getItemsFormData(o, true),
    onFormOpen: (o) => onItemsFormOpen(o),
  });

  // ── Quotes ─────────────────────────────────────────────────────────────────
  const viewQuotes = crudView({
    entity: 'quotes',
    newTitle: 'Nuevo Presupuesto', editTitle: 'Editar Presupuesto',
    formSize: 'lg',
    searchFn: (i, s) => [i.number, i.contact_name].some(v => v && v.toLowerCase().includes(s.toLowerCase())),
    cols: [
      { label: 'Número', render: i => `<strong>${esc(i.number) || '—'}</strong>` },
      { label: 'Cliente', render: i => esc(i.contact_name) || '—' },
      { label: 'Total', render: i => fmt.money(i.total) },
      { label: 'Estado', render: i => statusBadge(i.status, { draft: 'badge-gray', sent: 'badge-blue', accepted: 'badge-green', rejected: 'badge-red', expired: 'badge-yellow' }) },
      { label: 'Válido hasta', render: i => fmt.date(i.valid_until) },
    ],
    formBody: (i) => itemsFormBody(i, false),
    formData: (o) => getItemsFormData(o, false),
    onFormOpen: (o) => onItemsFormOpen(o),
  });

  // ── WhatsApp ───────────────────────────────────────────────────────────────
  async function viewWhatsapp(el) {
    let status = { connected: false, phone: '' };
    try { status = await get('/whatsapp/status'); }
    catch (e) { console.error(e); }

    function render() {
      el.innerHTML = `
        <div class="clntm-whatsapp-card">
          <div class="clntm-whatsapp-status ${status.connected ? 'is-connected' : 'is-disconnected'}">
            <span class="clntm-whatsapp-dot"></span>
            <div>
              <div class="clntm-whatsapp-status-label">${status.connected ? 'Conectado' : 'Desconectado'}</div>
              <div class="clntm-whatsapp-status-sub">${status.connected ? ('Número: ' + esc(status.phone)) : 'Conectá tu número para enviar y recibir mensajes desde el CRM'}</div>
            </div>
            ${I.whatsapp}
          </div>

          ${status.connected ? `
            <button class="btn btn-secondary" id="wa-disconnect">Desconectar</button>
          ` : `
            <form id="wa-connect-form" class="clntm-whatsapp-form">
              <label>Número de WhatsApp</label>
              <input type="text" id="wa-phone" placeholder="+54 9 11 1234-5678" required>
              <label>API Key (opcional, para integraciones externas)</label>
              <input type="text" id="wa-key" placeholder="Ej: clave de Evolution API / proveedor">
              <button type="submit" class="btn btn-primary">Conectar</button>
            </form>
          `}
        </div>`;

      if (!status.connected) {
        el.querySelector('#wa-connect-form').onsubmit = async (ev) => {
          ev.preventDefault();
          const phone = el.querySelector('#wa-phone').value.trim();
          const apiKey = el.querySelector('#wa-key').value.trim();
          try {
            const res = await post('/whatsapp/connect', { phone, apiKey });
            status = { connected: true, phone: res.phone || phone };
            toast('WhatsApp conectado');
            render();
          } catch (e) { toast('Error al conectar: ' + e.message, 'error'); }
        };
      } else {
        el.querySelector('#wa-disconnect').onclick = async () => {
          try {
            await post('/whatsapp/disconnect');
            status = { connected: false, phone: '' };
            toast('WhatsApp desconectado');
            render();
          } catch (e) { toast('Error al desconectar: ' + e.message, 'error'); }
        };
      }
    }

    render();
  }

  // ── Nav config ─────────────────────────────────────────────────────────────
  const NAV = [
    { id: 'dashboard', label: 'Dashboard', icon: I.dashboard, section: null },
    { id: 'contacts', label: 'Contactos', icon: I.contacts, section: 'CRM' },
    { id: 'companies', label: 'Empresas', icon: I.companies, section: 'CRM' },
    { id: 'leads', label: 'Leads', icon: I.leads, section: 'CRM' },
    { id: 'deals', label: 'Deals', icon: I.deals, section: 'CRM' },
    { id: 'activities', label: 'Actividades', icon: I.activities, section: 'CRM' },
    { id: 'invoices', label: 'Facturas', icon: I.invoices, section: 'Ventas' },
    { id: 'quotes', label: 'Presupuestos', icon: I.quotes, section: 'Ventas' },
    { id: 'products', label: 'Productos', icon: I.products, section: 'Ventas' },
    { id: 'whatsapp', label: 'WhatsApp', icon: I.whatsapp, section: 'Comunicación' },
  ];

  const VIEWS = { dashboard: viewDashboard, contacts: viewContacts, companies: viewCompanies, leads: viewLeads, deals: viewDeals, activities: viewActivities, products: viewProducts, invoices: viewInvoices, quotes: viewQuotes, whatsapp: viewWhatsapp };
  const PAGE_TITLE = { dashboard: 'Dashboard', contacts: 'Contactos', companies: 'Empresas', leads: 'Leads', deals: 'Deals', activities: 'Actividades', products: 'Productos', invoices: 'Facturas', quotes: 'Presupuestos', whatsapp: 'WhatsApp' };

  // ── App shell ──────────────────────────────────────────────────────────────
  function buildShell() {
    let navHtml = '';
    let lastSection = null;
    NAV.forEach(n => {
      if (n.section !== lastSection) {
        if (n.section) navHtml += `<div class="clntm-nav-section">${n.section}</div>`;
        lastSection = n.section;
      }
      navHtml += `<button class="clntm-nav-item" data-view="${n.id}">${n.icon} ${n.label}</button>`;
    });

    const logoSrc = cfg.logoUrl || '';
    const avatarSrc = USER.avatar || '';

    root().innerHTML = `
      <div class="clntm-sidebar">
        <div class="clntm-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="width:28px;height:28px"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="22" x2="12" y2="15.5"/><polyline points="22 8.5 12 15.5 2 8.5"/></svg>
          <span>Clientum</span>
        </div>
        <nav class="clntm-nav">${navHtml}</nav>
        <div class="clntm-user-area">
          <img class="clntm-user-avatar" src="${avatarSrc}" alt="" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22><circle cx=%2216%22 cy=%2216%22 r=%2216%22 fill=%22%232467a2%22/></svg>'">
          <div><div class="clntm-user-name">${USER.name || 'Usuario'}</div><div class="clntm-user-role">Administrador</div></div>
        </div>
      </div>
      <div class="clntm-main">
        <div class="clntm-topbar">
          <span class="clntm-page-title" id="page-title">Dashboard</span>
          <div class="clntm-topbar-right">
            <span style="font-size:12px;color:var(--gray-400)">v2.0</span>
          </div>
        </div>
        <div class="clntm-content" id="clntm-view"></div>
      </div>`;

    root().querySelectorAll('.clntm-nav-item').forEach(btn => {
      btn.onclick = () => navigate(btn.dataset.view);
    });
  }

  // ── Ruteo por URL (/app, /app/dashboard, /app/contacts, ...) ────────────────
  function basePath() {
    try { return new URL(cfg.homeUrl || '/').pathname.replace(/\/$/, ''); }
    catch (e) { return ''; }
  }

  function viewFromLocation() {
    const base = basePath();
    let path = location.pathname;
    if (base && path.startsWith(base)) path = path.slice(base.length);
    path = path.replace(/^\/?app\/?/, '');
    const seg = path.split('/').filter(Boolean)[0];
    return VIEWS[seg] ? seg : 'dashboard';
  }

  async function navigate(view, push = true) {
    if (!VIEWS[view]) view = 'dashboard';
    currentView = view;
    root().querySelectorAll('.clntm-nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
    document.getElementById('page-title').textContent = PAGE_TITLE[view] || view;

    if (push) {
      const url = basePath() + '/app/' + view;
      if (location.pathname.replace(/\/$/, '') !== url.replace(/\/$/, '')) {
        history.pushState({ view }, '', url);
      }
    }

    const el = document.getElementById('clntm-view');
    el.innerHTML = spinner();
    try { await VIEWS[view](el); }
    catch(e) { el.innerHTML = `<div class="empty-state"><p>Error al cargar: ${e.message}</p></div>`; console.error(e); }
  }

  window.addEventListener('popstate', () => navigate(viewFromLocation(), false));

  // ── Init ───────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    buildShell();
    navigate(viewFromLocation(), true);
  }

})();
