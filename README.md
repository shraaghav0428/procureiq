# ProcureIQ — AI-Powered Procurement Analyst

An AI procurement analyst that embeds intelligent decision support directly into the supplier comparison workflow. Built for procurement managers who evaluate multi-vendor quotations across complex sourcing events.

**Live:** [procureiq-alpha.vercel.app](https://procureiq-alpha.vercel.app/)

## What It Does

ProcureIQ helps procurement teams make faster, evidence-backed supplier award decisions. Instead of a separate AI chatbot or analytics dashboard, the AI lives inside the comparison table — surfacing insights, generating recommendations, and driving the buyer's attention to the right data through interactive elements.

### Core Features

- **AI Insight Banner** — Auto-computed savings analysis, L1 vendor risk flag, and price spread vs L2. No LLM call required — instant on page load.
- **Supplier Comparison Table** — 5 vendors × 15 line items with L1-L5 ranking badges, price change indicators vs last buy, compliance status, certifications, lead times, and payment terms. Sticky columns, header, and total row.
- **Interactive Filters** — Non-compliant vendors, savings highlights, price increases, and L1/L2 focus. Managed via global state so they can be triggered from AI chat.
- **AI Chat Panel** — Split-view panel alongside the table with streaming responses, multi-turn history, inline chart generation, markdown table rendering, and action chips that navigate to vendor columns or toggle table filters.
- **AI Recommendation** — Structured vendor recommendation with evidence points (specific INR values, compliance counts, L-ranking wins), trade-offs, and confidence score.
- **Procurement Summary** — Executive-ready summary with key findings, risks, and strategic recommendation.
- **PDF Export** — Client-side report generation with event data, recommendation, and summary.

### Sourcing Events

| Event | Category | Vendors | Items |
|-------|----------|---------|-------|
| IT Equipment Procurement | Information Technology | 5 | 15 |
| Industrial Safety Equipment | Health & Safety | 5 | 15 |

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript |
| State | Zustand |
| Styling | Tailwind CSS v4 |
| AI | Anthropic Claude Haiku 4.5 (streaming) |
| Deploy | Vercel |

## Running Locally

```bash
cd app
npm install
```

Create `.env.local` with your Anthropic API key:

```
ANTHROPIC_API_KEY=your_key_here
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Design Principle

> The AI should live inside the procurement workflow — not pull users away from it.

Every AI feature augments the comparison table rather than replacing it. Action chips in chat responses navigate to vendor columns and toggle table filters. The recommendation context is injected into chat to prevent contradictions between AI surfaces.

## Author

Raaghav S.H.
