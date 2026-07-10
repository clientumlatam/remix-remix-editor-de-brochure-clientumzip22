export interface Feature {
  title: string;
  desc: string;
}

export interface ServiceItem {
  title: string;
  desc: string;
  bullets: string[];
  price?: number;
  monthly?: number;
  time?: number;
}

export interface PricingPlan {
  name: string;
  price: string;
  desc: string;
  features: string[];
  note: string;
}

export interface BrochureData {
  cover: {
    slogan: string;
    sub: string;
  };
  chatbot: {
    title: string;
    features: Feature[];
    flowSteps: string[];
  };
  crm: {
    title: string;
    features: Feature[];
    stageLabels?: {
      leads: string;
      bot_contact: string;
      proposed: string;
      closed: string;
    };
    deals?: CRMDeal[];
  };
  services: ServiceItem[];
  testimonial: {
    text: string;
    author: string;
    company: string;
  };
  outreachEmail?: string;
  images?: Record<number, string>;
  logoUrl?: string;
}

export interface CRMDeal {
  id: string;
  company: string;
  amount: number;
  stage: "leads" | "bot_contact" | "proposed" | "closed";
  industry: string;
  city?: string;
  address?: string;
  phone?: string;
  contact?: string;
  contactTitle?: string;
  painPoint?: string;
  guiacoresUrl?: string;

  // v2.0 MEDDIC Metrics
  meddicMetrics?: number;
  meddicBuyer?: number;
  meddicCriteria?: number;
  meddicProcess?: number;
  meddicPain?: number;
  meddicChampion?: number;
  meddicScore?: number;
  meddicRedFlags?: string;
  meddicNextActions?: string[];

  // v2.0 Outreach Copy sequences
  outreachEmail1?: string;
  outreachEmail2?: string;
  outreachEmail3?: string;
  outreachLinkedIn?: string[];
  outreachPhoneScript?: string;
}

export interface AIChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  chartData?: any[];
  chartType?: "bar" | "line" | "pie";
}

export interface CustomTemplate {
  id: string;
  name: string;
  createdAt: string;
  brochureData: BrochureData;
  colorTheme: string;
  hidePrices: boolean;
  hideChatbot: boolean;
}

