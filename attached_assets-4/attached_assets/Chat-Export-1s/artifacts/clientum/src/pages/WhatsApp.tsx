import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "wouter";
import {
  MessageCircle, Search, Send, User, CheckCheck, Bot,
  Wifi, BarChart2, Book, Settings, Plus, Trash2, Pencil, X, Check,
  TrendingUp, Users, Zap, MessageSquare, ChevronDown, ChevronUp, Save,
  ListChecks, Shield, GitBranch, AlertTriangle, UserCheck, RefreshCw,
  Phone, Filter,
} from "lucide-react";
import OnboardingTab from "@/components/whatsapp/OnboardingTab";
import GuardrailsTab from "@/components/whatsapp/GuardrailsTab";
import FlowBuilderTab from "@/components/whatsapp/FlowBuilderTab";
import CampaignsTab from "@/components/whatsapp/CampaignsTab";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useWhatsAppStatus } from "@/hooks/useWhatsAppStatus";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend,
} from "recharts";

/* ------------------------------------------------------------------ */
/* Types                                                                 */
/* ------------------------------------------------------------------ */

interface WaMessage {
  id: number;
  phone: string;
  contactName: string;
  contactId: number | null;
  direction: "inbound" | "outbound";
  body: string;
  fromMe: boolean;
  aiGenerated: boolean;
  createdAt: string;
}

interface Conversation {
  phone: string;
  contactName: string;
  contactId: number | null;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  needsHuman: boolean;
}

interface Analytics {
  summary: {
    totalMessages: number;
    inbound: number;
    outbound: number;
    aiReplies: number;
    uniqueUsers: number;
    resolutionRate: number;
  };
  daily: { day: string; inbound: number; outbound: number; aiReplies: number }[];
  conversationsPerDay: { day: string; conversations: number }[];
}

interface KbEntry {
  id: number;
  question: string;
  answer: string;
  category: string;
  createdAt: string;
}

interface BotSettings {
  chatbotEnabled: boolean;
  chatbotMode: string;
  chatbotPersona: string | null;
  whatomateUrl: string | null;
  whatomateToken: string | null;
  evolutionApiUrl?: string | null;
  evolutionApiKey?: string | null;
  evolutionInstance?: string | null;
}

type Tab =
  | "conversations"
  | "analytics"
  | "kb"
  | "settings"
  | "onboarding"
  | "guardrails"
  | "flows"
  | "bots"
  | "campaigns";

const API = "/api";

function authHeaders(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });
  const isThisYear = d.getFullYear() === now.getFullYear();
  if (isThisYear) return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short" });
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "2-digit" });
}

function formatDay(day: string) {
  const d = new Date(day + "T12:00:00");
  return d.toLocaleDateString("es-AR", { weekday: "short", day: "numeric" });
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/* ------------------------------------------------------------------ */
/* Shared StatCard                                                       */
/* ------------------------------------------------------------------ */

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border p-5 flex items-center gap-4">
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
          color
        )}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-muted-foreground/70 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Analytics Tab                                                         */
/* ------------------------------------------------------------------ */

