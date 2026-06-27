# Implementation Specification

## Stack
- Next.js
- TypeScript
- TailwindCSS
- shadcn/ui
- Lucide Icons

## Data
Static JSON datasets.

- 2 sourcing events
- 5 vendors
- 15 line items

## AI Flow
Dataset -> Prompt -> AI Response

Response format:
1. Answer
2. Evidence
3. Recommendation
4. Trade-offs

## Features
- Workspace toggle
- Sourcing Event selector
- Supplier comparison
- AI recommendations
- Suggested questions
- Procurement summary
- PDF/Excel export

## Guardrails
No unsupported answers.
Use only available procurement data.
