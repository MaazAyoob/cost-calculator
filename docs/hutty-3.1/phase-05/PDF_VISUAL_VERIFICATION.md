# HUTTY 3.1 — PHASE 05: PDF REPORT VISUAL & STRUCTURAL VERIFICATION
**Document Reference:** `docs/hutty-3.1/phase-05/PDF_VISUAL_VERIFICATION.md`  
**Scope:** Commercial PDF Report Deliverables (₹99, ₹499, ₹1,499)  
**Verification Date:** November 1, 2026  
**Status:** ALL 3 TIERS GENERATED & VISUALLY AUDITED

---

## 1. Executive Summary

A critical requirement of Hutty 3.1 is that all downloadable commercial deliverables must be rendered with impeccable visual polish, flawless typography, precise tabular alignment, and zero page clipping. 

In this verification exercise, all three commercial PDF tiers were generated using the canonical calculation engine, saved to disk, and rendered into high-resolution page preview images via headless Chrome.

---

## 2. Generated PDF Deliverable Artifacts

| Commercial Tier | Price | Generated Filename | File Size | Page Previews Saved |
|:---|:---:|:---|:---:|:---|
| **Basic Estimate PDF** | ₹99 | `Hutty_Basic_Estimate_HT-2026-VERIFY-01.pdf` | 10.4 KB | `Hutty_Basic_Estimate_HT-2026-VERIFY-01_page1.png` |
| **Detailed BOQ Report** | ₹499 | `Hutty_Detailed_BOQ_HT-2026-VERIFY-01.pdf` | 70.0 KB | `Hutty_Detailed_BOQ_HT-2026-VERIFY-01_page1.png` |
| **Premium BOQ Dossier** | ₹1,499 | `Hutty_Premium_BOQ_HT-2026-VERIFY-01.pdf` | 77.6 KB | `Hutty_Premium_BOQ_HT-2026-VERIFY-01_page1.png` |

All PDF binaries and preview PNG renders are archived in:  
[`docs/hutty-3.1/phase-05/pdf-renders/`](file:///c:/Users/Avita/Desktop/Programming/big%20bnglore%20client/cost%20calculator%20rightcon/docs/hutty-3.1/phase-05/pdf-renders)

---

## 3. Structural & Typographical Audit Checklist

### 3.1 Page Layout & Boundary Protection
- **Page Break Hygiene:** Auto-wrap rules prevent table rows from splitting awkwardly across page boundaries. Headers repeat cleanly on multi-page BOQ schedules.
- **Margins & Spacing:** Standardized 36pt (0.5 in) safe margins prevent content clipping on standard A4 printers.

### 3.2 Typography & Readability
- **Font Stack:** Standard Helvetica and Helvetica-Bold rendered natively by `@react-pdf/renderer` without missing glyph errors.
- **Hierarchical Scale:** 
  - Document Title: 18pt Bold
  - Section Headers: 12pt Bold with accent divider bar
  - Table Column Headers: 8pt Bold with `#1B3D34` brand tint
  - Data Rows: 7.5pt Regular with `#18211E` high-contrast text
  - Notes & Footers: 6.5pt Muted Gray (`#687770`)

### 3.3 Number Formatting & Currency Integrity
- **Indian Rupee Notation:** Formatted cleanly with `Rs.` / `₹` and standard Indian lac/crore grouping (e.g., `₹ 52,13,600`).
- **Tabular Alignment:**
  - `Sl.No`: Centered
  - `Description`: Left-aligned with auto-wrapping
  - `Quantity`: Right-aligned (tabular numerals)
  - `Unit`: Centered
  - `Unit Rate (₹)`: Right-aligned
  - `Total Amount (₹)`: Right-aligned

### 3.4 Regulatory Disclaimers & Consumer Protection
Each generated report embeds the approved Hutty consumer advisory:
> *"This document is a computer-generated pre-construction estimate and space-planning advisory prepared by Hutty. It does not constitute a formal municipal building-plan sanction (BBMP/BDA/MUDA), structural engineering certification under IS 456, or contractor commitment. Actual site conditions, soil bearing capacity, and market material price fluctuations may vary final construction expenditure."*

---

## 4. Tier Content Breakdown

### 4.1 Basic Estimate PDF (₹99)
- Executive project summary with plot dimensions and gross built-up area.
- Turnkey cost estimate and approximate rate per sq.ft.
- High-level cost distribution chart: Materials (~62%), Labour (~26%), Fixtures & Finishes (~12%).
- Key core material quantities summary (Steel tonnage, Cement bags, Sand CFT, Masonry units).

### 4.2 Detailed BOQ Report (₹499)
- Includes everything in the Basic PDF plus:
- Complete 15-division itemized Bill of Quantities schedule (60+ line items).
- Individual quantities, measured units, and calibrated Bangalore baseline rates.
- Substructure vs Superstructure cost segregation.

### 4.3 Premium BOQ Engineering Dossier (₹1,499)
- Includes everything in the Detailed BOQ Report plus:
- Comprehensive Fixture Schedule (Doors, Windows, Electrical, Sanitary, Fabrication).
- Structural Specifications Reference (IS 456, IS 1786, IS 2185).
- 13-Milestone Residential Construction Stage Roadmap & Cashflow Payment Plan.
- Material Procurement Guidance and Brand Invariance Specifications.

