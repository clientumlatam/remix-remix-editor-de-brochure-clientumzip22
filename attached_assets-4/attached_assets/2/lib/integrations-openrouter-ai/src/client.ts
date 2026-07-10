import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getOpenRouterClient(): OpenAI {
  if (!process.env.OPENROUTER_API_KEY) {
    throw new Error(
      "OPENROUTER_API_KEY must be set. Add it to your Replit secrets.",
    );
  }
  if (!_client) {
    _client = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });
  }
  return _client;
}

export const openrouter = new Proxy({} as OpenAI, {
  get(_target, prop) {
    return getOpenRouterClient()[prop as keyof OpenAI];
  },
});

export function createOpenRouterClient(apiKey: string): OpenAI {
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });
}
