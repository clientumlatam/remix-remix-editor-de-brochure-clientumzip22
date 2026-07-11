import React, { useState, useMemo } from 'react';
import {
  Server, Download, Search, Filter, Globe, Code2, ExternalLink,
  CheckCircle2, AlertCircle, Clock, FileText, Database
} from 'lucide-react';

/* ── Types ─────────────────────────────────────────────────────────────── */
type Ambiente = 'Producción' | 'Desarrollo' | 'Externo';
type Estado   = 'Activo' | 'En revisión' | 'Inactivo';

interface CMDBEntry {
  id: string;
  servicio: string;
  url: string;
  ambiente: Ambiente;
  tecnologia: string;
  funcion: string;
  estado: Estado;
  responsable: string;
  dependencias: string;
  observaciones: string;
}

/* ── Data ───────────────────────────────────────────────────────────────── */
const initialData: CMDBEntry[] = [
  // ── Producción ──────────────────────────────────────────────────────────
  {
    id: 'p-01', servicio: 'Clientum (Sitio Principal)', url: 'https://clientum.com.ar/',
    ambiente: 'Producción', tecnologia: 'WordPress + cPanel', funcion: 'Sitio web principal de marketing y ventas',
    estado: 'Activo', responsable: 'Equipo Clientum', dependencias: 'Wiroos, Cloudflare',
    observaciones: 'Hosted en Wiroos (cPanel)',
  },
  {
    id: 'p-02', servicio: 'AI Copilot (Prod)', url: 'https://clientum.com.ar/ai-copilot/',
    ambiente: 'Producción', tecnologia: 'WordPress', funcion: 'Página de producto AI Copilot',
    estado: 'Activo', responsable: 'Equipo Clientum', dependencias: 'Clientum WP',
    observaciones: '',
  },
  {
    id: 'p-03', servicio: 'API Gateway (Prod)', url: 'https://clientum.com.ar/api-gateway-2/',
    ambiente: 'Producción', tecnologia: 'WordPress', funcion: 'Página de producto API Gateway',
    estado: 'Activo', responsable: 'Equipo Clientum', dependencias: 'Clientum WP',
    observaciones: '',
  },
  {
    id: 'p-04', servicio: 'Consultoría (Prod)', url: 'https://clientum.com.ar/consultoria/',
    ambiente: 'Producción', tecnologia: 'WordPress', funcion: 'Página de servicios de consultoría',
    estado: 'Activo', responsable: 'Equipo Clientum', dependencias: 'Clientum WP',
    observaciones: '',
  },
  {
    id: 'p-05', servicio: 'Discussions (Prod)', url: 'https://clientum.com.ar/discussions/',
    ambiente: 'Producción', tecnologia: 'WordPress', funcion: 'Foro / comunidad',
    estado: 'Activo', responsable: 'Equipo Clientum', dependencias: 'Clientum WP',
    observaciones: '',
  },
  {
    id: 'p-06', servicio: 'Inicio-2 (Prod)', url: 'https://clientum.com.ar/inicio-2/',
    ambiente: 'Producción', tecnologia: 'WordPress', funcion: 'Landing alternativa de inicio',
    estado: 'En revisión', responsable: 'Equipo Clientum', dependencias: 'Clientum WP',
    observaciones: 'Posible duplicado de home',
  },
  // ── Desarrollo – Replit principal ────────────────────────────────────
  ...[
    ['/', 'Home CRM App'],
    ['/academia/', 'Academia'],
    ['/academia-cursos/', 'Academia – Cursos'],
    ['/ai-copilot/', 'AI Copilot'],
    ['/api-gateway/', 'API Gateway'],
    ['/automatizacion/', 'Automatización'],
    ['/blog/', 'Blog'],
    ['/casos/', 'Casos de uso'],
    ['/catalogo-servicios/', 'Catálogo de servicios'],
    ['/clientum-ai-prospector/', 'AI Prospector'],
    ['/comparativa/', 'Comparativa'],
    ['/comparativa-erp/', 'Comparativa ERP'],
    ['/comparativa-servicios/', 'Comparativa Servicios'],
    ['/comparativa-servicios-2/', 'Comparativa Servicios 2'],
    ['/consultoria/', 'Consultoría'],
    ['/contacto/', 'Contacto'],
    ['/crm/', 'CRM'],
    ['/desarrollo-web/', 'Desarrollo Web'],
    ['/desarrollo-web-personalizado/', 'Desarrollo Web Personalizado'],
    ['/discussions/', 'Discussions'],
    ['/erp/', 'ERP'],
    ['/faq/', 'FAQ'],
    ['/ia/', 'IA'],
    ['/implementacion/', 'Implementación'],
    ['/implementacion-2/', 'Implementación 2'],
    ['/inicio/', 'Inicio'],
    ['/integracion/', 'Integración'],
    ['/marketing/', 'Marketing'],
    ['/portal/', 'Portal'],
    ['/precios/', 'Precios'],
    ['/privacidad/', 'Privacidad'],
    ['/recursos/', 'Recursos'],
    ['/reportes/', 'Reportes'],
    ['/servicios/', 'Servicios'],
    ['/servicios-generales/', 'Servicios Generales'],
    ['/sobre-nosotros/', 'Sobre Nosotros'],
    ['/socios/', 'Socios'],
    ['/socios-2/', 'Socios 2'],
    ['/whatsapp/', 'WhatsApp'],
  ].map(([path, label], i) => ({
    id: `d1-${String(i + 1).padStart(2, '0')}`,
    servicio: `Dev 1 – ${label}`,
    url: `https://36f6531a-bf05-4de9-8e88-70f328fddd84-00-2mkpr9yd2f9z4.worf.replit.dev${path}`,
    ambiente: 'Desarrollo' as Ambiente,
    tecnologia: 'React + Vite + Express',
    funcion: `Ruta de desarrollo: ${label}`,
    estado: 'Activo' as Estado,
    responsable: 'Equipo Dev',
    dependencias: 'Gemini API, Hunter.io API',
    observaciones: 'Entorno Replit principal',
  })),
  // ── Desarrollo – Replit secundario ──────────────────────────────────
  ...([
    ['/', 'Home'],
    ['/catalogo-servicios/', 'Catálogo de Servicios'],
    ['/register/', 'Registro'],
  ] as [string, string][]).map(([path, label], i) => ({
    id: `d2-${String(i + 1).padStart(2, '0')}`,
    servicio: `Dev 2 – ${label}`,
    url: `https://bbe371f2-6c4e-4c70-9c23-b0d941a3131d-00-232wexuylg1ly.worf.replit.dev${path}`,
    ambiente: 'Desarrollo' as Ambiente,
    tecnologia: 'React + Vite',
    funcion: `Ruta de segundo entorno: ${label}`,
    estado: 'Activo' as Estado,
    responsable: 'Equipo Dev',
    dependencias: '',
    observaciones: 'Entorno Replit secundario',
  })),
  // ── Externos ────────────────────────────────────────────────────────
  {
    id: 'e-01', servicio: 'Cloudflare', url: 'https://dash.cloudflare.com',
    ambiente: 'Externo', tecnologia: 'Cloudflare (CDN / DNS)', funcion: 'Dashboard, Email Routing, CDN y protección DNS',
    estado: 'Activo', responsable: 'Equipo Clientum', dependencias: 'DNS clientum.com.ar',
    observaciones: 'Gestiona email routing del dominio',
  },
  {
    id: 'e-02', servicio: 'Gmail', url: 'https://mail.google.com',
    ambiente: 'Externo', tecnologia: 'Google Workspace', funcion: 'Bandeja de entrada y comunicaciones',
    estado: 'Activo', responsable: 'Equipo Clientum', dependencias: 'Cloudflare Email Routing',
    observaciones: '',
  },
  {
    id: 'e-03', servicio: 'Hunter.io', url: 'https://hunter.io',
    ambiente: 'Externo', tecnologia: 'API REST', funcion: 'Búsqueda y verificación de emails para prospección',
    estado: 'Activo', responsable: 'Equipo Dev', dependencias: 'HUNTER_API_KEY (secret)',
    observaciones: 'Clave gestionada en Replit Secrets',
  },
  {
    id: 'e-04', servicio: 'Google Cloud Console', url: 'https://console.cloud.google.com',
    ambiente: 'Externo', tecnologia: 'Google Cloud Platform', funcion: 'API Credentials y servicios cloud',
    estado: 'Activo', responsable: 'Equipo Dev', dependencias: 'Google Maps API',
    observaciones: '',
  },
  {
    id: 'e-05', servicio: 'OpenRouter', url: 'https://openrouter.ai',
    ambiente: 'Externo', tecnologia: 'API REST (LLM proxy)', funcion: 'Workspace API Keys para modelos de IA alternativos',
    estado: 'En revisión', responsable: 'Equipo Dev', dependencias: '',
    observaciones: 'Evaluando uso vs Gemini directo',
  },
  {
    id: 'e-06', servicio: 'Google AI Studio', url: 'https://aistudio.google.com',
    ambiente: 'Externo', tecnologia: 'Google Gemini', funcion: 'Gestión de API Keys de Gemini',
    estado: 'Activo', responsable: 'Equipo Dev', dependencias: 'GEMINI_API_KEY (secret)',
    observaciones: 'Clave gestionada en Replit Secrets',
  },
  {
    id: 'e-07', servicio: 'Wiroos cPanel', url: 'https://wo52.wiroos.host:2083',
    ambiente: 'Externo', tecnologia: 'cPanel / Softaculous', funcion: 'Hosting producción: File Manager, BD, SSL',
    estado: 'Activo', responsable: 'Equipo Clientum', dependencias: 'Clientum Prod',
    observaciones: 'Acceso admin restringido',
  },
  {
    id: 'e-08', servicio: 'WordPress Plugin (repo)', url: 'https://es.wordpress.org/plugins/ai-marketing-expert/',
    ambiente: 'Externo', tecnologia: 'WordPress.org', funcion: 'Repositorio oficial del plugin AI Marketing Expert',
    estado: 'Activo', responsable: 'Equipo Dev', dependencias: 'WordPress.org',
    observaciones: '',
  },
  {
    id: 'e-09', servicio: 'Facebook Marketplace', url: 'https://www.facebook.com/marketplace',
    ambiente: 'Externo', tecnologia: 'Meta / Facebook', funcion: 'Canal de captación de leads',
    estado: 'Activo', responsable: 'Equipo Marketing', dependencias: '',
    observaciones: '',
  },
  {
    id: 'e-10', servicio: 'LinkedIn Jobs', url: 'https://www.linkedin.com/jobs',
    ambiente: 'Externo', tecnologia: 'LinkedIn', funcion: 'Canal de prospección y empleo',
    estado: 'Activo', responsable: 'Equipo Marketing', dependencias: '',
    observaciones: '',
  },
  {
    id: 'e-11', servicio: 'Hotmart Marketplace', url: 'https://hotmart.com/es/marketplace',
    ambiente: 'Externo', tecnologia: 'Hotmart', funcion: 'Marketplace de productos digitales',
    estado: 'Activo', responsable: 'Equipo Marketing', dependencias: '',
    observaciones: '',
  },
];

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const AMBIENTES: Ambiente[] = ['Producción', 'Desarrollo', 'Externo'];

