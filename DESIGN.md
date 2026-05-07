# Design System — Twenty Constitutions

## Design Philosophy

**Editorial greyscale.** The project carries the weight of 89 years of Thai political history — coups, democracies, dictatorships. The visual language reflects this: strictly monochromatic, typographically assertive, archival in tone. No decorative color. No gradients. Tension comes from contrast, whitespace, and structure — not from hue.

The reference image establishes the register: bold condensed headline in stark black on white, set against a collage of historical black-and-white portraits. The Democracy Monument is the spatial anchor — a piece of architecture born from the 1932 revolution, the same year the first constitution was written.

---

## Color System

All values are greyscale. One accent color (Democracy Gold) used sparingly for active state and constitutional milestones only.

### Palette

```css
/* Background */
--color-bg: #f5f4f2; /* Warm off-white — aged paper */
--color-surface: #ffffff; /* Cards, panels */
--color-surface-alt: #edece9; /* Zebra rows, inset sections */

/* Borders */
--color-border: #d4d2ce; /* Default border */
--color-border-strong: #a8a5a0; /* Emphasized dividers */

/* Text */
--color-text: #0f0e0d; /* Near-black body text */
--color-text-muted: #6b6860; /* Labels, metadata */
--color-text-subtle: #9e9b95; /* Placeholders, disabled */

/* Ink fills (for charts, regime badges, etc.) */
--color-ink-100: #0f0e0d; /* Full black */
--color-ink-80: #3a3835;
--color-ink-60: #6b6860;
--color-ink-40: #a8a5a0;
--color-ink-20: #d4d2ce;
--color-ink-10: #edece9;

/* Constitutional accent — use at maximum 5% of UI surface area */
--color-gold: #c9a84c; /* Democracy Monument gold trim */
--color-gold-subtle: #f5edd6; /* Background tint for gold context */
```

### Regime Type Encoding (greyscale only)

Regime type is a core data dimension. Encode with ink fill + pattern, never hue.

| Regime          | Fill                         | Badge style           |
| --------------- | ---------------------------- | --------------------- |
| `civilian`      | `ink-20` bg / `ink-100` text | Outlined, thin border |
| `military`      | `ink-80` bg / white text     | Solid dark            |
| `semi_military` | `ink-40` bg / `ink-100` text | Mid-fill              |

### Era Color Map (greyscale gradient across time)

Eras run 1932–2021. Map to ink stops so earlier = lighter, later = darker. This reinforces the timeline reading direction.

| Era                 | Ink Stop | Year Range |
| ------------------- | -------- | ---------- |
| `early_democracy`   | ink-10   | 1932–1946  |
| `post_coup_1947`    | ink-20   | 1947–1951  |
| `dictatorship`      | ink-80   | 1952–1972  |
| `democratic_spring` | ink-20   | 1973–1976  |
| `semi_democracy`    | ink-40   | 1977–1991  |
| `modern_democracy`  | ink-20   | 1992–2005  |
| `post_coup_2006`    | ink-60   | 2006–2013  |
| `post_coup_2014`    | ink-80   | 2014–2021  |

Note: coup eras intentionally map to darker ink, democracy eras to lighter — legible without explanation.

---

## Typography

### Type Scale

The reference image uses a bold condensed grotesque. The stack should read as archival/institutional — not tech-forward.

```css
/* Primary — headlines, section numbers, stat cards */
font-family: "Geist Variable", "Inter Variable", system-ui, sans-serif;

/* Thai text — section content */
font-family: "Noto Sans Thai", "Sarabun", system-ui, sans-serif;
/* Note: add @fontsource/noto-sans-thai or load from Google Fonts */
```

### Scale (Tailwind tokens)

| Token             | Size            | Weight | Usage                                       |
| ----------------- | --------------- | ------ | ------------------------------------------- |
| `text-display`    | 4.5rem / 72px   | 900    | Hero headline (e.g. "TWENTY CONSTITUTIONS") |
| `text-title`      | 2.25rem / 36px  | 700    | Page titles                                 |
| `text-heading`    | 1.5rem / 24px   | 600    | Section headings, card titles               |
| `text-subheading` | 1.125rem / 18px | 500    | Chapter names, labels                       |
| `text-body`       | 1rem / 16px     | 400    | Body, Thai text                             |
| `text-small`      | 0.875rem / 14px | 400    | Metadata, tags                              |
| `text-xs`         | 0.75rem / 12px  | 400    | Timestamps, footnotes                       |

### Headline Treatment

Follow the reference image: **ALL CAPS, tight tracking, left-aligned, no decoration**. Used for page heroes and stat card values.

```css
.headline {
  font-size: 4.5rem;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 0.95;
  text-transform: uppercase;
  color: var(--color-ink-100);
}
```

---

## Layout

### Grid

12-column grid, 24px gutters, max-width 1440px. Sidebar layouts use a fixed 280px left rail.

```
|--280px nav--|--1fr content (max 1160px)--|
```

