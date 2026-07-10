import React, { useState, useEffect, useRef } from "react";
import { CRMDeal, BrochureData, CustomTemplate } from "../types";
import { INITIAL_DEALS } from "../data";
import { loadDeals, saveDeals, addActivity, DEALS_EVENT } from "../store/sharedStore";
import CrmFullApp from "./crm-full/CrmFullApp";
import SidebarEditor from "./SidebarEditor";
import BrochurePreview from "./BrochurePreview";
import {
  Users,
  DollarSign,
  Plus,
  ArrowRight,
  ArrowLeft,
  Trash2,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Award,
  Search,
  Building2,
  MapPin,
  Phone,
  User,
  Sparkles,
  Check,
  Compass,
  Info,
  RefreshCw,
  FileDown,
  ExternalLink,
  Target,
  TrendingUp,
  Mail,
  Linkedin,
  MessageSquare,
  CheckSquare,
  Square,
  ChevronRight,
  ShieldAlert,
  Star,
  Copy,
  Layout,
  Globe,
  Key,
  Settings,
  Lock,
  X,
  Map,
  Filter,
  Download,
  FileText,
  Layers,
  Printer,
  ChevronDown,
  Package,
  Bot,
  Sliders,
  Edit3,
  Clock,
  PlusCircle
} from "lucide-react";

interface SalesProspectorDashboardProps {
  brochureData: BrochureData;
  hidePrices: boolean;
  onBack?: () => void;
  onLogout?: () => void;
  currentUsername?: string;
  currentUserRole?: string;
  onChangeDeals?: (newDeals: CRMDeal[]) => void;
  // Brochure editor (merged "Brochure" tab)
  onChangeBrochureData?: (data: BrochureData) => void;
  colorTheme?: string;
  onThemeChange?: (theme: string) => void;
  contactInfo?: { website: string; email: string; phone: string; address: string; github?: string };
  onContactChange?: (info: { website: string; email: string; phone: string; address: string; github?: string }) => void;
  activePreset?: string;
  onPresetChange?: (preset: string) => void;
  customTemplates?: CustomTemplate[];
  onSaveTemplate?: (name: string) => void;
  onDeleteTemplate?: (id: string) => void;
  onHidePricesChange?: (hide: boolean) => void;
  hideChatbot?: boolean;
  onHideChatbotChange?: (hide: boolean) => void;
  showAllPages?: boolean;
  onShowAllPagesChange?: (show: boolean) => void;
  selectedPage?: number;
  onSelectedPageChange?: (page: number) => void;
  onPrint?: () => void;
  onExportPDF?: () => void;
  onResetBrochure?: () => void;
}

const CITIES_RN = [
  "General Roca",
  "Cipolletti",
  "San Carlos de Bariloche",
  "Viedma",
  "Villa Regina",
  "Allen",
  "Cinco Saltos",
  "Catriel",
  "San Antonio Oeste"
];

const CITIES_NQ = [
  "Neuquén Capital",
  "Plottier",
  "Centenario",
  "Zapala",
  "Cutral Co",
  "Plaza Huincul",
  "San Martín de los Andes",
  "Villa La Angostura",
  "Chos Malal"
];

const INDUSTRIES_PRESET = [
  "Distribuidora Mayorista",
  "Bodega de Vinos",
  "Inmobiliaria & Alquileres",
  "Corralón de Construcción",
  "Clínica de Salud / Estética",
  "Empaque de Fruta / Manzana",
  "Gastronomía & Restorán",
  "Ferretería Industrial",
  "Logística & Transporte"
];

// Pipeline tracker custom action tasks checklist preset
const DEFAULT_CHECKLIST = [
  { id: "task-1", text: "Buscar 5 nuevos prospectos locales de acopio o logística", checked: false },
  { id: "task-2", text: "Investigar señales de compra de los top 3 leads", checked: false },
  { id: "task-3", text: "Calificar con MEDDIC los contactos en etapa 'Propuesta'", checked: true },
  { id: "task-4", text: "Generar secuencias de outreach personalizadas", checked: false },
  { id: "task-5", text: "Enviar correos de seguimiento a leads fríos", checked: false }
];

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  "";
const hasValidKey = Boolean(API_KEY) && API_KEY !== "YOUR_API_KEY" && API_KEY.trim() !== "";

