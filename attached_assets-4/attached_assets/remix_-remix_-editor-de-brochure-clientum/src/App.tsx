import React, { useState, useEffect } from "react";
import SidebarEditor from "./components/SidebarEditor";
import BrochurePreview from "./components/BrochurePreview";
import PublicWebsite from "./components/PublicWebsite";
import SalesAssistantChat from "./components/SalesAssistantChat";
import SalesProspectorDashboard from "./components/SalesProspectorDashboard";
import { DEFAULT_BROCHURE_DATA, INDUSTRY_PRESETS } from "./data";
import { BrochureData, CustomTemplate } from "./types";
import { Printer, BookOpen, Sparkles, Sliders, RefreshCw, LayoutGrid, Layers, FileText, Globe, Target } from "lucide-react";
import { exportBrochureToPDF } from "./utils/pdfGenerator";

export default function App() {
  const [viewMode, setViewMode] = useState<"editor" | "website" | "prospector">("prospector");
  
  const [brochureData, setBrochureData] = useState<BrochureData>(() => {
    const saved = localStorage.getItem("clientum_brochure_data");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading brochureData from localStorage", e);
      }
    }
    return INDUSTRY_PRESETS.gaman?.data || DEFAULT_BROCHURE_DATA;
  });

  const [activePreset, setActivePreset] = useState<string>(() => {
    return localStorage.getItem("clientum_active_preset") || "gaman";
  });

  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(() => {
    const saved = localStorage.getItem("clientum_custom_templates");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading customTemplates from localStorage", e);
      }
    }
    return [];
  });

  const [colorTheme, setColorTheme] = useState<string>(() => {
    return localStorage.getItem("clientum_color_theme") || "navy";
  });

  const [showAllPages, setShowAllPages] = useState<boolean>(false);
  const [selectedPage, setSelectedPage] = useState<number>(1);
  
  const [hidePrices, setHidePrices] = useState<boolean>(() => {
    return localStorage.getItem("clientum_hide_prices") === "true";
  });

  const [hideChatbot, setHideChatbot] = useState<boolean>(() => {
    return localStorage.getItem("clientum_hide_chatbot") === "true";
  });

  const activePages = hideChatbot ? [1, 2, 4, 6, 7, 8] : [1, 2, 3, 4, 5, 6, 7, 8];

  const [contactInfo, setContactInfo] = useState(() => {
    const saved = localStorage.getItem("clientum_contact_info");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error loading contactInfo from localStorage", e);
      }
    }
    return {
      website: "gaman.com.ar",
      email: "gamanferreteria@gmail.com",
      phone: "+54 9 298 455-1234",
      address: "GAMAN Ferreterías (4 Sucursales)",
      github: "https://github.com/clientumlatam/clientum",
    };
  });

  // Persist states to localStorage
  useEffect(() => {
    localStorage.setItem("clientum_brochure_data", JSON.stringify(brochureData));
  }, [brochureData]);

  useEffect(() => {
    localStorage.setItem("clientum_active_preset", activePreset);
  }, [activePreset]);

  useEffect(() => {
    localStorage.setItem("clientum_color_theme", colorTheme);
  }, [colorTheme]);

  useEffect(() => {
    localStorage.setItem("clientum_hide_prices", String(hidePrices));
  }, [hidePrices]);

  useEffect(() => {
    localStorage.setItem("clientum_hide_chatbot", String(hideChatbot));
  }, [hideChatbot]);

  useEffect(() => {
    localStorage.setItem("clientum_contact_info", JSON.stringify(contactInfo));
  }, [contactInfo]);

  useEffect(() => {
    localStorage.setItem("clientum_custom_templates", JSON.stringify(customTemplates));
  }, [customTemplates]);

  const handlePresetChange = (presetKey: string) => {
    setActivePreset(presetKey);
    if (presetKey === "default") {
      setBrochureData(DEFAULT_BROCHURE_DATA);
    } else if (INDUSTRY_PRESETS[presetKey]) {
      setBrochureData(INDUSTRY_PRESETS[presetKey].data);
    } else if (presetKey.startsWith("custom_")) {
      const templateId = presetKey.replace("custom_", "");
      const found = customTemplates.find((t) => t.id === templateId);
      if (found) {
        setBrochureData(found.brochureData);
        setColorTheme(found.colorTheme);
        setHidePrices(found.hidePrices);
        if (found.hideChatbot !== undefined) {
          setHideChatbot(found.hideChatbot);
        }
      }
    }
  };

  const handleSaveTemplate = (name: string) => {
    const newTemplate: CustomTemplate = {
      id: Math.random().toString(36).substring(2, 11),
      name,
      createdAt: new Date().toLocaleString("es-AR"),
      brochureData,
      colorTheme,
      hidePrices,
      hideChatbot,
    };
    setCustomTemplates((prev) => [...prev, newTemplate]);
    setActivePreset(`custom_${newTemplate.id}`);
  };

  const handleDeleteTemplate = (id: string) => {
    setCustomTemplates((prev) => prev.filter((t) => t.id !== id));
    if (activePreset === `custom_${id}`) {
      setActivePreset("default");
    }
  };

  const handleReset = () => {
    if (confirm("¿Estás seguro de reiniciar los textos del brochure a sus valores predeterminados?")) {
      setBrochureData(DEFAULT_BROCHURE_DATA);
      setActivePreset("default");
      setColorTheme("navy");
      setHideChatbot(false);
      setHidePrices(false);
      setContactInfo({
        website: "clientum.com.ar",
        email: "info@clientum.com.ar",
        phone: "+54 298 451-0883",
        address: "General Roca, Río Negro",
        github: "https://github.com/clientumlatam/clientum",
      });
      localStorage.removeItem("clientum_sim_deals");
      localStorage.removeItem("clientum_brochure_data");
      localStorage.removeItem("clientum_active_preset");
      localStorage.removeItem("clientum_color_theme");
      localStorage.removeItem("clientum_hide_prices");
      localStorage.removeItem("clientum_hide_chatbot");
      localStorage.removeItem("clientum_contact_info");
    }
  };

  const handlePrint = () => {
    // Switch to multi-page view for clean prints
    const originalShowAll = showAllPages;
    setShowAllPages(true);
    
    // Allow React state to update before opening print dialog
    setTimeout(() => {
      window.print();
      setShowAllPages(originalShowAll);
    }, 250);
  };

  const handleExportPDF = () => {
    exportBrochureToPDF(brochureData, contactInfo, colorTheme, hideChatbot);
  };

  const handleHideChatbotChange = (hide: boolean) => {
    setHideChatbot(hide);
    if (hide && (selectedPage === 3 || selectedPage === 5)) {
      setSelectedPage(4);
    }
  };

  if (viewMode === "prospector") {
    return (
      <SalesProspectorDashboard
        brochureData={brochureData}
        hidePrices={hidePrices}
        onBack={() => setViewMode("editor")}
        onChangeDeals={(newDeals) => {
          setBrochureData((prev) => ({
            ...prev,
            crm: {
              ...prev.crm,
              deals: newDeals
            }
          }));
        }}
      />
    );
  }

  if (viewMode === "website") {
    return (
      <PublicWebsite
        onBackToEditor={() => setViewMode("editor")}
        brochureData={brochureData}
        colorTheme={colorTheme}
        contactInfo={contactInfo}
        hidePrices={hidePrices}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-sans text-slate-800 overflow-hidden">
      {/* Dynamic Header Navbar (Hidden during prints) */}
      <header className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between no-print z-10 shadow-xs flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Logo SVG */}
          <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center">
            <svg width="22" height="22" viewBox="0 0 180 180" fill="none">
              <rect width="180" height="180" rx="36" fill="#1A3461"/>
              <line x1="90" y1="28" x2="152" y2="90" stroke="white" strokeWidth="11" strokeLinecap="round"/>
              <line x1="152" y1="90" x2="90" y2="152" stroke="white" strokeWidth="11" strokeLinecap="round"/>
              <line x1="90" y1="152" x2="28" y2="90" stroke="white" strokeWidth="11" strokeLinecap="round"/>
              <line x1="28" y1="90" x2="90" y2="28" stroke="white" strokeWidth="11" strokeLinecap="round"/>
              <circle cx="90" cy="28" r="14" fill="white"/>
              <circle cx="152" cy="90" r="14" fill="white"/>
              <circle cx="90" cy="152" r="14" fill="white"/>
              <circle cx="28" cy="90" r="14" fill="white"/>
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-850 flex items-center gap-1.5 leading-none">
              Editor de Brochure Clientum
              <span className="bg-blue-100 text-blue-800 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider font-mono">
                2026 Edition
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Personaliza, simula e imprime en formato A4 para tus clientes de Argentina.
            </p>
          </div>
        </div>

        {/* Global Mode Switcher - Editor vs Prospector vs Public Website */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setViewMode("editor")}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "editor"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Ir al Editor de Brochure de Clientum"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Editor de</span> Brochure
          </button>
          <button
            onClick={() => setViewMode("prospector")}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "prospector"
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Ir al Prospectador de Clientes B2B v2.0"
          >
            <Target className="w-3.5 h-3.5" />
            <span>AI Client Prospector 🎯</span>
          </button>
          <button
            onClick={() => setViewMode("website")}
            className={`px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
              viewMode === "website"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-500 hover:text-slate-800"
            }`}
            title="Ver el Sitio Web Público de Clientum"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Sitio Web 🌐</span>
          </button>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="bg-slate-100 p-0.5 rounded-lg flex items-center gap-1 border border-slate-200">
            <button
              onClick={() => setShowAllPages(false)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                !showAllPages ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Ver página individual"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Página Única
            </button>
            <button
              onClick={() => setShowAllPages(true)}
              className={`px-3 py-1.5 rounded-md text-[11px] font-bold flex items-center gap-1 transition-all ${
                showAllPages ? "bg-white text-slate-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
              }`}
              title="Ver todas las páginas apiladas"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Ver Todas (Imprimir)
            </button>
          </div>

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="text-slate-500 hover:text-red-600 bg-slate-50 hover:bg-red-50 border border-slate-200 p-2 rounded-lg transition-colors"
            title="Reiniciar textos"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          {/* Print button */}
          <button
            onClick={handlePrint}
            className="bg-slate-700 hover:bg-slate-800 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Abrir diálogo de impresión para guardar como PDF desde el navegador"
          >
            <Printer className="w-4 h-4" />
            Imprimir / PDF A4
          </button>

          {/* Export PDF button */}
          <button
            onClick={handleExportPDF}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Descargar Brochure completo como PDF Vectorial de Alta Calidad"
          >
            <FileText className="w-4 h-4" />
            Descargar PDF
          </button>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        {/* Left Side Editors */}
        <SidebarEditor
          data={brochureData}
          onChange={setBrochureData}
          preset={activePreset}
          onPresetChange={handlePresetChange}
          colorTheme={colorTheme}
          onThemeChange={setColorTheme}
          contactInfo={contactInfo}
          onContactChange={setContactInfo}
          hidePrices={hidePrices}
          onHidePricesChange={setHidePrices}
          hideChatbot={hideChatbot}
          onHideChatbotChange={handleHideChatbotChange}
          customTemplates={customTemplates}
          onSaveTemplate={handleSaveTemplate}
          onDeleteTemplate={handleDeleteTemplate}
        />

        {/* Right Side Live Interactive Preview */}
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {/* Page Selector Tabs (Only shown in single view mode) */}
          {!showAllPages && (
            <div className="bg-white border-b border-slate-200 px-6 py-2 flex items-center gap-1 overflow-x-auto no-print flex-shrink-0 scrollbar-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-2 font-mono flex items-center gap-1">
                <Layers className="w-3 h-3 text-slate-400" /> Páginas:
              </span>
              {activePages.map((page) => (
                <button
                  key={page}
                  onClick={() => setSelectedPage(page)}
                  className={`px-3 py-1 rounded-md text-[11px] font-bold transition-all ${
                    selectedPage === page
                      ? "bg-slate-800 text-white shadow-xs"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                  }`}
                >
                  Pág. {activePages.indexOf(page) + 1}
                </button>
              ))}
            </div>
          )}

          {/* Render Brochure Preview */}
          <BrochurePreview
            data={brochureData}
            colorTheme={colorTheme}
            contactInfo={contactInfo}
            selectedPage={selectedPage}
            showAllPages={showAllPages}
            hidePrices={hidePrices}
            hideChatbot={hideChatbot}
            preset={activePreset}
            onChange={setBrochureData}
          />
        </div>

        {/* Floating Sales Assistant Chat */}
        <SalesAssistantChat
          brochureData={brochureData}
          preset={activePreset}
        />
      </main>
    </div>
  );
}
