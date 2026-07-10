import { useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Loader2, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error al procesar la solicitud");
      setSent(true);
    } catch (err: any) {
      setError(err.message);
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
        <div className="absolute bottom-[-80px] left-[-80px] w-[500px] h-[500px] rounded-full opacity-20 pointer-events-none" style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 65%)", filter: "blur(50px)" }} />
        <div className="absolute top-[20%] right-[-60px] w-[280px] h-[280px] rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, #818cf8 0%, transparent 65%)", filter: "blur(40px)" }} />
        <div className="relative z-10 flex items-center gap-3 mb-auto">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-lg" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", boxShadow: "0 0 24px rgba(59,130,246,0.4)" }}>C</div>
          <span className="text-white font-bold text-lg tracking-tight">Clientum</span>
        </div>
        <div className="relative z-10 mt-auto">
          <h2 className="text-3xl font-bold text-white leading-tight mb-4">Recuperá el acceso<br />a tu cuenta.</h2>
          <p className="text-slate-400 text-base leading-relaxed">Te enviamos un enlace para restablecer tu contraseña. El proceso toma menos de 2 minutos.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-sm">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-base">C</div>
            <span className="font-bold text-gray-900">Clientum</span>
          </div>

          {sent ? (
            <div className="space-y-6">
              <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-green-500" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Revisá tu email</h2>
                <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                  Te enviamos un enlace de recuperación a <strong className="text-gray-800">{email}</strong>. El enlace expira en 1 hora.
                </p>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                <p className="text-sm text-blue-700 leading-relaxed">
                  Si no lo ves en tu bandeja de entrada, revisá la carpeta de spam o correo no deseado.
                </p>
              </div>
              <Link href="/login">
                <button className="w-full py-2.5 rounded-lg text-sm font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 transition-all">
                  Volver al inicio de sesión
                </button>
              </Link>
            </div>
          ) : (
            <>
              <Link href="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-8 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Volver al login
              </Link>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">¿Olvidaste tu contraseña?</h2>
                <p className="text-gray-500 text-sm mt-1 leading-relaxed">Ingresá tu email y te enviamos un enlace para crear una nueva contraseña.</p>
              </div>

              {error && (
                <div className="mb-5 bg-red-50 border border-red-100 text-red-700 text-sm rounded-lg px-4 py-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      placeholder="tu@empresa.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-lg text-sm text-gray-900 outline-none transition-all focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                      style={{ border: "1.5px solid #e5e7eb", background: "#fafafa" }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                  style={{ background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", boxShadow: "0 2px 12px rgba(59,130,246,0.3)" }}
                >
                  {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enviar enlace de recuperación
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
