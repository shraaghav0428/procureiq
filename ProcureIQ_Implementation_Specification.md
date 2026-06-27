# ProcureIQ — Implementation Specification

> Version: 1.0
> Author: Raaghav S H
> Project: ProcureIQ – AI Procurement Analyst
> Assignment: Aerchain – Assignment 2

---

# 1. Objective

This document provides the technical implementation guidance required to build the ProcureIQ prototype.

The objective is **not** to build a production-ready procurement platform.

The objective is to build a polished, enterprise-quality AI prototype that demonstrates how natural language can simplify supplier evaluation after an RFQ has been completed.

The implementation should prioritize:

- Clean UI
- Fast interactions
- Predictable AI behaviour
- Clear procurement workflows
- Maintainable code
- Reusable components

---

# 2. Technology Stack

The technology stack is intentionally modern and lightweight.

## Frontend

- Next.js
- React
- TypeScript

## Styling

- Tailwind CSS

## Components

- shadcn/ui

## Icons

- Lucide React

## Charts

- Recharts

## AI

- Google Gemini

## State

- React Hooks

No Redux.

No Zustand.

Global state should be avoided unless genuinely necessary.

---

# 3. Folder Structure

The project should follow a clean, scalable folder hierarchy.

```text
app/
components/
components/chat/
components/layout/
components/sidebar/
components/table/
components/cards/
components/export/

data/

hooks/

lib/

services/

types/

utils/

public/
```

All procurement data should remain separate from presentation logic.

---

# 4. Static Dataset

The prototype uses static procurement datasets.

Two sourcing events are supported.

## Event 1

Corporate Laptop Procurement

## Event 2

Industrial Safety Equipment Procurement

Each event contains:

- Five Vendors
- Fifteen Line Items
- Supplier questionnaire
- Commercial attributes
- Procurement summary
- AI recommendation

The application should never fetch external procurement data.

Everything should load locally.

---

# 5. Data Model

Each sourcing event should include:

```typescript
Sourcing Event

↓

Vendors

↓

Line Items

↓

Commercial Information

↓

AI Analysis
```

Every vendor should contain:

- Vendor Name
- Historical Rating
- Technical Compliance
- Lead Time
- Payment Terms
- Incoterms
- Unit Price
- Total Price
- Commercial Remarks
- Certifications
- Risk Level
- Quotation Attachment

---

# 6. Screen Architecture

The application consists of one primary workspace.

The layout contains three persistent regions.

## Header

- Navigation
- Workspace Toggle
- Sourcing Event Selector
- Export Buttons

---

## Left Sidebar

- Procurement Snapshot
- Suggested Questions
- AI Status

---

## Centre Workspace

- Supplier Comparison Table

---

## Right Panel

- AI Chat
- Recommendation Card
- Procurement Summary

The layout should never change between personas.

Only content changes.

---

# 7. Component Hierarchy

The application should be built using reusable components.

Examples include:

```
Header

Sidebar

WorkspaceToggle

SourcingDropdown

SnapshotCard

SuggestedQuestionChip

ComparisonTable

VendorHeader

LineItemRow

RecommendationCard

ChatPanel

ChatMessage

ProcurementSummary

ExportButton
```

Each component should have a single responsibility.

Avoid large monolithic files.

---

# 8. AI Behaviour

The AI should behave like an experienced Procurement Analyst.

Every answer should follow the same response structure.

## Response Template

- Answer
- Supporting Evidence
- Recommendation
- Trade-offs

This consistency improves trust and readability.

---

# 9. Suggested Questions

Suggested Questions are predefined prompts.

Clicking a suggestion should immediately submit it.

Examples:

- Which supplier should I award?
- Compare Vendor A and Vendor C.
- Show pricing comparison.
- Highlight procurement risks.
- Generate Procurement Summary.

This reduces typing and demonstrates capability during the live demo.

---

# 10. Recommendation Engine

Recommendations should never appear random.

Instead they should evaluate multiple procurement dimensions.

Suggested factors:

- Commercial Value
- Lead Time
- Technical Compliance
- Historical Rating
- Risk Level
- Payment Terms

Rather than calculating a visible numerical score, the recommendation should explain the reasoning behind the decision.

Users trust evidence more than algorithms.

---

# 11. AI Guardrails

The AI must never:

- Hallucinate suppliers
- Invent prices
- Create fake procurement insights
- Recommend unsupported suppliers
- Answer unrelated questions

If insufficient information exists, the AI should explicitly state this.

Example:

> The current procurement dataset does not contain sufficient information to answer this question.

---

# 12. Prompt Design

Every AI prompt should include:

- Selected sourcing event
- Supplier comparison data
- User question
- System instructions

The system prompt should clearly define the AI's role.

Example:

"You are an experienced Procurement Analyst.

Answer only using the procurement dataset provided.

Never invent information.

Always explain your reasoning.

Always provide supporting evidence.

Politely decline unrelated questions."

---

# 13. Export

## PDF Export

Should export:

- Procurement Summary
- Recommendation
- Key Supplier Comparison
- Date
- Sourcing Event

## Excel Export

Should export:

- Complete supplier comparison table
- One worksheet
- Clean formatting

No hidden calculations.

---

# 14. Loading States

Whenever AI responses are generated:

- Display animated thinking state.
- Disable duplicate submissions.
- Maintain scroll position.
- Show smooth message transitions.
- Avoid full-page loading screens.

---

# 15. Error Handling

If Gemini fails:

- Display friendly error message.
- Allow retry.
- Never crash the application.

If exports fail:

- Notify user.
- Allow retry.

---

# 16. Performance

The application should feel instant.

Target:

| Action | Target |
|---|---|
| Initial load | <2 seconds |
| AI responses | <10 seconds |
| Table switching | Instant |
| Exports | <5 seconds |

---

# 17. Accessibility

- Buttons should be keyboard accessible.
- Contrast ratios should meet WCAG recommendations.
- Icons should always include labels or tooltips.
- Tables should remain readable on smaller laptop screens.

---

# 18. Future Extensibility

The architecture should make it easy to support:

- Live ERP integrations
- Dynamic procurement datasets
- OCR
- Supplier document ingestion
- AI Agents
- Contract Intelligence
- Spend Analytics
- Multi-sourcing events
- Real-time collaboration

Although these capabilities are outside the scope of this assignment, the project structure should not prevent them from being added in the future.

---

# 19. Definition of Done

The implementation is complete when:

- Both sourcing events are fully functional.
- Persona switching works correctly.
- AI answers procurement questions.
- Recommendation card updates correctly.
- Procurement Summary generates successfully.
- PDF export works.
- Excel export works.
- Suggested Questions work.
- Static procurement dataset is complete.
- The application is polished enough for a live demonstration.

---

# 20. Engineering Principles

While building this prototype, prioritize the following:

- Readability over cleverness.
- Simplicity over unnecessary abstraction.
- Consistency over experimentation.
- Trust over AI creativity.
- Enterprise UX over flashy UI.

The finished product should feel like a focused feature that could exist inside a modern procurement platform such as Aerchain, rather than a standalone AI chatbot.
