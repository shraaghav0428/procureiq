# ProcureIQ — UI / UX Specification

> Version: 1.0
> Author: Raaghav S H
> Project: ProcureIQ – AI Procurement Analyst
> Assignment: Aerchain – Assignment 2

---

# 1. Design Philosophy

ProcureIQ is not a chatbot.

It is not a dashboard.

It is an AI-powered procurement workspace.

The experience should feel like sitting beside an experienced Procurement Analyst who has already reviewed every supplier quotation before the buyer begins asking questions.

The interface should reduce cognitive load rather than increase it.

Every screen should communicate three qualities:

- Trust
- Clarity
- Speed

The application should feel calm, spacious and enterprise-grade.

It should never feel cluttered.

---

# 2. Design Principles

The interface follows six core principles.

## 1. Information before decoration

Every UI element must help users make procurement decisions.

Avoid unnecessary animations.

Avoid decorative widgets.

Prioritize clarity.

---

## 2. White space creates confidence

Enterprise users spend hours inside procurement software.

Generous spacing makes information easier to scan.

Large comparison tables should never feel overwhelming.

---

## 3. AI should feel integrated

The AI Procurement Analyst is part of the workspace.

It should never appear like an external chatbot bolted onto the application.

The AI and procurement comparison should feel tightly connected.

---

## 4. Recommendations should be explainable

The application should never simply say

"Vendor B is recommended."

Instead it should explain

- Why
- Based on what evidence
- What trade-offs exist
- What risks remain

Transparency builds trust.

---

## 5. Everything should be scannable

Users should understand the screen within five seconds.

Important information should always appear above the fold.

---

## 6. Enterprise first

Every component should feel like it belongs inside products such as:

- SAP Ariba
- Coupa
- Zip
- Aerchain
- Linear
- Notion

Professional.

Minimal.

Confident.

---

# 3. Colour Palette

Primary

#0070BB

Used for:

- Primary buttons
- Active tabs
- Links
- Highlights

---

Background

#FFFFFF

---

Surface

#F8FAFC

Used for cards.

---

Border

#E5E7EB

---

Primary Text

#111827

---

Secondary Text

#6B7280

---

Success

#16A34A

---

Warning

#F59E0B

---

Risk

#DC2626

---

# 4. Typography

Headings

Font Weight

600

Colour

#111827

---

Body

Regular

16px

---

Small Text

14px

Used for helper information.

---

Badges

12px

Semi Bold

Uppercase

---

# 5. Layout

The application uses a three-column layout.

```
-----------------------------------------------------------

Header

-----------------------------------------------------------

Sidebar          Comparison Workspace          AI Analyst Panel

-----------------------------------------------------------
```

The layout remains fixed throughout the application.

Users should never lose context.

---

# 6. Header

Height

72px

Contents

ProcureIQ Logo

Workspace Toggle

Sourcing Event Dropdown

Export PDF

Export Excel

User Avatar

---

Workspace Toggle

Located beside the logo.

Two options

- Procurement Manager
- Head of Procurement

Switching personas updates

- Suggested Questions
- Procurement Summary

Everything else remains unchanged.

This ensures users always remain within the same procurement context.

---

Sourcing Event Dropdown

Contains two static sourcing events.

- Corporate Laptop Procurement
- Industrial Safety Equipment Procurement

Changing the sourcing event replaces

- Vendors
- Line Items
- Quotations
- AI Responses

The layout never changes.

---

Export Buttons

Two buttons.

- Export PDF
- Export Excel

Exports should always represent the currently selected sourcing event.

---

# 7. Left Sidebar

Width

Approximately 280px.

Purpose

Quick navigation.

High-level procurement context.

AI guidance.

The sidebar remains visible at all times.

---

Section 1

Procurement Snapshot

Card layout.

Displays

- Number of Vendors
- Total Line Items
- Lowest Bid
- Highest Technical Score
- Average Lead Time

These metrics update whenever the sourcing event changes.

---

Section 2

Suggested Questions

Appears as clickable chips.

Example

- Which supplier should I award?
- Compare Vendor A and Vendor C.
- Who has the lowest total cost?
- Generate Procurement Summary.
- Which supplier has the best payment terms?

Clicking a chip automatically submits the prompt to the AI.

No typing required.

---

Section 3

AI Status

Small information card.

Displays

- Dataset Loaded
- 5 Vendors
- 15 Line Items
- Ready for Questions

This subtly reassures users that the AI is operating on the loaded procurement dataset only.
