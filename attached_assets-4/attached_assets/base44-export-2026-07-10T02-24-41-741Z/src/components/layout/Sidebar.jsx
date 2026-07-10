import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Package, MapPin, Users, Bot, Menu, X, Wrench, Kanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/crm', label: 'CRM', icon: Kanban },
  { path: '/conversations', label: 'Conversaciones', icon: MessageSquare },
  { path: '/products', label: 'Productos', icon: Package },
  { path: '/branches', label: 'Sucursales', icon: MapPin },
  { path: '/sellers', label: 'Vendedores', icon: Users },
  { path: '/bot', label: 'Bot WhatsApp', icon: Bot },
];

export default function Sidebar({ isOpen, onToggle }) {
  const location = useLocation();

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onToggle} />
      )}

      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden bg-white shadow-md"
        onClick={onToggle}
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      <aside className={cn(
        "fixed top-0 left-0 h-full w-64 z-40 transition-transform duration-300 flex flex-col",
        "bg-[hsl(222,47%,11%)] text-white",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        {/* Logo */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg">
              <Wrench className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white">GAMAN</h1>
              <p className="text-xs text-white/50">Ferretería y Corralón</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && onToggle?.()}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-2 px-4 py-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-white/50">Bot activo · 24/7</span>
          </div>
        </div>
      </aside>
    </>
  );
}