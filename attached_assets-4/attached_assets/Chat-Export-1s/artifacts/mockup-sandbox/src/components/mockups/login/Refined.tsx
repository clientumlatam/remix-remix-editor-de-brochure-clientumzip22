export function Refined() {
  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0a1020 0%, #0f1e38 45%, #162d58 100%)" }}
    >
      {/* Background glow orbs */}
      <div
        className="absolute top-[-120px] left-[-120px] w-[480px] h-[480px] rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)", filter: "blur(40px)" }}
      />
      <div
        className="absolute bottom-[-80px] right-[-80px] w-[360px] h-[360px] rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, #6366f1 0%, transparent 70%)", filter: "blur(40px)" }}
      />
      <div
        className="absolute top-[40%] right-[15%] w-[200px] h-[200px] rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #38bdf8 0%, transparent 70%)", filter: "blur(30px)" }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-white font-black text-2xl mb-4 shadow-lg"
            style={{
              background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
              boxShadow: "0 0 32px rgba(59,130,246,0.45), 0 4px 16px rgba(0,0,0,0.4)",
            }}
          >
            C
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Clientum</h1>
          <p className="text-slate-400 text-sm mt-1">CRM para PyMEs argentinas</p>
        </div>

        {/* Glass card */}
        <div
          className="rounded-2xl p-7 shadow-2xl"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">Iniciar sesión</h2>
            <p className="text-slate-400 text-sm mt-0.5">Ingresá con tu cuenta de Clientum</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Email</label>
              <input
                type="email"
                placeholder="tu@empresa.com"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
                readOnly
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300 uppercase tracking-wider">Contraseña</label>
                <a href="#" className="text-xs text-blue-400 hover:text-blue-300 transition-colors">¿Olvidaste tu contraseña?</a>
              </div>
              <input
                type="password"
                placeholder="••••••••"
                defaultValue="password"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 outline-none transition-all"
                style={{
                  background: "rgba(255,255,255,0.07)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
                readOnly
              />
            </div>

            <button
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white mt-1 transition-all"
              style={{
                background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                boxShadow: "0 4px 20px rgba(59,130,246,0.4)",
              }}
            >
              Ingresar
            </button>
          </div>

          <p className="text-center text-sm text-slate-500 mt-5">
            ¿No tenés cuenta?{" "}
            <a href="#" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
              Registrate gratis
            </a>
          </p>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          © 2025 Clientum · Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
