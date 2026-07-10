import { Link } from "wouter";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { Zap, CheckCircle2, ArrowRight, Clock, Bell, RefreshCw, Mail, MessageCircle, FileText } from "lucide-react";

const BRAND_BLUE = "#2467a2";
const BRAND_GREEN = "#25d366";

const AUTOMATIONS = [
  { icon: <Bell className="w-5 h-5" />, title: "Recordatorios automáticos", desc: "Si un deal no tiene actividad en X días, el sistema alerta al responsable automáticamente." },
  { icon: <MessageCircle className="w-5 h-5" />, title: "Seguimiento por WhatsApp", desc: "Enviá mensajes de seguimiento automáticos a leads que no respondieron en 48hs." },
  { icon: <Mail className="w-5 h-5" />, title: "Emails de nurturing", desc: "Secuencias de emails que se disparan según la etapa del lead en el pipeline." },
  { icon: <FileText className="w-5 h-5" />, title: "Facturas automáticas", desc: "Al cerrar un deal como ganado, se genera automáticamente un borrador de factura." },
  { icon: <RefreshCw className="w-5 h-5" />, title: "Sincronización de datos", desc: "Los datos de WhatsApp, CRM y facturación se sincronizan en tiempo real sin intervención." },
  { icon: <Clock className="w-5 h-5" />, title: "Tareas programadas", desc: "Creá flujos donde al avanzar una etapa se asignen tareas al equipo correcto automáticamente." },
];

const WORKFLOW = [
  { step: "Lead entra por WhatsApp", color: BRAND_GREEN },
  { step: "Bot califica y registra en CRM", color: BRAND_BLUE },
  { step: "Se asigna asesor automáticamente", color: "#7c3aed" },
  { step: "Recordatorio si no hay actividad en 2 días", color: "#ea580c" },
  { step: "Deal ganado → factura generada", color: BRAND_GREEN },
];

export default function AutomatizacionPage() {
  return (
    <SiteLayout>
      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-24" style={{ background: "linear-gradient(135deg, #1a0a00 0%, #4a1a00 60%, #3a1500 100%)" }}>
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border border-orange-400/30 text-orange-300" style={{ background: "rgba(234,88,12,0.2)" }}>
              <Zap className="w-4 h-4" />
              Automatización
            </div>
            <h1 className="text-4xl lg:text-5xl font-black leading-tight">
              Hacé más con{" "}
              <span style={{ color: BRAND_GREEN }}>menos esfuerzo</span>
            </h1>
            <p className="text-lg text-orange-100 leading-relaxed">
              Automatizá seguimientos, alertas, emails y tareas. Tu equipo se enfoca en vender — el sistema hace el resto.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:opacity-90" style={{ background: BRAND_GREEN }}>
                  Probar gratis <ArrowRight className="w-4 h-4" />
                </button>
              </Link>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-orange-200">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Sin código</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Flujos visuales</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-green-400" /> Activación inmediata</span>
            </div>
          </div>

          {/* Workflow preview */}
          <div className="bg-white/10 backdrop-blur rounded-2xl p-5 border border-white/10 space-y-2">
            <p className="text-white text-sm font-semibold mb-4">Flujo automático de ventas</p>
            {WORKFLOW.map((w, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: w.color }} />
                <div className="flex-1 bg-white/10 rounded-lg px-4 py-2.5 text-white text-sm">{w.step}</div>
                {i < WORKFLOW.length - 1 && (
                  <div className="absolute left-6 mt-8 w-0.5 h-4 bg-white/20" />
                )}
              </div>
            ))}
            <p className="text-orange-300 text-xs text-center pt-2">Se ejecuta automáticamente, sin intervención manual</p>
          </div>
        </div>
      </section>

      {/* Automations */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-black text-gray-900">Automatizaciones listas para usar</h2>
            <p className="text-gray-500 mt-3 max-w-xl mx-auto">Activalas con un click. No necesitás ser técnico ni programador.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AUTOMATIONS.map((a) => (
              <div key={a.title} className="p-6 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-white bg-orange-500">
                  {a.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{a.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-white text-center" style={{ background: BRAND_BLUE }}>
        <div className="max-w-2xl mx-auto px-6 space-y-6">
          <h2 className="text-3xl font-black">Automatizá tu negocio hoy</h2>
          <p className="text-blue-100">Probalo 14 días gratis y activá tus primeros flujos en minutos.</p>
          <Link href="/register">
            <button className="px-8 py-4 rounded-xl font-bold text-white text-lg hover:opacity-90 transition-all" style={{ background: BRAND_GREEN }}>
              Probar gratis →
            </button>
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
