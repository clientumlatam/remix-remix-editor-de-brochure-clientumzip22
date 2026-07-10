import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { ArrowLeft, Loader2, CheckCircle2, Eye, EyeOff, XCircle } from "lucide-react";

export default function ResetPassword() {
  const [location] = useLocation();
  const token = new URLSearchParams(window.location.search).get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const strong = password.length >= 8;
  const match = password === confirm;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!strong) { setError("La contraseña debe tener al menos 8 caracteres."); return; }
    if (!match) { setError("Las contraseñas no coinciden."); return; }
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al restablecer la contraseña");
      setDone(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-8">
        <div className="max-w-sm w-full text-center space-y-4">
          <XCircle className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-bold text-gray-900">Enlace inválido</h2>
          <p className="text-gray-500 text-sm">Este enlace de recuperación no es válido o expiró.</p>
          <Link href="/login">
            <button className="mt-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }}>
              Volver al login
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left brand panel */}
      <div
        className="hidden lg:flex flex-col w-[52%] p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(150deg, #0a1020 0%, #0f1e38 50%, #162d58 100%)" }}
      >
        <div className="absolute bottom-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 65%)", filter: "blur(50px)" }} />
        <div className="relative z-10 flex items-center gap-3 mb-auto">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", boxShadow: "0 0 24px rgba(59,130,246,0.4)" }}>C</div>
          <span className="text-white font-bold text-lg tracking-tight">Clientum</span>
        </div>
        <div className="relative z-10 mt-auto">
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">Nueva contraseña,<br />acceso seguro.</h2>
          <p className="text-slate-400 text-base leading-relaxed">Creá una contraseña fuerte para proteger tu cuenta de Clientum.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          {done ? (
            <div className="space-y-6">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Contraseña actualizada</h2>
                <p className="text-gray-500 text-sm mt-2">Tu contraseña fue cambiada exitosamente. Ya podés ingresar con tu nueva contraseña.</p>
              </div>
              <Link href="/login">
                <button className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", boxShadow: "0 2px 12px rgba(59,130,246,0.3)" }}>
                  Ir al login
                </button>
              </Link>
            </div>
          ) : (
            <>
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Volver al login
              </Link>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Crear nueva contraseña</h2>
                <p className="text-gray-500 text-sm mt-1">Elegí una contraseña segura de al menos 8 caracteres.</p>
              </div>

              {error && (
                <div className="mb-5 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Nueva contraseña</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      placeholder="Mínimo 8 caracteres"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full px-3.5 py-2.5 pr-10 rounded-lg text-sm text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      style={{ border: "1.5px solid #e5e7eb", background: "#fafafa" }}
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {password && (
                    <p className={`text-xs ${strong ? "text-green-600" : "text-red-500"}`}>
                      {strong ? "✓ Contraseña válida" : "✗ Mínimo 8 caracteres"}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-gray-700">Confirmar contraseña</label>
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="Repetí la contraseña"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-lg text-sm text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                    style={{ border: "1.5px solid #e5e7eb", background: "#fafafa" }}
                  />
                  {confirm && (
                    <p className={`text-xs ${match ? "text-green-600" : "text-red-500"}`}>
                      {match ? "✓ Las contraseñas coinciden" : "✗ Las contraseñas no coinciden"}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", boxShadow: "0 2px 12px rgba(59,130,246,0.3)" }}
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Cambiar contraseña
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
