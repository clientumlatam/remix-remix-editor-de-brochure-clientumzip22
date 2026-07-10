import { MessageCircle, FileText, BarChart3, ArrowRight, CheckCircle2, Shield } from "lucide-react";

const features = [
  { icon: MessageCircle, label: "Chatbot WhatsApp 24/7", sub: "Respondé clientes automáticamente" },
  { icon: FileText, label: "Facturación AFIP", sub: "Facturas electrónicas en segundos" },
  { icon: BarChart3, label: "Pipeline de ventas", sub: "Seguimiento completo de leads y deals" },
];

const avatars = [
  { color: "#6366f1", letter: "M" },
  { color: "#3b82f6", letter: "S" },
  { color: "#0ea5e9", letter: "A" },
  { color: "#06b6d4", letter: "R" },
];

export function VariantB() {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel — wider */}
      <div
        className="hidden lg:flex flex-col w-[55%] p-14 relative overflow-hidden"
        style={{ background: "linear-gradient(155deg, #050e20 0%, #0b1a35 40%, #0f2348 100%)" }}
      >
        {/* Subtle grid */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* Top radial bloom */}
        <div
          className="absolute top-0 right-0 w-[600px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 80% 0%, rgba(37,99,235,0.18) 0%, transparent 60%)", filter: "blur(40px)" }}
        />
        <div
          className="absolute bottom-0 left-0 w-[500px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at 20% 100%, rgba(59,130,246,0.14) 0%, transparent 60%)", filter: "blur(50px)" }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-black text-base"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              boxShadow: "0 0 24px rgba(59,130,246,0.4), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            C
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">Clientum</span>
        </div>

        {/* Center content */}
        <div className="relative z-10 flex flex-col justify-center flex-1 py-10">
          {/* Tag */}
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-6 w-fit"
            style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.3)", color: "#93c5fd" }}
          >
            <CheckCircle2 size={11} />
            Plataforma todo-en-uno para PyMEs
          </div>

          <h2 className="text-4xl font-bold text-white leading-[1.15] tracking-tight mb-4">
            Tu PyME, organizada
            <br />
            <span
              style={{
                backgroundImage: "linear-gradient(90deg, #60a5fa, #818cf8)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              y automatizada.
            </span>
          </h2>

          <p className="text-sm leading-relaxed mb-10" style={{ color: "rgba(148,163,184,0.8)", maxWidth: "380px" }}>
            CRM, facturación electrónica AFIP y atención por WhatsApp con IA — todo integrado, sin código, operativo en una semana.
          </p>

          {/* Feature list */}
          <div className="space-y-4">
            {features.map(({ icon: Icon, label, sub }) => (
              <div
                key={label}
                className="flex items-start gap-3.5 p-3.5 rounded-xl"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: "rgba(59,130,246,0.18)", border: "1px solid rgba(59,130,246,0.3)" }}
                >
                  <Icon size={15} style={{ color: "#93c5fd" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">{label}</p>
                  <p className="text-xs mt-0.5" style={{ color: "rgba(148,163,184,0.65)" }}>{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom social proof */}
        <div
          className="relative z-10 flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          <div className="flex -space-x-2.5">
            {avatars.map(({ color, letter }) => (
              <div
                key={letter}
                className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs text-white font-bold"
                style={{ background: color, borderColor: "#0b1a35" }}
              >
                {letter}
              </div>
            ))}
          </div>
          <div className="flex-1">
            <p className="text-xs text-white font-medium">+500 PyMEs ya lo usan</p>
            <p className="text-xs" style={{ color: "rgba(148,163,184,0.6)" }}>Calificación 4.9/5 · Sin tarjeta de crédito</p>
          </div>
        </div>
      </div>

      {/* Right panel — light gray bg + elevated card */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: "#f1f5f9" }}>
        <div
          className="w-full max-w-[360px] rounded-2xl p-8"
          style={{ background: "#ffffff", boxShadow: "0 8px 48px rgba(0,0,0,0.10), 0 2px 12px rgba(0,0,0,0.06)" }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-6 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-base">C</div>
            <span className="font-bold text-gray-900">Clientum</span>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 tracking-tight">Bienvenido de vuelta</h2>
            <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Ingresá con tu cuenta de Clientum</p>
          </div>

          <form className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700">Email</label>
              <div
                className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                style={{ border: "1.5px solid #e5e7eb", background: "#f9fafb", color: "#9ca3af" }}
              >
                tu@empresa.com
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Contraseña</label>
                <span className="text-xs font-medium" style={{ color: "#2563eb" }}>
                  ¿Olvidaste tu contraseña?
                </span>
              </div>
              <div
                className="w-full px-3.5 py-2.5 rounded-xl text-sm"
                style={{
                  border: "1.5px solid #2563eb",
                  background: "#fff",
                  color: "#374151",
                  boxShadow: "0 0 0 4px rgba(37,99,235,0.10)",
                }}
              >
                ••••••••••••
              </div>
            </div>

            <div className="pt-1.5 space-y-2.5">
              <button
                type="button"
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                style={{
                  background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
                  boxShadow: "0 4px 16px rgba(29,78,216,0.4)",
                }}
              >
                Ingresar
                <ArrowRight size={15} />
              </button>

              <button
                type="button"
                className="w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5"
                style={{ background: "#f0f7ff", border: "1.5px solid #bfdbfe", color: "#1d4ed8" }}
              >
                Crear cuenta gratis
              </button>
            </div>
          </form>

          {/* Security badge */}
          <div className="mt-5 flex items-center justify-center gap-1.5">
            <Shield size={12} style={{ color: "#9ca3af" }} />
            <span className="text-xs" style={{ color: "#9ca3af" }}>
              Ingreso seguro · SSL cifrado · Sin tarjeta de crédito
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
