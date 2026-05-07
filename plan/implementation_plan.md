# Implementation Plan: Twenty Constitutions Dashboard

## Data Overview

### preprocessed_data.csv

**2,797 sections** across **38 constitutional documents** (1932–2021).

| Field                                  | Description                                                | Values    |
| -------------------------------------- | ---------------------------------------------------------- | --------- |
| `section_id`                           | Unique key e.g. `const_2475_s_1`                           | 2,797     |
| `doc_id`                               | Parent document e.g. `const_2475`                          | 38        |
| `doc_type`                             | `full` / `amendment` / `interim`                           | 3         |
| `year_th` / `year_ce`                  | Buddhist / Christian year                                  | 1932–2021 |
| `name_short`                           | Short constitution name                                    | ~31       |
| `era`                                  | Political era                                              | 8         |
| `regime_type`                          | `civilian` / `military` / `semi_military`                  | 3         |
| `parent_doc_id`                        | For amendments: the doc being amended                      | —         |
| `chapter_number`                       | Chapter number (0 = general/preamble)                      | —         |
| `chapter_title`                        | Thai chapter title                                         | —         |
| `sub_section_number`                   | Sub-section number                                         | —         |
| `section_number`                       | Section number within document                             | —         |
| `section_role`                         | `content` / `wrapper` / `quoted`                           | 3         |
| `target_chapter` / `target_section_no` | Amendment target reference                                 | —         |
| `change_mode`                          | `content` / `amended` / `new` / `text_substitution` / etc. | 10        |
| `text`                                 | Full Thai text of the section                              | —         |
| `tokens`                               | Tokenized word list (Python list string)                   | —         |
| `word_count`                           | Word count (min 2, max 642, avg 39.5)                      | —         |

**Era breakdown:**

| Era                 | Period    | Sections |
| ------------------- | --------- | -------- |
| `early_democracy`   | 1932–1946 | 173      |
| `post_coup_1947`    | 1947–1951 | 339      |
| `dictatorship`      | 1952–1972 | 226      |
| `democratic_spring` | 1973–1976 | 272      |
| `semi_democracy`    | 1977–1991 | 248      |
| `modern_democracy`  | 1992–2005 | 850      |
| `post_coup_2006`    | 2006–2013 | 365      |
| `post_coup_2014`    | 2014–2021 | 324      |

**Doc type counts:** full: 2,166 · amendment: 358 · interim: 273
**Regime counts:** civilian: 1,521 · military: 784 · semi_military: 492

---

### section_theme_scores.csv

**5,188 rows** — thematic scoring of every section. Each section can appear multiple times (once per assigned theme). Join key: `section_id`.

| Field             | Description                                      |
| ----------------- | ------------------------------------------------ |
| `section_id`      | Joins to `preprocessed_data.csv`                 |
| `constitution_id` | Parent document                                  |
| `year_th`         | Buddhist year                                    |
| `topic`           | Numeric topic ID (–1 to 99, 102 distinct values) |
| `theme`           | Human-readable Thai theme label (13 themes)      |
| `theme_score`     | Relevance weight 0.06–1.0 (avg 0.54)             |

**13 Themes (by total section weight):**

| #   | Theme                                                  | Sections scored |
| --- | ------------------------------------------------------ | --------------- |
| 1   | นิติบัญญัติ (Legislature)                              | 1,223           |
| 2   | บริหาร (Executive)                                     | 692             |
| 3   | สถาบันพระมหากษัตริย์ (Monarchy)                        | 656             |
| 4   | สิทธิ-เสรีภาพ-หน้าที่ (Rights & Duties)                | 577             |
| 5   | แนวนโยบายแห่งรัฐ (State Policy)                        | 464             |
| 6   | พรรคการเมืองและการเลือกตั้ง (Parties & Elections)      | 439             |
| 7   | อื่น ๆ (Other/Emergent)                                | 355             |
| 8   | ตุลาการ (Judiciary)                                    | 343             |
| 9   | ท้องถิ่น (Local Government)                            | 163             |
| 10  | ตรวจสอบอำนาจรัฐ/ต้านทุจริต (Oversight/Anti-corruption) | 129             |
| 11  | จริยธรรมทางการเมือง (Political Ethics)                 | 54              |
| 12  | การคลังและงบประมาณ (Finance & Budget)                  | 53              |
| 13  | การมีส่วนร่วมทางการเมือง (Political Participation)     | 40              |

