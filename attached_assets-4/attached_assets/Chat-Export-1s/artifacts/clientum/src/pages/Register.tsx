import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Check } from "lucide-react";

export default function Register() {
  const [form, setForm] = useState({ orgName: "", name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  function update(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Registration failed");
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
            Comenzá gratis.<br />Resultados en una semana.
          </h2>
          <p className="text-slate-400 text-base mb-10 leading-relaxed">
            14 días de prueba completa — sin tarjeta de crédito. Configuramos todo con vos.
          </p>

          <div className="space-y-3">
            {[
              "14 días de prueba gratis, sin compromisos",
              "Onboarding guiado en español",
              "Soporte por WhatsApp incluido",
              "Cancelá cuando quieras",
            ].map((text) => (
              <div key={text} className="flex items-center gap-3">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.3)" }}
                >
                  <Check className="w-3 h-3 text-green-400" />
                </div>
                <span className="text-slate-300 text-sm">{text}</span>
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
              <span className="text-white font-semibold">+500 PyMEs</span> ya automatizadas
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
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Crear cuenta</h2>
            <p className="text-gray-500 text-sm mt-1">Registrá tu empresa en Clientum</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="orgName" className="text-sm font-medium text-gray-700">Nombre de la empresa</label>
              <input
                id="orgName"
                placeholder="Mi Empresa S.A."
                value={form.orgName}
                onChange={update("orgName")}
                required
                minLength={2}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                style={{ border: "1.5px solid #e5e7eb", background: "#fafafa" }}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">Tu nombre</label>
              <input
                id="name"
                placeholder="Juan García"
                value={form.name}
                onChange={update("name")}
                required
                minLength={2}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                style={{ border: "1.5px solid #e5e7eb", background: "#fafafa" }}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
              <input
                id="email"
                type="email"
                placeholder="juan@miempresa.com"
                value={form.email}
                onChange={update("email")}
                required
                className="w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                style={{ border: "1.5px solid #e5e7eb", background: "#fafafa" }}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">Contraseña</label>
              <input
                id="password"
                type="password"
                placeholder="Mínimo 8 caracteres"
                value={form.password}
                onChange={update("password")}
                required
                minLength={8}
                className="w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                style={{ border: "1.5px solid #e5e7eb", background: "#fafafa" }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2 mt-1"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                boxShadow: "0 2px 12px rgba(59,130,246,0.3)",
              }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Crear cuenta gratis
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            ¿Ya tenés cuenta?{" "}
            <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Iniciá sesión
            </Link>
          </p>

          <p className="text-center text-xs text-gray-400 mt-4">
            Sin tarjeta de crédito · 14 días gratis
          </p>
        </div>
      </div>
    </div>
  );
}