Mobile: single column, nav collapses to top bar.

### Spacing Scale (base 4px)

```
4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128
```

Use multiples of 8 for component spacing, multiples of 4 for internal padding.

---

## Components

### Stat Card

Large number (display weight), label below, optional delta or unit. No color fill — white card, `border border-border`, subtle shadow.

```
+------------------------+
|  38                    |
|  Constitutions         |
|  1932 – 2021           |
+------------------------+
```

### Constitution Badge

Pill-shaped, regime-encoded via greyscale fill. Text: `doc_type` or `regime_type`.

- Full: `border` outlined
- Amendment: dashed border
- Interim: `ink-20` fill

### Section Card

```
+------------------------------------------+
|  มาตรา 3   Chapter: พระมหากษัตริย์   [content]  |
|  ------------------------------------------  |
|  Thai text body of the section goes here    |
|  spanning multiple lines as needed.          |
|                                              |
|  2475 · 42 words                             |
+------------------------------------------+
```

### Timeline Bar (Gantt row)

One horizontal bar per document. Width proportional to section count, x-position from year. Fill = regime ink value. On hover: tooltip with doc name, year, section count, era.

### Era Label

Small all-caps label + thin horizontal rule. Used to group timeline segments.

```
EARLY DEMOCRACY  ───────────────────────────
```

---

## Iconography

Use HugeIcons (already installed). Stroke weight: 1.5px. Color: `ink-60` default, `ink-100` on active.

| Context               | Icon            |
| --------------------- | --------------- |
| Constitution document | `file-document` |
| Section / clause      | `paragraph`     |
| Timeline              | `calendar`      |
| Search                | `search-01`     |
| Compare               | `columns`       |
| Amendment             | `edit-01`       |
| Military regime       | `shield-01`     |
| Civilian regime       | `user-group`    |
| Filter                | `filter`        |

---

## Democracy Monument Backdrop

The Democracy Monument (อนุสาวรีย์ประชาธิปไตย) — built 1939, Ratchadamnoen Avenue — is the visual backdrop motif of the project. It was commissioned by Field Marshal Plaek Phibunsongkhram to commemorate the 1932 revolution and the first constitution.

### Usage

**Hero section of the Overview Dashboard (`/`):**

- Full-width background image of the Democracy Monument, desaturated to pure greyscale
- Overlaid with a left-anchored headline block (white bg panel, left 40% of viewport)
- The monument image bleeds to the right edge, partially obscured by the text panel
- Subtle vignette on the right edge: `linear-gradient(to left, rgba(15,14,13,0.6), transparent)`

**Section header strip:**

- A narrow (120px height) cropped band of the monument's central tower, used as a recurring motif between major page sections
- `mix-blend-mode: multiply` on `--color-bg` so it integrates with the page tone

**Constitution detail pages:**

- Small embossed seal / circular crop of the monument wing reliefs used as a section watermark (low-opacity, `ink-10`, positioned bottom-right of section cards)

### Image Treatment Rules

1. **Always desaturate** — no sepia, no warm tones. Pure greyscale only.
2. **High contrast** — lift blacks, crush whites. The monument should read as architectural line, not photograph.
3. **Never crop the central tower** in hero usage — it is the compositional focal point.
4. **Opacity max 30%** for background watermark uses so text legibility is never compromised.

---

## Portrait Grid Motif

Inspired directly by the reference image — a grid of historical black-and-white portraits (the figures who wrote, enacted, or tore up Thailand's constitutions).

**Usage:**

- Right-side panel of the Overview hero
- Each cell: one portrait per constitutional era or key figure
- Treatment: `grayscale(100%) contrast(1.1)`, hard crop to face, `aspect-ratio: 1/1`
- Grid: 5 columns × variable rows, no gaps between cells (`gap-0`)
- On hover: overlay with name + year + role in `ink-100` panel sliding from bottom

**Note:** Use only public domain / licensed historical photographs. Treat as art direction, not decoration — these are the human faces of the documents.

---

## Motion & Interaction

**Principles:** Minimal motion. Transitions convey state change, not delight.

```css
/* Standard transition */
transition: all 150ms ease-out;

/* Page enter */
animation: fade-up 200ms ease-out;

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

No animated charts on load. Charts render instantly; transitions only on filter/state changes.

---

## Tone Reference

| Avoid                    | Prefer                                    |
| ------------------------ | ----------------------------------------- |
| Colorful gradient cards  | White cards with ink borders              |
| Rounded-2xl everything   | Sharp corners (`rounded-sm` or none)      |
| Icon-heavy UI            | Text-first, icons as secondary affordance |
| Playful micro-animations | Functional transitions only               |
| Vibrant data colors      | Greyscale + gold accent only              |
| "Dashboard" look         | Editorial / archival look                 |

The aesthetic target: **a museum catalog meets a data newspaper**. Think NYT graphics desk, not SaaS analytics tool.
