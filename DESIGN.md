# NER CONNECT — Design System & Visual Specification

**Stitch Project Source of Truth:** `17234927885700456669`  
**Platform:** SIH26002 — AI-Based Smart Logistics & Accessibility Intelligence for Northeast India (NER)  
**Authority:** Ministry of Development of North Eastern Region (MDoNER) / National Disaster Management Authority (NDMA)

---

## 1. Visual Philosophy & Aesthetic

- **Style Archetype:** High-Density Institutional Modernism + Tactical Cartographic Utility.
- **Chrome Envelope:** Deep Slate & Navy (`#0b1c30`, `#0f172a`, `#131b2e`, `#1e293b`) for global command navigation, header chrome, live map HUDs, and system telemetries.
- **Operational Surface Base:** Clean Crisp Slate-50 / Light Blue-Gray (`#f8fafc`, `#f8f9ff`) with pure white analytical cards (`#ffffff`) framed by 1px crisp structural hairline borders (`#e2e8f0`, `#cbd5e1`).
- **Typography:** Dual-type configuration:
  - **Interface Primary:** `Inter` (neutral, high x-height, maximum legibility).
  - **Telemetry Monospace:** `JetBrains Mono` (live GPS coordinates, speeds, cargo weights, model confidence scores, ISO timestamps, VIN tags).

---

## 2. Color Palette & Operational Semantics

### Core Brand & Architectural Tokens
| Token | Hex | Role |
| :--- | :--- | :--- |
| `primary` | `#0f172a` | Main command rail, primary buttons, terminal nodes |
| `primary-container` | `#131b2e` | Top alerts header, dark telemetry boxes |
| `inverse-surface` | `#0b1c30` | Header background, top sidebar identity |
| `secondary` | `#0051d5` / `#2563eb` | Logistics Blue, baseline routes, vehicle trackers, active links |
| `tertiary` / `ai-neural` | `#9333ea` | AI Route candidates, GNN attention logits, flood predictive models |
| `surface` | `#f8f9ff` | Application canvas background |
| `surface-container-lowest` | `#ffffff` | Pure white card surfaces & modal backgrounds |
| `surface-container-low` | `#eff4ff` | Secondary card fills & sub-tables |
| `surface-container` | `#e5eeff` | Tertiary container fills & badge backgrounds |
| `outline` | `#76777d` | Borders, subtle dividers |
| `outline-variant` | `#c6c6cd` / `#e2e8f0` | 1px card separators and table gridlines |

### Semantic & Crisis Status Colors (Strict Non-Negotiable Standards)
| Status | Token | Hex | Badge Bg | Badge Border | Meaning |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SAFE / OPEN** | `emerald` / `green` | `#16a34a` / `#22c55e` | `#f0fdf4` | `#bbf7d0` | Motorable passes, safe bridges, intact lifeline routes |
| **WATCH / CAUTION** | `amber` / `yellow` | `#eab308` / `#d97706` | `#fefce8` | `#fef08a` | Heavy rain (50-80mm/h), waterlogged, speed-restricted |
| **HIGH RISK** | `orange` | `#f97316` / `#ea580c` | `#fff7ed` | `#fed7aa` | Active landslide risk, single-lane emergency escort |
| **BLOCKED / CRITICAL** | `error` / `red` | `#dc2626` / `#b91c1c` | `#fef2f2` | `#fecaca` | Washed out bridge, submerged road, cut-off corridor |
| **ORIGINAL ROUTE** | `blue` | `#2563eb` | `#eff6ff` | `#bfdbfe` | Baseline OSRM / Scheduled transit path |
| **AI CANDIDATE** | `purple` | `#9333ea` | `#faf5ff` | `#e9d5ff` | Deep Learning GNN / RRNCO candidate corridor |
| **RECOMMENDED HYBRID** | `emerald-glow` | `#16a34a` | `#dcfce7` | `#86efac` | Optimal OR-Tools + LightGBM Lifeline Route |

---

## 3. Typography Hierarchy