export default function SalesProspectorDashboard({
  brochureData,
  hidePrices,
  onBack,
  onLogout,
  currentUsername,
  currentUserRole = "user",
  onChangeDeals,
  onChangeBrochureData,
  colorTheme = "navy",
  onThemeChange,
  contactInfo,
  onContactChange,
  activePreset = "clientum_completo",
  onPresetChange,
  customTemplates = [],
  onSaveTemplate,
  onDeleteTemplate,
  onHidePricesChange,
  hideChatbot = false,
  onHideChatbotChange,
  showAllPages = false,
  onShowAllPagesChange,
  selectedPage = 1,
  onSelectedPageChange,
  onPrint,
  onExportPDF,
  onResetBrochure
}: SalesProspectorDashboardProps) {
  // currentUserRole is kept in the prop signature for future server-enforced
  // admin-only actions inside this dashboard; the nav itself is shown to all.
  void currentUserRole;
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<
    "pipeline" | "icp" | "research" | "meddic" | "outreach" |
    "products" | "sellers" | "branches" | "conversations" | "bot" |
    "brochure" | "config" | "pages" | "ai" | "activity" | "quickcreate"
  >("config");
  // "CRM Completo" reorganizado: barra horizontal de categorías (arriba) + menú vertical (izquierda)
  // Single unified navigation — all tools in one sidebar, no category switcher.
  const NAV_ITEMS = [
    { id: "pipeline" as const, label: "CRM Pipeline", icon: Compass },
    { id: "products" as const, label: "Productos", icon: Package },
    { id: "sellers" as const, label: "Vendedores", icon: Users },
    { id: "branches" as const, label: "Sucursales", icon: Building2 },
    { id: "icp" as const, label: "ICP Builder", desc: "Definí tu cliente ideal", icon: Target },
    { id: "research" as const, label: "Patagonia Explorer", desc: "Buscá y calificá leads reales", icon: Search },
    { id: "meddic" as const, label: "Calificación MEDDIC", desc: "Auditá el potencial de cada lead", icon: Award },
    { id: "outreach" as const, label: "Outreach Campaigns", desc: "Generá campañas de contacto", icon: Mail },
    { id: "conversations" as const, label: "Conversaciones", icon: MessageSquare },
    { id: "bot" as const, label: "Bot", icon: Bot },
    { id: "brochure" as const, label: "Brochure", icon: FileText },
    { id: "config" as const, label: "Configuración", icon: Sliders },
    { id: "pages" as const, label: "Contenido", icon: Edit3 },
    { id: "ai" as const, label: "Copiloto IA", icon: Sparkles },
    { id: "activity" as const, label: "Actividad", icon: Clock },
    { id: "quickcreate" as const, label: "Creación Rápida", icon: PlusCircle },
  ];
  const brochureActivePages = hideChatbot ? [1, 2, 4, 6, 7, 8] : [1, 2, 3, 4, 5, 6, 7, 8];
  const resolvedContactInfo = contactInfo || {
    website: "clientum.com.ar",
    email: "info@clientum.com.ar",
    phone: "+54 9 298 451-0883",
    address: "General Roca, Río Negro, Argentina",
    github: "",
  };

  // User custom Google Maps Key
  const [customApiKey, setCustomApiKey] = useState<string>(() => localStorage.getItem("custom_google_maps_key") || "");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [modalKeyInput, setModalKeyInput] = useState(() => localStorage.getItem("custom_google_maps_key") || "");
  const [isValidatingKey, setIsValidatingKey] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState<boolean>(false);

  const isKeyActive = Boolean(customApiKey) && customApiKey !== "YOUR_API_KEY" && customApiKey.trim() !== "";
  const hasActiveValidKey = hasValidKey || isKeyActive;

  // CRM deals management — shared across every tab (Pipeline, Patagonia
  // Explorer, Creación Rápida, Actividad) via the sharedStore event bus.
  const [deals, setDeals] = useState<CRMDeal[]>(() => {
    if (brochureData?.crm?.deals && brochureData.crm.deals.length > 0) {
      return brochureData.crm.deals;
    }
    const saved = loadDeals();
    if (saved.length > 0) return saved;
    return INITIAL_DEALS;
  });

  // Track state and changes
  useEffect(() => {
    saveDeals(deals);
    if (onChangeDeals) {
      onChangeDeals(deals);
    }
  }, [deals]);

  // Live-sync: pick up deals created/edited from other tabs (e.g. Creación
  // Rápida) without requiring a full page reload.
  useEffect(() => {
    const handleExternalDealsUpdate = (e: Event) => {
      const updated = (e as CustomEvent<CRMDeal[]>).detail ?? loadDeals();
      setDeals((prev) => (JSON.stringify(prev) !== JSON.stringify(updated) ? updated : prev));
    };
    window.addEventListener(DEALS_EVENT, handleExternalDealsUpdate);
    return () => window.removeEventListener(DEALS_EVENT, handleExternalDealsUpdate);
  }, []);

  // ICP Builder States
  const [icpIndustry, setIcpIndustry] = useState("Distribuidora Mayorista");
  const [icpCustomIndustry, setIcpCustomIndustry] = useState("");
  const [icpAcv, setIcpAcv] = useState("$180.000 ARS/mes");
  const [icpLoading, setIcpLoading] = useState(false);
  const [icpResult, setIcpResult] = useState<any>(() => {
    const saved = localStorage.getItem("clientum_icp_data");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return null;
  });

  // Research & Discovery States
  const [searchProv, setSearchProv] = useState<"RN" | "NQ">("RN");
  const [searchCity, setSearchCity] = useState("General Roca");
  const [searchIndustry, setSearchIndustry] = useState("Distribuidora Mayorista");
  const [searchCustom, setSearchCustom] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [enrichingIds, setEnrichingIds] = useState<Set<number>>(new Set());
  const [addedProspectNames, setAddedProspectNames] = useState<string[]>([]);
  const [researchingLeadId, setResearchingLeadId] = useState<string | null>(null);

  // Dynamic filter states for Google Places API search results
  const [filterDistance, setFilterDistance] = useState<string>("any"); // "any" | "2" | "5" | "10"
  const [filterPrice, setFilterPrice] = useState<string>("any"); // "any" | "1" | "2" | "3"
  const [filterMinRating, setFilterMinRating] = useState<string>("any"); // "any" | "3.5" | "4.0" | "4.5"

  // Selected prospect for active map highlighting/embed details
  const [selectedProspectIndex, setSelectedProspectIndex] = useState<number>(0);

  // Derived state: Filtered Search Results
  const filteredSearchResults = searchResults.filter((p) => {
    // Distance filter
    if (filterDistance !== "any") {
      const maxDistance = parseFloat(filterDistance);
      if (p.distance && p.distance > maxDistance) return false;
    }
    // Price filter
    if (filterPrice !== "any") {
      const targetPrice = parseInt(filterPrice, 10);
      if (p.priceLevel && p.priceLevel !== targetPrice) return false;
    }
    // Min Rating filter
    if (filterMinRating !== "any") {
      const minRating = parseFloat(filterMinRating);
      if (!p.rating || p.rating < minRating) return false;
    }
    return true;
  });

  const [detailedResearchMap, setDetailedResearchMap] = useState<Record<string, any>>(() => {
    const saved = localStorage.getItem("clientum_detailed_research");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {};
  });

  // MEDDIC States
  const [selectedMeddicLeadId, setSelectedMeddicLeadId] = useState<string>("");
  const [meddicMetrics, setMeddicMetrics] = useState<number>(3);
  const [meddicBuyer, setMeddicBuyer] = useState<number>(3);
  const [meddicCriteria, setMeddicCriteria] = useState<number>(3);
  const [meddicProcess, setMeddicProcess] = useState<number>(3);
  const [meddicPain, setMeddicPain] = useState<number>(3);
  const [meddicChampion, setMeddicChampion] = useState<number>(3);
  const [meddicRedFlags, setMeddicRedFlags] = useState<string>("");

  // Outreach Sequence States
  const [selectedOutreachLeadId, setSelectedOutreachLeadId] = useState<string>("");
  const [outreachLoading, setOutreachLoading] = useState(false);
  const [activeOutreachSubTab, setActiveOutreachSubTab] = useState<"email1" | "email2" | "email3" | "linkedin" | "phone">("email1");
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  const [showFallbackBanner, setShowFallbackBanner] = useState<string | null>(null);

  // Pipeline checklist state
  const [checklist, setChecklist] = useState<{ id: string; text: string; checked: boolean }[]>(() => {
    const saved = localStorage.getItem("clientum_pipeline_checklist");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_CHECKLIST;
  });

  useEffect(() => {
    localStorage.setItem("clientum_pipeline_checklist", JSON.stringify(checklist));
  }, [checklist]);

  // Adjust city default when province changes
  useEffect(() => {
    if (searchProv === "RN") {
      setSearchCity(CITIES_RN[0]);
    } else {
      setSearchCity(CITIES_NQ[0]);
    }
  }, [searchProv]);

  // Handle manual lead form in pipeline
  const [showAddForm, setShowAddForm] = useState(false);
  const [addCompany, setAddCompany] = useState("");
  const [addAmount, setAddAmount] = useState("");
  const [addIndustry, setAddIndustry] = useState("Distribuidora Mayorista");
  const [addContact, setAddContact] = useState("");
  const [addPhone, setAddPhone] = useState("");
  const [addStage, setAddStage] = useState<CRMDeal["stage"]>("leads");

  const handleAddDealManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addCompany.trim()) return;

    const parsedAmount = parseFloat(addAmount) || 180000;
    const newDeal: CRMDeal = {
      id: "deal-" + Date.now(),
      company: addCompany.trim(),
      amount: parsedAmount,
      industry: addIndustry,
      stage: addStage,
      contact: addContact.trim() || "Contacto Directo",
      phone: addPhone.trim() || "+54 298 443-1205",
      painPoint: "Falta de seguimiento en consultas e integraciones de WhatsApp",
      meddicMetrics: 3,
      meddicBuyer: 2,
      meddicCriteria: 3,
      meddicProcess: 2,
      meddicPain: 4,
      meddicChampion: 1,
      meddicScore: 40,
      meddicRedFlags: "Aún no se ha identificado un Champion clave dentro de la PyME.",
      meddicNextActions: ["Identificar al Champion clave", "Coordinar llamada de diagnóstico comercial"]
    };

    setDeals((prev) => [newDeal, ...prev]);
    setAddCompany("");
    setAddAmount("");
    setAddContact("");
    setAddPhone("");
    setShowAddForm(false);
  };

  // Move deal stages
  const moveDeal = (id: string, direction: "next" | "prev") => {
    const stages: CRMDeal["stage"][] = ["leads", "bot_contact", "proposed", "closed"];
    let movedDeal: CRMDeal | null = null;
    setDeals((prev) =>
      prev.map((deal) => {
        if (deal.id !== id) return deal;
        const currentIndex = stages.indexOf(deal.stage);
        let nextIndex = currentIndex;
        if (direction === "next" && currentIndex < stages.length - 1) {
          nextIndex = currentIndex + 1;
        } else if (direction === "prev" && currentIndex > 0) {
          nextIndex = currentIndex - 1;
        }
        movedDeal = { ...deal, stage: stages[nextIndex] };
        return movedDeal;
      })
    );
    if (movedDeal) {
      addActivity({ type: "stage", title: `"${movedDeal.company}" pasó a la etapa "${movedDeal.stage}"` });
    }
  };

  const handleDeleteDeal = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este prospecto del CRM?")) {
      setDeals((prev) => prev.filter((d) => d.id !== id));
      if (selectedMeddicLeadId === id) setSelectedMeddicLeadId("");
      if (selectedOutreachLeadId === id) setSelectedOutreachLeadId("");
    }
  };

  // Run AI ICP Builder
  const handleGenerateICP = async () => {
    setIcpLoading(true);
    const selectedInd = icpCustomIndustry.trim() || icpIndustry;
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "buildICP",
          payload: { industry: selectedInd, acv: icpAcv }
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      if (data.result) {
        setIcpResult(data.result);
        localStorage.setItem("clientum_icp_data", JSON.stringify(data.result));
        if (data.isFallback) {
          setShowFallbackBanner("Se ha utilizado el Generador de ICP alternativo de Clientum debido a alta demanda en la API de Gemini.");
        } else {
          setShowFallbackBanner(null);
        }
      }
    } catch (e: any) {
      console.error(e);
      alert("Error al generar el ICP: " + e.message);
    } finally {
      setIcpLoading(false);
    }
  };

  // Run AI Prospect Discovery Search
  const handleSearchProspects = async () => {
    setSearchLoading(true);
    setSearchResults([]);
    const selectedInd = searchIndustry === "OTRO" ? searchCustom.trim() : searchIndustry;
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "prospectLeads",
          payload: { 
            city: searchCity, 
            industry: selectedInd,
            googleMapsPlatformKey: customApiKey 
          }
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      if (data.result && data.result.prospects) {
        const enriched = data.result.prospects.map((p: any, index: number) => {
          const rating = typeof p.rating === "number" ? p.rating : parseFloat((3.5 + (index * 0.33) % 1.5).toFixed(1));
          const priceLevel = p.priceLevel || ((index % 3) + 1);
          const distance = p.distance || parseFloat((0.2 + (index * 1.7) % 9.3).toFixed(1));
          return {
            ...p,
            rating,
            priceLevel,
            distance,
            _idx: index,
          };
        });
        setSearchResults(enriched);
        // Auto-enrich prospects that have a website domain
        autoEnrichProspects(enriched);
        if (data.isRealScraped && data.isGooglePlaces) {
          setShowFallbackBanner("¡Éxito total! Se ha utilizado la API oficial de Google Places para obtener prospectos 100% reales de Google Maps en tiempo real.");
        } else if (data.isRealScraped) {
          setShowFallbackBanner("¡Éxito! Se ha utilizado el motor de scraping de Google Maps real de Clientum (vía Apify) para extraer prospectos activos en tiempo real.");
        } else if (data.isFallback) {
          setShowFallbackBanner("Se ha activado el motor local de prospección inteligente de Clientum por alta demanda en la API de Gemini.");
        } else {
          setShowFallbackBanner(null);
        }
      }
    } catch (e: any) {
      console.error(e);
      alert("Error al prospectar leads: " + e.message);
    } finally {
      setSearchLoading(false);
    }
  };

  // ── Hunter.io enrichment helpers ──────────────────────────────────────────

  const enrichSingleProspect = async (idx: number, domain: string) => {
    setEnrichingIds(prev => new Set(prev).add(idx));
    try {
      const res = await fetch("/api/enrich-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain }),
      });
      const data = await res.json();
      if (data.contacts && data.contacts.length > 0) {
        const best = data.contacts[0]; // highest confidence first
        setSearchResults(prev =>
          prev.map(p =>
            p._idx === idx
              ? {
                  ...p,
                  contact:         best.name,
                  contactEmail:    best.email,
                  contactPosition: best.position,
                  contactLinkedin: best.linkedin ?? null,
                  contactVerified: true,
                  _hunterSource:   true,
                }
              : p
          )
        );
      }
    } catch (e) {
      console.warn("[Enrich] Error for idx", idx, e);
    } finally {
      setEnrichingIds(prev => { const s = new Set(prev); s.delete(idx); return s; });
    }
  };

  const autoEnrichProspects = (prospects: any[]) => {
    // Enrich up to 10 prospects that have a website, staggered to avoid rate limits
    let delay = 0;
    let count = 0;
    for (const p of prospects) {
      if (p.website && count < 10) {
        const idx = p._idx;
        const domain = p.website;
        setTimeout(() => enrichSingleProspect(idx, domain), delay);
        delay += 600; // 600ms between requests
        count++;
      }
    }
  };

  const handleValidateAndSaveKey = async () => {
    if (!modalKeyInput || modalKeyInput.trim() === "") {
      setValidationError("Por favor, ingresa una clave antes de validar.");
      return;
    }

    setIsValidatingKey(true);
    setValidationError(null);
    setValidationSuccess(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "validateGooglePlacesKey",
          payload: { apiKey: modalKeyInput.trim() }
        })
      });

      const data = await response.json();
      if (data.success) {
        setValidationSuccess(true);
        localStorage.setItem("custom_google_maps_key", modalKeyInput.trim());
        setCustomApiKey(modalKeyInput.trim());
      } else {
        setValidationError(data.error || "La clave de API no es válida.");
      }
    } catch (err: any) {
      console.error(err);
      setValidationError("Error de conexión al validar la clave: " + (err.message || err));
    } finally {
      setIsValidatingKey(false);
    }
  };

  const handleRemoveKey = () => {
    localStorage.removeItem("custom_google_maps_key");
    setCustomApiKey("");
    setModalKeyInput("");
    setValidationSuccess(false);
    setValidationError(null);
  };

  const handleDownloadCSV = () => {
    if (filteredSearchResults.length === 0) {
      alert("No hay prospectos para descargar.");
      return;
    }

    // CSV headers
    const headers = [
      "Empresa",
      "Rubro",
      "Monto Sugerido ARS",
      "Ciudad",
      "Provincia",
      "Direccion",
      "Telefono",
      "Contacto",
      "Fit Score",
      "Dolor Diagnosticado",
      "Calificacion Google",
      "Rango de Precio",
      "Distancia km",
      "Link Guia Cores"
    ];

    const rows = filteredSearchResults.map((p) => [
      p.company || "",
      p.industry || "",
      p.amount || 0,
      p.city || "",
      searchProv === "RN" ? "Río Negro" : "Neuquén",
      p.address || "",
      p.phone || "",
      p.contact || "",
      p.score || "",
      p.painPoint || "",
      p.rating || "",
      "$".repeat(p.priceLevel || 1),
      p.distance || "",
      p.guiacoresUrl || ""
    ]);

    // Construct CSV content (including UTF-8 BOM so Spanish accents like "Río Negro" render correctly in Excel)
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row
          .map((val) => {
            const strVal = String(val).replace(/"/g, '""');
            return `"${strVal}"`;
          })
          .join(",")
      )
    ].join("\n");

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Leads_Clientum_${searchCity}_${searchIndustry.replace(/\s+/g, "_")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Run AI Deep Research on specific prospect
  const handleResearchProspect = async (lead: CRMDeal) => {
    setResearchingLeadId(lead.id);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "researchProspect",
          payload: { company: lead.company, industry: lead.industry, city: lead.city || "General Roca" }
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      if (data.result) {
        const report = data.result;
        // Update deal with research findings
        setDeals((prev) =>
          prev.map((d) => {
            if (d.id !== lead.id) return d;
            return {
              ...d,
              contactEmail: report.keyContacts?.[0]?.email,
              contactLinkedIn: report.keyContacts?.[0]?.linkedin,
              contactTitle: report.keyContacts?.[0]?.title,
              buyingSignals: report.buyingSignals,
              fitScore: report.fitScore,
              fitReasoning: report.fitReasoning,
              phone: report.phone || d.phone,
              address: report.address || d.address,
              contact: report.keyContacts?.[0]?.name || d.contact
            };
          })
        );
        
        const newMap = { ...detailedResearchMap, [lead.id]: report };
        setDetailedResearchMap(newMap);
        localStorage.setItem("clientum_detailed_research", JSON.stringify(newMap));
        if (data.isFallback) {
          setShowFallbackBanner("Se ha generado la Ficha de Investigación desde nuestro simulador local debido a alta demanda en la API de Gemini.");
        } else {
          setShowFallbackBanner(null);
        }
      }
    } catch (e: any) {
      console.error(e);
      alert("Error en investigación profunda: " + e.message);
    } finally {
      setResearchingLeadId(null);
    }
  };

  // Run AI Outreach Sequence Generator
  const handleGenerateOutreach = async (lead: CRMDeal) => {
    setOutreachLoading(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generateOutreach",
          payload: {
            company: lead.company,
            contact: lead.contact || "Socio Gerente",
            title: lead.contactTitle || "Gerente",
            industry: lead.industry,
            painPoint: lead.painPoint || "Falta de seguimiento comercial automático"
          }
        })
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      if (data.result) {
        const r = data.result;
        setDeals((prev) =>
          prev.map((d) => {
            if (d.id !== lead.id) return d;
            return {
              ...d,
              outreachEmail1: r.email1Body,
              outreachEmail2: r.email2Body,
              outreachEmail3: r.email3Body,
              outreachLinkedIn: r.linkedinSequence,
              outreachPhoneScript: r.phoneScript
            };
          })
        );
        if (data.isFallback) {
          setShowFallbackBanner("Se ha generado la Campaña de Outreach usando nuestra base de plantillas locales optimizadas por alta demanda en la API de Gemini.");
        } else {
          setShowFallbackBanner(null);
        }
      }
    } catch (e: any) {
      console.error(e);
      alert("Error al generar campaña de outreach: " + e.message);
    } finally {
      setOutreachLoading(false);
    }
  };

  // Trigger MEDDIC qualification updates
  useEffect(() => {
    if (!selectedMeddicLeadId) return;
    const lead = deals.find((d) => d.id === selectedMeddicLeadId);
    if (lead) {
      setMeddicMetrics(lead.meddicMetrics || 3);
      setMeddicBuyer(lead.meddicBuyer || 3);
      setMeddicCriteria(lead.meddicCriteria || 3);
      setMeddicProcess(lead.meddicProcess || 3);
      setMeddicPain(lead.meddicPain || 3);
      setMeddicChampion(lead.meddicChampion || 3);
      setMeddicRedFlags(lead.meddicRedFlags || "");
    }
  }, [selectedMeddicLeadId]);

  const handleSaveMeddic = () => {
    if (!selectedMeddicLeadId) return;
    
    // Custom MEDDIC scoring algorithm (sum of criteria * 3.33)
    const rawSum = meddicMetrics + meddicBuyer + meddicCriteria + meddicProcess + meddicPain + meddicChampion;
    const score = Math.round((rawSum / 30) * 100);

    // Generate smart suggestions based on weak links
    const nextActions: string[] = [];
    if (meddicMetrics < 3) nextActions.push("Cuantificar el ROI estimando el valor del contrato frente a horas ahorradas");
    if (meddicBuyer < 3) nextActions.push("Encontrar el contacto directo del Economic Buyer (Dueño o Socio Gerente)");
    if (meddicCriteria < 3) nextActions.push("Alinear la propuesta técnica de Clientum con los criterios de compra definidos");
    if (meddicProcess < 3) nextActions.push("Presentar una demo de 15 minutos de WhatsApp Bot para acelerar el proceso de decisión");
    if (meddicPain < 4) nextActions.push("Confirmar si el dolor de atención lenta en WhatsApp realmente le preocupa a la gerencia");
    if (meddicChampion < 3) nextActions.push("Fidelizar a un líder de ventas interno que defienda Clientum ante el dueño");

    if (nextActions.length === 0) {
      nextActions.push("Enviar propuesta comercial formal Clase A", "Agendar llamada de cierre", "Iniciar onboarding técnico");
    }

    setDeals((prev) =>
      prev.map((d) => {
        if (d.id !== selectedMeddicLeadId) return d;
        return {
          ...d,
          meddicMetrics,
          meddicBuyer,
          meddicCriteria,
          meddicProcess,
          meddicPain,
          meddicChampion,
          meddicScore: score,
          meddicRedFlags: meddicRedFlags || (score < 50 ? "Bajo puntaje de calificación — riesgo alto de estancamiento del negocio." : "Sin alertas graves detectadas."),
          meddicNextActions: nextActions
        };
      })
    );

    alert("¡Calificación MEDDIC actualizada y guardada con éxito!");
  };

  // Copy helper
  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  // Add prospected lead to active deals
  const handleAddProspectedLead = (p: any) => {
    const newDeal: CRMDeal = {
      id: "deal-prospect-" + Date.now() + "-" + Math.floor(Math.random() * 1000),
      company: p.company,
      amount: p.amount || 180000,
      industry: p.industry || searchIndustry,
      stage: "leads",
      city: p.city || searchCity,
      address: p.address,
      phone: p.phone,
      contact: p.contact,
      painPoint: p.painPoint,
      guiacoresUrl: p.guiacoresUrl,
      meddicMetrics: p.score >= 8 ? 4 : 3,
      meddicBuyer: 2,
      meddicCriteria: 3,
      meddicProcess: 2,
      meddicPain: 5,
      meddicChampion: 1,
      meddicScore: 50,
      meddicRedFlags: "Nuevo prospecto. Falta calificar el comprador económico y champion.",
      meddicNextActions: ["Coordinar contacto inicial vía WhatsApp", "Presentar demo interactiva"]
    };

    setDeals((prev) => [newDeal, ...prev]);
    setAddedProspectNames((prev) => [...prev, p.company]);
  };

  // Pipeline math
  const totalPipelineVal = deals.reduce((acc, curr) => acc + curr.amount, 0);
  const closedVal = deals.filter((d) => d.stage === "closed").reduce((acc, curr) => acc + curr.amount, 0);
  const activeLeadsCount = deals.filter((d) => d.stage !== "closed").length;
  const closedCount = deals.filter((d) => d.stage === "closed").length;

  const getMEDDICStatusColor = (score: number) => {
    if (score >= 75) return "bg-emerald-100 text-emerald-800 border-emerald-250";
    if (score >= 45) return "bg-amber-100 text-amber-800 border-amber-250";
    return "bg-red-100 text-red-800 border-red-250";
  };

  const getMEDDICStatusLabel = (score: number) => {
    if (score >= 75) return "HOT 🔥 (Alta Conversión)";
    if (score >= 45) return "WARM ⚡ (Medianamente Calificado)";
    return "COLD ❄ (Baja Calificación)";
  };

  // CSV Exporter
  const handleExportToCSV = () => {
    if (!deals || deals.length === 0) {
      alert("No hay contactos registrados en el CRM para exportar.");
      return;
    }
    const headers = [
      "ID", "Empresa", "Monto_ARS", "Etapa_CRM", "Rubro", "Ciudad", "Direccion", "Telefono", "Contacto", "Dolor_Atencion", "MEDDIC_Score"
    ];
    const rows = deals.map((d) => [
      d.id,
      `"${d.company.replace(/"/g, '""')}"`,
      d.amount,
      `"${d.stage}"`,
      `"${d.industry.replace(/"/g, '""')}"`,
      `"${(d.city || "").replace(/"/g, '""')}"`,
      `"${(d.address || "").replace(/"/g, '""')}"`,
      `"${(d.phone || "").replace(/"/g, '""')}"`,
      `"${(d.contact || "").replace(/"/g, '""')}"`,
      `"${(d.painPoint || "").replace(/"/g, '""')}"`,
      d.meddicScore || 0
    ]);
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "ai_client_prospector_pipeline.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 relative animate-fadeIn h-full">
      {/* Top Professional Header */}
      <div className="bg-slate-900 border-b border-slate-800 text-white px-6 py-4 flex items-center justify-between no-print z-10 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-900/30">
            <Target className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-extrabold tracking-tight">AI CLIENT PROSPECTOR</h2>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono uppercase tracking-widest">
                v2.0 PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Sistema integral de prospección B2B, calificación MEDDIC y automatización de outreach en la Patagonia.
            </p>
          </div>
        </div>

        {/* Back and CSV triggers */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportToCSV}
            className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-slate-300"
          >
            <FileDown className="w-3.5 h-3.5 text-blue-400" />
            Exportar CSV
          </button>
          {onBack && (
            <button
              onClick={onBack}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
            >
              Volver al Editor
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          {onLogout && (
            <button
              onClick={onLogout}
              title={currentUsername ? `Sesión: ${currentUsername}` : undefined}
              className="bg-slate-800 hover:bg-red-900/60 border border-slate-700 hover:border-red-800 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all text-slate-300"
            >
              <Lock className="w-3.5 h-3.5" />
              Cerrar sesión
            </button>
          )}
        </div>
      </div>

      {showFallbackBanner && (
        <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-2.5 flex items-center justify-between gap-4 text-emerald-800 text-xs font-semibold animate-fadeIn no-print">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse flex-shrink-0" />
            <span>
              <strong>Resiliencia de Clientum:</strong> {showFallbackBanner}
            </span>
          </div>
          <button 
            onClick={() => setShowFallbackBanner(null)}
            className="text-emerald-500 hover:text-emerald-800 font-bold transition-all px-2 py-0.5 hover:bg-emerald-100 rounded text-sm cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Cuerpo: menú vertical unificado + contenido */}
      <div className="flex-1 flex overflow-hidden">
        <aside className="w-56 bg-white border-r border-slate-200 overflow-y-auto flex-shrink-0 no-print py-3 px-2">
          <div className="px-2.5 pb-2 mb-1 border-b border-slate-100 flex items-center gap-1.5 text-slate-400">
            <Compass className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider font-mono">Pipeline, Prospección &amp; Comunicación</span>
          </div>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full text-left px-2.5 py-2 rounded-lg flex items-start gap-2.5 transition-colors cursor-pointer mb-0.5 ${
                activeTab === item.id ? "bg-emerald-50" : "hover:bg-slate-50"
              }`}
            >
              <item.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${activeTab === item.id ? "text-emerald-600" : "text-slate-400"}`} />
              <span>
                <span className={`block text-xs font-bold ${activeTab === item.id ? "text-emerald-700" : "text-slate-700"}`}>{item.label}</span>
                {"desc" in item && item.desc && <span className="block text-[10px] text-slate-400">{item.desc}</span>}
              </span>
            </button>
          ))}
        </aside>

      {/* Main Interactive Screen Content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col">
        
        {/* TAB 1: PIPELINE & SALES TRACKER DASHBOARD */}
        {activeTab === "pipeline" && (
          <div className="flex flex-col gap-6 h-full max-w-7xl mx-auto w-full">
            
            {/* Executive Pipeline Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider font-mono">Valor Total Pipeline</span>
                  <h3 className="text-xl font-black text-slate-800 mt-0.5">${totalPipelineVal.toLocaleString("es-AR")} ARS</h3>
                </div>
              </div>

              <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider font-mono">Facturación Ganada</span>
                  <h3 className="text-xl font-black text-emerald-800 mt-0.5">${closedVal.toLocaleString("es-AR")} ARS</h3>
                </div>
              </div>

              <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider font-mono">Prospectos Activos</span>
                  <h3 className="text-xl font-black text-indigo-800 mt-0.5">{activeLeadsCount} Leads</h3>
                </div>
              </div>

              <div className="bg-white border border-slate-200 shadow-xs rounded-xl p-4 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider font-mono">Tasa de Conversión</span>
                  <h3 className="text-xl font-black text-amber-800 mt-0.5">
                    {deals.length > 0 ? Math.round((closedCount / deals.length) * 100) : 0}% Win-Rate
                  </h3>
                </div>
              </div>
            </div>

            {/* Main Interactive Grid: Kanban + Actions Checklist */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              
              {/* Kanban Pipeline Column Board (Occupies 3 cols) */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-l-3 border-emerald-500 pl-2">
                    Tablero Kanban de Ventas v2.0
                  </h3>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-slate-900 hover:bg-slate-850 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo Lead Manual
                  </button>
                </div>

                {showAddForm && (
                  <form onSubmit={handleAddDealManual} className="bg-white border border-slate-250 rounded-xl p-4 flex flex-col gap-3 shadow-md animate-fadeIn max-w-xl">
                    <h4 className="text-xs font-extrabold text-slate-800 border-b border-slate-100 pb-2 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-500" />
                      Registrar Nuevo Prospecto Comercial
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Empresa</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Distribuidora Comahue"
                          value={addCompany}
                          onChange={(e) => setAddCompany(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Valor Estimado (ARS)</label>
                        <input
                          type="number"
                          placeholder="Ej. 180000"
                          value={addAmount}
                          onChange={(e) => setAddAmount(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Contacto Directo</label>
                        <input
                          type="text"
                          placeholder="Ej. Marcos Ramirez (Dueño)"
                          value={addContact}
                          onChange={(e) => setAddContact(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Teléfono Local</label>
                        <input
                          type="text"
                          placeholder="Ej. +54 298 4432120"
                          value={addPhone}
                          onChange={(e) => setAddPhone(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500 focus:bg-white"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Rubro Comercial</label>
                        <select
                          value={addIndustry}
                          onChange={(e) => setAddIndustry(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                        >
                          {INDUSTRIES_PRESET.map((i) => (
                            <option key={i} value={i}>{i}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Etapa del Embudo</label>
                        <select
                          value={addStage}
                          onChange={(e) => setAddStage(e.target.value as any)}
                          className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none focus:border-emerald-500"
                        >
                          <option value="leads">Nuevos Leads (Prospectos)</option>
                          <option value="bot_contact">Bot Calificador Whatsapp</option>
                          <option value="proposed">Propuesta Presentada</option>
                          <option value="closed">Venta Cerrada (Ganado)</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="text-slate-500 hover:text-slate-800 text-xs font-bold px-3 py-2"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg"
                      >
                        Guardar Lead
                      </button>
                    </div>
                  </form>
                )}

                {/* The Kanban Board Layout */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                  
                  {/* Column 1: Leads */}
                  <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200 flex flex-col gap-3 min-h-[450px]">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-extrabold text-slate-700 font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                        Nuevos Leads
                      </span>
                      <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        {deals.filter((d) => d.stage === "leads").length}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-0.5 scrollbar-thin">
                      {deals.filter((d) => d.stage === "leads").map((deal) => (
                        <div key={deal.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-xs flex flex-col gap-2 hover:border-blue-400 transition-all border-l-3 border-l-blue-400">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-[11px] font-bold text-slate-800">{deal.company}</h5>
                              <span className="text-[9px] text-slate-400 font-medium">{deal.industry}</span>
                            </div>
                            <button onClick={() => handleDeleteDeal(deal.id)} className="text-slate-300 hover:text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <div className="text-[10px] text-slate-500 flex flex-col gap-0.5 mt-1 border-t border-slate-100 pt-1.5">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{deal.contact}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span className="font-mono">{deal.phone}</span>
                            </div>
                          </div>

                          <div className="flex justify-between items-center mt-2 border-t border-slate-100 pt-2">
                            <span className="text-xs font-black text-slate-700 font-mono">${deal.amount.toLocaleString("es-AR")}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => { setSelectedMeddicLeadId(deal.id); setActiveTab("meddic"); }}
                                className="bg-slate-50 hover:bg-slate-100 text-slate-500 text-[9px] font-extrabold px-1.5 py-0.5 rounded border border-slate-200 font-mono"
                                title="Calificar MEDDIC"
                              >
                                MEDDIC: {deal.meddicScore || 0}%
                              </button>
                              <button
                                onClick={() => moveDeal(deal.id, "next")}
                                className="bg-slate-900 hover:bg-black text-white p-1 rounded transition-colors"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 2: Whatsapp Bot Contact */}
                  <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200 flex flex-col gap-3 min-h-[450px]">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-extrabold text-slate-700 font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                        WhatsApp Bot
                      </span>
                      <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        {deals.filter((d) => d.stage === "bot_contact").length}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-0.5 scrollbar-thin">
                      {deals.filter((d) => d.stage === "bot_contact").map((deal) => (
                        <div key={deal.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-xs flex flex-col gap-2 hover:border-emerald-400 transition-all border-l-3 border-l-emerald-400">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-[11px] font-bold text-slate-800">{deal.company}</h5>
                              <span className="text-[9px] text-slate-400 font-medium">{deal.industry}</span>
                            </div>
                            <button onClick={() => handleDeleteDeal(deal.id)} className="text-slate-300 hover:text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <div className="text-[9px] bg-emerald-50 text-emerald-800 p-1.5 rounded-md border border-emerald-100 font-sans mt-1">
                            <strong className="block font-bold">Respuesta del Bot de WhatsApp:</strong>
                            <p className="mt-0.5 leading-relaxed text-slate-700 italic">"Hola! Registramos tu interés en la propuesta para el rubro..."</p>
                          </div>

                          <div className="flex justify-between items-center mt-2 border-t border-slate-100 pt-2">
                            <span className="text-xs font-black text-slate-700 font-mono">${deal.amount.toLocaleString("es-AR")}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => moveDeal(deal.id, "prev")}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-1 rounded transition-colors"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => { setSelectedOutreachLeadId(deal.id); setActiveTab("outreach"); }}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono"
                              >
                                Outreach
                              </button>
                              <button
                                onClick={() => moveDeal(deal.id, "next")}
                                className="bg-slate-900 hover:bg-black text-white p-1 rounded transition-colors"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 3: Proposal/Proposed */}
                  <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200 flex flex-col gap-3 min-h-[450px]">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-extrabold text-slate-700 font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full"></span>
                        Propuesta
                      </span>
                      <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        {deals.filter((d) => d.stage === "proposed").length}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-0.5 scrollbar-thin">
                      {deals.filter((d) => d.stage === "proposed").map((deal) => (
                        <div key={deal.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-xs flex flex-col gap-2 hover:border-indigo-400 transition-all border-l-3 border-l-indigo-400">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-[11px] font-bold text-slate-800">{deal.company}</h5>
                              <span className="text-[9px] text-slate-400 font-medium">{deal.industry}</span>
                            </div>
                            <button onClick={() => handleDeleteDeal(deal.id)} className="text-slate-300 hover:text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          
                          {deal.meddicScore ? (
                            <div className={`text-[9px] p-1.5 rounded border ${getMEDDICStatusColor(deal.meddicScore)} font-semibold`}>
                              MEDDIC: {deal.meddicScore}% ({deal.meddicScore >= 75 ? "HOT" : "WARM"})
                            </div>
                          ) : (
                            <div className="text-[9px] bg-amber-50 text-amber-800 p-1.5 rounded border border-amber-100 italic">
                              ⚠️ Requiere calificación MEDDIC para avanzar con seguridad.
                            </div>
                          )}

                          <div className="flex justify-between items-center mt-2 border-t border-slate-100 pt-2">
                            <span className="text-xs font-black text-slate-700 font-mono">${deal.amount.toLocaleString("es-AR")}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => moveDeal(deal.id, "prev")}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-1 rounded transition-colors"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => { setSelectedMeddicLeadId(deal.id); setActiveTab("meddic"); }}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded font-mono"
                              >
                                Score
                              </button>
                              <button
                                onClick={() => moveDeal(deal.id, "next")}
                                className="bg-slate-900 hover:bg-black text-white p-1 rounded transition-colors"
                              >
                                <ArrowRight className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column 4: Closed Won */}
                  <div className="bg-slate-100/80 rounded-xl p-3 border border-slate-200 flex flex-col gap-3 min-h-[450px]">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <span className="text-xs font-extrabold text-slate-700 font-mono uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 bg-emerald-600 rounded-full"></span>
                        Ganados (Closed)
                      </span>
                      <span className="bg-slate-200 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                        {deals.filter((d) => d.stage === "closed").length}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-0.5 scrollbar-thin">
                      {deals.filter((d) => d.stage === "closed").map((deal) => (
                        <div key={deal.id} className="bg-white border border-slate-200 p-3 rounded-lg shadow-xs flex flex-col gap-2 hover:border-emerald-600 transition-all border-l-3 border-l-emerald-600">
                          <div className="flex justify-between items-start">
                            <div>
                              <h5 className="text-[11px] font-bold text-slate-800">{deal.company}</h5>
                              <span className="text-[9px] text-slate-400 font-medium">{deal.industry}</span>
                            </div>
                            <button onClick={() => handleDeleteDeal(deal.id)} className="text-slate-300 hover:text-red-500">
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          
                          <div className="text-[9px] bg-emerald-100 text-emerald-800 p-1.5 rounded-md border border-emerald-250 font-semibold flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" />
                            Facturado & AFIP Clase A
                          </div>

                          <div className="flex justify-between items-center mt-2 border-t border-slate-100 pt-2">
                            <span className="text-xs font-black text-slate-800 font-mono">${deal.amount.toLocaleString("es-AR")}</span>
                            <div className="flex gap-1">
                              <button
                                onClick={() => moveDeal(deal.id, "prev")}
                                className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-1 rounded transition-colors"
                              >
                                <ArrowLeft className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Sidebar Action Center / Top Movers & Checklist (1 Column) */}
              <div className="flex flex-col gap-6">
                
                {/* Pipeline Health & Recommendations */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                    <Lightbulb className="w-4.5 h-4.5 text-amber-500" />
                    Recomendaciones Estratégicas
                  </h4>
                  <div className="flex flex-col gap-2.5 mt-3">
                    {deals.filter((d) => d.stage === "proposed" && !d.meddicScore).length > 0 && (
                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5 text-[10px] text-amber-900 leading-relaxed">
                        <strong className="block font-bold">Alerta de Riesgo Comercial</strong>
                        Hay propuestas presentadas sin puntuación de calificación MEDDIC. Evaluá sus tomadores de decisiones para evitar perder oportunidades.
                      </div>
                    )}
                    {deals.filter((d) => d.stage === "leads").length >= 4 && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-2.5 text-[10px] text-blue-900 leading-relaxed">
                        <strong className="block font-bold">Cuello de Botella en Entrada</strong>
                        Tenés muchos prospectos en etapa inicial de 'Leads'. Activá el bot de WhatsApp calificador para agilizar el contacto automático.
                      </div>
                    )}
                    <div className="bg-slate-50 border border-slate-150 rounded-lg p-2.5 text-[10px] text-slate-600 leading-relaxed">
                      <strong className="block font-bold">Tip de Conversión Patagónico</strong>
                      Ofrecer precios transparentes en pesos acelera el paso de WhatsApp Bot a Propuesta técnica en un 35% en Río Negro y Neuquén.
                    </div>
                  </div>
                </div>

                {/* Top Movers (This week) */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                    <TrendingUp className="w-4.5 h-4.5 text-emerald-500" />
                    Top Movers & Alertas
                  </h4>
                  <div className="flex flex-col gap-2.5 mt-3">
                    {deals.slice(0, 3).map((deal, idx) => (
                      <div key={idx} className="flex justify-between items-center text-[11px] border-b border-slate-50 pb-1.5 last:border-0 last:pb-0">
                        <div className="truncate">
                          <strong className="font-bold text-slate-850 block truncate">{deal.company}</strong>
                          <span className="text-[10px] text-slate-400 capitalize">{deal.stage.replace('_', ' ')}</span>
                        </div>
                        <span className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-extrabold text-[10px]">
                          ${deal.amount.toLocaleString("es-AR")}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sales Pipeline Weekly Actions Checklist */}
                <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <span className="flex items-center gap-1.5">
                      <CheckSquare className="w-4.5 h-4.5 text-blue-500" />
                      Weekly Action Checklist
                    </span>
                    <span className="text-[9px] font-mono text-slate-400">
                      {checklist.filter((t) => t.checked).length}/{checklist.length} done
                    </span>
                  </h4>
                  <div className="flex flex-col gap-2 mt-3">
                    {checklist.map((task) => (
                      <button
                        key={task.id}
                        onClick={() => {
                          setChecklist((prev) =>
                            prev.map((t) => (t.id === task.id ? { ...t, checked: !t.checked } : t))
                          );
                        }}
                        className="flex items-start gap-2 text-left text-[11px] hover:bg-slate-50 p-1 rounded transition-colors group cursor-pointer"
                      >
                        {task.checked ? (
                          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <div className="w-4 h-4 border border-slate-300 rounded flex-shrink-0 mt-0.5 group-hover:border-emerald-500"></div>
                        )}
                        <span className={`leading-snug ${task.checked ? "line-through text-slate-400" : "text-slate-700"}`}>
                          {task.text}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: IDEAL CUSTOMER PROFILE BUILDER */}
        {activeTab === "icp" && (
          <div className="flex-1 max-w-4xl mx-auto w-full flex flex-col gap-6">
            
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
              <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Target className="w-5 h-5 text-emerald-600" />
                Ideal Customer Profile (ICP) Builder
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mb-6">
                Definí tu cliente ideal para alinear tus esfuerzos comerciales. La IA analizará la facturación de tu público objetivo, el tamaño corporativo y los tomadores de decisiones para generar un perfil MEDDIC detallado en segundos.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-100 pb-5 mb-5 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Rubro de la Empresa</label>
                  <select
                    value={icpIndustry}
                    onChange={(e) => {
                      setIcpIndustry(e.target.value);
                      if (e.target.value !== "OTRO") setIcpCustomIndustry("");
                    }}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none"
                  >
                    {INDUSTRIES_PRESET.map((i) => (
                      <option key={i} value={i}>{i}</option>
                    ))}
                    <option value="OTRO">Otro rubro personalizado...</option>
                  </select>
                </div>

                {icpIndustry === "OTRO" && (
                  <div className="flex flex-col gap-1.5 animate-fadeIn">
                    <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Rubro Personalizado</label>
                    <input
                      type="text"
                      placeholder="Ej. Veterinaria o Taller"
                      value={icpCustomIndustry}
                      onChange={(e) => setIcpCustomIndustry(e.target.value)}
                      className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Monto de Contrato Promedio (ACV)</label>
                  <input
                    type="text"
                    value={icpAcv}
                    onChange={(e) => setIcpAcv(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none"
                  />
                </div>

                <button
                  onClick={handleGenerateICP}
                  disabled={icpLoading || (icpIndustry === "OTRO" && !icpCustomIndustry.trim())}
                  className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs py-2.5 px-4 rounded-lg flex items-center justify-center gap-1.5 disabled:opacity-50 h-[38px] transition-all"
                >
                  {icpLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Analizando con IA...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                      Generar Perfil ICP
                    </>
                  )}
                </button>
              </div>

              {/* Render ICP Output Template */}
              {icpResult ? (
                <div className="border border-slate-200 rounded-xl bg-slate-50/50 p-6 flex flex-col gap-5 leading-normal animate-fadeIn text-sm">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 font-mono">
                      【IDEAL CUSTOMER PROFILE】
                    </h4>
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-250 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                      Generado por IA v2.0
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Company Profile */}
                    <div className="bg-white rounded-lg p-4 border border-slate-150">
                      <h5 className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-1.5 mb-2.5">
                        <Building2 className="w-4 h-4 text-emerald-600" />
                        🏢 Perfil Corporativo
                      </h5>
                      <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                        <div><strong>Rubros Verticales:</strong> {icpResult.industry}</div>
                        <div><strong>Rango de ARR:</strong> {icpResult.arrRange}</div>
                        <div><strong>Cantidad Empleados:</strong> {icpResult.employeeCount}</div>
                        <div><strong>Etapa de Negocio:</strong> {icpResult.stage}</div>
                        <div><strong>Tasa Crecimiento:</strong> {icpResult.growthRate}</div>
                      </div>
                    </div>

                    {/* Decision Maker */}
                    <div className="bg-white rounded-lg p-4 border border-slate-150">
                      <h5 className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-1.5 mb-2.5">
                        <User className="w-4 h-4 text-emerald-600" />
                        👤 Tomador de Decisiones Key
                      </h5>
                      <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                        <div><strong>Rol Principal:</strong> {icpResult.decisionMakerRole}</div>
                        <div><strong>Seniority / Rango:</strong> {icpResult.decisionMakerSeniority}</div>
                        <div><strong>Autoridad Presupuesto:</strong> {icpResult.budgetAuthority}</div>
                        <div className="border-t border-slate-50 pt-2 mt-1">
                          <strong>Puntos de Dolor Críticos:</strong>
                          <ul className="list-disc pl-4 mt-1 flex flex-col gap-1 text-[11px] text-slate-500">
                            {icpResult.painPoints?.map((p: string, i: number) => (
                              <li key={i}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* Revenue Impact */}
                    <div className="bg-white rounded-lg p-4 border border-slate-150">
                      <h5 className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-1.5 mb-2.5">
                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                        💰 Impacto Financiero
                      </h5>
                      <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                        <div><strong>Valor Contrato Promedio:</strong> {icpResult.avgContractValue}</div>
                        <div><strong>Ciclo de Venta Promedio:</strong> {icpResult.salesCycle}</div>
                        <div><strong>Potencial de Conversión:</strong> {icpResult.winRatePotential}</div>
                        <div><strong>Relación LTV:CAC Objetivo:</strong> {icpResult.ltvToCac}</div>
                      </div>
                    </div>

                    {/* Geographic Focus */}
                    <div className="bg-white rounded-lg p-4 border border-slate-150">
                      <h5 className="font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-50 pb-1.5 mb-2.5">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        📍 Foco Geográfico
                      </h5>
                      <div className="flex flex-col gap-1.5 text-xs text-slate-600">
                        <div><strong>Regiones Foco:</strong> {icpResult.regions}</div>
                        <div><strong>Husos Horarios:</strong> {icpResult.timeZones}</div>
                      </div>
                    </div>

                  </div>

                  {/* Qualification Criteria MEDDIC */}
                  <div className="bg-white rounded-lg p-5 border border-slate-200 mt-2">
                    <h5 className="font-black text-slate-800 text-xs uppercase tracking-wider font-mono border-b border-slate-100 pb-2 mb-3 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-emerald-600" />
                      ✅ Criterios de Calificación MEDDIC de Conversión
                    </h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
                      <div><strong>Metrics (Métricas):</strong> {icpResult.meddicMetrics}</div>
                      <div><strong>Economic Buyer (Comprador Económico):</strong> {icpResult.meddicEconomicBuyer}</div>
                      <div><strong>Decision Criteria (Criterios Selección):</strong> {icpResult.meddicDecisionCriteria}</div>
                      <div><strong>Decision Process (Proceso Decisión):</strong> {icpResult.meddicDecisionProcess}</div>
                      <div><strong>Identify Pain (Identificar Dolor):</strong> {icpResult.meddicIdentifyPain}</div>
                      <div><strong>Champion (Defensor Interno):</strong> {icpResult.meddicChampion}</div>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                  <Target className="w-8 h-8 text-slate-300" />
                  <p className="text-xs font-semibold">Todavía no has generado un Perfil de Cliente Ideal.</p>
                  <p className="text-[10px] text-slate-400 max-w-md">Seleccioná un rubro y hace clic en "Generar Perfil ICP" para que la Inteligencia Artificial defina la hoja de ruta de tus clientes calificados.</p>
                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 3: PROSPECT RESEARCH & EXPLORATION */}
        {activeTab === "research" && (
          <div className="flex-1 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Buscador Satelital Form */}
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-4 self-start">
              <div>
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Sparkles className="w-4.5 h-4.5 text-emerald-500" />
                  Buscador Patagónico Satelital
                </h3>
                <p className="text-[10px] text-slate-500 leading-relaxed mt-1">
                  Encontrá y calificá prospectos de Río Negro y Neuquén basándose en datos reales de Google Maps y su presencia en la <strong>Guía Cores</strong>.
                </p>
              </div>

              {hasActiveValidKey ? (
                <div className="bg-emerald-50/60 border border-emerald-100 rounded-lg p-2.5 text-[10px] text-emerald-800 leading-relaxed flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-emerald-700">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                      <span>Buscador Google Maps Activo ✅</span>
                    </div>
                    <button
                      onClick={() => {
                        setValidationError(null);
                        setValidationSuccess(false);
                        setModalKeyInput(customApiKey);
                        setShowKeyModal(true);
                      }}
                      className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
                      title="Configurar Clave"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span>
                    Conexión establecida con la API oficial de Google Places para obtener datos 100% reales en tiempo real. {customApiKey ? "(Clave personalizada guardada localmente)" : ""}
                  </span>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-[10px] text-slate-600 leading-relaxed flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Globe className="w-3.5 h-3.5 text-slate-500" />
                      <span>Prospección Local Simulada ⚠️</span>
                    </div>
                    <button
                      onClick={() => {
                        setValidationError(null);
                        setValidationSuccess(false);
                        setModalKeyInput(customApiKey);
                        setShowKeyModal(true);
                      }}
                      className="text-slate-400 hover:text-emerald-600 transition cursor-pointer"
                      title="Configurar Clave"
                    >
                      <Settings className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <span>
                    Para obtener empresas 100% reales de Google Maps en tiempo real, introduce tu clave de Google Places.
                  </span>
                  <button
                    onClick={() => {
                      setValidationError(null);
                      setValidationSuccess(false);
                      setModalKeyInput(customApiKey);
                      setShowKeyModal(true);
                    }}
                    className="mt-1 w-full text-center py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[9px] transition tracking-wide uppercase font-mono cursor-pointer"
                  >
                    Configurar Clave Real ⚙️
                  </button>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Provincia</label>
                <div className="grid grid-cols-2 gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setSearchProv("RN")}
                    className={`py-1 text-xs font-bold rounded ${
                      searchProv === "RN" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Río Negro
                  </button>
                  <button
                    onClick={() => setSearchProv("NQ")}
                    className={`py-1 text-xs font-bold rounded ${
                      searchProv === "NQ" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    Neuquén
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Ciudad Local</label>
                <select
                  value={searchCity}
                  onChange={(e) => setSearchCity(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                >
                  {(searchProv === "RN" ? CITIES_RN : CITIES_NQ).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Rubro de Negocio</label>
                <select
                  value={searchIndustry}
                  onChange={(e) => {
                    setSearchIndustry(e.target.value);
                    setSearchCustom("");
                  }}
                  className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                >
                  {INDUSTRIES_PRESET.map((i) => (
                    <option key={i} value={i}>{i}</option>
                  ))}
                  <option value="OTRO">Otro rubro personalizado...</option>
                </select>
              </div>

              {searchIndustry === "OTRO" && (
                <div className="flex flex-col gap-1 animate-fadeIn">
                  <label className="text-[10px] font-bold text-slate-400 uppercase font-mono">Rubro Personalizado</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Taller Mecánico, Farmacia"
                    value={searchCustom}
                    onChange={(e) => setSearchCustom(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-none"
                  />
                </div>
              )}

              {/* Filtros dinámicos de Google Places */}
              <div className="border-t border-slate-100 pt-3 flex flex-col gap-2.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase font-mono flex items-center gap-1">
                  <Filter className="w-3 h-3 text-emerald-600" />
                  Filtros Dinámicos (Google Places)
                </span>
                
                {/* Filtro Distancia */}
                <div className="flex flex-col gap-1 bg-slate-50/50 p-2 rounded-lg border border-slate-150">
                  <span className="text-[9px] font-bold text-slate-500 font-mono">Distancia Máxima</span>
                  <div className="flex flex-col gap-1 text-[10px] text-slate-600 mt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-700 transition">
                      <input
                        type="radio"
                        name="filterDistance"
                        value="any"
                        checked={filterDistance === "any"}
                        onChange={() => setFilterDistance("any")}
                        className="accent-emerald-600 cursor-pointer"
                      />
                      <span>Cualquier distancia</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-700 transition">
                      <input
                        type="radio"
                        name="filterDistance"
                        value="2"
                        checked={filterDistance === "2"}
                        onChange={() => setFilterDistance("2")}
                        className="accent-emerald-600 cursor-pointer"
                      />
                      <span>Menos de 2 km</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-700 transition">
                      <input
                        type="radio"
                        name="filterDistance"
                        value="5"
                        checked={filterDistance === "5"}
                        onChange={() => setFilterDistance("5")}
                        className="accent-emerald-600 cursor-pointer"
                      />
                      <span>Menos de 5 km</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-700 transition">
                      <input
                        type="radio"
                        name="filterDistance"
                        value="10"
                        checked={filterDistance === "10"}
                        onChange={() => setFilterDistance("10")}
                        className="accent-emerald-600 cursor-pointer"
                      />
                      <span>Menos de 10 km</span>
                    </label>
                  </div>
                </div>

                {/* Filtro Rango Precios */}
                <div className="flex flex-col gap-1 bg-slate-50/50 p-2 rounded-lg border border-slate-150">
                  <span className="text-[9px] font-bold text-slate-500 font-mono">Rango de Precios (Google)</span>
                  <div className="flex flex-col gap-1 text-[10px] text-slate-600 mt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-700 transition">
                      <input
                        type="radio"
                        name="filterPrice"
                        value="any"
                        checked={filterPrice === "any"}
                        onChange={() => setFilterPrice("any")}
                        className="accent-emerald-600 cursor-pointer"
                      />
                      <span>Todos los niveles</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-700 transition">
                      <input
                        type="radio"
                        name="filterPrice"
                        value="1"
                        checked={filterPrice === "1"}
                        onChange={() => setFilterPrice("1")}
                        className="accent-emerald-600 cursor-pointer"
                      />
                      <span>$ (Económico)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-700 transition">
                      <input
                        type="radio"
                        name="filterPrice"
                        value="2"
                        checked={filterPrice === "2"}
                        onChange={() => setFilterPrice("2")}
                        className="accent-emerald-600 cursor-pointer"
                      />
                      <span>$$ (Moderado)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-700 transition">
                      <input
                        type="radio"
                        name="filterPrice"
                        value="3"
                        checked={filterPrice === "3"}
                        onChange={() => setFilterPrice("3")}
                        className="accent-emerald-600 cursor-pointer"
                      />
                      <span>$$$ (Premium / Corp)</span>
                    </label>
                  </div>
                </div>

                {/* Filtro Rating */}
                <div className="flex flex-col gap-1 bg-slate-50/50 p-2 rounded-lg border border-slate-150">
                  <span className="text-[9px] font-bold text-slate-500 font-mono">Calificación Mínima</span>
                  <div className="flex flex-col gap-1 text-[10px] text-slate-600 mt-1">
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-700 transition">
                      <input
                        type="radio"
                        name="filterRating"
                        value="any"
                        checked={filterMinRating === "any"}
                        onChange={() => setFilterMinRating("any")}
                        className="accent-emerald-600 cursor-pointer"
                      />
                      <span>Todos los ratings</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-700 transition">
                      <input
                        type="radio"
                        name="filterRating"
                        value="3.5"
                        checked={filterMinRating === "3.5"}
                        onChange={() => setFilterMinRating("3.5")}
                        className="accent-emerald-600 cursor-pointer"
                      />
                      <span>3.5+ ★ Estrellas</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-700 transition">
                      <input
                        type="radio"
                        name="filterRating"
                        value="4.0"
                        checked={filterMinRating === "4.0"}
                        onChange={() => setFilterMinRating("4.0")}
                        className="accent-emerald-600 cursor-pointer"
                      />
                      <span>4.0+ ★ Estrellas</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer hover:text-emerald-700 transition">
                      <input
                        type="radio"
                        name="filterRating"
                        value="4.5"
                        checked={filterMinRating === "4.5"}
                        onChange={() => setFilterMinRating("4.5")}
                        className="accent-emerald-600 cursor-pointer"
                      />
                      <span>4.5+ ★ Estrellas</span>
                    </label>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSearchProspects}
                disabled={searchLoading || (searchIndustry === "OTRO" && !searchCustom.trim())}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 shadow-sm disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                {searchLoading ? "Buscando en directorios..." : `Buscar Leads en ${searchCity}`}
              </button>

              <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
                <span className="text-[9px] text-slate-400 font-mono">Clientum Lead Mining v2.0</span>
                <a
                  href="https://www.guiacores.com.ar/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[9px] text-blue-600 hover:underline inline-flex items-center gap-0.5 font-bold"
                >
                  <span>Ir a Guía Cores</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            {/* Results Display */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-xs">
                <div className="flex flex-col">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5 uppercase tracking-wider font-mono">
                    <Target className="w-4 h-4 text-emerald-600" />
                    Prospectos Encontrados ({filteredSearchResults.length} de {searchResults.length})
                  </h4>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Filtrado dinámico por distancia, precio y reputación en tiempo real.
                  </p>
                </div>
                {filteredSearchResults.length > 0 && (
                  <button
                    onClick={handleDownloadCSV}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer font-sans"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar CSV
                  </button>
                )}
              </div>

              {searchLoading && (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center gap-3 shadow-xs animate-pulse">
                  <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
                  <h5 className="text-xs font-bold text-slate-700">Analizando registros de la Patagonia</h5>
                  <p className="text-[10px] text-slate-400 max-w-sm">
                    Buscando en la Guía Cores comercios activos en {searchCity} y estructurando su análisis comercial...
                  </p>
                </div>
              )}

              {!searchLoading && searchResults.length === 0 && (
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2 shadow-xs">
                  <Search className="w-8 h-8 text-slate-300" />
                  <p className="text-xs font-semibold">No se encontraron búsquedas activas en este momento.</p>
                  <p className="text-[10px] text-slate-400 max-w-sm">
                    Elegí la localidad y el rubro en el panel de la izquierda y presioná buscar para obtener prospectos reales con sus datos de contacto locales.
                  </p>
                </div>
              )}

              {!searchLoading && searchResults.length > 0 && (
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
                  
                  {/* Left Column: Scrollable List (7/12) */}
                  <div className="xl:col-span-7 flex flex-col gap-3.5 max-h-[620px] overflow-y-auto pr-1 scrollbar-thin">
                    {filteredSearchResults.length === 0 ? (
                      <div className="bg-slate-50 border border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
                        <Filter className="w-6 h-6 text-slate-300" />
                        <span className="text-xs font-bold text-slate-600">Ningún prospecto coincide con los filtros</span>
                        <span className="text-[10px] text-slate-400 max-w-xs leading-normal">
                          Intenta flexibilizar la distancia, rango de precios o calificación mínima en el panel lateral para visualizar más comercios.
                        </span>
                      </div>
                    ) : (
                      filteredSearchResults.map((p, idx) => {
                        const isSelected = selectedProspectIndex === idx || (selectedProspectIndex >= filteredSearchResults.length && idx === 0);
                        const alreadyAdded = addedProspectNames.includes(p.company) || deals.some((d) => d.company === p.company);
                        
                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedProspectIndex(idx)}
                            className={`bg-white border rounded-xl p-4 shadow-xs flex flex-col gap-3 hover:shadow-md transition-all cursor-pointer border-l-4 ${
                              isSelected
                                ? "border-emerald-600 ring-2 ring-emerald-500/20 bg-emerald-50/10"
                                : "border-slate-200 border-l-slate-400 hover:border-emerald-300"
                            } animate-fadeIn`}
                          >
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h5 className="text-xs font-black text-slate-800">{p.company}</h5>
                                <div className="flex flex-wrap gap-1 mt-1.5">
                                  <span className="bg-slate-100 text-slate-700 border border-slate-200 text-[8px] font-bold px-1.5 py-0.5 rounded-md font-mono">
                                    📍 {p.city}
                                  </span>
                                  {p.rating && (
                                    <span className="bg-amber-50 text-amber-700 border border-amber-100 text-[8px] font-bold px-1.5 py-0.5 rounded-md font-mono flex items-center gap-0.5">
                                      ★ {p.rating.toFixed(1)}
                                    </span>
                                  )}
                                  {p.distance && (
                                    <span className="bg-sky-50 text-sky-700 border border-sky-100 text-[8px] font-bold px-1.5 py-0.5 rounded-md font-mono">
                                      🚗 {p.distance.toFixed(1)} km
                                    </span>
                                  )}
                                  {p.priceLevel && (
                                    <span className="bg-purple-50 text-purple-700 border border-purple-100 text-[8px] font-bold px-1.5 py-0.5 rounded-md font-mono" title="Rango de precios en Google">
                                      {"$".repeat(p.priceLevel)}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="text-right flex flex-col items-end">
                                <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md font-mono">
                                  ${p.amount?.toLocaleString("es-AR")}
                                </span>
                                <span className="text-[8px] text-slate-400 mt-0.5 font-semibold">Contrato Sugerido</span>
                              </div>
                            </div>

                            <div className="text-[10px] text-slate-500 grid grid-cols-2 gap-2 border-t border-b border-slate-100 py-2">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate" title={p.address}>{p.address}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="font-mono truncate">{p.phone}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span className="truncate">Contacto: {p.contact}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Award className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                <span>Fit Score: {p.score || 7}/10</span>
                              </div>
                            </div>

                            {/* Pain Point analysis */}
                            <div className="bg-amber-50/60 border border-amber-100 rounded-lg p-2 text-[10px] text-amber-900 leading-relaxed">
                              <strong className="block font-bold mb-0.5 text-amber-800 flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-amber-500" />
                                Diagnóstico Comercial:
                              </strong>
                              <p className="text-slate-700 font-medium">{p.painPoint}</p>
                            </div>

                            <div className="flex justify-between items-center gap-2 mt-1">
                              <span className="text-[9px] text-slate-400 italic font-mono">
                                Haz clic para ver en mapa
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddProspectedLead(p);
                                }}
                                disabled={alreadyAdded}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 ${
                                  alreadyAdded
                                    ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                                    : "bg-slate-950 text-white hover:bg-black cursor-pointer shadow-sm"
                                }`}
                              >
                                {alreadyAdded ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                                    Lead en CRM
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3.5 h-3.5" />
                                    Agregar a CRM
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Right Column: Google Maps & Local Map Widget (5/12) */}
                  <div className="xl:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex flex-col h-[480px] xl:h-[620px]">
                    
                    {/* Map Header */}
                    <div className="bg-slate-900 text-white p-3 flex items-center justify-between shrink-0">
                      <div className="flex items-center gap-1.5">
                        <Map className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-xs font-mono tracking-wide">
                          Geolocalización GPS
                        </span>
                      </div>
                      <span className="bg-slate-800 text-emerald-400 border border-emerald-500/20 text-[9px] font-bold font-mono px-2 py-0.5 rounded">
                        {customApiKey ? "Google Maps API" : "Simulador Local"}
                      </span>
                    </div>

                    {/* Active Selected Prospect Information Banner */}
                    {(() => {
                      const selectedIdx = selectedProspectIndex < filteredSearchResults.length ? selectedProspectIndex : 0;
                      const activeProspect = filteredSearchResults[selectedIdx];
                      
                      if (!activeProspect) {
                        return (
                          <div className="bg-slate-100 text-slate-500 p-3 text-center text-[10px] font-medium italic border-b border-slate-200">
                            Ningún prospecto seleccionado para visualizar
                          </div>
                        );
                      }

                      return (
                        <div className="bg-slate-50 border-b border-slate-200 p-3 flex flex-col gap-1 shrink-0">
                          <span className="text-[10px] font-black text-slate-800 truncate">
                            {activeProspect.company}
                          </span>
                          <span className="text-[9px] text-slate-500 truncate flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            {activeProspect.address}
                          </span>
                        </div>
                      );
                    })()}

                    {/* Map Frame / Iframe Component */}
                    <div className="flex-1 relative bg-slate-100 flex flex-col items-center justify-center">
                      {(() => {
                        const selectedIdx = selectedProspectIndex < filteredSearchResults.length ? selectedProspectIndex : 0;
                        const activeProspect = filteredSearchResults[selectedIdx];

                        if (!activeProspect) {
                          return (
                            <div className="text-center p-6 text-slate-400 flex flex-col items-center gap-1.5">
                              <Map className="w-10 h-10 text-slate-300 animate-pulse" />
                              <span className="text-xs font-bold">Sin datos de mapa</span>
                            </div>
                          );
                        }

                        // Render local interactive vector map component
                        return (
                          <div className="w-full h-full relative overflow-hidden bg-[#e5e9f0] select-none p-4 flex flex-col justify-between">
                            
                            {/* Water and natural landscape representation */}
                            <div className="absolute inset-0 opacity-40">
                              {/* Blue Lake / River Area depending on searchCity */}
                              {searchCity.toUpperCase().includes("BARILOCHE") ? (
                                <div className="absolute top-0 left-0 w-full h-[180px] bg-blue-300 rounded-b-[40px] flex items-center justify-center border-b-2 border-blue-400">
                                  <span className="text-[10px] font-bold text-blue-700 tracking-wider uppercase font-mono">
                                    Lago Nahuel Huapi (Bariloche)
                                  </span>
                                </div>
                              ) : searchCity.toUpperCase().includes("VIEDMA") ? (
                                <div className="absolute top-[40%] left-0 w-full h-[60px] bg-blue-300 transform -rotate-6 flex items-center justify-center border-t border-b border-blue-400">
                                  <span className="text-[9px] font-bold text-blue-700 tracking-wider uppercase font-mono">
                                    Río Negro (Límite Provincial)
                                  </span>
                                </div>
                              ) : (
                                <div className="absolute top-[30%] left-0 w-full h-[50px] bg-sky-200 transform rotate-12 flex items-center justify-center border-t border-b border-sky-300">
                                  <span className="text-[9px] font-bold text-sky-600 tracking-wider uppercase font-mono">
                                    Río Limay / Confluencia
                                  </span>
                                </div>
                              )}

                              {/* Simple grid lines representing streets */}
                              <div className="absolute inset-0 grid grid-cols-6 grid-rows-6 pointer-events-none">
                                {Array.from({ length: 36 }).map((_, i) => (
                                  <div key={i} className="border-[0.5px] border-slate-300/40" />
                                ))}
                              </div>
                            </div>

                            {/* Center Marker representing general location */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-[120px] h-[120px] rounded-full border border-emerald-500/10 bg-emerald-500/5 flex items-center justify-center animate-ping" />
                            </div>

                            {/* Plotting interactive pins for all filtered search results */}
                            {filteredSearchResults.map((prospect, index) => {
                              // Predefined relative coordinate offsets for visual placement
                              const xPos = 20 + ((index * 23) % 65);
                              const yPos = 25 + ((index * 17) % 55);
                              const isActivePin = selectedIdx === index;

                              return (
                                <button
                                  key={index}
                                  onClick={() => setSelectedProspectIndex(index)}
                                  style={{ left: `${xPos}%`, top: `${yPos}%` }}
                                  className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center group transition-all duration-300 z-10 hover:z-30 cursor-pointer"
                                >
                                  {/* Floating name tag when hovered or active */}
                                  <div className={`px-2 py-1 rounded text-[9px] font-bold shadow-md whitespace-nowrap mb-1 transition-all max-w-[150px] truncate ${
                                    isActivePin
                                      ? "bg-emerald-600 text-white ring-2 ring-white scale-105"
                                      : "bg-white text-slate-800 border border-slate-200 opacity-60 hover:opacity-100"
                                  }`}>
                                    {prospect.company}
                                  </div>
                                  
                                  {/* Pin graphics */}
                                  <div className="relative">
                                    <MapPin className={`w-6 h-6 transition-transform ${
                                      isActivePin
                                        ? "text-emerald-600 drop-shadow-lg scale-125 animate-bounce"
                                        : "text-slate-500 hover:text-slate-800"
                                    }`} />
                                    {isActivePin && (
                                      <div className="w-2 h-2 bg-emerald-600 rounded-full absolute top-1.5 left-2 animate-ping" />
                                    )}
                                  </div>
                                </button>
                              );
                            })}

                            <div className="z-10 bg-white/90 backdrop-blur-xs border border-slate-200 rounded-lg p-2 text-[10px] text-slate-600 self-start mt-auto flex items-center gap-1.5 shadow-xs max-w-xs leading-relaxed font-sans">
                              <Info className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>
                                Mostrando <strong>{filteredSearchResults.length} pines interactivos</strong> de la ciudad de {searchCity}. Selecciona un pin o un comercio en la lista para centrar la visualización.
                              </span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Map Footer status */}
                    <div className="bg-slate-50 border-t border-slate-200 p-2.5 text-[10px] text-slate-400 flex items-center justify-between shrink-0 font-mono">
                      <span>Ubicación: {searchCity}, Patagonia</span>
                      {customApiKey ? (
                        <span className="text-emerald-600 font-bold">● ONLINE (Google)</span>
                      ) : (
                        <span className="text-amber-500 font-bold">● MODO SIMULADO</span>
                      )}
                    </div>

                  </div>

                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 4: LEAD QUALIFICATION (MEDDIC SCORING) */}
        {activeTab === "meddic" && (
          <div className="flex-1 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left side: Deals selection */}
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-3 self-start">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                <Users className="w-4.5 h-4.5 text-slate-500" />
                Seleccionar Lead
              </h3>
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                {deals.filter((d) => d.stage !== "closed").map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedMeddicLeadId(d.id)}
                    className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                      selectedMeddicLeadId === d.id
                        ? "bg-emerald-50/50 border-emerald-500 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-350"
                    }`}
                  >
                    <div>
                      <strong className="block text-xs font-bold text-slate-800 truncate">{d.company}</strong>
                      <span className="text-[10px] text-slate-400 capitalize">{d.stage.replace('_', ' ')}</span>
                    </div>
                    <span className="font-mono text-[10px] font-extrabold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                      {d.meddicScore || 0}%
                    </span>
                  </button>
                ))}
                {deals.filter((d) => d.stage !== "closed").length === 0 && (
                  <div className="text-center text-xs text-slate-400 py-6">
                    No hay leads activos en el CRM para calificar. ¡Buscá leads en el mapa o registrá uno manual!
                  </div>
                )}
              </div>
            </div>

            {/* Right side: Detailed MEDDIC scorecard */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              
              {selectedMeddicLeadId ? (
                (() => {
                  const lead = deals.find((d) => d.id === selectedMeddicLeadId);
                  if (!lead) return null;
                  return (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-6 animate-fadeIn">
                      
                      {/* Executive scorecard header */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                        <div>
                          <h3 className="text-base font-black text-slate-800">{lead.company}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">MEDDIC Qualification Assessment Scorecard</p>
                        </div>
                        <div className={`p-3 rounded-xl border flex flex-col items-center gap-0.5 ${getMEDDICStatusColor(lead.meddicScore || 40)}`}>
                          <span className="text-[9px] font-mono uppercase tracking-widest font-black opacity-80">Calificación de Conversión</span>
                          <strong className="text-xl font-mono font-black">{lead.meddicScore || 40}/100</strong>
                          <span className="text-[10px] font-extrabold mt-0.5">{getMEDDICStatusLabel(lead.meddicScore || 40)}</span>
                        </div>
                      </div>

                      {/* Interactive MEDDIC Star-Rating Criteria */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* M: Metrics */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-slate-800 font-mono flex items-center gap-1.5">
                              <span className="bg-blue-600 text-white w-5 h-5 rounded flex items-center justify-center text-[10px]">M</span>
                              Metrics Defined (Métricas)
                            </span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setMeddicMetrics(star)}>
                                  <Star className={`w-4 h-4 ${star <= meddicMetrics ? "text-amber-500 fill-amber-500" : "text-slate-300"}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed">¿El cliente tiene métricas cuantificables de ahorro de tiempo y aumento de ventas que el bot/CRM de Clientum le solucionará?</p>
                        </div>

                        {/* E: Economic Buyer */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-slate-800 font-mono flex items-center gap-1.5">
                              <span className="bg-indigo-600 text-white w-5 h-5 rounded flex items-center justify-center text-[10px]">E</span>
                              Economic Buyer (Comprador)
                            </span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setMeddicBuyer(star)}>
                                  <Star className={`w-4 h-4 ${star <= meddicBuyer ? "text-amber-500 fill-amber-500" : "text-slate-300"}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed">¿Hablás directamente con la persona que tiene la chequera o presupuesto para autorizar la compra (ej. el Socio Gerente)?</p>
                        </div>

                        {/* D: Decision Criteria */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-slate-800 font-mono flex items-center gap-1.5">
                              <span className="bg-indigo-700 text-white w-5 h-5 rounded flex items-center justify-center text-[10px]">D</span>
                              Decision Criteria (Criterios)
                            </span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setMeddicCriteria(star)}>
                                  <Star className={`w-4 h-4 ${star <= meddicCriteria ? "text-amber-500 fill-amber-500" : "text-slate-300"}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed">¿Están claros sus criterios de evaluación (ej. integración con WhatsApp, costo del plan, soporte, seguridad de datos)?</p>
                        </div>

                        {/* D: Decision Process */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-slate-800 font-mono flex items-center gap-1.5">
                              <span className="bg-emerald-700 text-white w-5 h-5 rounded flex items-center justify-center text-[10px]">D</span>
                              Decision Process (Proceso)
                            </span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setMeddicProcess(star)}>
                                  <Star className={`w-4 h-4 ${star <= meddicProcess ? "text-amber-500 fill-amber-500" : "text-slate-300"}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed">¿Conocés exactamente los pasos que toma para comprar (demo, aprobación de finanzas, firma de contrato y cronograma)?</p>
                        </div>

                        {/* I: Identify Pain */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-slate-800 font-mono flex items-center gap-1.5">
                              <span className="bg-amber-600 text-white w-5 h-5 rounded flex items-center justify-center text-[10px]">I</span>
                              Identify Pain (Dolor)
                            </span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setMeddicPain(star)}>
                                  <Star className={`w-4 h-4 ${star <= meddicPain ? "text-amber-500 fill-amber-500" : "text-slate-300"}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed">¿Tenés confirmado el dolor profundo del negocio (ej. pérdida de $200.000 ARS en ventas por responder consultas tarde)?</p>
                        </div>

                        {/* C: Champion */}
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-black text-slate-800 font-mono flex items-center gap-1.5">
                              <span className="bg-slate-700 text-white w-5 h-5 rounded flex items-center justify-center text-[10px]">C</span>
                              Champion Identified (Defensor)
                            </span>
                            <div className="flex gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button key={star} onClick={() => setMeddicChampion(star)}>
                                  <Star className={`w-4 h-4 ${star <= meddicChampion ? "text-amber-500 fill-amber-500" : "text-slate-300"}`} />
                                </button>
                              ))}
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-500 leading-relaxed">¿Tenés un Champion o defensor interno (ej. coordinador de ventas) que esté presionando para cerrar la compra?</p>
                        </div>

                      </div>

                      {/* Red Flags Input */}
                      <div className="flex flex-col gap-1.5 mt-2">
                        <label className="text-[11px] font-black text-slate-600 uppercase font-mono flex items-center gap-1">
                          <ShieldAlert className="w-4 h-4 text-red-500" />
                          Red Flags / Deal Breakers (Señales de Alerta de Negocio)
                        </label>
                        <textarea
                          placeholder="Mencione cualquier riesgo técnico, retraso presupuestario o competidor que amenace la venta..."
                          value={meddicRedFlags}
                          onChange={(e) => setMeddicRedFlags(e.target.value)}
                          className="bg-slate-50 border border-slate-250 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-red-500 focus:bg-white h-[65px]"
                        ></textarea>
                      </div>

                      {/* Action Triggers */}
                      <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
                        <button
                          onClick={handleSaveMeddic}
                          className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs py-2 px-5 rounded-lg flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          Guardar Calificación MEDDIC
                        </button>
                      </div>

                      {/* Smart Diagnostics Suggestions output (if saved) */}
                      {lead.meddicNextActions && lead.meddicNextActions.length > 0 && (
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mt-2">
                          <h4 className="text-[11px] font-black text-slate-700 uppercase font-mono tracking-wider mb-2 flex items-center gap-1.5">
                            <Lightbulb className="w-4 h-4 text-amber-500" />
                            Next Best Actions recomendadas para avanzar el negocio:
                          </h4>
                          <ul className="list-disc pl-4 text-xs text-slate-600 flex flex-col gap-1.5 leading-relaxed">
                            {lead.meddicNextActions.map((action, i) => (
                              <li key={i}>{action}</li>
                            ))}
                          </ul>
                          {lead.meddicRedFlags && (
                            <div className="mt-3 border-t border-slate-150 pt-2.5 text-xs">
                              <strong className="text-red-800 font-bold flex items-center gap-1">
                                <ShieldAlert className="w-3.5 h-3.5 text-red-500" />
                                Alertas de Riesgo Activas:
                              </strong>
                              <p className="text-slate-600 mt-1 leading-relaxed">{lead.meddicRedFlags}</p>
                            </div>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })()
              ) : (
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2 shadow-xs">
                  <Award className="w-10 h-10 text-slate-300 animate-bounce" />
                  <p className="text-xs font-semibold">Ningún lead seleccionado para la auditoría MEDDIC.</p>
                  <p className="text-[10px] text-slate-400 max-w-sm">Elegí uno de tus prospectos activos de la columna izquierda para calificar su viabilidad y recibir sugerencias inmediatas de venta.</p>
                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 5: PERSONALIZED OUTREACH GENERATOR */}
        {activeTab === "outreach" && (
          <div className="flex-1 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left selector */}
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col gap-3 self-start">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-1.5 border-b border-slate-100 pb-2.5">
                <Users className="w-4.5 h-4.5 text-slate-500" />
                Seleccionar Lead
              </h3>
              <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto pr-1">
                {deals.filter((d) => d.stage !== "closed").map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedOutreachLeadId(d.id)}
                    className={`w-full p-3 rounded-xl border text-left flex justify-between items-center transition-all ${
                      selectedOutreachLeadId === d.id
                        ? "bg-emerald-50/50 border-emerald-500 shadow-xs"
                        : "bg-white border-slate-200 hover:border-slate-350"
                    }`}
                  >
                    <div>
                      <strong className="block text-xs font-bold text-slate-800 truncate">{d.company}</strong>
                      <span className="text-[10px] text-slate-400 capitalize">{d.stage.replace('_', ' ')}</span>
                    </div>
                    {d.outreachEmail1 ? (
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded font-mono">Generado</span>
                    ) : (
                      <span className="bg-slate-100 text-slate-400 text-[9px] font-medium px-1.5 py-0.5 rounded font-mono">Pendiente</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Right sequence renderer */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              
              {selectedOutreachLeadId ? (
                (() => {
                  const lead = deals.find((d) => d.id === selectedOutreachLeadId);
                  if (!lead) return null;

                  return (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col gap-5 animate-fadeIn">
                      
                      <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="text-sm font-black text-slate-800">
                            Campaña de Prospección: {lead.company}
                          </h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Destinatario: {lead.contact} ({lead.contactTitle || "Gerente / Titular"}) · Rubro: {lead.industry}
                          </p>
                        </div>

                        <button
                          onClick={() => handleGenerateOutreach(lead)}
                          disabled={outreachLoading}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-3 rounded-lg flex items-center gap-1 transition-all disabled:opacity-50"
                        >
                          {outreachLoading ? (
                            <>
                              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              Escribiendo...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                              {lead.outreachEmail1 ? "Volver a Generar por IA" : "Generar Campaña Outreach"}
                            </>
                          )}
                        </button>
                      </div>

                      {lead.outreachEmail1 ? (
                        <div className="flex flex-col gap-4 leading-normal">
                          
                          {/* Subtabs for Email 1, Email 2, Email 3, LinkedIn, Phone script */}
                          <div className="flex border-b border-slate-200 overflow-x-auto gap-1">
                            <button
                              onClick={() => setActiveOutreachSubTab("email1")}
                              className={`py-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1 ${
                                activeOutreachSubTab === "email1"
                                  ? "border-emerald-600 text-emerald-700"
                                  : "border-transparent text-slate-400 hover:text-slate-600"
                              }`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                              Email 1 (Día 1)
                            </button>
                            <button
                              onClick={() => setActiveOutreachSubTab("email2")}
                              className={`py-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1 ${
                                activeOutreachSubTab === "email2"
                                  ? "border-emerald-600 text-emerald-700"
                                  : "border-transparent text-slate-400 hover:text-slate-600"
                              }`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                              Email 2 (Día 3)
                            </button>
                            <button
                              onClick={() => setActiveOutreachSubTab("email3")}
                              className={`py-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1 ${
                                activeOutreachSubTab === "email3"
                                  ? "border-emerald-600 text-emerald-700"
                                  : "border-transparent text-slate-400 hover:text-slate-600"
                              }`}
                            >
                              <Mail className="w-3.5 h-3.5" />
                              Email 3 (Día 6)
                            </button>
                            <button
                              onClick={() => setActiveOutreachSubTab("linkedin")}
                              className={`py-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1 ${
                                activeOutreachSubTab === "linkedin"
                                  ? "border-emerald-600 text-emerald-700"
                                  : "border-transparent text-slate-400 hover:text-slate-600"
                              }`}
                            >
                              <Linkedin className="w-3.5 h-3.5" />
                              LinkedIn
                            </button>
                            <button
                              onClick={() => setActiveOutreachSubTab("phone")}
                              className={`py-2 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1 ${
                                activeOutreachSubTab === "phone"
                                  ? "border-emerald-600 text-emerald-700"
                                  : "border-transparent text-slate-400 hover:text-slate-600"
                              }`}
                            >
                              <Phone className="w-3.5 h-3.5" />
                              Llamada/SMS
                            </button>
                          </div>

                          {/* Email 1 Content */}
                          {activeOutreachSubTab === "email1" && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 animate-fadeIn">
                              <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Email de Apertura</span>
                                <button
                                  onClick={() => handleCopyText(`Asunto: Consulta rápida para ${lead.company} - Automatización en WhatsApp\n\n${lead.outreachEmail1 || ""}`, "email1")}
                                  className="text-xs bg-white text-slate-600 border border-slate-200 rounded px-2.5 py-1 flex items-center gap-1 hover:bg-slate-50"
                                >
                                  {copySuccess === "email1" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                  {copySuccess === "email1" ? "¡Copiado!" : "Copiar Correo"}
                                </button>
                              </div>
                              <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans select-all">
                                <strong className="text-slate-500 block border-b border-slate-100 pb-1.5 mb-2 font-mono">
                                  Asunto: Consulta rápida para {lead.company} - Automatización en WhatsApp
                                </strong>
                                {lead.outreachEmail1}
                              </div>
                            </div>
                          )}

                          {/* Email 2 Content */}
                          {activeOutreachSubTab === "email2" && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 animate-fadeIn">
                              <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Email de Seguimiento 2</span>
                                <button
                                  onClick={() => handleCopyText(`Asunto: Re: Consulta rápida para ${lead.company} - Un dato de conversión\n\n${lead.outreachEmail2 || ""}`, "email2")}
                                  className="text-xs bg-white text-slate-600 border border-slate-200 rounded px-2.5 py-1 flex items-center gap-1 hover:bg-slate-50"
                                >
                                  {copySuccess === "email2" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                  {copySuccess === "email2" ? "¡Copiado!" : "Copiar Correo"}
                                </button>
                              </div>
                              <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans select-all">
                                <strong className="text-slate-500 block border-b border-slate-100 pb-1.5 mb-2 font-mono">
                                  Asunto: Re: Consulta rápida para {lead.company} - Un dato de conversión
                                </strong>
                                {lead.outreachEmail2 || `Hola ${lead.contact?.split(' ')[0] || ""},\n\nTe escribo brevemente porque las PyMEs de la Patagonia en tu rubro que implementaron el bot de WhatsApp y CRM de Clientum aumentaron sus ventas un 40% el primer mes, simplemente porque respondieron consultas en menos de 2 minutos.\n\nEvitamos demoras y centralizamos todo el historial del prospecto automáticamente.\n\n¿Te queda bien un Meet rápido este jueves a las 11:00 hs para ver cómo aplicarlo en ${lead.company}?\n\nAbrazo,\nEquipo de Clientum`}
                              </div>
                            </div>
                          )}

                          {/* Email 3 Content */}
                          {activeOutreachSubTab === "email3" && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 animate-fadeIn">
                              <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Email de Cierre / Break-up</span>
                                <button
                                  onClick={() => handleCopyText(`Asunto: Último intento / Solución para ${lead.company}\n\n${lead.outreachEmail3 || ""}`, "email3")}
                                  className="text-xs bg-white text-slate-600 border border-slate-200 rounded px-2.5 py-1 flex items-center gap-1 hover:bg-slate-50"
                                >
                                  {copySuccess === "email3" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                  {copySuccess === "email3" ? "¡Copiado!" : "Copiar Correo"}
                                </button>
                              </div>
                              <div className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed font-sans select-all">
                                <strong className="text-slate-500 block border-b border-slate-100 pb-1.5 mb-2 font-mono">
                                  Asunto: Último intento / Solución para {lead.company}
                                </strong>
                                {lead.outreachEmail3 || `Hola ${lead.contact?.split(' ')[0] || ""},\n\nSé que estás a mil gestionando el día a día en ${lead.company}, por lo que esta es mi última consulta para no interrumpir.\n\nSi el dolor principal hoy es que tu equipo comercial pierde tiempo respondiendo preguntas de soporte básico en vez de cerrar ventas, Clientum se instala en 5 días y se paga solo con 2 ventas ganadas.\n\nSi te interesa dar el salto tecnológico, avisame y coordinamos. Si no, ¡te deseo el mayor de los éxitos en este trimestre!\n\nSaludos atentos,\nEquipo de Clientum`}
                              </div>
                            </div>
                          )}

                          {/* LinkedIn Sequence steps list */}
                          {activeOutreachSubTab === "linkedin" && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 animate-fadeIn">
                              <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider flex items-center gap-1">
                                  <Linkedin className="w-3.5 h-3.5 text-blue-600" /> Secuencia LinkedIn Multi-Paso
                                </span>
                              </div>
                              <div className="flex flex-col gap-3.5 mt-1 text-xs">
                                {(lead.outreachLinkedIn || [
                                  "Paso 1: Solicitud de contacto con nota personalizada: 'Hola Martín, un gusto conectar. Me entusiasma ver cómo lideran en el rubro en la Patagonia. ¡Saludos!'",
                                  "Paso 2 (Día +2): Compartir un artículo de valor: 'Hola Martín, te comparto este breve análisis sobre el impacto de la atención instantánea por WhatsApp en el sector de logística rural. Espero que te sirva.'",
                                  "Paso 3 (Día +4): Enviar propuesta directa: 'Hola Martín, veo que en tu local reciben muchas consultas diarias. ¿Evaluaron automatizar las cotizaciones recurrentes por WhatsApp para aliviar a tu equipo? Saludos.'",
                                  "Paso 4 (Día +7): Mensaje final de seguimiento: 'Hola Martín, te dejé un correo para ver si te servía un Meet de 15 minutos sin compromiso para ver Clientum en vivo. ¿Te interesa que coordinemos?'"
                                ]).map((step, i) => (
                                  <div key={i} className="bg-white border border-slate-150 rounded-lg p-3 shadow-xs">
                                    <div className="flex justify-between items-center border-b border-slate-50 pb-1 mb-1.5 text-[10px] font-mono text-slate-400">
                                      <span>TOC {i+1} - STEP {i+1}</span>
                                      <button
                                        onClick={() => handleCopyText(step, `lk-${i}`)}
                                        className="hover:text-emerald-600 flex items-center gap-0.5"
                                      >
                                        {copySuccess === `lk-${i}` ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                                        {copySuccess === `lk-${i}` ? "Copiado" : "Copiar"}
                                      </button>
                                    </div>
                                    <p className="text-slate-700 leading-normal font-sans font-medium">{step}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Phone Call Script */}
                          {activeOutreachSubTab === "phone" && (
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-3 animate-fadeIn">
                              <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                                <span className="text-[10px] text-slate-400 uppercase font-mono tracking-wider">Guion Telefónico / Elevador de Prospección</span>
                                <button
                                  onClick={() => handleCopyText(lead.outreachPhoneScript || "", "phone")}
                                  className="text-xs bg-white text-slate-600 border border-slate-200 rounded px-2.5 py-1 flex items-center gap-1 hover:bg-slate-50"
                                >
                                  {copySuccess === "phone" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                                  {copySuccess === "phone" ? "¡Copiado!" : "Copiar Guion"}
                                </button>
                              </div>
                              <div className="text-xs text-slate-850 whitespace-pre-wrap leading-relaxed font-sans font-medium italic border-l-4 border-l-emerald-500 pl-3 py-2 bg-white rounded-r-lg">
                                {lead.outreachPhoneScript || `\"Hola ${lead.contact || "Martín"}, ¿cómo estás? Te habla de Clientum. Te llamo cortito porque vi el crecimiento que tienen en la zona y sé que están con mucha demanda. Te quería preguntar brevemente: ¿hoy tu equipo está dando abasto con las consultas que les entran por WhatsApp o sienten que a veces se les pasan oportunidades de venta por demoras en responder? ... Excelente, justamente desarrollamos un sistema de bot y CRM que soluciona esto en 5 días. ¿Te queda bien que coordinemos un Meet rápido de 15 minutos el miércoles a las 10:00 hs para que veas el sistema adaptado a tu marca?\"`}
                              </div>
                            </div>
                          )}

                        </div>
                      ) : (
                        <div className="border border-dashed border-slate-300 rounded-xl p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
                          <Mail className="w-8 h-8 text-slate-300 animate-pulse" />
                          <p className="text-xs font-bold text-slate-500">No se ha generado ninguna campaña para este lead.</p>
                          <p className="text-[10px] text-slate-400 max-w-sm">Hacé clic en el botón de arriba "Generar Campaña Outreach" para crear automáticamente una secuencia completa personalizada de emails y redes sociales por Inteligencia Artificial.</p>
                        </div>
                      )}

                    </div>
                  );
                })()
              ) : (
                <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-16 text-center text-slate-400 flex flex-col items-center justify-center gap-2 shadow-xs">
                  <Mail className="w-10 h-10 text-slate-300 animate-bounce" />
                  <p className="text-xs font-semibold">Ningún lead seleccionado para la campaña de Outreach.</p>
                  <p className="text-[10px] text-slate-400 max-w-sm">Elegí uno de tus prospectos de la columna izquierda para generar o visualizar sus plantillas de outreach altamente persuasivas.</p>
                </div>
              )}

            </div>

          </div>
        )}

        {/* TAB 6: CRM COMPLETO (catálogo, sucursales, vendedores, bot) — fusionado en el menú unificado */}
        {["products", "sellers", "branches", "conversations", "bot"].includes(activeTab) && (
          <div className="flex-1 -m-6 flex flex-col">
            <CrmFullApp hideNav activeTabOverride={activeTab as "products" | "sellers" | "branches" | "conversations" | "bot"} />
          </div>
        )}

        {/* TAB 7: BROCHURE + EDITOR (fusionado en el menú unificado "CRM Completo") */}
        {["brochure", "config", "pages", "ai", "activity", "quickcreate"].includes(activeTab) && (
          <div className="flex-1 -m-6 flex flex-col overflow-hidden">
            <div className="bg-white border-b border-slate-200 px-6 py-2.5 flex flex-wrap items-center justify-between gap-2 flex-shrink-0">
              <div className="bg-slate-100 p-0.5 rounded-lg flex items-center gap-1 border border-slate-200">
                <button
                  onClick={() => onShowAllPagesChange?.(false)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                    !showAllPages ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Ver página individual"
                >
                  Página Única
                </button>
                <button
                  onClick={() => onShowAllPagesChange?.(true)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                    showAllPages ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                  title="Ver todas las páginas apiladas"
                >
                  Ver Todas (Imprimir)
                </button>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={onResetBrochure}
                  className="text-slate-500 hover:text-red-600 bg-slate-50 hover:bg-red-50 border border-slate-200 p-2 rounded-lg transition-colors"
                  title="Reiniciar textos"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onPrint}
                  className="bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Abrir diálogo de impresión para guardar como PDF desde el navegador"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Imprimir / PDF
                </button>
                <button
                  onClick={onExportPDF}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  title="Descargar Brochure completo como PDF Vectorial de Alta Calidad"
                >
                  <FileText className="w-3.5 h-3.5" />
                  Descargar PDF
                </button>
              </div>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
              <SidebarEditor
                data={brochureData}
                onChange={(d) => onChangeBrochureData?.(d)}
                preset={activePreset}
                onPresetChange={(p) => onPresetChange?.(p)}
                colorTheme={colorTheme}
                onThemeChange={(t) => onThemeChange?.(t)}
                contactInfo={resolvedContactInfo}
                onContactChange={(c) => onContactChange?.(c)}
                hidePrices={hidePrices}
                onHidePricesChange={(h) => onHidePricesChange?.(h)}
                hideChatbot={hideChatbot}
                onHideChatbotChange={(h) => onHideChatbotChange?.(h)}
                customTemplates={customTemplates}
                onSaveTemplate={(n) => onSaveTemplate?.(n)}
                onDeleteTemplate={(id) => onDeleteTemplate?.(id)}
                hideTabs
                activeTabOverride={
                  (["config", "pages", "ai", "activity", "quickcreate"].includes(activeTab)
                    ? (activeTab as "config" | "pages" | "ai" | "activity" | "quickcreate")
                    : "pages")
                }
              />

              <div className="flex-1 flex flex-col overflow-hidden relative">
                {!showAllPages && (
                  <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center gap-1 overflow-x-auto no-print flex-shrink-0 scrollbar-none">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2 font-mono flex items-center gap-1">
                      <Layers className="w-3 h-3 text-slate-400" /> Páginas:
                    </span>
                    {brochureActivePages.map((page) => (
                      <button
                        key={page}
                        onClick={() => onSelectedPageChange?.(page)}
                        className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                          selectedPage === page
                            ? "bg-slate-800 text-white shadow-xs"
                            : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                        }`}
                      >
                        Pág. {brochureActivePages.indexOf(page) + 1}
                      </button>
                    ))}
                  </div>
                )}

                <BrochurePreview
                  data={brochureData}
                  colorTheme={colorTheme}
                  contactInfo={resolvedContactInfo}
                  selectedPage={selectedPage}
                  showAllPages={showAllPages}
                  hidePrices={hidePrices}
                  hideChatbot={hideChatbot}
                  preset={activePreset}
                  onChange={(d) => onChangeBrochureData?.(d)}
                />
              </div>
            </div>
          </div>
        )}

      </div>
      </div>

      {/* MODAL CONFIGURACIÓN GOOGLE PLACES API KEY */}
      {showKeyModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full m-4 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-4.5 h-4.5 text-emerald-400" />
                <span className="font-bold text-sm font-sans tracking-wide">
                  Configuración de API Key: Google Places (New)
                </span>
              </div>
              <button
                onClick={() => setShowKeyModal(false)}
                className="text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs text-slate-700 leading-relaxed">
              
              {/* Quick Guide */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2.5">
                <h4 className="font-bold text-slate-800 flex items-center gap-1">
                  <Info className="w-4 h-4 text-emerald-600" />
                  Guía Rápida de Configuración (3 pasos)
                </h4>
                <ol className="list-decimal pl-4 space-y-1.5 text-[11px] text-slate-600">
                  <li>
                    Ingresa a la consola de Google Cloud en{" "}
                    <a
                      href="https://console.cloud.google.com/"
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-600 hover:underline font-semibold inline-flex items-center gap-0.5"
                    >
                      console.cloud.google.com <ExternalLink className="w-3 h-3" />
                    </a>.
                  </li>
                  <li>
                    Habilita la API de <strong>Places API (New)</strong> en la sección de Biblioteca de APIs.
                  </li>
                  <li>
                    Crea una API Key en la sección <strong>APIs y Servicios &rarr; Credenciales</strong>, asegúrate de activar la facturación en tu cuenta (Google regala un saldo mensual gratuito) y pégala aquí abajo.
                  </li>
                </ol>
                <div className="text-[10px] text-slate-400 italic mt-1 bg-white p-1.5 rounded border border-slate-100 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tu clave se guarda localmente en este navegador de forma 100% segura.</span>
                </div>
              </div>

              {/* Input Field */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Ingresar API Key de Google
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={modalKeyInput}
                    onChange={(e) => setModalKeyInput(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                  />
                  <Key className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>
              </div>

              {/* Validation Statuses */}
              {validationError && (
                <div className="bg-red-50 border border-red-100 text-red-800 rounded-lg p-3 text-[11px] flex flex-col gap-1">
                  <div className="font-bold flex items-center gap-1.5 text-red-700">
                    <AlertTriangle className="w-4 h-4 text-red-500" />
                    <span>Clave no válida</span>
                  </div>
                  <span>{validationError}</span>
                </div>
              )}

              {validationSuccess && (
                <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-lg p-3 text-[11px] flex flex-col gap-1 animate-fadeIn">
                  <div className="font-bold flex items-center gap-1.5 text-emerald-700">
                    <CheckCircle className="w-4 h-4 text-emerald-500" />
                    <span>¡Validación Exitosa!</span>
                  </div>
                  <span>
                    La clave de Google Maps se validó con éxito en el servidor y ha sido guardada de manera local. Ahora podrás buscar negocios en tiempo real.
                  </span>
                </div>
              )}

              {/* Info about active state */}
              {customApiKey && !validationSuccess && !validationError && (
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-[11px] flex items-center justify-between text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Clave guardada activa: {customApiKey.substring(0, 6)}...{customApiKey.substring(customApiKey.length - 4)}
                  </span>
                  <button
                    onClick={handleRemoveKey}
                    className="text-red-500 hover:text-red-700 hover:underline font-bold text-[10px] cursor-pointer"
                  >
                    Remover Clave
                  </button>
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="bg-slate-50 p-4 border-t border-slate-150 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowKeyModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={handleValidateAndSaveKey}
                disabled={isValidatingKey || !modalKeyInput.trim()}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition cursor-pointer"
              >
                {isValidatingKey ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Validando en Google...
                  </>
                ) : (
                  "Validar y Guardar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
