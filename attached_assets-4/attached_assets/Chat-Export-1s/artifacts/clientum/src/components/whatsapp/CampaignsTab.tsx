import { useState, useEffect } from "react";
import {
  Megaphone, Plus, Send, Trash2, Users, Check, X,
  Clock, CheckCircle2, AlertCircle, Loader2, RefreshCw,
  ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const API = "/api";
function authHeaders(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

interface Campaign {
  id: number;
  name: string;
  message: string;
  filter: string;
  status: "draft" | "sending" | "sent" | "failed";
  sentCount: number;
  failedCount: number;
  totalRecipients: number;
  createdAt: string;
  sentAt: string | null;
}

const FILTER_LABELS: Record<string, string> = {
  contacts_with_phone: "Contactos con teléfono",
  has_conversation: "Contactos con conversación previa",
  all: "Todos los contactos",
};

const STATUS_CFG: Record<Campaign["status"], { label: string; icon: React.ReactNode; classes: string }> = {
  draft:   { label: "Borrador",  icon: <Clock className="w-3 h-3" />,        classes: "bg-gray-100 text-gray-600 border-gray-200" },
  sending: { label: "Enviando", icon: <Loader2 className="w-3 h-3 animate-spin" />, classes: "bg-blue-50 text-blue-700 border-blue-200" },
  sent:    { label: "Enviada",  icon: <CheckCircle2 className="w-3 h-3" />,  classes: "bg-green-50 text-green-700 border-green-200" },
  failed:  { label: "Error",    icon: <AlertCircle className="w-3 h-3" />,   classes: "bg-red-50 text-red-700 border-red-200" },
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

interface Props { token: string }

export default function CampaignsTab({ token }: Props) {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [sending, setSending] = useState<number | null>(null);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [previewCount, setPreviewCount] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    message: "",
    filter: "contacts_with_phone",
  });
  const [saving, setSaving] = useState(false);

  const headers = authHeaders(token);

  async function load() {
    try {
      const r = await fetch(`${API}/whatsapp/campaigns`, { headers });
      if (r.ok) setCampaigns(await r.json());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  // Poll sending campaigns every 5s
  useEffect(() => {
    const hasSending = campaigns.some(c => c.status === "sending");
    if (!hasSending) return;
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, [campaigns]);

  // Preview count when filter changes
  useEffect(() => {
    if (!showForm) return;
    setPreviewCount(null);
    fetch(`${API}/whatsapp/campaigns/preview-count?filter=${form.filter}`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(d => d && setPreviewCount(d.count))
      .catch(() => {});
  }, [form.filter, showForm]);

  async function createCampaign() {
    if (!form.name.trim() || !form.message.trim()) return;
    setSaving(true);
    try {
      const r = await fetch(`${API}/whatsapp/campaigns`, {
        method: "POST", headers,
        body: JSON.stringify(form),
      });
      if (r.ok) {
        const c: Campaign = await r.json();
        setCampaigns(prev => [c, ...prev]);
        setForm({ name: "", message: "", filter: "contacts_with_phone" });
        setShowForm(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function sendCampaign(id: number) {
    setSending(id);
    try {
      const r = await fetch(`${API}/whatsapp/campaigns/${id}/send`, { method: "POST", headers });
      if (r.ok) {
        setCampaigns(prev => prev.map(c => c.id === id ? { ...c, status: "sending" } : c));
        setTimeout(load, 3000);
      }
    } finally {
      setSending(null);
    }
  }

  async function deleteCampaign(id: number) {
    setDeleting(id);
    try {
      await fetch(`${API}/whatsapp/campaigns/${id}`, { method: "DELETE", headers });
      setCampaigns(prev => prev.filter(c => c.id !== id));
    } finally {
      setDeleting(null);
    }
  }

  const charCount = form.message.length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">Campañas masivas</h2>
          <p className="text-sm text-muted-foreground">Enviá mensajes a múltiples contactos de WhatsApp</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" onClick={() => { setShowForm(true); setExpandedId(null); }}>
            <Plus className="w-4 h-4 mr-1" /> Nueva campaña
          </Button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-blue-800 flex items-center gap-2">
              <Megaphone className="w-4 h-4" />
              Nueva campaña
            </p>
            <button onClick={() => setShowForm(false)} className="text-blue-400 hover:text-blue-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <div>
              <Label className="text-xs mb-1">Nombre de la campaña</Label>
              <Input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Ej: Promo Black Friday, Recordatorio de pago..."
              />
            </div>

            <div>
              <Label className="text-xs mb-1">Destinatarios</Label>
              <Select value={form.filter} onValueChange={v => setForm(f => ({ ...f, filter: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contacts_with_phone">Contactos con teléfono</SelectItem>
                  <SelectItem value="has_conversation">Solo contactos con conversación previa</SelectItem>
                </SelectContent>
              </Select>
              {previewCount !== null && (
                <p className="text-xs text-blue-700 mt-1 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {previewCount} destinatarios estimados
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <Label className="text-xs">Mensaje</Label>
                <span className={cn("text-[10px]", charCount > 900 ? "text-red-500" : "text-muted-foreground")}>
                  {charCount}/1024
                </span>
              </div>
              <Textarea
                value={form.message}
                onChange={e => setForm(f => ({ ...f, message: e.target.value.slice(0, 1024) }))}
                placeholder="Hola {nombre}, te contactamos desde..."
                rows={5}
                className="text-sm resize-none"
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                Tip: podés usar texto libre. El mensaje se enviará tal cual a cada destinatario.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={createCampaign}
              disabled={saving || !form.name.trim() || !form.message.trim()}
            >
              <Check className="w-4 h-4 mr-1" />
              {saving ? "Guardando..." : "Guardar campaña"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Campaigns list */}
      {loading ? (
        <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
          <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando campañas...
        </div>
      ) : campaigns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground text-sm text-center">
          <Megaphone className="w-12 h-12 mb-4 opacity-20" />
          <p className="font-medium">Sin campañas todavía</p>
          <p className="text-xs mt-1">Creá tu primera campaña para enviar mensajes masivos por WhatsApp.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {campaigns.map(c => {
            const cfg = STATUS_CFG[c.status] ?? STATUS_CFG.draft;
            const isExpanded = expandedId === c.id;

            return (
              <div key={c.id} className="bg-white border rounded-2xl overflow-hidden shadow-sm">
                {/* Row */}
                <button
                  className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : c.id)}
                >
                  {/* Icon */}
                  <div className={cn(
                    "w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0",
                    c.status === "sent" ? "bg-green-100" : c.status === "sending" ? "bg-blue-100" : c.status === "failed" ? "bg-red-100" : "bg-gray-100"
                  )}>
                    <Megaphone className={cn("w-4 h-4", c.status === "sent" ? "text-green-600" : c.status === "sending" ? "text-blue-600" : c.status === "failed" ? "text-red-600" : "text-gray-500")} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                      <span className={cn("flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full border font-medium", cfg.classes)}>
                        {cfg.icon} {cfg.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {FILTER_LABELS[c.filter] ?? c.filter}
                      </span>
                      {c.status === "sent" && (
                        <span className="flex items-center gap-1 text-green-600 font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          {c.sentCount} enviados · {c.failedCount} fallidos
                        </span>
                      )}
                      {c.status === "sending" && (
                        <span className="flex items-center gap-1 text-blue-600">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Enviando a {c.totalRecipients} destinatarios...
                        </span>
                      )}
                      <span>{formatDate(c.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    {c.status === "draft" && (
                      <Button
                        size="sm"
                        className="h-7 text-xs gap-1"
                        onClick={e => { e.stopPropagation(); sendCampaign(c.id); }}
                        disabled={sending === c.id}
                      >
                        {sending === c.id
                          ? <Loader2 className="w-3 h-3 animate-spin" />
                          : <Send className="w-3 h-3" />}
                        {sending === c.id ? "Enviando..." : "Enviar"}
                      </Button>
                    )}
                    {(c.status === "draft" || c.status === "failed") && (
                      <button
                        className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 transition-colors"
                        onClick={e => { e.stopPropagation(); deleteCampaign(c.id); }}
                        disabled={deleting === c.id}
                      >
                        {deleting === c.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="border-t bg-gray-50 px-5 py-4 space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Mensaje enviado</p>
                      <div className="bg-white border rounded-xl px-4 py-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {c.message}
                      </div>
                    </div>
                    {c.status === "sent" && (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-white rounded-xl border p-3 text-center">
                          <p className="text-xs text-muted-foreground">Total destinatarios</p>
                          <p className="text-xl font-bold text-gray-900 mt-1">{c.totalRecipients}</p>
                        </div>
                        <div className="bg-green-50 rounded-xl border border-green-200 p-3 text-center">
                          <p className="text-xs text-green-600">Enviados</p>
                          <p className="text-xl font-bold text-green-700 mt-1">{c.sentCount}</p>
                        </div>
                        <div className="bg-red-50 rounded-xl border border-red-200 p-3 text-center">
                          <p className="text-xs text-red-600">Fallidos</p>
                          <p className="text-xl font-bold text-red-700 mt-1">{c.failedCount}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