const ambienteStyle: Record<Ambiente, string> = {
  'Producción': 'bg-emerald-100 text-emerald-700 border border-emerald-200',
  'Desarrollo': 'bg-sky-100 text-sky-700 border border-sky-200',
  'Externo':    'bg-violet-100 text-violet-700 border border-violet-200',
};

const estadoIcon: Record<Estado, React.ReactNode> = {
  'Activo':      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />,
  'En revisión': <Clock className="w-3.5 h-3.5 text-amber-500" />,
  'Inactivo':    <AlertCircle className="w-3.5 h-3.5 text-red-400" />,
};

const estadoTextStyle: Record<Estado, string> = {
  'Activo':      'text-emerald-700',
  'En revisión': 'text-amber-700',
  'Inactivo':    'text-red-500',
};

/* ── Export helpers ──────────────────────────────────────────────────────── */
function toCSV(rows: CMDBEntry[]): string {
  const headers = ['Servicio','URL','Ambiente','Tecnología','Función','Estado','Responsable','Dependencias','Observaciones'];
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const lines = [
    headers.map(escape).join(','),
    ...rows.map(r => [
      r.servicio, r.url, r.ambiente, r.tecnologia, r.funcion,
      r.estado, r.responsable, r.dependencias, r.observaciones,
    ].map(escape).join(',')),
  ];
  return lines.join('\r\n');
}

