import React, { useState, useEffect } from "react";
import PublicWebsite from "./components/PublicWebsite";
import SalesProspectorDashboard from "./components/SalesProspectorDashboard";
import { DEFAULT_BROCHURE_DATA, INDUSTRY_PRESETS } from "./data";
import { BrochureData, CustomTemplate } from "./types";
import { exportBrochureToPDF } from "./utils/pdfGenerator";

export default function App() {
  const [viewMode, setViewMode] = useState<"website" | "prospector">("website");

  // Which industry solution page is being shown on the public website home ("general" = Default Clientum)
  const [publicIndustry, setPublicIndustry] = useState<string>("general");
  
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
      website: "clientum.com.ar",
      email: "info@clientum.com.ar",
      phone: "+54 9 298 451-0883",
      address: "General Roca, Río Negro, Argentina",
      github: "",
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
        phone: "+54 9 298 451-0883",
        address: "General Roca, Río Negro, Argentina",
        github: "",
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
        onBack={() => setViewMode("website")}
        onChangeDeals={(newDeals) => {
          setBrochureData((prev) => ({
            ...prev,
            crm: {
              ...prev.crm,
              deals: newDeals
            }
          }));
        }}
        onChangeBrochureData={setBrochureData}
        colorTheme={colorTheme}
        onThemeChange={setColorTheme}
        contactInfo={contactInfo}
        onContactChange={setContactInfo}
        activePreset={activePreset}
        onPresetChange={handlePresetChange}
        customTemplates={customTemplates}
        onSaveTemplate={handleSaveTemplate}
        onDeleteTemplate={handleDeleteTemplate}
        onHidePricesChange={setHidePrices}
        hideChatbot={hideChatbot}
        onHideChatbotChange={handleHideChatbotChange}
        showAllPages={showAllPages}
        onShowAllPagesChange={setShowAllPages}
        selectedPage={selectedPage}
        onSelectedPageChange={setSelectedPage}
        onPrint={handlePrint}
        onExportPDF={handleExportPDF}
        onResetBrochure={handleReset}
      />
    );
  }

  if (viewMode === "website") {
    return (
      <PublicWebsite
        onBackToEditor={() => setViewMode("prospector")}
        brochureData={brochureData}
        colorTheme={colorTheme}
        contactInfo={contactInfo}
        hidePrices={hidePrices}
      />
    );
  }

  // Fallback: should not normally be reached since viewMode is only "website" | "prospector".
  return (
    <PublicWebsite
      onBackToEditor={() => setViewMode("prospector")}
      brochureData={brochureData}
      colorTheme={colorTheme}
      contactInfo={contactInfo}
      hidePrices={hidePrices}
    />
  );
}
