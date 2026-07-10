import { useState } from "react";
import { useLocation } from "wouter";
import { LogIn, Loader2, Eye, EyeOff } from "lucide-react";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

interface PortalContact {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
}

export default function PortalLogin() {
  const [, setLocation] = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${BASE}/api/portal/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Error al iniciar sesión");
        return;
      }

      const { token, contact }: { token: string; contact: PortalContact } = await res.json();
      localStorage.setItem("portalToken", token);
      localStorage.setItem("portalContact", JSON.stringify(contact));
      setLocation("/portal/dashboard");
    } catch {
      setError("Error de conexión. Intentá de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1a2b4a] to-[#2467a2] px-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8 text-white space-y-2">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto font-black text-xl" style={{ background: "#761c8f" }}>
            C
          </div>
          <h1 className="text-2xl font-bold">Portal de Clientes</h1>
          <p className="text-blue-200 text-sm">Accedé a tus facturas y proyectos</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Iniciar sesión</h2>
            <p className="text-gray-500 text-sm mt-1">Ingresá con las credenciales que te proporcionó tu proveedor</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2467a2] transition-colors"
                placeholder="tu@empresa.com"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Contraseña</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#2467a2] transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold text-sm text-white flex items-center justify-center gap-2 disabled:opacity-70 transition-opacity hover:opacity-90"
              style={{ background: "#2467a2" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              {loading ? "Ingresando…" : "Ingresar al portal"}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400">
            ¿No tenés acceso?{" "}
            <a href="mailto:info@clientum.net.ar" className="font-semibold" style={{ color: "#2467a2" }}>
              Contactá a tu proveedor
            </a>
          </p>
        </div>

        <p className="text-center text-xs text-blue-200 mt-6">
          <a href="/" className="hover:underline">← Volver al sitio de Clientum</a>
        </p>
      </div>
    </div>
  );
}
