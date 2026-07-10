import { MessageCircle, FileText, BarChart3, Star } from "lucide-react";

const features = [
  { icon: MessageCircle, label: "Chatbot WhatsApp 24/7" },
  { icon: FileText, label: "Facturación electrónica AFIP" },
  { icon: BarChart3, label: "Pipeline de ventas y CRM" },
];

const avatars = [
  { color: "#6366f1", letter: "M" },
  { color: "#3b82f6", letter: "S" },
  { color: "#0ea5e9", letter: "A" },
  { color: "#06b6d4", letter: "R" },
];

export function VariantA() {
  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div
        className="hidden lg:flex flex-col w-[52%] p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(150deg, #060d1f 0%, #0d1d3b 45%, #112245 100%)" }}
      >
        {/* Dot-grid texture overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.06]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Ambient glows */}
        <div
          className="absolute bottom-[-60px] left-[-40px] w-[480px] h-[480px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(59,130,246,0.22) 0%, transparent 65%)", filter: "blur(60px)" }}
        />
        <div
          className="absolute top-[15%] right-[-40px] w-[260px] h-[260px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(129,140,248,0.14) 0%, transparent 65%)", filter: "blur(48px)" }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-base"
            style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", boxShadow: "0 0 20px rgba(59,130,246,0.35)" }}
          >
            C
          </div>
          <span className="text-white font-semibold text-base tracking-tight">Clientum</span>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Content block */}
        <div className="relative z-10 pb-2">
          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-5">
            <div className="h-px w-6" style={{ background: "rgba(59,130,246,0.6)" }} />
            <span className="text-xs font-medium tracking-widest uppercase" style={{ color: "rgba(147,197,253,0.7)" }}>
              CRM para PyMEs argentinas
            </span>
          </div>

          <h2 className="text-[2.1rem] font-bold text-white leading-[1.2] tracking-tight mb-4">
            Tu PyME, organizada<br />
            <span style={{ color: "#60a5fa" }}>y automatizada.</span>
          </h2>

          <p className="text-sm leading-relaxed mb-8" style={{ color: "rgba(148,163,184,0.85)" }}>
            CRM, facturación electrónica y atención al cliente por WhatsApp —<br />
            todo en una sola plataforma.
          </p>

          {/* Features */}
          <div className="space-y-3 mb-10">
            {features.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(59,130,246,0.15)", border: "1px solid rgba(59,130,246,0.28)" }}
                >
                  <Icon size={15} style={{ color: "#93c5fd" }} />
                </div>
                <span className="text-sm font-medium" style={{ color: "rgba(226,232,240,0.85)" }}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Social proof */}
          <div
            className="flex items-center gap-4 px-4 py-3 rounded-xl"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <div className="flex -space-x-2">
              {avatars.map(({ color, letter }) => (
                <div
                  key={letter}
                  className="w-7 h-7 rounded-full border-2 flex items-center justify-center text-xs text-white font-bold"
                  style={{ background: color, borderColor: "#0d1d3b" }}
                >
                  {letter}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={11} fill="#fbbf24" stroke="none" />
                ))}
                <span className="text-xs font-semibold text-white ml-1">4.9</span>
              </div>
              <p className="text-xs" style={{ color: "rgba(148,163,184,0.7)" }}>
                <span className="text-white font-medium">+500 PyMEs</span> confían en Clientum
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-[340px]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-base">C</div>
            <span className="font-bold text-gray-900">Clientum</span>
          </div>

          <div className="mb-7">
            <h2 className="text-[1.5rem] font-bold text-gray-900 tracking-tight leading-tight">Bienvenido de vuelta</h2>
            <p className="text-sm mt-1" style={{ color: "#6b7280" }}>Ingresá con tu cuenta de Clientum</p>
          </div>

          <form className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#374151", letterSpacing: "0.06em" }}>
                Email
              </label>
              <div
                className="w-full px-3.5 py-2.5 rounded-lg text-sm flex items-center"
                style={{ border: "1.5px solid #d1d5db", background: "#fff" }}
              >
                <span style={{ color: "#9ca3af" }}>tu@empresa.com</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wide" style={{ color: "#374151", letterSpacing: "0.06em" }}>
                  Contraseña
                </label>
                <span className="text-xs font-medium" style={{ color: "#2563eb" }}>
                  ¿Olvidaste tu contraseña?
                </span>
              </div>
              <div
                className="w-full px-3.5 py-2.5 rounded-lg text-sm flex items-center"
                style={{ border: "1.5px solid #3b82f6", background: "#fff", boxShadow: "0 0 0 3px rgba(59,130,246,0.12)" }}
              >
                <span style={{ color: "#374151" }}>••••••••••••</span>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="button"
                className="w-full py-2.5 rounded-lg text-sm font-semibold text-white"
                style={{
                  background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.38)",
                }}
              >
                Ingresar
              </button>
            </div>
          </form>

          {/* Inline register CTA — no divider */}
          <p className="text-center text-sm mt-5" style={{ color: "#9ca3af" }}>
            ¿Sin cuenta?{" "}
            <span className="font-semibold" style={{ color: "#2563eb" }}>
              Crear una gratis →
            </span>
          </p>

          {/* Trust line */}
          <div className="mt-8 flex items-center justify-center gap-3">
            <div className="h-px flex-1" style={{ background: "#f3f4f6" }} />
            <span className="text-xs" style={{ color: "#9ca3af" }}>
              🔒 Ingreso seguro · SSL cifrado
            </span>
            <div className="h-px flex-1" style={{ background: "#f3f4f6" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
