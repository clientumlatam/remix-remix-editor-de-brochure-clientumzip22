import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Users, Package, Building2, MessageSquare, MessagesSquare, Bot, Database } from 'lucide-react';
import CrmFullDashboard from './CrmFullDashboard';
import CrmFullPipeline from './CrmFullPipeline';
import CrmFullProducts from './CrmFullProducts';
import CrmFullSellers from './CrmFullSellers';
import CrmFullBranches from './CrmFullBranches';
import CrmFullConversations from './CrmFullConversations';
import CrmFullBotConfig from './CrmFullBotConfig';
import CrmFullCMDB from './CrmFullCMDB';
import { Conversation, Seller, Branch, Product } from './crmTypes';
import {
  initialConversations,
  initialSellers,
  initialBranches,
  initialProducts,
} from './crmInitialData';

type SubTab = 'dashboard' | 'crm' | 'products' | 'sellers' | 'branches' | 'conversations' | 'bot' | 'cmdb';

const tabs: { id: SubTab; label: string; icon: React.ReactNode }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'crm', label: 'CRM', icon: <MessagesSquare className="w-4 h-4" /> },
  { id: 'products', label: 'Productos', icon: <Package className="w-4 h-4" /> },
  { id: 'sellers', label: 'Vendedores', icon: <Users className="w-4 h-4" /> },
  { id: 'branches', label: 'Sucursales', icon: <Building2 className="w-4 h-4" /> },
  { id: 'conversations', label: 'Conversaciones', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'bot', label: 'Bot', icon: <Bot className="w-4 h-4" /> },
  { id: 'cmdb', label: 'Infraestructura', icon: <Database className="w-4 h-4" /> },
];

function loadOrDefault<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    if (saved) return JSON.parse(saved) as T;
  } catch {
    // ignore
  }
  return defaultValue;
}

interface CrmFullAppProps {
  /** When provided, the visible pane is controlled externally (e.g. by a unified top-level nav) instead of internal state. */
  activeTabOverride?: SubTab;
  /** Hides this component's own sub-nav — used when a parent nav already exposes these tabs. */
  hideNav?: boolean;
}

export default function CrmFullApp({ activeTabOverride, hideNav = false }: CrmFullAppProps = {}) {
  const [internalActiveTab, setInternalActiveTab] = useState<SubTab>('dashboard');
  const activeTab = activeTabOverride ?? internalActiveTab;
  const setActiveTab = setInternalActiveTab;

  const [conversations, setConversations] = useState<Conversation[]>(() =>
    loadOrDefault('clientum_crmfull_conversations', initialConversations)
  );
  const [sellers, setSellers] = useState<Seller[]>(() => {
    const saved = loadOrDefault('clientum_crmfull_sellers', initialSellers);
    return saved.length > 0 ? saved : initialSellers;
  });
  const [branches, setBranches] = useState<Branch[]>(() => {
    const saved = loadOrDefault('clientum_crmfull_branches', initialBranches);
    return saved.length > 0 ? saved : initialBranches;
  });
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = loadOrDefault('clientum_crmfull_products', initialProducts);
    // If localStorage had an empty array (first visit or reset), seed from catalog
    return saved.length > 0 ? saved : initialProducts;
  });

  // Persist to localStorage
  useEffect(() => { localStorage.setItem('clientum_crmfull_conversations', JSON.stringify(conversations)); }, [conversations]);
  useEffect(() => { localStorage.setItem('clientum_crmfull_sellers', JSON.stringify(sellers)); }, [sellers]);
  useEffect(() => { localStorage.setItem('clientum_crmfull_branches', JSON.stringify(branches)); }, [branches]);
  useEffect(() => { localStorage.setItem('clientum_crmfull_products', JSON.stringify(products)); }, [products]);

  const handleUpdateConversation = (id: string, data: Partial<Conversation>) => {
    setConversations(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
  };

  const handleSaveSeller = (seller: Seller) => {
    setSellers(prev => {
      const exists = prev.find(s => s.id === seller.id);
      return exists ? prev.map(s => s.id === seller.id ? seller : s) : [...prev, seller];
    });
  };

  const handleSaveBranch = (branch: Branch) => {
    setBranches(prev => {
      const exists = prev.find(b => b.id === branch.id);
      return exists ? prev.map(b => b.id === branch.id ? branch : b) : [...prev, branch];
    });
  };

  const handleSaveProduct = (product: Product) => {
    setProducts(prev => {
      const exists = prev.find(p => p.id === product.id);
      return exists ? prev.map(p => p.id === product.id ? product : p) : [...prev, product];
    });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <CrmFullDashboard />;
      case 'crm':
        return (
          <CrmFullPipeline
            conversations={conversations}
            sellers={sellers}
            onUpdateConversation={handleUpdateConversation}
          />
        );
      case 'products':
        return <CrmFullProducts products={products} onSave={handleSaveProduct} />;
      case 'sellers':
        return <CrmFullSellers sellers={sellers} onSave={handleSaveSeller} />;
      case 'branches':
        return <CrmFullBranches branches={branches} onSave={handleSaveBranch} />;
      case 'conversations':
        return <CrmFullConversations conversations={conversations} />;
      case 'bot':
        return <CrmFullBotConfig />;
      case 'cmdb':
        return <CrmFullCMDB />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {/* Sub-navigation */}
      {!hideNav && (
      <nav className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-1 overflow-x-auto flex-shrink-0 shadow-xs">
        <div className="flex items-center gap-1.5 mr-4 flex-shrink-0">
          <Building2 className="w-5 h-5 text-primary" />
          <span className="font-bold text-sm text-slate-700">CRM Completo</span>
        </div>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>
      )}

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
