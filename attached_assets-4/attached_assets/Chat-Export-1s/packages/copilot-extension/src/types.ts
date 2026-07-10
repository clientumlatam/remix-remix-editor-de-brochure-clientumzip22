export interface WaMessage {
  from: "me" | "them";
  text: string;
}

export type BgMessage =
  | { type: "GET_STATUS" }
  | { type: "LOGIN"; payload: { apiUrl: string; email: string; password: string } }
  | { type: "LOGOUT" }
  | { type: "COPILOT_SUGGEST"; payload: { phone: string; messages: WaMessage[] } };

export interface AuthState {
  token: string;
  apiUrl: string;
  tenantName: string;
  email: string;
  hasApiKey: boolean;
}

export interface SuggestResponse {
  suggestion?: string;
  contactName?: string | null;
  handoffActive?: boolean;
  error?: string;
}
