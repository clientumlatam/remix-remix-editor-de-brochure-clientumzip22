import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Login failed");
      login(data.token, data.user, data.tenant);
      navigate("/app/dashboard");
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div
        className="hidden lg:flex flex-col w-[52%] p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(150deg, #0a1020 0%, #0f1e38 50%, #162d58 100%)" }}
      >
        <div
          className="absolute bottom-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 65%)", filter: "blur(50px)" }}
        />
        <div
          className="absolute top-[20%] right-[-60px] w-[280px] h-[280px] rounded-full opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #818cf8 0%, transparent 65%)", filter: "blur(40px)" }}
        />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3 mb-auto">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              boxShadow: "0 0 24px rgba(59,130,246,0.4)",
            }}
          >
            C
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Clientum</span>
        </div>

        {/* Headline */}
        <div className="relative z-10 mt-auto">
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">
            Tu PyME, organizada<br />y automatizada.
          </h2>
          <p className="text-slate-400 text-base mb-10 leading-relaxed">
            CRM, facturación electrónica y atención al cliente por WhatsApp — todo en una sola plataforma.
          </p>

          <div className="space-y-4">
            {[
              { icon: "💬", label: "Chatbot WhatsApp 24/7" },
              { icon: "📄", label: "Facturación electrónica AFIP" },
              { icon: "📊", label: "Pipeline de ventas y CRM" },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-sm flex-shrink-0"
                  style={{ background: "rgba(59,130,246,0.18)", border: "1px solid rgba(59,130,246,0.25)" }}
                >
                  {f.icon}
                </div>
                <span className="text-slate-300 text-sm">{f.label}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 flex items-center gap-3">
            <div className="flex -space-x-2">
              {["#6366f1", "#3b82f6", "#0ea5e9", "#06b6d4"].map((c, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full border-2 border-slate-800 flex items-center justify-center text-xs text-white font-bold"
                  style={{ background: c }}
                >
                  {["M", "S", "A", "R"][i]}
                </div>
              ))}
            </div>
            <p className="text-slate-400 text-sm">
              <span className="text-white font-semibold">+500 PyMEs</span> confían en Clientum
            </p>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-base">C</div>
            <span className="font-bold text-gray-900">Clientum</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Bienvenido de vuelta</h2>
            <p className="text-gray-500 text-sm mt-1">Ingresá con tu cuenta de Clientum</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                placeholder="tu@empresa.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                style={{ border: "1.5px solid #e5e7eb", background: "#fafafa" }}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña</label>
                <Link href="/forgot-password">
                  <span className="text-xs text-blue-600 font-medium cursor-pointer hover:text-blue-700">
                    ¿Olvidaste tu contraseña?
                  </span>
                </Link>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                style={{ border: "1.5px solid #e5e7eb", background: "#fafafa" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                boxShadow: "0 2px 12px rgba(59,130,246,0.3)",
              }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Ingresar
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400">¿Nuevo en Clientum?</span>
            </div>
          </div>

          <Link href="/register">
            <button
              type="button"
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-blue-600 transition-all hover:bg-blue-50"
              style={{ border: "1.5px solid #bfdbfe", background: "#eff6ff" }}
            >
              Crear cuenta gratis
            </button>
          </Link>

          <p className="text-center text-xs text-gray-400 mt-8">
            Sin tarjeta de crédito · Operativo en una semana
          </p>
        </div>
      </div>
    </div>
  );
}
