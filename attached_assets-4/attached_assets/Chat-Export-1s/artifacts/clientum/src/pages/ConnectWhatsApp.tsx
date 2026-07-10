import { useState, useEffect, useRef } from "react";
import { CheckCircle2, Loader2, Wifi, QrCode, Zap, Shield, Clock, ChevronRight, AlertTriangle, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type Step = "bienvenida" | "servidor" | "instancia" | "qr" | "listo";

const STEPS: { id: Step; label: string }[] = [
  { id: "bienvenida", label: "Bienvenida" },
  { id: "servidor", label: "Servidor" },
  { id: "instancia", label: "Instancia" },
  { id: "qr", label: "Escanear QR" },
  { id: "listo", label: "¡Listo!" },
];

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center justify-center gap-2 mb-10">
      {STEPS.map((step, i) => (
        <div key={step.id} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all",
              i < idx ? "bg-emerald-500 text-white" :
              i === idx ? "bg-[#1e3a6e] border-2 border-blue-400 text-blue-300" :
              "bg-white/5 border border-white/10 text-white/30"
            )}>
              {i < idx ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
            </div>
            <span className={cn("text-[10px] whitespace-nowrap", i === idx ? "text-blue-300" : "text-white/30")}>{step.label}</span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={cn("w-10 h-[2px] mb-4 rounded", i < idx ? "bg-emerald-500" : "bg-white/10")} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function ConnectWhatsApp() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>("bienvenida");
  const [apiUrl, setApiUrl] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [instance, setInstance] = useState("");
  const [saving, setSaving] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<string>("disconnected");
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  useEffect(() => {
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  async function saveEvolutionConfig() {
    setSaving(true);
    try {
      const res = await fetch("/api/whatsapp/bot-settings", {
        method: "PATCH",
        headers,
        body: JSON.stringify({ evolutionApiUrl: apiUrl.trim(), evolutionApiKey: apiKey.trim(), evolutionInstanceId: instance.trim() }),
      });
      if (!res.ok) throw new Error();
      return true;
    } catch {
      toast({ title: "Error", description: "No se pudo guardar la configuración.", variant: "destructive" });
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function startConnection() {
    setSaving(true);
    try {
      await fetch("/api/whatsapp/session/connect", { method: "POST", headers });
      setStep("qr");
      // Poll for QR
      pollRef.current = setInterval(async () => {
        const r = await fetch("/api/whatsapp/session", { headers: { Authorization: `Bearer ${token}` } });
        const d = await r.json();
        setSessionStatus(d.status);
        if (d.qrDataUrl) setQrDataUrl(d.qrDataUrl);
        if (d.status === "connected") {
          if (pollRef.current) clearInterval(pollRef.current);
          setTimeout(() => setStep("listo"), 800);
        }
      }, 3000);
    } catch {
      toast({ title: "Error al conectar", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  function copyScript() {
    navigator.clipboard.writeText(`bash <(curl -s https://scripts.clientum.ar/instalar-evolution.sh)`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-10 px-4"
      style={{ background: "linear-gradient(180deg, #0D1B35 0%, #0A1628 100%)" }}>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold text-white">Conectar WhatsApp</h1>
          <p className="text-sm text-white/50 mt-1">Vinculá tu número en 5 minutos — QR, instancia y webhook configurados automáticamente</p>
        </div>

        <StepIndicator current={step} />

        {/* BIENVENIDA */}
        {step === "bienvenida" && (
          <div className="text-center space-y-8">
            <div className="w-24 h-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <svg viewBox="0 0 24 24" className="w-12 h-12 fill-emerald-400"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Conectá tu número de WhatsApp</h2>
              <p className="text-white/60 max-w-md mx-auto">En menos de 5 minutos tu número de WhatsApp quedará conectado al agente IA de Clientum. El bot responderá automáticamente a tus clientes — sin código, sin apps extra.</p>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              {[
                { icon: Wifi, label: "Servidor Evolution", sub: "URL + API Key del servidor" },
                { icon: QrCode, label: "Escanear QR", sub: "Con tu celular en 30 seg" },
                { icon: Zap, label: "Bot activo", sub: "Respuestas automáticas" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                  <Icon className="w-6 h-6 text-blue-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-white/40 mt-1">{sub}</p>
                </div>
              ))}
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-left max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-300">Necesitás un servidor Evolution API</p>
                  <p className="text-xs text-amber-300/70 mt-1">Si todavía no tenés uno, instalalo gratis con nuestro script:</p>
                  <button onClick={copyScript} className="flex items-center gap-2 mt-2 bg-black/30 rounded px-3 py-1.5 font-mono text-xs text-emerald-300 hover:bg-black/50 transition-colors">
                    bash scripts-ubuntu/instalar-evolution.sh
                    {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            </div>
            <Button onClick={() => setStep("servidor")} size="lg" className="bg-[#111E36] border border-blue-500/30 text-white hover:bg-blue-900/30 px-12 gap-2">
              Empezar <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* SERVIDOR */}
        {step === "servidor" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
            <div className="text-center">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-lg font-bold text-white">Configurar servidor Evolution API</h2>
              <p className="text-sm text-white/50 mt-1">Ingresá las credenciales de tu servidor Evolution API</p>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/70 text-xs uppercase tracking-wide">URL del servidor</Label>
                <Input value={apiUrl} onChange={e => setApiUrl(e.target.value)} placeholder="https://evolution.miserver.com" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/70 text-xs uppercase tracking-wide">API Key global</Label>
                <Input type="password" value={apiKey} onChange={e => setApiKey(e.target.value)} placeholder="tu-api-key-de-evolution" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
              </div>
            </div>
            <Button disabled={!apiUrl.trim() || !apiKey.trim() || saving} onClick={async () => { if (await saveEvolutionConfig()) setStep("instancia"); }} className="w-full gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Continuar
            </Button>
          </div>
        )}

        {/* INSTANCIA */}
        {step === "instancia" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-bold text-white">Nombre de instancia</h2>
              <p className="text-sm text-white/50 mt-1">Identificador único para tu conexión de WhatsApp</p>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70 text-xs uppercase tracking-wide">Nombre de instancia</Label>
              <Input value={instance} onChange={e => setInstance(e.target.value)} placeholder="mi-empresa-wa" className="bg-white/5 border-white/10 text-white placeholder:text-white/20" />
              <p className="text-xs text-white/30">Solo letras, números y guiones. Ej: ferreteria-norte</p>
            </div>
            <Button disabled={!instance.trim() || saving} onClick={async () => { if (await saveEvolutionConfig()) await startConnection(); }} className="w-full gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Conectar y generar QR
            </Button>
          </div>
        )}

        {/* QR */}
        {step === "qr" && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-6 text-center">
            <h2 className="text-lg font-bold text-white">Escaneá el código QR</h2>
            <p className="text-sm text-white/50">Abrí WhatsApp en tu celular → Dispositivos vinculados → Vincular dispositivo</p>
            <div className="flex items-center justify-center">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="QR Code" className="w-56 h-56 rounded-xl border border-white/20" />
              ) : (
                <div className="w-56 h-56 rounded-xl border border-white/10 bg-white/5 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                  <p className="text-xs text-white/40">Generando QR…</p>
                </div>
              )}
            </div>
            {sessionStatus === "connected" && (
              <div className="flex items-center gap-2 justify-center text-emerald-400">
                <CheckCircle2 className="w-5 h-5" /> <span className="font-semibold">¡Conectado!</span>
              </div>
            )}
            <p className="text-xs text-white/30 flex items-center justify-center gap-1">
              <Clock className="w-3 h-3" /> El QR se actualiza cada 30 segundos
            </p>
          </div>
        )}

        {/* LISTO */}
        {step === "listo" && (
          <div className="text-center space-y-8">
            <div className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-12 h-12 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">¡WhatsApp conectado!</h2>
              <p className="text-white/60">Tu número ya está vinculado al agente IA de Clientum. El bot comenzará a responder automáticamente.</p>
            </div>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
              {[
                { label: "Bot activo", value: "Sí", color: "text-emerald-400" },
                { label: "Modo", value: "Híbrido", color: "text-blue-400" },
                { label: "Instancia", value: instance || "conectada", color: "text-white" },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white/5 border border-white/10 rounded-xl p-3 text-center">
                  <p className={cn("text-sm font-bold", color)}>{value}</p>
                  <p className="text-xs text-white/40 mt-1">{label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-center">
              <a href="/app/agent-config" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-colors">
                Configurar Agente IA
              </a>
              <a href="/app/whatsapp" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white text-sm font-medium transition-colors">
                Ver conversaciones
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