**Multi-theme sections:** 1,405 sections carry 2+ themes. 1,371 sections have a single dominant score of 1.0.

**Theme weight by era (top 3 per era):**

| Era                 | Dominant → Secondary → Tertiary             |
| ------------------- | ------------------------------------------- |
| `early_democracy`   | อื่น ๆ → นิติบัญญัติ → สถาบันพระมหากษัตริย์ |
| `post_coup_1947`    | นิติบัญญัติ → สถาบันพระมหากษัตริย์ → อื่น ๆ |
| `dictatorship`      | นิติบัญญัติ → สถาบันพระมหากษัตริย์ → อื่น ๆ |
| `democratic_spring` | นิติบัญญัติ → สถาบันพระมหากษัตริย์ → อื่น ๆ |
| `semi_democracy`    | นิติบัญญัติ → สถาบันพระมหากษัตริย์ → อื่น ๆ |
| `modern_democracy`  | นิติบัญญัติ → อื่น ๆ → แนวนโยบายแห่งรัฐ     |
| `post_coup_2006`    | นิติบัญญัติ → บริหาร → สถาบันพระมหากษัตริย์ |
| `post_coup_2014`    | นิติบัญญัติ → บริหาร → แนวนโยบายแห่งรัฐ     |

Observation: สิทธิ-เสรีภาพ-หน้าที่ (Rights & Duties) and ตรวจสอบอำนาจรัฐ (Oversight) never reach the top 3 in any era — a historically meaningful signal worth surfacing in the UI.

---

## Tech Stack

**Framework:** React Router v7 (SSR, file-based routing)
**Styling:** Tailwind CSS v4 + shadcn/ui
**Icons:** HugeIcons
**Fonts:** Geist Variable, Inter Variable (+ Noto Sans Thai for section text)
**Language:** TypeScript + React 19
**Package manager:** Bun

---

## Data Layer

```
app/data/
  types.ts                       # Shared TypeScript types
  constitutions.server.ts        # preprocessed_data.csv loader + aggregators
  themes.server.ts               # section_theme_scores.csv loader + join helpers
```

Both CSVs are parsed server-side in React Router loaders using `papaparse`. No database needed — total data is ~8k rows. Join by `section_id` at load time, cache in module scope per server process.

**Key types:**

```ts
type ConstitutionSection = {
  section_id: string
  doc_id: string
  doc_type: "full" | "amendment" | "interim"
  year_ce: number
  name_short: string
  era: Era
  regime_type: RegimeType
  parent_doc_id: string | null
  chapter_number: number
  chapter_title: string
  section_number: number
  section_role: "content" | "wrapper" | "quoted"
  change_mode: ChangeMode
  text: string
  tokens: string[]
  word_count: number
  themes: ThemeScore[] // joined from section_theme_scores
}

type ThemeScore = {
  topic: number
  theme: string
  score: number
}

type ConstitutionDoc = {
  doc_id: string
  doc_type: "full" | "amendment" | "interim"
  year_ce: number
  name_short: string
  era: Era
  regime_type: RegimeType
  parent_doc_id: string | null
  sections: ConstitutionSection[]
  // Aggregated at load time:
  section_count: number
  word_count_total: number
  chapter_count: number
  theme_profile: Record<string, number> // summed theme_score per theme
}
```

---

## Route Structure

```
app/routes/
  home.tsx                        # Overview dashboard
  constitutions/
    index.tsx                     # Constitution list
    $docId.tsx                    # Constitution detail
  themes.tsx                      # Theme analysis across all documents
  explorer.tsx                    # Section-level search + filter
  compare.tsx                     # Side-by-side document comparison
```