function toMarkdown(rows: CMDBEntry[]): string {
  const cols = ['Servicio','URL','Ambiente','Tecnología','Función','Estado','Responsable','Dependencias','Observaciones'];
  const sep  = cols.map(() => '---').join(' | ');
  const keys: (keyof CMDBEntry)[] = ['servicio','url','ambiente','tecnologia','funcion','estado','responsable','dependencias','observaciones'];
  const lines = [
    `# Inventario de Infraestructura – Clientum\n`,
    `_Generado: ${new Date().toLocaleDateString('es-AR', { dateStyle: 'long' })}_\n`,
    `| ${cols.join(' | ')} |`,
    `| ${sep} |`,
    ...rows.map(r => `| ${keys.map(k => String(r[k]).replace(/\|/g, '\\|')).join(' | ')} |`),
  ];
  return lines.join('\n');
}

function download(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

/* ── Component ───────────────────────────────────────────────────────────── */
export default function CrmFullCMDB() {
  const [search, setSearch]           = useState('');
  const [filterAmbiente, setFilterAmbiente] = useState<Ambiente | 'Todos'>('Todos');
  const [filterEstado, setFilterEstado]     = useState<Estado | 'Todos'>('Todos');
  const [data, setData] = useState<CMDBEntry[]>(initialData);
  const [editingId, setEditingId]     = useState<string | null>(null);
  const [editRow, setEditRow]         = useState<CMDBEntry | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter(r =>
      (filterAmbiente === 'Todos' || r.ambiente === filterAmbiente) &&
      (filterEstado   === 'Todos' || r.estado   === filterEstado)   &&
      (q === '' ||
        r.servicio.toLowerCase().includes(q) ||
        r.url.toLowerCase().includes(q) ||
        r.tecnologia.toLowerCase().includes(q) ||
        r.funcion.toLowerCase().includes(q) ||
        r.responsable.toLowerCase().includes(q))
    );
  }, [data, search, filterAmbiente, filterEstado]);

  const counts = useMemo(() =>
    AMBIENTES.reduce((acc, a) => ({ ...acc, [a]: data.filter(r => r.ambiente === a).length }), {} as Record<string,number>)
  , [data]);

  function startEdit(row: CMDBEntry) { setEditingId(row.id); setEditRow({ ...row }); }
  function cancelEdit() { setEditingId(null); setEditRow(null); }
  function saveEdit() {
    if (!editRow) return;
    setData(prev => prev.map(r => r.id === editRow.id ? editRow : r));
    setEditingId(null); setEditRow(null);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-slate-800">Inventario de Infraestructura</h1>
          </div>
          <p className="text-sm text-slate-500">CMDB – {data.length} recursos registrados</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => download(toCSV(filtered), 'clientum-infraestructura.csv', 'text/csv')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Exportar CSV
          </button>
          <button
            onClick={() => download(toMarkdown(filtered), 'clientum-infraestructura.md', 'text/markdown')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-xs transition-all"
          >
            <FileText className="w-3.5 h-3.5" /> Exportar Markdown
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { label: 'Total', value: data.length, color: 'bg-slate-100 text-slate-700', icon: <Server className="w-4 h-4" /> },
          { label: 'Producción', value: counts['Producción'] ?? 0, color: 'bg-emerald-50 text-emerald-700', icon: <Globe className="w-4 h-4" /> },
          { label: 'Desarrollo', value: counts['Desarrollo'] ?? 0, color: 'bg-sky-50 text-sky-700', icon: <Code2 className="w-4 h-4" /> },
          { label: 'Externos', value: counts['Externo'] ?? 0, color: 'bg-violet-50 text-violet-700', icon: <ExternalLink className="w-4 h-4" /> },
        ] as const).map(({ label, value, color, icon }) => (
          <div key={label} className={`rounded-xl p-4 flex items-center gap-3 ${color}`}>
            {icon}
            <div>
              <div className="text-xl font-bold">{value}</div>
              <div className="text-xs font-medium opacity-70">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar servicio, URL, tecnología…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={filterAmbiente}
            onChange={e => setFilterAmbiente(e.target.value as Ambiente | 'Todos')}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="Todos">Todos los ambientes</option>
            {AMBIENTES.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
          <select
            value={filterEstado}
            onChange={e => setFilterEstado(e.target.value as Estado | 'Todos')}
            className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="Todos">Todos los estados</option>
            {(['Activo','En revisión','Inactivo'] as Estado[]).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        {(search || filterAmbiente !== 'Todos' || filterEstado !== 'Todos') && (
          <span className="text-xs text-slate-500">{filtered.length} resultado{filtered.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-x-auto">
        <table className="w-full text-xs min-w-[900px]">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              {['Servicio','URL','Ambiente','Tecnología','Función','Estado','Responsable','Dependencias','Observaciones',''].map(h => (
                <th key={h} className="text-left px-3 py-2.5 font-semibold text-slate-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map(row => {
              const isEditing = editingId === row.id;
              return (
                <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group">
                  {isEditing && editRow ? (
                    <>
                      {(['servicio','url','tecnologia','funcion'] as const).map(k => (
                        <td key={k} className="px-2 py-1.5">
                          <input
                            className="w-full border border-primary/40 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                            value={editRow[k]}
                            onChange={e => setEditRow({ ...editRow, [k]: e.target.value })}
                          />
                        </td>
                      ))}
                      {/* ambiente */}
                      <td className="px-2 py-1.5">
                        <select
                          className="border border-primary/40 rounded px-1 py-0.5 text-xs focus:outline-none"
                          value={editRow.ambiente}
                          onChange={e => setEditRow({ ...editRow, ambiente: e.target.value as Ambiente })}
                        >
                          {AMBIENTES.map(a => <option key={a}>{a}</option>)}
                        </select>
                      </td>
                      {/* estado */}
                      <td className="px-2 py-1.5">
                        <select
                          className="border border-primary/40 rounded px-1 py-0.5 text-xs focus:outline-none"
                          value={editRow.estado}
                          onChange={e => setEditRow({ ...editRow, estado: e.target.value as Estado })}
                        >
                          {(['Activo','En revisión','Inactivo'] as Estado[]).map(s => <option key={s}>{s}</option>)}
                        </select>
                      </td>
                      {(['responsable','dependencias','observaciones'] as const).map(k => (
                        <td key={k} className="px-2 py-1.5">
                          <input
                            className="w-full border border-primary/40 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                            value={editRow[k]}
                            onChange={e => setEditRow({ ...editRow, [k]: e.target.value })}
                          />
                        </td>
                      ))}
                      <td className="px-2 py-1.5">
                        <div className="flex gap-1">
                          <button onClick={saveEdit}   className="px-2 py-0.5 rounded bg-primary text-white text-xs font-semibold">✓</button>
                          <button onClick={cancelEdit} className="px-2 py-0.5 rounded bg-slate-200 text-slate-600 text-xs font-semibold">✕</button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-3 py-2.5 font-medium text-slate-700 whitespace-nowrap max-w-[160px] truncate" title={row.servicio}>{row.servicio}</td>
                      <td className="px-3 py-2.5 max-w-[200px]">
                        <a
                          href={row.url} target="_blank" rel="noreferrer"
                          className="text-primary hover:underline truncate block max-w-full"
                          title={row.url}
                        >
                          {row.url}
                        </a>
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${ambienteStyle[row.ambiente]}`}>
                          {row.ambiente}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap max-w-[140px] truncate" title={row.tecnologia}>{row.tecnologia}</td>
                      <td className="px-3 py-2.5 text-slate-600 max-w-[180px] truncate" title={row.funcion}>{row.funcion}</td>
                      <td className="px-3 py-2.5">
                        <div className={`flex items-center gap-1 whitespace-nowrap font-medium ${estadoTextStyle[row.estado]}`}>
                          {estadoIcon[row.estado]} {row.estado}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{row.responsable}</td>
                      <td className="px-3 py-2.5 text-slate-500 max-w-[160px] truncate" title={row.dependencias}>{row.dependencias || '—'}</td>
                      <td className="px-3 py-2.5 text-slate-500 max-w-[160px] truncate" title={row.observaciones}>{row.observaciones || '—'}</td>
                      <td className="px-3 py-2.5">
                        <button
                          onClick={() => startEdit(row)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] px-2 py-0.5 rounded border border-slate-200 text-slate-500 hover:text-primary hover:border-primary/40"
                        >
                          Editar
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center py-10 text-slate-400 text-sm">
                  No se encontraron recursos con los filtros aplicados.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-slate-400 text-right">
        Mostrando {filtered.length} de {data.length} recursos · Hacé clic en "Editar" para actualizar un registro
      </p>
    </div>
  );
}
