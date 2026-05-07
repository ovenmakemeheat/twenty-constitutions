# Dataset Card: Thai Constitutional Text Corpus

## Dataset Summary

This dataset contains section-level text from **38 Thai constitutional documents** spanning from 1932 (B.E. 2475) to 2021 (B.E. 2564), covering full constitutions, interim charters, and amendments. It supports NLP and political science research on Thai constitutional history, including topic modeling, thematic analysis, and regime-change studies.

---

## Files Overview

| File | Rows | Columns | Description |
|------|------|---------|-------------|
| `sections_v2_fixed.csv` | 2,797 | 19 | Raw section-level text for all constitutional documents |
| `preprocessed_data.csv` | 2,797 | 21 | Preprocessed version with tokenized text and word counts |
| `section_theme_scores.csv` | 5,188 | 6 | Theme classification scores per section (semi-supervised) |
| `exp_topic_assignments.csv` | 4,706 | 15 | LDA topic probability assignments per section |

---

## File Details

### `sections_v2_fixed.csv`

The core dataset. Contains one row per constitutional section with full Thai text and structural metadata.

**Columns:**

| Column | Type | Description |
|--------|------|-------------|
| `section_id` | string | Unique identifier (e.g., `const_2475_s_1`) |
| `doc_id` | string | Parent document ID (e.g., `const_2475`) |
| `doc_type` | string | Type of document: `full`, `interim`, `amendment` |
| `year_th` | int | Thai Buddhist Era year (2475–2564) |
| `year_ce` | int | Common Era year (1932–2021) |
| `name_short` | string | Short name of the constitution |
| `era` | string | Political era label (see below) |
| `regime_type` | string | Regime type: `civilian`, `military`, `semi_military` |
| `parent_doc_id` | string | ID of the full constitution this document amends (if applicable) |
| `chapter_number` | int | Chapter number within the document |
| `chapter_title` | string | Thai title of the chapter |
| `sub_section_number` | string | Sub-section number (if applicable) |
| `sub_section_title` | string | Thai title of the sub-section (if applicable) |
| `section_number` | int | Section number |
| `section_role` | string | Role of the section: `content`, `wrapper`, `quoted` |
| `target_chapter` | string | Target chapter (for amendments) |
| `target_section_no` | string | Target section number (for amendments) |
| `change_mode` | string | How this section was changed (see below) |
| `text` | string | Full Thai text of the section |

**Era labels:**

| Value | Description |
|-------|-------------|
| `early_democracy` | 1932–1946 |
| `post_coup_1947` | After 1947 coup |
| `dictatorship` | Sarit–Thanom era |
| `semi_democracy` | Mixed civilian-military periods |
| `democratic_spring` | 1973–1976 |
| `modern_democracy` | 1997 onward (before coups) |
| `post_coup_2006` | After 2006 coup |
| `post_coup_2014` | After 2014 coup |

**Change modes:** `content`, `new`, `amended`, `new_content`, `text_substitution`, `reinstate`, `renumber`, `chapter_new`, `chapter_amended`, `chapter_repealed`, `meta`

---

### `preprocessed_data.csv`

Same as `sections_v2_fixed.csv` with two additional NLP columns, used as input for topic modeling.

**Additional Columns:**

| Column | Type | Description |
|--------|------|-------------|
| `tokens` | list (string) | Tokenized Thai words after stopword removal |
| `word_count` | int | Number of tokens in the section |

---

### `section_theme_scores.csv`

Theme classification results per section, generated via a semi-supervised topic modeling approach. Each row represents one section assigned to one dominant theme.

**Columns:**

| Column | Type | Description |
|--------|------|-------------|
| `section_id` | string | Section identifier |
| `constitution_id` | string | Parent constitution ID |
| `year_th` | int | Thai Buddhist Era year |
| `topic` | int | LDA topic number assigned to the section |
| `theme` | string | Human-interpretable theme label |
| `theme_score` | float | Confidence score for the theme assignment (0–1) |

**Theme labels (13 categories):**

| Thai | Description |
|------|-------------|
| สถาบันพระมหากษัตริย์ | Monarchy |
| นิติบัญญัติ | Legislature |
| บริหาร | Executive |
| ตุลาการ | Judiciary |
| สิทธิ-เสรีภาพ-หน้าที่ | Rights, Freedoms & Duties |
| พรรคการเมืองและการเลือกตั้ง | Political Parties & Elections |
| การมีส่วนร่วมทางการเมือง | Political Participation |
| ตรวจสอบอำนาจรัฐ/ต้านทุจริต | Oversight & Anti-corruption |
| จริยธรรมทางการเมือง | Political Ethics |
| ท้องถิ่น | Local Government |
| การคลังและงบประมาณ | Finance & Budget |
| แนวนโยบายแห่งรัฐ | State Policy Directives |
| อื่น ๆ (emergent) | Other / Emergent |

> Note: This file has more rows than `sections_v2_fixed.csv` because some sections appear in multiple documents (e.g., reinstated or amended sections).

---

### `exp_topic_assignments.csv`

Raw LDA (Latent Dirichlet Allocation) topic probability outputs for each section across 9 topics (topic_0 through topic_8).

**Columns:**

| Column | Type | Description |
|--------|------|-------------|
| `constitution_id` | string | Parent constitution ID |
| `year_th` | int | Thai Buddhist Era year |
| `name_short` | string | Short name of the constitution |
| `chapter_number` | int | Chapter number |
| `section_number` | int | Section number |
| `dominant_topic` | int | Topic with highest probability (0–8) |
| `topic_0_prob` – `topic_8_prob` | float | Probability for each of the 9 LDA topics |

---

## Dataset Statistics

- **Documents:** 38 constitutional documents (full constitutions, interim charters, amendments)
- **Sections:** 2,797 unique sections
- **Time span:** 1932–2021 (B.E. 2475–2564)
- **Language:** Thai
- **Regime types:** `civilian` (democratic periods), `military` (post-coup periods), `semi_military` (transitional)
- **LDA topics:** 9
- **Thematic categories:** 13

---

## Usage

This dataset is designed for:

- **Topic modeling** of constitutional text over time
- **Regime-change analysis** comparing civilian vs. military constitutions
- **Thematic trend analysis** across Thai political eras
- **NLP research** on Thai legal/political language

### Recommended join keys

- `section_id` links `sections_v2_fixed.csv` / `preprocessed_data.csv` → `section_theme_scores.csv`
- `(constitution_id, chapter_number, section_number)` links to `exp_topic_assignments.csv`

---

## Source

Derived from official Thai constitutional documents. Processed as part of the Data Modeling Project for political text analysis.
