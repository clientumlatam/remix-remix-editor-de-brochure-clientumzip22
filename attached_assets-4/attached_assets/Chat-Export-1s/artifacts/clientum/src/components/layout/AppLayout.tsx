import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Building2,
  Target,
  Briefcase,
  Activity,
  FileText,
  Package,
  MessageCircle,
  LogOut,
  Settings,
  ChevronDown,
  SlidersHorizontal,
  ClipboardList,
  Bot,
  Calendar,
  ShoppingCart,
  Send,
  Search,
  BarChart2,
  Grid3X3,
  CreditCard,
  Sparkles,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useWhatsAppStatus } from "@/hooks/useWhatsAppStatus";
import { useWhatsAppNotifications } from "@/hooks/useWhatsAppNotifications";
import { useToast } from "@/hooks/use-toast";
import { useCallback, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  badge?: "whatsapp";
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navigationGroups: NavGroup[] = [
  {
    label: "General",
    items: [
      { name: "Dashboard", href: "/app/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "CRM",
    items: [
      { name: "Contactos",   href: "/app/contacts",        icon: Users },
      { name: "Empresas",    href: "/app/companies",       icon: Building2 },
      { name: "Leads",       href: "/app/leads",           icon: Target },
      { name: "Deals",       href: "/app/deals",           icon: Briefcase },
      { name: "Actividades", href: "/app/activities",      icon: Activity },
      { name: "WhatsApp",    href: "/app/whatsapp",        icon: MessageCircle, badge: "whatsapp" },
      { name: "Broadcast",   href: "/app/broadcast",       icon: Send },
      { name: "Turnos",      href: "/app/appointments",    icon: Calendar },
      { name: "Asistente IA", href: "/app/ai-chat",        icon: Bot },
      { name: "Copilot IA",  href: "/app/copilot-history", icon: Sparkles },
      { name: "Prospector",  href: "/app/prospector",      icon: Search },
    ],
  },
  {
    label: "Ventas",
    items: [
      { name: "Cotizaciones", href: "/app/quotes",   icon: ClipboardList },
      { name: "Facturas",     href: "/app/invoices", icon: FileText },
      { name: "Pedidos",      href: "/app/orders",   icon: ShoppingCart },
      { name: "Productos",    href: "/app/products", icon: Package },
    ],
  },
  {
    label: "Crecimiento",
    items: [
      { name: "Analytics", href: "/app/analytics", icon: BarChart2 },
    ],
  },
];

const bottomNavigation: NavItem[] = [
  { name: "Servicios",     href: "/app/services", icon: Grid3X3 },
  { name: "Plan y pagos",  href: "/app/payments", icon: CreditCard },
  { name: "Configuración", href: "/app/settings", icon: SlidersHorizontal },
];

function WaSidebarIndicator({ needsHumanCount }: { needsHumanCount: number }) {
  const { status } = useWhatsAppStatus();

  if (needsHumanCount > 0) {
    return (
      <span className="ml-auto flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-orange-500 text-white text-[10px] font-bold flex-shrink-0">
        {needsHumanCount > 9 ? "9+" : needsHumanCount}
      </span>
    );
  }
  if (status === "connected")
    return <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />;
  if (status === "qr_pending")
    return <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />;
  return null;
}

function NavLink({
  item,
  location,
  needsHumanCount,
}: {
  item: NavItem;
  location: string;
  needsHumanCount: number;
}) {
  const isActive = location.startsWith(item.href);
  return (
    <Link
      href={item.href}
      className={cn(
        "group/nav relative flex items-center gap-2.5 px-3 py-2 text-[13px] rounded-lg transition-all duration-150",
        isActive
          ? "bg-white/10 text-white font-medium shadow-sm"
          : "text-white/50 hover:text-white/80 hover:bg-white/5"
      )}
    >
      {isActive && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-full bg-blue-400" />
      )}
      <item.icon
        className={cn(
          "w-[15px] h-[15px] flex-shrink-0 transition-colors duration-150",
          isActive ? "text-blue-300" : "text-white/40 group-hover/nav:text-white/70"
        )}
      />
      <span className="flex-1 truncate">{item.name}</span>
      {item.badge === "whatsapp" && (
        <WaSidebarIndicator needsHumanCount={needsHumanCount} />
      )}
    </Link>
  );
}

function NavGroupSection({
  group,
  location,
  needsHumanCount,
  open,
  onToggle,
}: {
  group: NavGroup;
  location: string;
  needsHumanCount: number;
  open: boolean;
  onToggle: () => void;
}) {
  const hasActiveChild = group.items.some((item) => location.startsWith(item.href));

  return (
    <div>
      {/* Clickable group header */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between px-3 py-1.5 rounded-md transition-colors duration-150 group/header",
          "hover:bg-white/5"
        )}
      >
        <span
          className={cn(
            "text-[10px] font-semibold uppercase tracking-widest select-none transition-colors duration-150",
            hasActiveChild && !open ? "text-blue-300/70" : "text-white/25",
            "group-hover/header:text-white/45"
          )}
        >
          {group.label}
        </span>
        <ChevronDown
          className={cn(
            "w-3 h-3 text-white/20 transition-all duration-200 group-hover/header:text-white/40",
            open ? "rotate-0" : "-rotate-90"
          )}
        />
      </button>

      {/* Items — simple height-based collapse */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200 ease-in-out",
          open ? "mt-0.5 space-y-0.5" : "max-h-0"
        )}
        style={open ? {} : { maxHeight: 0 }}
      >
        {open &&
          group.items.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              location={location}
              needsHumanCount={needsHumanCount}
            />
          ))}
      </div>
    </div>
  );
}

