# Clientum CRM

AI-powered B2B sales CRM with Kanban pipeline, MEDDIC qualification, prospect discovery, outreach campaigns, and brochure generation. Built with React + TypeScript + Vite on the frontend and an Express backend, powered by Google Gemini AI.

## How to run

```
npm run dev
```

The app starts on port 5000.

## Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Framer Motion
- **Backend**: Express (serves both the API and Vite dev middleware)
- **AI**: Google Gemini via `@google/genai`
- **PDF**: jsPDF for brochure export

## Required secrets

| Key | Description |
|-----|-------------|
| `GEMINI_API_KEY` | Google Gemini API key — powers all AI features |

## Optional secrets

| Key | Description |
|-----|-------------|
| `APIFY_API_TOKEN` | Apify token for real Google Maps scraping |
| `GOOGLE_MAPS_PLATFORM_KEY` | Google Maps Platform key for live prospect discovery |

## Features

- **CRM Kanban** — drag leads through pipeline stages with MEDDIC scoring
- **ICP Builder** — AI-generated Ideal Customer Profile
- **Patagonia Explorer** — prospect discovery via Google Maps / Apify
- **MEDDIC Qualification** — AI-assisted qualification scoring
- **Outreach Campaigns** — WhatsApp/email campaign automation
- **Brochure Generator** — AI-generated PDF brochures per prospect

## User preferences

- Keep the existing project structure and stack
