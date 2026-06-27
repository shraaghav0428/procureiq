# ProcureIQ Product Brief

## Product Overview
AI Procurement Analyst for post-RFQ supplier evaluation.

## Problem
Manual supplier evaluation is slow and inconsistent.

## Goal
Help procurement teams compare suppliers, ask AI questions, receive evidence-backed recommendations, generate summaries and export reports.

## Scope
- 2 sourcing events
- 5 vendors
- 15 line items
- Static datasets
- AI Recommendation
- Procurement Chat
- Procurement Summary
- PDF & Excel export

## Personas
### Procurement Manager
Operational decisions.

### Head of Procurement
Executive review.

Workspace toggle changes:
- Suggested Questions
- Procurement Summary

## Dataset
Events:
- Corporate Laptop Procurement
- Industrial Safety Equipment Procurement

Fields:
Item ID, Item Name, UoM, Qty/Batch, Annual Qty, Order Type, Unit Price, Total Price, Payment Terms, Incoterms, Lead Time, Commercial Remarks, Quotation Attachment, Technical Compliance, Historical Vendor Rating, Risk Level, Certifications.

## Guardrails
Only answer using provided dataset.
Never hallucinate.
Explain when information is unavailable.

## Success Metrics
- Recommendation <2 min
- AI <10 sec
- Summary <30 sec
- Export success 100%