// Load persisted open-group state; default all open
function loadGroupState(labels: string[]): Record<string, boolean> {
  try {
    const raw = localStorage.getItem("sidebar_groups");
    if (raw) return JSON.parse(raw);
  } catch {}
  return Object.fromEntries(labels.map((l) => [l, true]));
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location, navigate] = useLocation();
  const { user, tenant, logout } = useAuth();
  const { toast } = useToast();

  const groupLabels = navigationGroups.map((g) => g.label);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() =>
    loadGroupState(groupLabels)
  );

  const toggleGroup = useCallback((label: string) => {
    setOpenGroups((prev) => {
      const next = { ...prev, [label]: !prev[label] };
      try {
        localStorage.setItem("sidebar_groups", JSON.stringify(next));
      } catch {}
      return next;
    });
  }, []);

  const handleNewAlert = useCallback(
    (conv: { contactName: string; lastMessage: string; phone: string }) => {
      toast({
        title: `⚠️ ${conv.contactName} necesita atención`,
        description: conv.lastMessage || "Nuevos mensaje en WhatsApp",
        action: (
          <button
            onClick={() => navigate("/app/whatsapp")}
            className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-input bg-background px-3 py-1.5 hover:bg-accent hover:text-accent-foreground"
          >
            Ver
          </button>
        ),
      });
    },
    [toast, navigate]
  );

  const { needsHumanCount } = useWhatsAppNotifications(handleNewAlert);

  function handleLogout() {
    logout();
    window.location.href = "/login";
  }

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "??";

  return (
    <div className="flex h-screen bg-[#F0F4FA]">
      {/* Sidebar */}
      <aside
        className="w-56 flex flex-col flex-shrink-0"
        style={{
          background: "linear-gradient(180deg, #162544 0%, #111E36 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        {/* Logo */}
        <div
          className="h-14 flex items-center px-4 flex-shrink-0"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
        >
          <Link href="/app/dashboard" className="flex items-center gap-2.5 select-none">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)" }}
            >
              <span className="font-black text-white text-sm leading-none">C</span>
            </div>
            <span className="text-white font-semibold text-[15px] tracking-tight">Clientum</span>
          </Link>
        </div>

        {/* Grouped navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1">
          {navigationGroups.map((group) => (
            <NavGroupSection
              key={group.label}
              group={group}
              location={location}
              needsHumanCount={needsHumanCount}
              open={openGroups[group.label] ?? true}
              onToggle={() => toggleGroup(group.label)}
            />
          ))}
        </nav>

        {/* Bottom nav */}
        <div
          className="px-2.5 py-2 space-y-0.5 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {bottomNavigation.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              location={location}
              needsHumanCount={0}
            />
          ))}
        </div>

        {/* User section */}
        <div
          className="p-2.5 flex-shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-white/60 hover:text-white hover:bg-white/6 transition-all duration-150">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                  style={{ background: "linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)" }}
                >
                  {initials}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-[12px] font-medium text-white/80 truncate leading-tight">
                    {user?.name ?? "Usuario"}
                  </p>
                  <p className="text-[10px] text-white/35 truncate leading-tight mt-px">
                    {tenant?.name ?? ""}
                  </p>
                </div>
                <ChevronDown className="w-3 h-3 flex-shrink-0 text-white/30" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-52 mb-1">
              <div className="px-2 py-1.5">
                <p className="text-xs font-medium">{user?.name}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/app/settings">
                  <Settings className="w-4 h-4 mr-2" />
                  Configuración
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-red-600 focus:text-red-600"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="h-full p-8 max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
