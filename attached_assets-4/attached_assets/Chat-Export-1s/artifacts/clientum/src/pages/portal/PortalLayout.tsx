import { usePortal } from "@/contexts/PortalContext";
import { useLocation, Link } from "wouter";
import { FileText, Briefcase, LogOut, User, LayoutDashboard, Menu, X } from "lucide-react";
import { useState } from "react";

const NAV = [
  { href: "/portal/dashboard", icon: <LayoutDashboard className="w-4 h-4" />, label: "Inicio" },
  { href: "/portal/invoices", icon: <FileText className="w-4 h-4" />, label: "Mis facturas" },
  { href: "/portal/deals", icon: <Briefcase className="w-4 h-4" />, label: "Mis proyectos" },
];

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const { contact, logout } = usePortal();
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 flex flex-col transform transition-transform duration-200 lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0" style={{ background: "#761c8f" }}>
            C
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm leading-tight">Portal Cliente</p>
            <p className="text-xs text-gray-400 leading-tight">Clientum</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map((item) => {
            const active = location === item.href;
            return (
              <Link key={item.href} href={item.href}>
                <a
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    active ? "text-white" : "text-gray-600 hover:bg-gray-50"
                  }`}
                  style={active ? { background: "#2467a2" } : {}}
                >
                  {item.icon}
                  {item.label}
                </a>
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-4 py-4 border-t border-gray-100 space-y-2">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: "#2467a2" }}>
              {contact?.name?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{contact?.name}</p>
              <p className="text-xs text-gray-400 truncate">{contact?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors font-medium"
          >
            <LogOut className="w-4 h-4" /> Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-100 flex items-center justify-between px-4 py-3">
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-gray-600">
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="font-bold text-gray-900 text-sm">Portal Cliente</span>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ background: "#2467a2" }}>
            {contact?.name?.[0]?.toUpperCase() ?? "?"}
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