```css
/* Display & Headlines */
.font-display-lg  { font-family: 'Inter'; font-size: 32px; font-weight: 700; line-height: 40px; letter-spacing: -0.02em; }
.font-headline-lg { font-family: 'Inter'; font-size: 24px; font-weight: 600; line-height: 32px; letter-spacing: -0.015em; }
.font-headline-md { font-family: 'Inter'; font-size: 20px; font-weight: 600; line-height: 28px; letter-spacing: -0.01em; }
.font-headline-sm { font-family: 'Inter'; font-size: 16px; font-weight: 600; line-height: 24px; letter-spacing: -0.005em; }

/* Body Text */
.font-body-lg { font-family: 'Inter'; font-size: 15px; font-weight: 400; line-height: 22px; }
.font-body-md { font-family: 'Inter'; font-size: 13px; font-weight: 400; line-height: 18px; }
.font-body-sm { font-family: 'Inter'; font-size: 12px; font-weight: 400; line-height: 16px; }

/* Monospace Telemetry */
.font-label-lg { font-family: 'JetBrains Mono'; font-size: 13px; font-weight: 500; line-height: 18px; letter-spacing: 0.02em; }
.font-label-md { font-family: 'JetBrains Mono'; font-size: 11px; font-weight: 500; line-height: 14px; letter-spacing: 0.04em; }
.font-label-sm { font-family: 'JetBrains Mono'; font-size: 10px; font-weight: 600; line-height: 12px; letter-spacing: 0.06em; }
```

---

## 4. Layout Architecture & Screen Grid

### Persistent Shell
1. **Left Sidebar Command Rail (`w-[280px]` / `sidebar-width`):** Fixed dark slate navigation housing:
   - NER CONNECT official emblem & title
   - 8 Northeast States indicator (`HQ GHY`)
   - 9 Primary screen links with active pill states and badged notification counts
   - Connection latency chip (`Operational • Low Latency 24ms`)
   - Senior Operations Officer profile (`Er. A. K. Sarma, Director of Logistics Ops NER`)
2. **Top Application Bar (`h-16`):**
   - Current view breadcrumb (`Operational View > Northeast Regional Command`)
   - Demo scenario quick trigger (`Run SIH Simulation (12:00 - 12:45 Flood Event)`)
   - Live Indian Standard Time (`IST`) & IMD Radar Sync status
   - Multilingual regional switcher (6 languages: English, Hindi, Assamese, Bengali, Khasi, Bodo)
3. **Main Workspace:** Responsive content area hosting active screen views.

### Screen Roster
1. **Command Center (`command-center`):** Top 6-column KPI strip + Split 68% Leaflet Map / 32% Operational Context (Active Incidents, Critical Cargo Focus, AI Route Decision Engine).
2. **Fleet & Deliveries (`fleet-and-deliveries`):** Fleet statistics strip, live vehicle list with search/status filters, vehicle inspection modal, cargo type badges, driver logs.
3. **Network Accessibility (`network-accessibility`):** State and district filters, road status matrix (Open/Watch/High Risk/Blocked), bridge structural condition, hazard overlays.
4. **AI Routing (`ai-routing`):** 4-way strategy comparison (Mode A: Baseline OSRM, Mode B: LightGBM Context, Mode C: GNN/Neural, Mode D: Hybrid Lifeline), elevation slope impact, radar rain factor.
5. **Supply Continuity (`supply-continuity`):** Hospital stockout predictions, hours-to-stockout countdowns, inventory reallocation recommendations, supply disruption chain.
6. **Field Operations (`field-operations`):** Report Incident modal with offline queue capability, camera photo capture, GPS geotagging, Incident Lifecycle review table (Reported, Under Review, Verified, Rejected, Resolved).
7. **Alerts (`alerts`):** Multilingual emergency broadcast generator, priority filters (Critical, High, Watch, Resolved), push notification triggers.
8. **Analytics (`analytics`):** Disruption charts, travel time regressors, ML AUC accuracy gauges, stockout prevention metrics.
9. **Administration (`administration`):** User roles & permissions, ML model registry, API health & DB stats, audit logs.

---

## 5. Map & GIS Standards

- **Engine:** Leaflet.js with high-contrast tactical dark/light vector layers for Northeast India (Assam, Meghalaya, Arunachal Pradesh, Nagaland, Manipur, Mizoram, Tripura, Sikkim).
- **Route Styling:**
  - `Original Route`: `#2563eb` solid 4px line
  - `Blocked Route Segment`: `#dc2626` striped/dashed 5px line with warning callout
  - `AI Candidate Route`: `#9333ea` dashed 3.5px line
  - `Recommended Hybrid Corridor`: `#16a34a` solid 5px line with pulse/glow highlight
- **Pins & Overlays:**
  - `Live Vehicle`: Truck icon with pulse ring & telemetry label tag
  - `Bridge Node`: Bridge symbol with color-coded load status
  - `Incident Node`: Hazard triangle with verified report thumbnail callout
  - `Hospital / Supply Hub`: Red cross badge with hours-to-stockout badge
- **Fail-safe Fallbacks:** If map tiles or external layers are slow, fallback to vector cartography without crashing the application.