---

## Features

---

### 1. Overview Dashboard (`/`)

The landing page. Gives a full quantitative picture of 89 years of Thai constitutional history.

**Stat bar (top)**

- 38 constitutions · 2,797 sections · 89 years · 13 themes
- Longest constitution (2540: 336 sections)
- Most amended document

**Constitutional Timeline (main chart)**

- Horizontal gantt: one row per document, x-axis = year, bar width proportional to section count
- Fill encodes `regime_type` (greyscale: civilian light, military dark)
- Badge above bar: `doc_type` (full / amendment / interim)
- Hover tooltip: name, year, regime, era, section count, top theme
- Click: navigate to `/constitutions/:docId`

**Regime Breakdown**

- Stacked bar or donut: civilian 1,521 / military 784 / semi-military 492 sections
- Toggleable: show by section count or document count

**Theme Distribution by Era**

- Stacked bar chart: x = era, y = summed `theme_score`, stacked by theme
- 13 themes × 8 eras
- Shows how constitutional emphasis shifted: monarchy-heavy early eras → rights/policy emphasis in modern democracy → oversight/anti-corruption emerging post-2006

**Doc Type Breakdown**

- Small donut: full vs. amendment vs. interim

---

### 2. Constitution List (`/constitutions`)

Browsable, filterable list of all 38 documents.

**Table columns:**

- Name (`name_short`)
- Year CE
- Type badge (`doc_type`)
- Regime badge (`regime_type`)
- Era
- Section count
- Total word count
- Top theme (highest summed `theme_score` for that doc)
- Parent doc link (for amendments)

**Filter panel:**

- `doc_type`: full / amendment / interim (checkbox)
- `era`: multi-select (8 options)
- `regime_type`: civilian / military / semi-military (checkbox)
- Year range slider: 1932–2021
- Theme: multi-select from 13 themes — show only docs where that theme has weight ≥ threshold

**Sort:** year · section count · word count · top theme score

**Theme profile mini-bar:** small horizontal stacked bar per row showing theme composition of each document (13 segments, proportional to summed theme_score)

---

### 3. Constitution Detail (`/constitutions/:docId`)

Full view of a single constitutional document.

**Header band**

- Name, year, type badge, regime badge, era, section count
- If amendment: link to parent doc + list of targeted sections (`target_section_no`, `change_mode`)
- If full doc: list all amendments that reference it via `parent_doc_id`

**Theme Profile Card**

- Horizontal bar chart of this document's theme composition (summed `theme_score` per theme, 13 bars)
- Compare to era average toggle

**Chapter Navigation (left sidebar)**

- List all chapters by `chapter_number` + `chapter_title`
- Each chapter shows section count + dominant theme badge
- Click to scroll to chapter

**Section List (main panel)**

- Grouped by chapter
- Each section card:
  - มาตรา N · chapter title · `section_role` badge · `change_mode` badge (if not `content`)
  - Full Thai text (`text`)
  - Word count chip
  - Theme pills: all themes for this section with score ≥ 0.3, sized/weighted by `theme_score`
  - `topic` ID shown as metadata
- Filter sections within this doc by theme (click a theme pill to show only matching sections)

**Amendment Lineage Panel**

- For full docs: collapsible panel listing all amendment documents targeting this constitution, grouped by `change_mode` (amended / new / repealed / text_substitution)
- For amendments: shows exactly which sections are modified and how

---

### 4. Theme Analysis (`/themes`)

The primary analytical view enabled by `section_theme_scores.csv`.

**Theme overview grid**

- One card per theme (13 cards)
- Shows: total sections, total score weight, constitutions where dominant, era of peak weight
- Click to expand to theme detail

**Theme × Era heatmap**

- Matrix: 13 themes (rows) × 8 eras (columns)
- Cell = summed `theme_score` for that theme in that era
- Color intensity = ink saturation (greyscale)
- Reveals: rights/participation themes weakest in coup eras, oversight emerges only post-2006

**Theme × Regime heatmap**

