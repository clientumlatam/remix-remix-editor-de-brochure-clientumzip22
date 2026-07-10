export interface StoredConfig {
  apiUrl: string;
  token: string;
}

export interface MeResponse {
  userId: number;
  email: string;
  tenantId: number;
  tenantName: string;
  hasApiKey: boolean;
}

export interface SuggestRequest {
  phone: string;
  messages: { from: "me" | "them"; text: string }[];
  tone: "formal" | "amigable" | "persuasivo" | "directo";
}

export interface DebtAlert {
  amount: number;
  invoiceCount: number;
  suggestedMessage: string;
}

export interface SuggestResponse {
  suggestion: string;
  contactName: string | null;
  handoffActive: boolean;
  debtAlert: DebtAlert | null;
}

export interface ChatStatus {
  phone: string;
  needsHuman: boolean;
  botPaused: boolean;
  escalatedAt: string | null;
}

export type MessageToBackground =
  | { type: "SUGGEST"; payload: SuggestRequest }
  | { type: "GET_STATUS"; payload: { phone: string } }
  | { type: "TOGGLE_BOT"; payload: { phone: string; paused: boolean } }
  | { type: "INSERT_TEXT"; payload: { text: string; tabId: number } }
  | { type: "GET_CONFIG" };

export type MessageFromBackground =
  | { type: "SUGGEST_OK"; data: SuggestResponse }
  | { type: "STATUS_OK"; data: ChatStatus }
  | { type: "TOGGLE_BOT_OK"; data: { botPaused: boolean } }
  | { type: "INSERT_TEXT_OK" }
  | { type: "CONFIG_OK"; data: StoredConfig | null }
  | { type: "ERROR"; error: string };
