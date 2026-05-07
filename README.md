# Twenty Constitutions

**89 years of Thai constitutional history — digitized, structured, and visualized.**

An interactive data explorer for all 38 Thai constitutional documents spanning 1932–2021: full constitutions, interim charters, and amendments. Each document is broken down into sections with thematic scoring across 13 dimensions, enabling analysis of how constitutional priorities shifted across political eras.

## Dataset

The underlying dataset is publicly available on Kaggle:

**[Twenty Constitutions Digitization](https://www.kaggle.com/datasets/microhum/twenty-constitutions-digitization)**

It contains two CSV files:

| File                       | Description                                                                                                            |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `preprocessed_data.csv`    | Every section from all 38 documents with metadata (era, regime type, chapter, change mode, tokenized text, word count) |
| `section_theme_scores.csv` | Per-section thematic scores across 13 Thai constitutional themes                                                       |

### Document coverage

- **38 documents** — 20 full constitutions, plus amendments and interim charters
- **2,797 sections** across all documents
- **8 political eras** from Early Democracy (1932) to Post-Coup 2014 (2021)
- **3 regime types** — Civilian, Semi-Military, Military

### Thematic dimensions (13)

| Thai                        | English                     |
| --------------------------- | --------------------------- |
| นิติบัญญัติ                 | Legislature                 |
| บริหาร                      | Executive                   |
| สถาบันพระมหากษัตริย์        | Monarchy                    |
| สิทธิ-เสรีภาพ-หน้าที่       | Rights & Duties             |
| แนวนโยบายแห่งรัฐ            | State Policy                |
| พรรคการเมืองและการเลือกตั้ง | Elections                   |
| ตุลาการ                     | Judiciary                   |
| ท้องถิ่น                    | Local Government            |
| ตรวจสอบอำนาจรัฐ/ต้านทุจริต  | Oversight & Anti-corruption |
| จริยธรรมทางการเมือง         | Political Ethics            |
| การคลังและงบประมาณ          | Finance & Budget            |
| การมีส่วนร่วมทางการเมือง    | Political Participation     |
| อื่น ๆ (emergent)           | Other (emergent)            |

## Features

- **Constitutional timeline** — all documents plotted by year, row height scaled to section count, colored by regime type
- **Thematic heatmap** — 8 eras × 13 themes matrix showing where constitutional emphasis shifted over time
- **Era breakdown** — document count, section count, and dominant regime per era
- **Document explorer** — filterable and sortable table with search, regime filter, type filter, and era filter
- **Document drawer** — per-document view with chapter navigation, full section text, and theme profile bar chart

## Tech stack

- [React Router v7](https://reactrouter.com/) (framework mode, SSR)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [PapaParse](https://www.papaparse.com/) for CSV parsing on the server
- TypeScript throughout

## Getting started

### Prerequisites

- Node.js 20+
- The dataset CSVs placed in the `data/` directory at the project root

Download the data from Kaggle and place the files as:

```
data/
  preprocessed_data.csv
  section_theme_scores.csv
```

### Install and run

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for production

```bash
npm run build
npm start
```

## Project structure

```
app/
  data/
    constitutions.server.ts   # CSV loading, parsing, aggregation (server-only)
    types.ts                  # Shared TypeScript types and constants
  components/
    badges.tsx                # Stat cards, regime/type badges, sort icon
    charts.tsx                # RegimeBar, DocTypeDonut, ThemeHeatmap, EraTable
    timeline.tsx              # Constitutional timeline with hover tooltips
    doc-drawer.tsx            # Side drawer for per-document exploration
  routes/
    home.tsx                  # Main page — loader + UI
data/
  preprocessed_data.csv       # (not committed — download from Kaggle)
  section_theme_scores.csv    # (not committed — download from Kaggle)
```

## Credits

Made with Claude by ทีมงาน Production ชุมชนนิมนต์ยิ้ม season 67 และ สภาผู้แทนราษฎรอีสานใต้ชุดที่ 67
