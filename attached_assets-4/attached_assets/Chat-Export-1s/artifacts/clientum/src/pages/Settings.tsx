import { useState, useEffect } from "react";
import { Building2, User, Shield, Save, Loader2, CheckCircle2, FileText, Webhook, Copy, RefreshCw, ExternalLink, Users, Bot, Eye, EyeOff, Trash2, ShoppingCart, Link2, Link2Off, RotateCw, Zap, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface TenantData {
  id: number;
  name: string;
  slug: string;
  plan: string;
  cuit?: string;
  razonSocial?: string;
  condicionIva?: string;
  puntoVenta?: number;
  ingresosBrutos?: string;
  domicilioFiscal?: string;
  inicioActividades?: string;
  emailContacto?: string;
  telefono?: string;
  sitioWeb?: string;
}

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

const CONDICIONES_IVA = [
  "Responsable Inscripto",
  "Responsable No Inscripto",
  "Exento",
  "Consumidor Final",
  "Monotributo",
  "No Responsable",
  "Sujeto No Categorizado",
];

const PLAN_LABELS: Record<string, string> = {
  starter: "Starter",
  pro: "Pro",
  business: "Business",
};

const PLAN_COLORS: Record<string, string> = {
  starter: "bg-gray-100 text-gray-700",
  pro: "bg-blue-100 text-blue-700",
  business: "bg-purple-100 text-purple-700",
};

function Field({ label, sublabel, children }: { label: string; sublabel?: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-4 items-start py-4 border-b last:border-0">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {sublabel && <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>}
      </div>
      <div className="col-span-2">{children}</div>
    </div>
  );
}

export default function Settings() {
  const { user: authUser, tenant: authTenant, token, login } = useAuth();
  const { toast } = useToast();

  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingTenant, setSavingTenant] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [saved, setSaved] = useState<"tenant" | "profile" | null>(null);

  // WhatsApp webhook
  const [webhookSecret, setWebhookSecret] = useState<string | null>(null);
  const [webhookLoading, setWebhookLoading] = useState(false);
  const [webhookRotating, setWebhookRotating] = useState(false);
  const [copied, setCopied] = useState(false);

  // AI / OpenRouter
  const [aiKeyInput, setAiKeyInput] = useState("");
  const [aiKeyPreview, setAiKeyPreview] = useState<string | null>(null);
  const [hasAiKey, setHasAiKey] = useState(false);
  const [aiKeyVisible, setAiKeyVisible] = useState(false);
  const [savingAi, setSavingAi] = useState(false);
  const [aiLoaded, setAiLoaded] = useState(false);

  // WooCommerce
  const [wcLoaded, setWcLoaded] = useState(false);
  const [wcConnected, setWcConnected] = useState(false);
  const [wcStoreUrl, setWcStoreUrl] = useState<string | null>(null);
  const [wcSyncedAt, setWcSyncedAt] = useState<string | null>(null);
  const [wcProductCount, setWcProductCount] = useState(0);
  const [wcForm, setWcForm] = useState({ storeUrl: "", consumerKey: "", consumerSecret: "" });
  const [wcConnecting, setWcConnecting] = useState(false);
  const [wcSyncing, setWcSyncing] = useState(false);
  const [wcDisconnecting, setWcDisconnecting] = useState(false);

  // WhatsApp Chatbot / Gateway
  const [botLoaded, setBotLoaded] = useState(false);
  const [botEnabled, setBotEnabled] = useState(true);
  const [botMode, setBotMode] = useState("hybrid");
  const [botPersona, setBotPersona] = useState("");
  const [whatomateUrl, setWhatomateUrl] = useState("");
  const [whatomateToken, setWhatomateToken] = useState("");
  const [savingBot, setSavingBot] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Error al cargar");
        const data = await res.json();
        setTenant(data.tenant);
        setUser(data.user);
      } catch {
        toast({ title: "Error", description: "No se pudo cargar la configuración.", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  async function loadAiSettings() {
    if (aiLoaded) return;
    try {
      const res = await fetch("/api/settings/ai", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setHasAiKey(data.hasApiKey);
      setAiKeyPreview(data.apiKeyPreview);
      setAiLoaded(true);
    } catch {
      toast({ title: "Error", description: "No se pudo cargar la configuración de IA.", variant: "destructive" });
    }
  }

  async function saveAiKey(e: React.FormEvent) {
    e.preventDefault();
    if (!aiKeyInput.trim()) return;
    setSavingAi(true);
    try {
      const res = await fetch("/api/settings/ai", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ openrouterApiKey: aiKeyInput.trim() }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setHasAiKey(data.hasApiKey);
      setAiKeyPreview(data.apiKeyPreview);
      setAiKeyInput("");
      toast({ title: "API Key guardada", description: "El Asistente IA ya está listo para usar." });
    } catch {
      toast({ title: "Error", description: "No se pudo guardar la API key.", variant: "destructive" });
    } finally {
      setSavingAi(false);
    }
  }

  async function removeAiKey() {
    setSavingAi(true);
    try {
      const res = await fetch("/api/settings/ai", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ openrouterApiKey: null }),
      });
      if (!res.ok) throw new Error();
      setHasAiKey(false);
      setAiKeyPreview(null);
      setAiKeyInput("");
      toast({ title: "API Key eliminada" });
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar la API key.", variant: "destructive" });
    } finally {
      setSavingAi(false);
    }
  }

  async function loadIntegraciones() {
    // WooCommerce
    if (!wcLoaded) {
      try {
        const res = await fetch("/api/integrations/woocommerce/status", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setWcConnected(data.connected);
          setWcStoreUrl(data.storeUrl);
          setWcSyncedAt(data.syncedAt);
          setWcProductCount(data.productCount);
        } else {
          toast({ title: "Error", description: "No se pudo cargar el estado de WooCommerce.", variant: "destructive" });
        }
      } catch {
        toast({ title: "Error de conexión", description: "No se pudo cargar WooCommerce.", variant: "destructive" });
      } finally {
        setWcLoaded(true);
      }
    }
    // WhatsApp bot settings
    if (!botLoaded) {
      try {
        const res = await fetch("/api/whatsapp/bot-settings", { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const data = await res.json();
          setBotEnabled(data.chatbotEnabled ?? true);
          setBotMode(data.chatbotMode ?? "hybrid");
          setBotPersona(data.chatbotPersona ?? "");
          setWhatomateUrl(data.whatomateUrl ?? "");
          setWhatomateToken(data.whatomateToken ?? "");
        } else {
          toast({ title: "Error", description: "No se pudo cargar la configuración del chatbot.", variant: "destructive" });
        }
      } catch {
        toast({ title: "Error de conexión", description: "No se pudo cargar el chatbot.", variant: "destructive" });
      } finally {
        setBotLoaded(true);
      }
    }
    if (!webhookSecret) loadWebhookSecret();
  }

  async function connectWoo(e: React.FormEvent) {
    e.preventDefault();
    setWcConnecting(true);
    try {
      const res = await fetch("/api/integrations/woocommerce/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ storeUrl: wcForm.storeUrl, consumerKey: wcForm.consumerKey, consumerSecret: wcForm.consumerSecret }),
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: "Error", description: data.error ?? "No se pudo conectar.", variant: "destructive" }); return; }
      setWcConnected(true);
      setWcStoreUrl(wcForm.storeUrl);
      setWcForm({ storeUrl: "", consumerKey: "", consumerSecret: "" });
      toast({ title: "WooCommerce conectado", description: "La tienda está conectada. Hacé Sync para importar productos." });
    } catch { toast({ title: "Error de conexión", variant: "destructive" }); }
    finally { setWcConnecting(false); }
  }

  async function syncWoo() {
    setWcSyncing(true);
    try {
      const res = await fetch("/api/integrations/woocommerce/sync", {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) { toast({ title: "Error al sincronizar", description: data.error, variant: "destructive" }); return; }
      setWcSyncedAt(new Date().toISOString());
      setWcProductCount(data.synced ?? wcProductCount);
      toast({ title: "Sincronización completa", description: `${data.synced ?? ""} productos importados.` });
    } catch { toast({ title: "Error al sincronizar", variant: "destructive" }); }
    finally { setWcSyncing(false); }
  }

  async function disconnectWoo() {
    if (!confirm("¿Desconectar WooCommerce? Se eliminarán los productos sincronizados.")) return;
    setWcDisconnecting(true);
    try {
      const res = await fetch("/api/integrations/woocommerce/disconnect", { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) { const d = await res.json().catch(() => ({})); toast({ title: "Error al desconectar", description: d.error, variant: "destructive" }); return; }
      setWcConnected(false); setWcStoreUrl(null); setWcSyncedAt(null); setWcProductCount(0);
      toast({ title: "WooCommerce desconectado" });
    } catch { toast({ title: "Error al desconectar", variant: "destructive" }); }
    finally { setWcDisconnecting(false); }
  }

  async function saveBotSettings(e: React.FormEvent) {
    e.preventDefault();
    setSavingBot(true);
    try {
      const res = await fetch("/api/whatsapp/bot-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ chatbotEnabled: botEnabled, chatbotMode: botMode, chatbotPersona: botPersona || null, whatomateUrl: whatomateUrl || null, whatomateToken: whatomateToken || null }),
      });
      if (!res.ok) throw new Error();
      toast({ title: "Configuración guardada", description: "Los ajustes del chatbot se actualizaron." });
    } catch { toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" }); }
    finally { setSavingBot(false); }
  }

  async function loadWebhookSecret() {
    setWebhookLoading(true);
    try {
      const res = await fetch("/api/settings/webhook", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setWebhookSecret(data.secret);
    } catch {
      toast({ title: "Error", description: "No se pudo cargar el webhook.", variant: "destructive" });
    } finally {
      setWebhookLoading(false);
    }
  }

  async function rotateWebhookSecret() {
    setWebhookRotating(true);
    try {
      const res = await fetch("/api/settings/webhook/rotate", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setWebhookSecret(data.secret);
      toast({ title: "Secret regenerado", description: "Actualizá la URL en Evolution API." });
    } catch {
      toast({ title: "Error", description: "No se pudo regenerar.", variant: "destructive" });
    } finally {
      setWebhookRotating(false);
    }
  }

  function copyWebhookUrl() {
    if (!webhookSecret) return;
    const url = `${window.location.origin}/api/webhooks/whatsapp/evolution?secret=${webhookSecret}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function saveTenant(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!tenant) return;
    setSavingTenant(true);
    try {
      const res = await fetch("/api/settings/tenant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: tenant.name,
          cuit: tenant.cuit,
          razonSocial: tenant.razonSocial,
          condicionIva: tenant.condicionIva,
          puntoVenta: tenant.puntoVenta ? Number(tenant.puntoVenta) : undefined,
          ingresosBrutos: tenant.ingresosBrutos,
          domicilioFiscal: tenant.domicilioFiscal,
          inicioActividades: tenant.inicioActividades,
          emailContacto: tenant.emailContacto,
          telefono: tenant.telefono,
          sitioWeb: tenant.sitioWeb,
        }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      const updated = await res.json();
      setTenant(updated);
      setSaved("tenant");
      setTimeout(() => setSaved(null), 3000);
      toast({ title: "Guardado", description: "Configuración actualizada correctamente." });
    } catch {
      toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" });
    } finally {
      setSavingTenant(false);
    }
  }

  async function saveProfile(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!user) return;
    setSavingProfile(true);
    try {
      const res = await fetch("/api/settings/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: user.name, email: user.email }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      const updated = await res.json();
      setUser(updated);
      setSaved("profile");
      setTimeout(() => setSaved(null), 3000);
      toast({ title: "Perfil actualizado", description: "Tus datos personales fueron guardados." });
    } catch {
      toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-sm text-muted-foreground mt-1">Administrá tu cuenta, empresa y datos fiscales</p>
      </div>

      <Tabs defaultValue="empresa">
        <TabsList className="mb-6 flex-wrap h-auto gap-1">
          <TabsTrigger value="empresa" className="gap-2">
            <Building2 className="w-4 h-4" /> Empresa
          </TabsTrigger>
          <TabsTrigger value="afip" className="gap-2">
            <FileText className="w-4 h-4" /> AFIP / Fiscal
          </TabsTrigger>
          <TabsTrigger value="perfil" className="gap-2">
            <User className="w-4 h-4" /> Mi perfil
          </TabsTrigger>
          <TabsTrigger value="integraciones" className="gap-2" onClick={loadIntegraciones}>
            <Webhook className="w-4 h-4" /> Integraciones
          </TabsTrigger>
          <TabsTrigger value="ia" className="gap-2" onClick={loadAiSettings}>
            <Bot className="w-4 h-4" /> Asistente IA
          </TabsTrigger>
          <TabsTrigger value="plan" className="gap-2">
            <Shield className="w-4 h-4" /> Plan
          </TabsTrigger>
        </TabsList>

        {/* EMPRESA */}
        <TabsContent value="empresa">
          <Card>
            <CardHeader>
              <CardTitle>Datos de la empresa</CardTitle>
              <CardDescription>Información general de tu organización en Clientum</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveTenant}>
                <Field label="Nombre de la empresa" sublabel="Aparece en documentos y en el sistema">
                  <Input
                    value={tenant?.name ?? ""}
                    onChange={(e) => setTenant((t) => t ? { ...t, name: e.target.value } : t)}
                    placeholder="Mi Empresa S.A."
                  />
                </Field>
                <Field label="Email de contacto" sublabel="Email para comunicaciones">
                  <Input
                    type="email"
                    value={tenant?.emailContacto ?? ""}
                    onChange={(e) => setTenant((t) => t ? { ...t, emailContacto: e.target.value } : t)}
                    placeholder="contacto@miempresa.com"
                  />
                </Field>
                <Field label="Teléfono">
                  <Input
                    value={tenant?.telefono ?? ""}
                    onChange={(e) => setTenant((t) => t ? { ...t, telefono: e.target.value } : t)}
                    placeholder="+54 11 4123 4567"
                  />
                </Field>
                <Field label="Sitio web">
                  <Input
                    value={tenant?.sitioWeb ?? ""}
                    onChange={(e) => setTenant((t) => t ? { ...t, sitioWeb: e.target.value } : t)}
                    placeholder="https://miempresa.com.ar"
                  />
                </Field>
                <Field label="Domicilio fiscal" sublabel="Dirección legal de la empresa">
                  <Input
                    value={tenant?.domicilioFiscal ?? ""}
                    onChange={(e) => setTenant((t) => t ? { ...t, domicilioFiscal: e.target.value } : t)}
                    placeholder="Av. Corrientes 1234, CABA"
                  />
                </Field>

                <div className="flex justify-end mt-6">
                  <Button type="submit" disabled={savingTenant} className="gap-2">
                    {savingTenant ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saved === "tenant" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saved === "tenant" ? "Guardado" : "Guardar cambios"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AFIP */}
        <TabsContent value="afip">
          <Card>
            <CardHeader>
              <CardTitle>Datos fiscales AFIP</CardTitle>
              <CardDescription>
                Estos datos se imprimen en facturas y comprobantes. Asegurate de que coincidan con tu inscripción en AFIP.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveTenant}>
                <Field label="CUIT" sublabel="Sin guiones (p.ej. 20123456789)">
                  <Input
                    value={tenant?.cuit ?? ""}
                    onChange={(e) => setTenant((t) => t ? { ...t, cuit: e.target.value } : t)}
                    placeholder="20-12345678-9"
                    maxLength={13}
                  />
                </Field>
                <Field label="Razón social" sublabel="Nombre legal ante AFIP">
                  <Input
                    value={tenant?.razonSocial ?? ""}
                    onChange={(e) => setTenant((t) => t ? { ...t, razonSocial: e.target.value } : t)}
                    placeholder="MI EMPRESA S.A."
                  />
                </Field>
                <Field label="Condición frente al IVA">
                  <Select
                    value={tenant?.condicionIva ?? ""}
                    onValueChange={(v) => setTenant((t) => t ? { ...t, condicionIva: v } : t)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccioná tu condición" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONDICIONES_IVA.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Punto de venta" sublabel="Número habilitado en AFIP (p.ej. 1)">
                  <Input
                    type="number"
                    min={1}
                    max={9999}
                    value={tenant?.puntoVenta ?? ""}
                    onChange={(e) => setTenant((t) => t ? { ...t, puntoVenta: Number(e.target.value) } : t)}
                    placeholder="1"
                    className="max-w-[120px]"
                  />
                </Field>
                <Field label="Ingresos Brutos" sublabel="Número de inscripción provincial">
                  <Input
                    value={tenant?.ingresosBrutos ?? ""}
                    onChange={(e) => setTenant((t) => t ? { ...t, ingresosBrutos: e.target.value } : t)}
                    placeholder="901-123456-7"
                  />
                </Field>
                <Field label="Inicio de actividades" sublabel="Fecha según AFIP (DD/MM/AAAA)">
                  <Input
                    value={tenant?.inicioActividades ?? ""}
                    onChange={(e) => setTenant((t) => t ? { ...t, inicioActividades: e.target.value } : t)}
                    placeholder="01/01/2020"
                    maxLength={10}
                  />
                </Field>

                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                  <strong>Próximamente:</strong> conexión directa con AFIP para emitir facturas electrónicas desde Clientum con un clic.
                </div>

                <div className="flex justify-end mt-6">
                  <Button type="submit" disabled={savingTenant} className="gap-2">
                    {savingTenant ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saved === "tenant" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saved === "tenant" ? "Guardado" : "Guardar datos fiscales"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PERFIL */}
        <TabsContent value="perfil">
          <Card>
            <CardHeader>
              <CardTitle>Mi perfil</CardTitle>
              <CardDescription>Tus datos personales en Clientum</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={saveProfile}>
                <Field label="Nombre completo">
                  <Input
                    value={user?.name ?? ""}
                    onChange={(e) => setUser((u) => u ? { ...u, name: e.target.value } : u)}
                    placeholder="Juan García"
                    required
                  />
                </Field>
                <Field label="Email" sublabel="Se usa para iniciar sesión">
                  <Input
                    type="email"
                    value={user?.email ?? ""}
                    onChange={(e) => setUser((u) => u ? { ...u, email: e.target.value } : u)}
                    placeholder="juan@empresa.com"
                    required
                  />
                </Field>
                <Field label="Rol">
                  <div className="flex items-center gap-2 h-9">
                    <Badge variant="secondary" className="capitalize">{user?.role ?? "user"}</Badge>
                    <span className="text-xs text-muted-foreground">Los roles se asignan por el administrador</span>
                  </div>
                </Field>

                <div className="flex justify-end mt-6">
                  <Button type="submit" disabled={savingProfile} className="gap-2">
                    {savingProfile ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saved === "profile" ? (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saved === "profile" ? "Guardado" : "Guardar perfil"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* INTEGRACIONES */}
        <TabsContent value="integraciones" className="space-y-6">
          {/* WhatsApp / Evolution API */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="w-5 h-5" /> WhatsApp — Evolution API
              </CardTitle>
              <CardDescription>
                Configurá el webhook en Evolution API para que los mensajes entrantes creen deals automáticamente en Clientum.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {webhookLoading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Cargando configuración…
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>URL del Webhook</Label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        value={webhookSecret ? `${window.location.origin}/api/webhooks/whatsapp/evolution?secret=${webhookSecret}` : "—"}
                        className="font-mono text-xs bg-gray-50"
                      />
                      <Button variant="outline" size="icon" onClick={copyWebhookUrl} disabled={!webhookSecret} title="Copiar URL">
                        {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Pegá esta URL en la configuración de Webhook de tu instancia en Evolution API.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={rotateWebhookSecret}
                      disabled={webhookRotating}
                      className="gap-2"
                    >
                      {webhookRotating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Regenerar secret
                    </Button>
                    <a
                      href="https://doc.evolution-api.com/v2/pt/webhook/webhook"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" /> Documentación Evolution API
                    </a>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 space-y-1">
                    <p className="font-semibold">¿Cómo funciona?</p>
                    <ol className="list-decimal list-inside space-y-1 text-blue-700">
                      <li>Un cliente te escribe por WhatsApp</li>
                      <li>Evolution API envía el mensaje a la URL de arriba</li>
                      <li>Clientum busca o crea el contacto por número de teléfono</li>
                      <li>Se crea un Deal automáticamente en el Kanban con el mensaje como nota</li>
                    </ol>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* WooCommerce */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" /> WooCommerce
              </CardTitle>
              <CardDescription>
                Conectá tu tienda de WordPress/WooCommerce para importar el catálogo de productos y sincronizarlo con Pedidos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {!wcLoaded ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
                </div>
              ) : wcConnected ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="text-sm font-medium text-green-800">Tienda conectada</p>
                      <p className="text-xs text-green-700 font-mono truncate">{wcStoreUrl}</p>
                      <p className="text-xs text-green-600">
                        {wcProductCount} productos · {wcSyncedAt ? `Último sync: ${new Date(wcSyncedAt).toLocaleString("es-AR")}` : "Sin sincronizar aún"}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={syncWoo} disabled={wcSyncing} className="gap-2">
                      {wcSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCw className="w-4 h-4" />}
                      Sincronizar productos
                    </Button>
                    <Button variant="ghost" size="sm" onClick={disconnectWoo} disabled={wcDisconnecting} className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50">
                      {wcDisconnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2Off className="w-4 h-4" />}
                      Desconectar
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={connectWoo} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="wc-url">URL de la tienda</Label>
                    <Input id="wc-url" placeholder="https://mitienda.com" value={wcForm.storeUrl}
                      onChange={(e) => setWcForm((f) => ({ ...f, storeUrl: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wc-key">Consumer Key</Label>
                    <Input id="wc-key" placeholder="ck_xxxxxxxxxxxxxxxx" value={wcForm.consumerKey}
                      onChange={(e) => setWcForm((f) => ({ ...f, consumerKey: e.target.value }))} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wc-secret">Consumer Secret</Label>
                    <Input id="wc-secret" type="password" placeholder="cs_xxxxxxxxxxxxxxxx" value={wcForm.consumerSecret}
                      onChange={(e) => setWcForm((f) => ({ ...f, consumerSecret: e.target.value }))} required />
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-800">
                    Encontrás las keys en <strong>WooCommerce → Ajustes → Avanzado → REST API</strong>. Necesitás permisos de <em>Lectura/Escritura</em>.
                  </div>
                  <Button type="submit" disabled={wcConnecting} className="gap-2">
                    {wcConnecting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                    Conectar tienda
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* WhatsApp Chatbot */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" /> Chatbot WhatsApp
              </CardTitle>
              <CardDescription>
                Configurá el comportamiento del bot y las credenciales del gateway (Whatomate o Evolution API).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!botLoaded ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" /> Cargando…
                </div>
              ) : (
                <form onSubmit={saveBotSettings} className="space-y-5">
                  {/* Bot enabled toggle */}
                  <Field label="Chatbot activo" sublabel="Activa o desactiva el bot para todos los contactos">
                    <div className="flex items-center gap-3 h-9">
                      <input type="checkbox" id="bot-enabled" checked={botEnabled}
                        onChange={(e) => setBotEnabled(e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-primary cursor-pointer" />
                      <label htmlFor="bot-enabled" className="text-sm text-muted-foreground cursor-pointer select-none">
                        {botEnabled ? "Bot habilitado" : "Bot deshabilitado"}
                      </label>
                    </div>
                  </Field>

                  {/* Mode */}
                  <Field label="Modo de operación" sublabel="Cómo interviene el bot en las conversaciones">
                    <select value={botMode} onChange={(e) => setBotMode(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring">
                      <option value="full_auto">Automático total — el bot responde siempre</option>
                      <option value="hybrid">Híbrido — bot responde, vos podés tomar el control</option>
                      <option value="supervised">Supervisado — el bot sugiere, vos enviás</option>
                    </select>
                  </Field>

                  {/* Persona */}
                  <Field label="Personalidad del bot" sublabel="Instrucciones de comportamiento y tono">
                    <textarea value={botPersona} onChange={(e) => setBotPersona(e.target.value)}
                      rows={3} placeholder="Ej: Respondé de forma amable y concisa. Siempre saludá por el nombre del cliente."
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring resize-none" />
                  </Field>

                  <div className="pt-2 border-t">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5" /> Gateway — Whatomate
                    </p>
                    <div className="space-y-3">
                      <Field label="URL del servidor" sublabel="Endpoint de tu instancia Whatomate">
                        <Input placeholder="https://api.whatomate.com/..." value={whatomateUrl}
                          onChange={(e) => setWhatomateUrl(e.target.value)} />
                      </Field>
                      <Field label="Token" sublabel="API token de Whatomate">
                        <Input type="password" placeholder="wm_..." value={whatomateToken}
                          onChange={(e) => setWhatomateToken(e.target.value)} />
                      </Field>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button type="submit" disabled={savingBot} className="gap-2">
                      {savingBot ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Guardar configuración
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Portal de Clientes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" /> Portal de Clientes
              </CardTitle>
              <CardDescription>
                Tus clientes pueden acceder a <strong>/portal</strong> para ver sus facturas y proyectos. Activá el acceso desde el perfil de cada contacto.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-green-50 border border-green-100 rounded-xl text-xs text-green-800 space-y-1">
                <p className="font-semibold">¿Cómo activar acceso a un cliente?</p>
                <ol className="list-decimal list-inside space-y-1 text-green-700">
                  <li>Abrí el perfil del contacto desde la sección Contactos</li>
                  <li>Hacé clic en "Acceso al Portal" y asignale una contraseña</li>
                  <li>Compartí con tu cliente la URL: <span className="font-mono">{window.location.origin}/portal</span></li>
                  <li>El cliente ingresa con su email y la contraseña que vos definiste</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ASISTENTE IA */}
        <TabsContent value="ia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" /> Asistente IA — OpenRouter
              </CardTitle>
              <CardDescription>
                Conectá tu API key de OpenRouter para activar el Asistente IA. Cada empresa usa su propia key.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {hasAiKey ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-green-800">API Key configurada</p>
                      <p className="text-xs text-green-700 font-mono">{aiKeyPreview}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={removeAiKey}
                      disabled={savingAi}
                      className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                    >
                      {savingAi ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                      Eliminar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Para cambiar la key, eliminá la actual y agregá una nueva.
                  </p>
                </div>
              ) : (
                <form onSubmit={saveAiKey} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="openrouter-key">API Key de OpenRouter</Label>
                    <div className="relative">
                      <Input
                        id="openrouter-key"
                        type={aiKeyVisible ? "text" : "password"}
                        value={aiKeyInput}
                        onChange={(e) => setAiKeyInput(e.target.value)}
                        placeholder="sk-or-v1-..."
                        className="pr-10 font-mono text-sm"
                        autoComplete="off"
                      />
                      <button
                        type="button"
                        onClick={() => setAiKeyVisible((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        tabIndex={-1}
                      >
                        {aiKeyVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      La key se guarda de forma segura y nunca se muestra completa.
                    </p>
                  </div>
                  <Button type="submit" disabled={savingAi || !aiKeyInput.trim()} className="gap-2">
                    {savingAi ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Guardar API Key
                  </Button>
                </form>
              )}

              <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-800 space-y-2">
                <p className="font-semibold">¿Cómo obtener tu API key gratis?</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Entrá a <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline font-medium">openrouter.ai/keys</a> (es gratis)</li>
                  <li>Creá una cuenta o iniciá sesión</li>
                  <li>Hacé clic en "Create Key"</li>
                  <li>Copiá la key y pegala arriba</li>
                </ol>
                <p className="text-blue-600 mt-1">OpenRouter ofrece modelos gratuitos como Gemma y Llama sin costo.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PLAN */}
        <TabsContent value="plan">
          <Card>
            <CardHeader>
              <CardTitle>Plan actual</CardTitle>
              <CardDescription>Gestioná tu suscripción a Clientum</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Tu plan actual</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xl font-bold text-gray-900">
                      {PLAN_LABELS[tenant?.plan ?? "starter"] ?? tenant?.plan}
                    </span>
                    <Badge className={cn("capitalize", PLAN_COLORS[tenant?.plan ?? "starter"])}>
                      activo
                    </Badge>
                  </div>
                </div>
                <Button variant="outline">Cambiar plan</Button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Starter", price: "$9.990/mes", features: ["3 usuarios", "500 contactos"] },
                  { label: "Pro", price: "$24.990/mes", features: ["10 usuarios", "Contactos ilimitados", "WhatsApp + IA + AFIP"] },
                  { label: "Business", price: "$59.990/mes", features: ["Usuarios ilimitados", "Multi-sucursal", "API + SLA"] },
                ].map((plan) => (
                  <div
                    key={plan.label}
                    className={cn(
                      "p-4 rounded-xl border text-sm",
                      (tenant?.plan ?? "starter").toLowerCase() === plan.label.toLowerCase()
                        ? "border-primary bg-primary/5"
                        : "border-gray-200"
                    )}
                  >
                    <p className="font-semibold text-gray-900">{plan.label}</p>
                    <p className="text-primary font-bold mt-1">{plan.price}</p>
                    <ul className="mt-2 space-y-1">
                      {plan.features.map((f) => (
                        <li key={f} className="text-muted-foreground text-xs">{f}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              <p className="text-xs text-muted-foreground mt-4 text-center">
                ¿Necesitás algo personalizado?{" "}
                <a href="mailto:hola@clientum.ar" className="text-primary hover:underline">Contactanos</a>
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