function AnalyticsTab({ token }: { token: string }) {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/whatsapp/analytics`, { headers: authHeaders(token) })
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Cargando analytics...
      </div>
    );
  if (!data)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Error al cargar analytics
      </div>
    );

  const { summary, daily, conversationsPerDay } = data;

  const barData = daily.map((d) => ({
    name: formatDay(d.day),
    Entrantes: Number(d.inbound),
    "Resp. IA": Number(d.aiReplies),
    Manuales: Math.max(0, Number(d.outbound) - Number(d.aiReplies)),
  }));

  const lineData = (conversationsPerDay ?? []).map((d) => ({
    name: formatDay(d.day),
    Conversaciones: Number(d.conversations),
  }));

  const aiPct =
    summary.outbound > 0
      ? Math.round((summary.aiReplies / summary.outbound) * 100)
      : 0;

  return (
    <div className="space-y-6">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Mensajes totales"
          value={summary.totalMessages}
          icon={MessageSquare}
          color="bg-blue-500"
          sub={`${summary.inbound} ent. · ${summary.outbound} sal.`}
        />
        <StatCard
          label="Usuarios únicos"
          value={summary.uniqueUsers}
          icon={Users}
          color="bg-green-500"
        />
        <StatCard
          label="Respuestas IA"
          value={summary.aiReplies}
          icon={Zap}
          color="bg-purple-500"
          sub={`${aiPct}% del total saliente`}
        />
        <StatCard
          label="Tasa de resolución"
          value={`${summary.resolutionRate}%`}
          icon={TrendingUp}
          color="bg-orange-500"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Mensajes por día (últimos 7 días)
          </h3>
          {barData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              Sin datos todavía.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={barData} barSize={16}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="Entrantes" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Resp. IA" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Manuales" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white rounded-xl border p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Conversaciones únicas por día
          </h3>
          {lineData.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              Sin datos todavía.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="Conversaciones"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-5">
          <p className="text-xs text-muted-foreground">Mensajes entrantes</p>
          <p className="text-2xl font-bold mt-1">{summary.inbound}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-xs text-muted-foreground">Mensajes salientes</p>
          <p className="text-2xl font-bold mt-1">{summary.outbound}</p>
        </div>
        <div className="bg-white rounded-xl border p-5">
          <p className="text-xs text-muted-foreground">Automatizados por IA</p>
          <p className="text-2xl font-bold mt-1 text-purple-600">{summary.aiReplies}</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Knowledge Base Tab                                                    */
/* ------------------------------------------------------------------ */

function KbTab({ token }: { token: string }) {
  const [entries, setEntries] = useState<KbEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ question: "", answer: "", category: "general" });
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [search, setSearch] = useState("");

  const headers = authHeaders(token);

  async function load() {
    const r = await fetch(`${API}/whatsapp/kb`, { headers });
    if (r.ok) setEntries(await r.json());
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function save() {
    if (!form.question.trim() || !form.answer.trim()) return;
    setSaving(true);
    try {
      if (editId !== null) {
        const r = await fetch(`${API}/whatsapp/kb/${editId}`, {
          method: "PATCH",
          headers,
          body: JSON.stringify(form),
        });
        if (r.ok) {
          const updated: KbEntry = await r.json();
          setEntries((prev) => prev.map((e) => (e.id === editId ? updated : e)));
        }
      } else {
        const r = await fetch(`${API}/whatsapp/kb`, {
          method: "POST",
          headers,
          body: JSON.stringify(form),
        });
        if (r.ok) {
          const created: KbEntry = await r.json();
          setEntries((prev) => [...prev, created]);
        }
      }
      setForm({ question: "", answer: "", category: "general" });
      setShowForm(false);
      setEditId(null);
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    await fetch(`${API}/whatsapp/kb/${id}`, { method: "DELETE", headers });
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  function startEdit(entry: KbEntry) {
    setForm({
      question: entry.question,
      answer: entry.answer,
      category: entry.category ?? "general",
    });
    setEditId(entry.id);
    setShowForm(true);
    setExpandedId(null);
  }

  function cancelForm() {
    setForm({ question: "", answer: "", category: "general" });
    setEditId(null);
    setShowForm(false);
  }

  const filtered = entries.filter(
    (e) =>
      e.question.toLowerCase().includes(search.toLowerCase()) ||
      e.answer.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = [...new Set(entries.map((e) => e.category))];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Base de Conocimiento</h2>
          <p className="text-sm text-muted-foreground">
            Preguntas y respuestas que el bot usa como contexto
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{entries.length} entradas</span>
          <Button
            size="sm"
            onClick={() => {
              cancelForm();
              setShowForm(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" /> Agregar entrada
          </Button>
        </div>
      </div>

      {entries.length > 3 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar en la base de conocimiento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}

      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 space-y-3">
          <p className="text-sm font-medium text-blue-700">
            {editId !== null ? "Editar entrada" : "Nueva entrada"}
          </p>
          <div>
            <Label className="text-xs mb-1">Pregunta / Trigger</Label>
            <Input
              value={form.question}
              onChange={(e) => setForm((f) => ({ ...f, question: e.target.value }))}
              placeholder="¿Cuánto cuesta el plan Pro?"
              autoFocus
            />
          </div>
          <div>
            <Label className="text-xs mb-1">Respuesta</Label>
            <Textarea
              value={form.answer}
              onChange={(e) => setForm((f) => ({ ...f, answer: e.target.value }))}
              placeholder="El plan Pro cuesta $X por mes e incluye..."
              rows={4}
            />
          </div>
          <div>
            <Label className="text-xs mb-1">Categoría</Label>
            <Input
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              placeholder="general, precios, soporte..."
              list="kb-categories"
            />
            <datalist id="kb-categories">
              {categories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={saving}>
              <Check className="w-4 h-4 mr-1" />
              {saving ? "Guardando..." : "Guardar"}
            </Button>
            <Button size="sm" variant="outline" onClick={cancelForm}>
              <X className="w-4 h-4 mr-1" /> Cancelar
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center text-muted-foreground text-sm py-12">Cargando...</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground text-sm text-center">
          <Book className="w-10 h-10 mb-3 opacity-20" />
          <p className="font-medium">
            {search ? "Sin resultados para tu búsqueda" : "Sin entradas todavía"}
          </p>
          <p className="text-xs mt-1">
            {search
              ? "Probá con otra palabra clave."
              : "Agregá preguntas y respuestas para que el bot las use."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((entry) => (
            <div key={entry.id} className="bg-white border rounded-xl overflow-hidden">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{entry.question}</p>
                  <Badge variant="outline" className="text-[10px] mt-1 capitalize">
                    {entry.category}
                  </Badge>
                </div>
                <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                  <button
                    className="p-1.5 rounded hover:bg-gray-100 text-muted-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(entry);
                    }}
                    title="Editar"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    className="p-1.5 rounded hover:bg-red-50 text-red-400 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      remove(entry.id);
                    }}
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  {expandedId === entry.id ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>
              {expandedId === entry.id && (
                <div className="px-4 pb-4 text-sm text-gray-600 border-t bg-gray-50 pt-3 whitespace-pre-wrap leading-relaxed">
                  {entry.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Settings Tab                                                          */
/* ------------------------------------------------------------------ */

function SettingsTab({ token }: { token: string }) {
  const [settings, setSettings] = useState<BotSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const headers = authHeaders(token);

  useEffect(() => {
    fetch(`${API}/whatsapp/bot-settings`, { headers })
      .then((r) => r.json())
      .then((d) => {
        setSettings(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function saveSettings() {
    if (!settings) return;
    setSaving(true);
    try {
      const r = await fetch(`${API}/whatsapp/bot-settings`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({
          chatbotEnabled: settings.chatbotEnabled,
          chatbotMode: settings.chatbotMode,
          chatbotPersona: settings.chatbotPersona ?? "",
          whatomateUrl: settings.whatomateUrl ?? "",
          whatomateToken: settings.whatomateToken ?? "",
        }),
      });
      if (r.ok) {
        setSettings(await r.json());
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Cargando...
      </div>
    );
  if (!settings)
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Error al cargar configuración
      </div>
    );

  function field<K extends keyof BotSettings>(key: K, val: BotSettings[K]) {
    setSettings((prev) => (prev ? { ...prev, [key]: val } : prev));
  }

  const MODES = [
    {
      value: "full_auto",
      label: "Automático completo",
      desc: "El bot responde todos los mensajes sin intervención humana",
      emoji: "🤖",
    },
    {
      value: "hybrid",
      label: "Híbrido",
      desc: "Bot responde pero el agente puede tomar control cuando quiera",
      emoji: "⚡",
    },
    {
      value: "supervised",
      label: "Supervisado",
      desc: "Bot sugiere respuestas y el agente las aprueba antes de enviar",
      emoji: "👤",
    },
  ];

  return (
    <div className="max-w-2xl space-y-5">
      {/* Bot toggle & mode */}
      <div className="bg-white rounded-xl border p-5 space-y-5">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Bot className="w-4 h-4 text-purple-500" /> Chatbot IA
        </h3>

        <div className="flex items-center justify-between py-1">
          <div>
            <Label className="text-sm font-medium">Bot activo</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cuando está desactivado, el bot no responde mensajes entrantes
            </p>
          </div>
          <Switch
            checked={settings.chatbotEnabled}
            onCheckedChange={(v) => field("chatbotEnabled", v)}
          />
        </div>

        <div>
          <Label className="text-sm font-medium mb-3 block">Modo de operación</Label>
          <div className="space-y-2">
            {MODES.map((m) => (
              <button
                key={m.value}
                onClick={() => field("chatbotMode", m.value)}
                className={cn(
                  "w-full text-left px-4 py-3 rounded-lg border transition-colors flex items-start gap-3",
                  settings.chatbotMode === m.value
                    ? "border-blue-500 bg-blue-50 text-blue-900"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                <span className="text-base mt-0.5">{m.emoji}</span>
                <div>
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{m.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-sm font-medium mb-1.5 block">Personalidad / Prompt del bot</Label>
          <Textarea
            value={settings.chatbotPersona ?? ""}
            onChange={(e) => field("chatbotPersona", e.target.value)}
            placeholder="Describí cómo debe hablar el bot, qué información tiene, cuál es su tono... (Dejá vacío para usar el prompt por defecto en español argentino)"
            rows={5}
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Si lo dejás vacío se usa el prompt por defecto en español argentino.
          </p>
        </div>
      </div>

      {/* WhatsApp connection */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Phone className="w-4 h-4 text-green-500" /> Conexión WhatsApp (Whatomate)
        </h3>
        <p className="text-xs text-muted-foreground">
          Configurá la URL y token de tu proveedor de WhatsApp para enviar mensajes salientes desde el bot.
        </p>

        <div>
          <Label className="text-xs mb-1.5 block">URL del proveedor</Label>
          <Input
            value={settings.whatomateUrl ?? ""}
            onChange={(e) => field("whatomateUrl", e.target.value)}
            placeholder="https://api.tuproveedor.com"
            type="url"
          />
        </div>

        <div>
          <Label className="text-xs mb-1.5 block">Token / API Key</Label>
          <Input
            value={settings.whatomateToken ?? ""}
            onChange={(e) => field("whatomateToken", e.target.value)}
            placeholder="tu-token"
            type="password"
          />
        </div>
      </div>

      <Button onClick={saveSettings} disabled={saving} className="w-full sm:w-auto gap-2">
        {saved ? (
          <>
            <Check className="w-4 h-4" /> Guardado
          </>
        ) : (
          <>
            <Save className="w-4 h-4" /> {saving ? "Guardando..." : "Guardar cambios"}
          </>
        )}
      </Button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Conversations Tab                                                     */
/* ------------------------------------------------------------------ */

type ConvFilter = "all" | "escalated";

function ConversationsTab({ token }: { token: string }) {
  const [, navigate] = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<WaMessage[]>([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<ConvFilter>("all");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const headers = authHeaders(token);

  const fetchConversations = useCallback(async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await fetch(`${API}/whatsapp/conversations`, { headers });
      if (res.ok) {
        const data: Conversation[] = await res.json();
        setConversations(data);
        setSelected((prev) => {
          if (prev) {
            const updated = data.find((c) => c.phone === prev.phone);
            return updated ?? prev;
          }
          return data.length > 0 ? data[0]! : null;
        });
      }
    } finally {
      setLoading(false);
      if (!silent) setRefreshing(false);
    }
  }, []);

  const fetchMessages = useCallback(async (phone: string) => {
    const res = await fetch(
      `${API}/whatsapp/conversations/${encodeURIComponent(phone)}/messages`,
      { headers }
    );
    if (res.ok) setMessages(await res.json());
  }, []);

  useEffect(() => {
    fetchConversations();
    const id = setInterval(() => fetchConversations(true), 10_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!selected) return;
    fetchMessages(selected.phone);
    const id = setInterval(() => fetchMessages(selected.phone), 5_000);
    return () => clearInterval(id);
  }, [selected?.phone]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!message.trim() || !selected || sending) return;
    setSending(true);
    try {
      const res = await fetch(
        `${API}/whatsapp/conversations/${encodeURIComponent(selected.phone)}/send`,
        { method: "POST", headers, body: JSON.stringify({ body: message }) }
      );
      if (res.ok) {
        const msg: WaMessage = await res.json();
        setMessages((prev) => [...prev, msg]);
        setMessage("");
        textareaRef.current?.focus();
        fetchConversations(true);
      }
    } finally {
      setSending(false);
    }
  }

  async function resolveConversation(phone: string) {
    await fetch(`${API}/whatsapp/conversations/${encodeURIComponent(phone)}/resolve`, {
      method: "POST",
      headers,
    });
    setConversations((prev) =>
      prev.map((c) => (c.phone === phone ? { ...c, needsHuman: false } : c))
    );
    setSelected((prev) => (prev?.phone === phone ? { ...prev, needsHuman: false } : prev));
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const escalatedCount = conversations.filter((c) => c.needsHuman).length;

  const filtered = conversations.filter((c) => {
    const matchesSearch =
      c.contactName.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchesFilter = filter === "all" ? true : c.needsHuman;
    return matchesSearch && matchesFilter;
  });

  const totalUnread = conversations.reduce((sum, c) => sum + Number(c.unread), 0);

  return (
    <div className="flex flex-1 rounded-xl overflow-hidden bg-white shadow-sm border min-h-0">
      {/* ---- Sidebar ---- */}
      <div className="w-72 border-r flex flex-col flex-shrink-0 min-h-0">
        {/* Search */}
        <div className="p-3 border-b space-y-2">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            <button
              onClick={() => fetchConversations()}
              className="h-8 w-8 flex items-center justify-center rounded-md border hover:bg-gray-50 transition-colors"
              title="Actualizar"
            >
              <RefreshCw className={cn("w-3.5 h-3.5 text-muted-foreground", refreshing && "animate-spin")} />
            </button>
          </div>
          {/* Filter tabs */}
          <div className="flex gap-1">
            <button
              onClick={() => setFilter("all")}
              className={cn(
                "flex-1 text-xs py-1 rounded-md font-medium transition-colors",
                filter === "all"
                  ? "bg-gray-900 text-white"
                  : "text-muted-foreground hover:text-gray-700 hover:bg-gray-100"
              )}
            >
              Todos
              {totalUnread > 0 && (
                <span className="ml-1 inline-flex items-center justify-center w-4 h-4 text-[10px] rounded-full bg-green-500 text-white">
                  {totalUnread > 9 ? "9+" : totalUnread}
                </span>
              )}
            </button>
            <button
              onClick={() => setFilter("escalated")}
              className={cn(
                "flex-1 text-xs py-1 rounded-md font-medium transition-colors flex items-center justify-center gap-1",
                filter === "escalated"
                  ? "bg-orange-500 text-white"
                  : "text-muted-foreground hover:text-orange-700 hover:bg-orange-50"
              )}
            >
              <AlertTriangle className="w-3 h-3" /> Atención
              {escalatedCount > 0 && (
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-4 h-4 text-[10px] rounded-full",
                    filter === "escalated"
                      ? "bg-white text-orange-600"
                      : "bg-orange-500 text-white"
                  )}
                >
                  {escalatedCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Conversation list */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
              Cargando...
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-sm p-4 text-center">
              <MessageCircle className="w-8 h-8 mb-2 opacity-20" />
              <p className="text-sm">
                {filter === "escalated"
                  ? "No hay conversaciones escaladas"
                  : "Aún no hay conversaciones"}
              </p>
              <p className="text-xs mt-1 opacity-70">
                {filter === "escalated"
                  ? "¡Todo bajo control!"
                  : "Los mensajes de WhatsApp aparecerán aquí."}
              </p>
            </div>
          ) : (
            filtered.map((conv) => (
              <button
                key={conv.phone}
                onClick={() => setSelected(conv)}
                className={cn(
                  "w-full flex items-start gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-100",
                  selected?.phone === conv.phone && "bg-blue-50 hover:bg-blue-50 border-l-2 border-l-blue-500",
                  conv.needsHuman && selected?.phone !== conv.phone && "border-l-2 border-l-orange-400"
                )}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0 mt-0.5",
                    conv.needsHuman
                      ? "bg-gradient-to-br from-orange-400 to-orange-600"
                      : "bg-gradient-to-br from-green-400 to-teal-500"
                  )}
                >
                  {conv.needsHuman ? <AlertTriangle className="w-4 h-4" /> : initials(conv.contactName)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-semibold text-gray-900 truncate">
                      {conv.contactName}
                    </span>
                    <span className="text-[10px] text-muted-foreground flex-shrink-0">
                      {formatTime(conv.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-1 mt-0.5">
                    {conv.needsHuman ? (
                      <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> Necesita atención
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground truncate">
                        {conv.lastMessage}
                      </span>
                    )}
                    {Number(conv.unread) > 0 && !conv.needsHuman && (
                      <Badge className="ml-1 h-4 min-w-[1rem] px-1 flex-shrink-0 bg-green-500 text-white text-[10px] rounded-full">
                        {conv.unread}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5 truncate">
                    {conv.phone}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* ---- Chat area ---- */}
      {selected ? (
        <div className="flex-1 flex flex-col min-w-0">
          {/* Escalation banner */}
          {selected.needsHuman && (
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 border-b border-orange-200">
              <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <p className="text-xs text-orange-700 font-medium flex-1">
                Este contacto solicitó atención humana. El bot está pausado.
              </p>
              <Button
                size="sm"
                variant="outline"
                className="h-6 text-xs border-orange-300 text-orange-700 hover:bg-orange-100 flex-shrink-0 gap-1 px-2"
                onClick={() => resolveConversation(selected.phone)}
              >
                <UserCheck className="w-3 h-3" />
                Resolver
              </Button>
            </div>
          )}

          {/* Chat header */}
          <div className="px-4 py-2.5 border-b flex items-center gap-3 bg-gray-50/80">
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0",
                selected.needsHuman
                  ? "bg-gradient-to-br from-orange-400 to-orange-600"
                  : "bg-gradient-to-br from-green-400 to-teal-500"
              )}
            >
              {initials(selected.contactName)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold truncate">{selected.contactName}</p>
                {selected.needsHuman && (
                  <Badge className="h-4 px-1.5 text-[10px] bg-orange-100 text-orange-700 border-orange-300">
                    ⚠️ Atención
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground font-mono">{selected.phone}</p>
            </div>
            {selected.contactId && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs h-7 gap-1"
                onClick={() => navigate(`/app/contacts/${selected.contactId}`)}
              >
                <User className="w-3 h-3" />
                Ver en CRM
              </Button>
            )}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-[#e5ddd5]">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                <div className="text-center bg-white/70 rounded-2xl px-6 py-4">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>Sin mensajes todavía</p>
                </div>
              </div>
            )}
            {messages.map((msg, i) => {
              const isFirst =
                i === 0 || messages[i - 1]?.fromMe !== msg.fromMe;
              return (
                <div
                  key={msg.id}
                  className={cn("flex", msg.fromMe ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "max-w-[72%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                      msg.fromMe
                        ? cn("bg-[#dcf8c6] text-gray-900", isFirst && "rounded-tr-sm")
                        : cn("bg-white text-gray-900", isFirst && "rounded-tl-sm")
                    )}
                  >
                    {msg.aiGenerated && (
                      <div className="flex items-center gap-1 mb-1 text-[10px] text-purple-600 font-medium">
                        <Bot className="w-3 h-3" />
                        Bot IA
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>
                    <div
                      className={cn(
                        "flex items-center gap-1 mt-1",
                        msg.fromMe ? "justify-end" : "justify-start"
                      )}
                    >
                      <span className="text-[10px] text-gray-400 leading-none">
                        {formatTime(msg.createdAt)}
                      </span>
                      {msg.fromMe && (
                        <CheckCheck
                          className={cn(
                            "w-3 h-3",
                            msg.aiGenerated ? "text-purple-400" : "text-blue-400"
                          )}
                        />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t bg-white flex items-end gap-2">
            <Textarea
              ref={textareaRef}
              placeholder="Escribí un mensaje… (Enter para enviar, Shift+Enter para nueva línea)"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 resize-none text-sm min-h-[40px] max-h-[120px]"
              rows={1}
            />
            <Button
              onClick={sendMessage}
              disabled={!message.trim() || sending}
              size="icon"
              className="flex-shrink-0 h-10 w-10"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-[#e5ddd5]">
          <div className="text-center bg-white/80 rounded-2xl px-8 py-6">
            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-gray-600 font-medium">Seleccioná una conversación</p>
            <p className="text-xs text-muted-foreground mt-1">
              Elegí un contacto de la lista para ver el historial
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bots Tab                                                              */
/* ------------------------------------------------------------------ */

interface BotCard {
  id: string;
  name: string;
  mode: string;
  enabled: boolean;
  status: "connected" | "qr_pending" | "disconnected";
  phone: string | null;
  persona: string | null;
}

function BotsTab({ token, onNavigate }: { token: string; onNavigate: (tab: Tab) => void }) {
  const [bot, setBot] = useState<BotCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const headers = authHeaders(token);

  useEffect(() => {
    Promise.all([
      fetch(`${API}/whatsapp/bot-settings`, { headers }).then((r) =>
        r.ok ? r.json() : null
      ),
      fetch(`${API}/whatsapp/session`, { headers }).then((r) =>
        r.ok ? r.json() : null
      ),
    ])
      .then(([settings, session]) => {
        if (settings) {
          setBot({
            id: "main",
            name: "Bot Principal",
            mode: settings.chatbotMode ?? "hybrid",
            enabled: settings.chatbotEnabled ?? false,
            status: session?.status ?? "disconnected",
            phone: session?.phone ?? null,
            persona: settings.chatbotPersona ?? null,
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function toggleBot() {
    if (!bot) return;
    setSaving(true);
    try {
      const r = await fetch(`${API}/whatsapp/bot-settings`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ chatbotEnabled: !bot.enabled }),
      });
      if (r.ok) {
        const updated = await r.json();
        setBot((prev) => (prev ? { ...prev, enabled: updated.chatbotEnabled } : prev));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  const MODE_LABELS: Record<string, { label: string; emoji: string }> = {
    full_auto: { label: "Automático completo", emoji: "🤖" },
    hybrid: { label: "Híbrido", emoji: "⚡" },
    supervised: { label: "Supervisado", emoji: "👤" },
  };

  const STATUS_CONFIG = {
    connected: {
      label: "Conectado",
      color: "bg-green-50 text-green-700 border-green-200",
      dot: "bg-green-500",
    },
    qr_pending: {
      label: "Esperando QR",
      color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      dot: "bg-yellow-400",
    },
    disconnected: {
      label: "Desconectado",
      color: "bg-gray-100 text-gray-500 border-gray-200",
      dot: "bg-gray-400",
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">
        Cargando...
      </div>
    );
  }

  const mode = bot ? (MODE_LABELS[bot.mode] ?? { label: bot.mode, emoji: "🤖" }) : null;
  const statusCfg = bot ? STATUS_CONFIG[bot.status] : null;

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Bots configurados</h2>
          <p className="text-sm text-muted-foreground">
            Gestioná los bots de WhatsApp de tu cuenta
          </p>
        </div>
        <span className="text-xs text-muted-foreground border rounded-full px-2.5 py-1">
          Plan actual: 1 bot incluido
        </span>
      </div>

      {bot && statusCfg && mode ? (
        <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-4 p-5 border-b bg-gradient-to-r from-gray-50 to-white">
            <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0">
              <Bot className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold text-gray-900">{bot.name}</h3>
                <div
                  className={cn(
                    "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border font-medium",
                    statusCfg.color
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      statusCfg.dot,
                      bot.status === "connected" && "animate-pulse"
                    )}
                  />
                  {statusCfg.label}
                  {bot.phone && (
                    <span className="ml-1 opacity-75 font-mono">+{bot.phone}</span>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {mode.emoji} {mode.label}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                  Estado
                </p>
                <p
                  className={cn(
                    "text-sm font-semibold mt-0.5",
                    bot.enabled ? "text-green-600" : "text-gray-400"
                  )}
                >
                  {bot.enabled ? "Activo" : "Inactivo"}
                </p>
              </div>
              <Switch checked={bot.enabled} onCheckedChange={toggleBot} disabled={saving} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 divide-x border-b">
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Modo</p>
              <p className="text-sm font-medium mt-1">
                {mode.emoji} {mode.label}
              </p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Conexión WA</p>
              <p className="text-sm font-medium mt-1">{statusCfg.label}</p>
            </div>
            <div className="p-4 text-center">
              <p className="text-xs text-muted-foreground">Personalidad</p>
              <p className="text-sm font-medium mt-1">
                {bot.persona ? "Configurada" : "Por defecto"}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 p-4 bg-gray-50/60">
            <button
              onClick={() => onNavigate("settings")}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              <Settings className="w-3.5 h-3.5" />
              Configurar bot
            </button>
            <span className="text-gray-300">·</span>
            <button
              onClick={() => onNavigate("onboarding")}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              <Wifi className="w-3.5 h-3.5" />
              Conectar WhatsApp
            </button>
            <span className="text-gray-300">·</span>
            <button
              onClick={() => onNavigate("guardrails")}
              className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              <Shield className="w-3.5 h-3.5" />
              Guardrails
            </button>
            {saved && (
              <span className="ml-auto text-xs text-green-600 font-medium flex items-center gap-1">
                <Check className="w-3 h-3" /> Guardado
              </span>
            )}
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-sm text-center">
          <Bot className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-medium">No se pudo cargar la configuración del bot</p>
          <p className="text-xs mt-1">
            Verificá que el servidor esté corriendo y que tengas permisos.
          </p>
        </div>
      )}

      {/* Add bot CTA */}
      <div className="border border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center bg-gray-50/50">
        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
          <Plus className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-600">Agregar otro bot</p>
        <p className="text-xs text-muted-foreground mt-1">
          Disponible en planes superiores — conectá múltiples números de WhatsApp.
        </p>
        <Badge variant="secondary" className="mt-3 text-xs">
          Próximamente
        </Badge>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Main Page                                                             */
/* ------------------------------------------------------------------ */

const TAB_GROUPS: {
  label: string;
  tabs: { id: Tab; label: string; icon: React.ElementType }[];
}[] = [
  {
    label: "Chat",
    tabs: [
      { id: "conversations", label: "Conversaciones", icon: MessageCircle },
      { id: "analytics", label: "Analytics", icon: BarChart2 },
      { id: "campaigns", label: "Campañas", icon: Filter },
    ],
  },
  {
    label: "IA",
    tabs: [
      { id: "bots", label: "Bots", icon: Bot },
      { id: "flows", label: "Flujos", icon: GitBranch },
      { id: "kb", label: "Conocimiento", icon: Book },
      { id: "guardrails", label: "Guardrails", icon: Shield },
    ],
  },
  {
    label: "Configuración",
    tabs: [
      { id: "onboarding", label: "Conectar", icon: ListChecks },
      { id: "settings", label: "Ajustes", icon: Settings },
    ],
  },
];

function WaStatusPill() {
  const { status, phone } = useWhatsAppStatus();
  if (status === "connected") {
    return (
      <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-green-50 text-green-700 border border-green-200 font-medium">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        {phone ? `+${phone}` : "Conectado"}
      </div>
    );
  }
  if (status === "qr_pending") {
    return (
      <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 font-medium">
        <span className="w-2 h-2 rounded-full bg-yellow-400" />
        Esperando QR
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200">
      <span className="w-2 h-2 rounded-full bg-gray-400" />
      Desconectado
    </div>
  );
}

export default function WhatsApp() {
  const { token } = useAuth();
  const [tab, setTab] = useState<Tab>("conversations");

  const isConversations = tab === "conversations";

  return (
    <div
      className={cn(
        "flex flex-col",
        isConversations ? "h-[calc(100vh-4rem)]" : "min-h-[calc(100vh-4rem)]"
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">WhatsApp</h1>
          <p className="text-xs text-muted-foreground">Chatbot IA · Conversaciones · Campañas</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
            <Bot className="w-3 h-3" />
            Bot IA
          </div>
          <WaStatusPill />
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto pb-0.5">
        {TAB_GROUPS.map((group, gi) => (
          <div key={group.label} className="flex items-center gap-1">
            {gi > 0 && <div className="w-px h-5 bg-gray-200 mx-1 flex-shrink-0" />}
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 mr-1 whitespace-nowrap hidden sm:block">
              {group.label}
            </span>
            {group.tabs.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all",
                  tab === id
                    ? "bg-gray-900 text-white shadow-sm"
                    : "text-muted-foreground hover:text-gray-800 hover:bg-gray-100"
                )}
              >
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Tab content */}
      <div className={cn("flex-1 min-h-0", !isConversations && "pb-8")}>
        {tab === "conversations" && <ConversationsTab token={token!} />}
        {tab === "analytics" && <AnalyticsTab token={token!} />}
        {tab === "campaigns" && <CampaignsTab token={token!} />}
        {tab === "bots" && <BotsTab token={token!} onNavigate={setTab} />}
        {tab === "flows" && <FlowBuilderTab token={token!} />}
        {tab === "kb" && <KbTab token={token!} />}
        {tab === "guardrails" && <GuardrailsTab token={token!} />}
        {tab === "onboarding" && <OnboardingTab token={token!} />}
        {tab === "settings" && <SettingsTab token={token!} />}
      </div>
    </div>
  );
}