- Same matrix format: 13 themes × 3 regime types (civilian / military / semi-military)
- Surfacing: which themes are structurally associated with military rule vs. civilian governance

**Theme over time (line chart)**

- X = year (per document), Y = summed `theme_score` for selected theme
- Multi-select themes to overlay lines
- Shows constitutional emphasis trajectory for any theme

**Theme drill-down (selected theme)**

- Top 20 sections by `theme_score` for this theme (across all docs)
- Section card: doc name, year, era, regime, section number, text excerpt, score
- Filter by era or regime type

**Multi-theme section explorer**

- Sections carrying 3+ themes (400 sections)
- Bubble chart or table: each row = section, columns = themes, cell = score
- Filter by primary theme or minimum score

---

### 5. Section Explorer (`/explorer`)

Full-text and theme-filtered browsing across all 2,797 sections.

**Search bar**

- Thai text substring match on `text` field (server-side)
- Tokenized keyword match against `tokens` field

**Filter panel:**

- Constitution (multi-select, 38 options)
- Era (multi-select)
- Regime type
- Doc type
- Theme (multi-select from 13 — match sections where theme_score ≥ 0.3 for selected theme)
- Section role: content / wrapper / quoted
- Change mode (for amendment tracking)
- Word count range slider

**Results list**

- Section card: doc name + year + era badge + regime badge + chapter + section number
- Thai text excerpt (first 200 chars)
- Theme pills (score ≥ 0.3)
- Word count chip
- Sort: document year · word count · top theme score

---

### 6. Compare View (`/compare`)

Side-by-side structural and thematic comparison of two constitutions.

**Selection:** two dropdowns (Doc A / Doc B), filtered to `full` or `interim` docs

**Summary stats row**

- Section count A vs B · Word count A vs B · Chapter count A vs B · Regime type · Era

**Theme profile comparison**

- Two horizontal bar charts side by side (same 13 themes, same x scale)
- Delta column: +/– change in theme weight from A to B

**Chapter structure comparison**

- Two column lists of chapters
- Visual alignment where chapter titles match (fuzzy match on `chapter_title`)
- Chapters unique to A or B highlighted

**Section-level diff**

- For matched chapters: show section count delta, word count delta
- For amendments targeting the same parent: show `change_mode` badges per section

---

## Implementation Phases

### Phase 1 — Data Foundation

1. `app/data/types.ts` — all TypeScript types
2. `app/data/constitutions.server.ts` — CSV loader, doc aggregation, module-level cache
3. `app/data/themes.server.ts` — theme scores loader, join helper, per-doc/era/regime aggregators
4. Route stubs for all 6 routes

### Phase 2 — Overview + List

5. Timeline/gantt chart (Recharts or CSS)
6. Theme × Era stacked bar chart
7. Regime donut
8. Stat bar
9. Constitution list table with filters + theme profile mini-bar

### Phase 3 — Detail + Themes

10. Constitution detail: header, chapter sidebar, section cards with theme pills
11. Amendment lineage panel
12. Theme analysis page: heatmaps, over-time line chart, drill-down

### Phase 4 — Explorer + Compare

13. Section explorer: text search + theme filters + results
14. Compare view: stats row, theme profile comparison, chapter alignment

### Phase 5 — Polish

15. Multi-theme section bubble chart
16. Noto Sans Thai font for section text
17. Export filtered section set as CSV

---

## Libraries to Add

| Library                      | Purpose                           | Install                              |
| ---------------------------- | --------------------------------- | ------------------------------------ |
| `papaparse`                  | Robust CSV parsing (server)       | `bun add papaparse @types/papaparse` |
| `recharts`                   | Charts — stacked bar, line, gantt | `bun add recharts`                   |
| `@tanstack/react-table`      | Sortable/filterable tables        | `bun add @tanstack/react-table`      |
| `@fontsource/noto-sans-thai` | Thai script body font             | `bun add @fontsource/noto-sans-thai` |

All compatible with React Router v7 SSR. Recharts renders client-side; wrap chart components in `<ClientOnly>` or use dynamic import where needed.
