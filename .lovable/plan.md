## Goal

Add four new metrics as **real columns** in the Statistics table (visible for every grouping), without cards:

- **CPM** = spent / impressions × 1000
- **CPC** = spent / clicks
- **Confirmed conversions** (subset of conversions, only in conversion mode)
- **Confirmed income** (subset of income, only in conversion mode)

## Anti-clutter strategy

Base mode goes from 5 → 7 columns, conversion mode from 9 → 13. To keep it readable:

1. **Sticky first column** (`label`) so scrolling right keeps context.
2. **Horizontal scroll** on the table wrapper (already `overflow-x-auto`) — remove `table-fixed` and let columns size to content; set sensible `min-w-*` per column instead of hard `w-[...]` so wide screens still fit everything.
3. **Column groups in the header**: add a thin second header row that groups columns:
   - `Traffic` → Impressions, Clicks, CTR
   - `Cost` → Spent, CPM, CPC
   - `Conversions` (only in conversion mode) → Conversions, Confirmed, CR, Income, Confirmed income, ROI

   Visual separator (subtle vertical border) between groups so the eye parses blocks instead of a wall of numbers.
4. **Compact numeric formatting**: CPM/CPC use `$0.00` (2 decimals). Confirmed columns share the same formatting as their parent (`toLocaleString()` / `$`).
5. **Column picker** (small "Columns" popover next to the "Rows" selector) to hide/show CPM, CPC, Confirmed conversions, Confirmed income individually. Defaults: all on. Preference persisted in `StatisticsContext` so it survives navigation like the other filters. This lets power users trim the table if they don't want everything.
6. KPI cards stay untouched (user explicitly asked to keep them out).

```text
┌──────────┬──── Traffic ────┬──── Cost ────┬──────── Conversions ────────┐
│ Date     │ Impr  Clicks CTR │ Spent CPM CPC│ Conv Confirmed CR Income Confirmed ROI │
└──────────┴─────────────────┴──────────────┴─────────────────────────────┘
```

## Scope (frontend only, presentation)

### 1. `src/pages/DashboardStatistics.tsx`

- Extend `UiRow` (line 34) with `confirmedConversions?: number`, `confirmedIncome?: number`. CPM/CPC are derived, not stored.
- Response parser (lines 302–312): read `confirmed_conversions` / `confirmed_income` (with `confirmed_revenue` alias), default `0`.
- Grouped aggregation (lines 356–365) and hour/date fill loops: sum the two new fields alongside `conversions`/`income`.
- `totals` memo (lines 490–496): sum the two new fields.
- Table (lines 865–946):
  - Remove `table-fixed`; give each `<th>` a `min-w-*` and `whitespace-nowrap`.
  - First column becomes sticky: `sticky left-0 bg-card z-10` (and `bg-muted/30` variant for the totals row) so it stays put during horizontal scroll.
  - Add a small header group row (Traffic / Cost / Conversions) using `colspan`.
  - New columns:
    - **CPM** — `${(spent / impressions * 1000).toFixed(2)}` (or `$0.00`), placed after Spent.
    - **CPC** — `${(spent / clicks).toFixed(2)}`, after CPM.
    - **Confirmed** (conversions) — after Conversions.
    - **Confirmed income** — after Income.
  - Totals row mirrors all new cells.
- Add small **Columns** popover next to the "Rows" selector (lines 843–857) with four checkboxes: CPM, CPC, Confirmed conv., Confirmed income. Each column render is gated by its flag.
- CSV export: mirror the visible columns (all of them when all toggles are on), so exports match what the user sees.

### 2. `src/contexts/StatisticsContext.tsx`

- Add persisted flags: `showCpm`, `showCpc`, `showConfirmedConversions`, `showConfirmedIncome` (default `true` each) with matching setters, wired the same way as `showConversions`.

### 3. Translations — `src/contexts/LanguageContext.tsx` + `src/lib/translations-es.ts`

New keys: `stats.cpm`, `stats.cpc`, `stats.confirmed` (short "Confirmed" / "Подтв." / "Confirm."), `stats.confirmedIncome`, `stats.columns`, `stats.groupTraffic`, `stats.groupCost`, `stats.groupConversions`. EN / RU / ES.

### 4. Files touched

- `src/pages/DashboardStatistics.tsx`
- `src/contexts/StatisticsContext.tsx`
- `src/contexts/LanguageContext.tsx`
- `src/lib/translations-es.ts`

## Out of scope

- Backend / ClickHouse changes. Frontend reads new fields opportunistically; until backend supplies them, Confirmed columns render `0` — the layout is what the user wants to see now.
- Sorting on CPM / CPC / Confirmed (derived values). Existing sort keys stay.
- Overview / Campaigns pages.
