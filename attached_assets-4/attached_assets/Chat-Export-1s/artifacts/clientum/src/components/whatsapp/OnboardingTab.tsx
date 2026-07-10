import { useState, useEffect, useRef } from "react";
import {
  CheckCircle2,
  Circle,
  Copy,
  RefreshCw,
  Smartphone,
  Wifi,
  WifiOff,
  Loader2,
  ChevronDown,
  ChevronUp,
  KeyRound,
  Zap,
  Bot,
  QrCode,
  ExternalLink,
  Save,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Props {
  token: string;
}

const API = "/api";

function authHeaders(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

type SessionStatus = "disconnected" | "qr_pending" | "connected";

interface SessionData {
  status: SessionStatus;
  qrDataUrl: string | null;
  phone: string | null;
}

function copyToClipboard(text: string, onDone: () => void) {
  navigator.clipboard.writeText(text).then(onDone).catch(() => {});
}

// ----- Direct QR Connection (Baileys) -----

function DirectConnectionSection({ token }: { token: string }) {
  const [session, setSession] = useState<SessionData>({
    status: "disconnected",
    qrDataUrl: null,
    phone: null,
  });
  const [loading, setLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = async () => {
    try {
      const res = await fetch(`${API}/whatsapp/session`, { headers: authHeaders(token) });
      if (res.ok) {
        const data: SessionData = await res.json();
        setSession(data);
        if (data.status === "connected" && pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      }
    } catch {}
  };

  useEffect(() => {
    fetchStatus();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startPolling = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(fetchStatus, 3000);
  };

  const handleConnect = async () => {
    setLoading(true);
    try {
      await fetch(`${API}/whatsapp/session/connect`, { method: "POST", headers: authHeaders(token) });
      startPolling();
      await fetchStatus();
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await fetch(`${API}/whatsapp/session/disconnect`, { method: "DELETE", headers: authHeaders(token) });
      if (pollRef.current) clearInterval(pollRef.current);
      setSession({ status: "disconnected", qrDataUrl: null, phone: null });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">Conexión Directa (QR)</p>
            <p className="text-xs text-muted-foreground">Escaneá el QR desde WhatsApp — sin configuración externa</p>
          </div>
        </div>
        <StatusBadge status={session.status} />
      </div>

      {session.status === "disconnected" && (
        <Button onClick={handleConnect} disabled={loading} className="w-full gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
          {loading ? "Iniciando…" : "Generar código QR"}
        </Button>
      )}

      {session.status === "qr_pending" && (
        <div className="space-y-3">
          {session.qrDataUrl ? (
            <div className="flex flex-col items-center gap-3">
              <img src={session.qrDataUrl} alt="QR" className="w-52 h-52 rounded-xl border shadow-sm" />
              <div className="text-center space-y-1">
                <p className="text-sm font-medium">Escaneá este código desde WhatsApp</p>
                <p className="text-xs text-muted-foreground">
                  Abrí WhatsApp → Dispositivos vinculados → Vincular dispositivo
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Esperando escaneo…
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-6">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Generando código QR…</p>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={handleDisconnect} disabled={loading}
            className="w-full text-muted-foreground text-xs">
            Cancelar
          </Button>
        </div>
      )}

      {session.status === "connected" && (
        <div className="space-y-3">
          <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg p-3">
            <Wifi className="w-5 h-5 text-green-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-green-800">¡WhatsApp conectado!</p>
              {session.phone && <p className="text-xs text-green-600 font-mono">+{session.phone}</p>}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleDisconnect} disabled={loading}
            className="w-full text-red-600 border-red-200 hover:bg-red-50 gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <WifiOff className="w-4 h-4" />}
            Desconectar
          </Button>
        </div>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: SessionStatus }) {
  if (status === "connected") return <Badge className="bg-green-100 text-green-700 border-green-200">Conectado</Badge>;
  if (status === "qr_pending") return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Esperando QR</Badge>;
  return <Badge variant="outline" className="text-muted-foreground">Desconectado</Badge>;
}

// ----- Whatomate Section -----

interface WhatomateSettings {
  whatomateUrl: string | null;
  whatomateToken: string | null;
}

function WhatomateSection({ token }: { token: string }) {
  const [open, setOpen] = useState(false);
  const [settings, setSettings] = useState<WhatomateSettings>({ whatomateUrl: null, whatomateToken: null });
  const [urlInput, setUrlInput] = useState("");
  const [tokenInput, setTokenInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [webhookSecret, setWebhookSecret] = useState<string>("");
  const [loadingSecret, setLoadingSecret] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [loaded, setLoaded] = useState(false);

  const webhookUrl = `${window.location.origin}/api/webhooks/whatsapp/whatomate`;

  async function loadSettings() {
    if (loaded) return;
    try {
      const res = await fetch(`${API}/whatsapp/bot-settings`, { headers: authHeaders(token) });
      if (res.ok) {
        const data: WhatomateSettings & Record<string, unknown> = await res.json();
        setSettings({ whatomateUrl: data.whatomateUrl, whatomateToken: data.whatomateToken });
        setUrlInput(data.whatomateUrl ?? "");
        setLoaded(true);
        if (data.whatomateUrl) setCompletedSteps(new Set([1, 2, 3]));
      }
    } catch {}
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`${API}/whatsapp/bot-settings`, {
        method: "PATCH",
        headers: authHeaders(token),
        body: JSON.stringify({
          whatomateUrl: urlInput.trim() || null,
          whatomateToken: tokenInput.trim() || null,
        }),
      });
      if (res.ok) {
        const data: WhatomateSettings = await res.json();
        setSettings(data);
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
        markDone(3);
      }
    } finally {
      setSaving(false);
    }
  }

  async function generateSecret() {
    setLoadingSecret(true);
    try {
      const res = await fetch(`${API}/settings/tenant/webhook-secret`, {
        method: "POST", headers: authHeaders(token),
      });
      if (res.ok) {
        const data: { webhookSecret: string } = await res.json();
        setWebhookSecret(data.webhookSecret);
        markDone(2);
      }
    } finally {
      setLoadingSecret(false);
    }
  }

  function markDone(step: number) {
    setCompletedSteps((prev) => new Set([...prev, step]));
  }

  return (
    <div className="border rounded-xl overflow-hidden">
      <button
        onClick={() => { setOpen((v) => !v); if (!open) loadSettings(); }}
        className="w-full flex items-center justify-between px-5 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
            <Zap className="w-4 h-4 text-green-700" />
          </div>
          <div>
            <p className="text-sm font-medium flex items-center gap-2">
              Vía Whatomate
              {settings.whatomateUrl && (
                <Badge className="bg-green-100 text-green-700 border-green-200 text-[10px]">Configurado</Badge>
              )}
            </p>
            <p className="text-xs text-muted-foreground">Conectá tu instancia self-hosted de Whatomate</p>
          </div>
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="px-5 pb-5 pt-1 space-y-4 border-t bg-gray-50/50">

          {/* Step 1 — Webhook URL */}
          <div className={cn("bg-white border rounded-xl p-4 space-y-3", completedSteps.has(1) && "border-green-200")}>
            <div className="flex items-center gap-2">
              {completedSteps.has(1) ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
              <p className="text-sm font-medium">Paso 1 — URL del Webhook en Whatomate</p>
            </div>
            <p className="text-xs text-muted-foreground">Configurá esta URL como webhook en tu instancia de Whatomate.</p>
            <div className="flex gap-2">
              <Input readOnly value={webhookUrl} className="text-xs font-mono bg-gray-50 flex-1" />
              <Button size="sm" variant="outline" onClick={() => copyToClipboard(webhookUrl, () => {
                setCopiedWebhook(true); markDone(1); setTimeout(() => setCopiedWebhook(false), 2000);
              })}>
                {copiedWebhook ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Step 2 — Verify Token */}
          <div className={cn("bg-white border rounded-xl p-4 space-y-3", completedSteps.has(2) && "border-green-200")}>
            <div className="flex items-center gap-2">
              {completedSteps.has(2) ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
              <p className="text-sm font-medium">Paso 2 — Verify Token (para verificación de Whatomate)</p>
            </div>
            <p className="text-xs text-muted-foreground">Generá un token y pegalo como "Verify Token" en Whatomate al configurar el webhook.</p>
            <div className="flex gap-2">
              <Input readOnly value={webhookSecret || "Todavía no generaste el token"} className="text-xs font-mono bg-gray-50 flex-1" />
              {webhookSecret && (
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(webhookSecret, () => {
                  setCopiedToken(true); setTimeout(() => setCopiedToken(false), 2000);
                })}>
                  {copiedToken ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                </Button>
              )}
              <Button size="sm" onClick={generateSecret} disabled={loadingSecret}>
                <RefreshCw className={cn("w-4 h-4 mr-1", loadingSecret && "animate-spin")} />
                {webhookSecret ? "Regenerar" : "Generar"}
              </Button>
            </div>
          </div>

          {/* Step 3 — Whatomate URL */}
          <div className={cn("bg-white border rounded-xl p-4 space-y-3", completedSteps.has(3) && "border-green-200")}>
            <div className="flex items-center gap-2">
              {completedSteps.has(3) ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Circle className="w-4 h-4 text-muted-foreground" />}
              <p className="text-sm font-medium">Paso 3 — URL de tu instancia Whatomate</p>
            </div>
            <form onSubmit={saveSettings} className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">URL de Whatomate</Label>
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://tu-whatomate.com"
                  className="text-sm font-mono"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">API Token (opcional — para envío de mensajes)</Label>
                <Input
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Token de acceso de Whatomate"
                  type="password"
                  className="text-sm font-mono"
                />
              </div>
              <Button type="submit" size="sm" disabled={saving || !urlInput.trim()} className="gap-2">
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : saved ? <CheckCircle2 className="w-3 h-3" /> : <Save className="w-3 h-3" />}
                {saved ? "Guardado" : "Guardar"}
              </Button>
            </form>
          </div>

          {/* Docs link */}
          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 space-y-2">
            <p className="font-semibold">¿Qué es Whatomate?</p>
            <p className="text-blue-700">
              Whatomate es una plataforma open-source auto-hospedada que conecta con la API Cloud oficial de WhatsApp (Meta).
              Necesitás un número de WhatsApp Business verificado por Meta.
            </p>
            <a
              href="https://github.com/shridarpatil/whatomate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 underline font-medium text-blue-700 hover:text-blue-900"
            >
              Ver documentación en GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {completedSteps.size >= 3 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0" />
              <p className="text-sm text-green-800 font-medium">¡Whatomate configurado! Los mensajes entrantes llegarán a Clientum.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ----- Main export -----

export default function OnboardingTab({ token }: Props) {
  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-base font-semibold">Conectar WhatsApp</h2>
        <p className="text-sm text-muted-foreground">
          Elegí cómo conectar tu número de WhatsApp al chatbot IA.
        </p>
      </div>

      {/* Recommended: Direct Baileys connection */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Recomendado — Sin configuración externa</p>
        </div>
        <DirectConnectionSection token={token} />
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">o</span>
        </div>
      </div>

      {/* Alternative: Whatomate */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-muted-foreground" />
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Alternativa — Whatomate (API Cloud de Meta)</p>
        </div>
        <WhatomateSection token={token} />
      </div>
    </div>
  );
}
