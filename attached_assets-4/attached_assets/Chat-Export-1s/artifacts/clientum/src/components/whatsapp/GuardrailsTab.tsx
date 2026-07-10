import { useState, useEffect } from "react";
import { Save, Check, X, Plus, Shield, AlertTriangle, MessageSquareOff, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";

interface Props { token: string }

interface Guardrails {
  blockedKeywords: string;
  avoidTopics: string;
  escalateAfterTurns: number;
  escalationMessage: string;
  enableProfanityFilter: boolean;
  enableEscalation: boolean;
}

const API = "/api";
function authHeaders(token: string) {
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

export default function GuardrailsTab({ token }: Props) {
  const [data, setData] = useState<Guardrails | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newTopic, setNewTopic] = useState("");

  const headers = authHeaders(token);

  useEffect(() => {
    fetch(`${API}/whatsapp/guardrails`, { headers })
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  function field<K extends keyof Guardrails>(key: K, val: Guardrails[K]) {
    setData((prev) => prev ? { ...prev, [key]: val } : prev);
  }

  function getKeywords(): string[] {
    return (data?.blockedKeywords ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  }

  function getTopics(): string[] {
    return (data?.avoidTopics ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  }

  function addKeyword() {
    const kw = newKeyword.trim();
    if (!kw || !data) return;
    const existing = getKeywords();
    if (!existing.includes(kw)) {
      field("blockedKeywords", [...existing, kw].join(", "));
    }
    setNewKeyword("");
  }

  function removeKeyword(kw: string) {
    if (!data) return;
    field("blockedKeywords", getKeywords().filter((k) => k !== kw).join(", "));
  }

  function addTopic() {
    const t = newTopic.trim();
    if (!t || !data) return;
    const existing = getTopics();
    if (!existing.includes(t)) {
      field("avoidTopics", [...existing, t].join(", "));
    }
    setNewTopic("");
  }

  function removeTopic(t: string) {
    if (!data) return;
    field("avoidTopics", getTopics().filter((x) => x !== t).join(", "));
  }

  async function save() {
    if (!data) return;
    setSaving(true);
    try {
      const r = await fetch(`${API}/whatsapp/guardrails`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(data),
      });
      if (r.ok) {
        setData(await r.json());
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Cargando...</div>;
  if (!data) return <div className="flex items-center justify-center h-64 text-muted-foreground text-sm">Error al cargar</div>;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-base font-semibold">Seguridad y Guardrails</h2>
        <p className="text-sm text-muted-foreground">Controlá qué puede y qué no puede decir el bot, y cuándo escalar a un agente humano.</p>
      </div>

      {/* Blocked Keywords */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <MessageSquareOff className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <p className="text-sm font-semibold">Palabras Bloqueadas</p>
            <p className="text-xs text-muted-foreground">Si el usuario envía estas palabras, el bot no responde y escala a un agente.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            placeholder="Ej: competencia, reembolso, fraude"
            onKeyDown={(e) => e.key === "Enter" && addKeyword()}
            className="flex-1"
          />
          <Button size="sm" onClick={addKeyword} disabled={!newKeyword.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {getKeywords().length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {getKeywords().map((kw) => (
              <Badge key={kw} variant="secondary" className="flex items-center gap-1 pl-2 pr-1">
                {kw}
                <button onClick={() => removeKeyword(kw)} className="ml-1 rounded hover:bg-gray-200 p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">Sin palabras bloqueadas todavía</p>
        )}
      </div>

      {/* Topics to Avoid */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div>
            <p className="text-sm font-semibold">Temas a Evitar</p>
            <p className="text-xs text-muted-foreground">El bot intentará no responder sobre estos temas y redirigirá al usuario.</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Input
            value={newTopic}
            onChange={(e) => setNewTopic(e.target.value)}
            placeholder="Ej: política, religión, finanzas personales"
            onKeyDown={(e) => e.key === "Enter" && addTopic()}
            className="flex-1"
          />
          <Button size="sm" onClick={addTopic} disabled={!newTopic.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {getTopics().length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {getTopics().map((t) => (
              <Badge key={t} variant="outline" className="flex items-center gap-1 pl-2 pr-1 border-amber-200 text-amber-700">
                {t}
                <button onClick={() => removeTopic(t)} className="ml-1 rounded hover:bg-amber-100 p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">Sin temas restringidos todavía</p>
        )}
      </div>

      {/* Profanity Filter */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-sm font-semibold">Filtros de Seguridad</p>
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <Label className="text-sm">Filtro de lenguaje inapropiado</Label>
            <p className="text-xs text-muted-foreground mt-0.5">El bot evitará generar respuestas con lenguaje ofensivo</p>
          </div>
          <Switch
            checked={data.enableProfanityFilter}
            onCheckedChange={(v) => field("enableProfanityFilter", v)}
          />
        </div>
      </div>

      {/* Escalation */}
      <div className="bg-white rounded-xl border p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
            <ArrowUpRight className="w-4 h-4 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-semibold">Escalación a Agente Humano</p>
            <p className="text-xs text-muted-foreground">Configurá cuándo el bot deriva la conversación a un agente.</p>
          </div>
        </div>

        <div className="flex items-center justify-between py-1">
          <div>
            <Label className="text-sm">Activar escalación automática</Label>
            <p className="text-xs text-muted-foreground mt-0.5">El bot derivará al agente luego de varios turnos sin resolución</p>
          </div>
          <Switch
            checked={data.enableEscalation}
            onCheckedChange={(v) => field("enableEscalation", v)}
          />
        </div>

        {data.enableEscalation && (
          <>
            <div>
              <Label className="text-xs mb-1.5 block">Turnos antes de escalar</Label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={20}
                  value={data.escalateAfterTurns}
                  onChange={(e) => field("escalateAfterTurns", Number(e.target.value))}
                  className="flex-1 accent-blue-500"
                />
                <span className="text-sm font-bold w-8 text-center">{data.escalateAfterTurns}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                El bot escala al agente luego de {data.escalateAfterTurns} mensajes del usuario sin que el problema esté resuelto
              </p>
            </div>

            <div>
              <Label className="text-xs mb-1.5 block">Mensaje de escalación</Label>
              <Textarea
                value={data.escalationMessage}
                onChange={(e) => field("escalationMessage", e.target.value)}
                rows={2}
                className="text-sm"
              />
            </div>
          </>
        )}
      </div>

      <Button onClick={save} disabled={saving} className="w-full sm:w-auto">
        {saved ? (
          <><Check className="w-4 h-4 mr-2" /> Guardado</>
        ) : (
          <><Save className="w-4 h-4 mr-2" /> {saving ? "Guardando..." : "Guardar cambios"}</>
        )}
      </Button>
    </div>
  );
}
