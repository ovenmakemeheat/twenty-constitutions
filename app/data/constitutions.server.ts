import fs from "node:fs"
import path from "node:path"
import Papa from "papaparse"
import type {
  ConstitutionDoc,
  ConstitutionSection,
  DocType,
  Era,
  RegimeType,
  SectionRole,
  ChangeMode,
  ThemeScore,
} from "./types"

// ---------------------------------------------------------------------------
// Raw CSV row shapes
// ---------------------------------------------------------------------------

type RawSection = {
  section_id: string
  doc_id: string
  doc_type: string
  year_th: string
  year_ce: string
  name_short: string
  era: string
  regime_type: string
  parent_doc_id: string
  chapter_number: string
  chapter_title: string
  sub_section_number: string
  sub_section_title: string
  section_number: string
  section_role: string
  target_chapter: string
  target_section_no: string
  change_mode: string
  text: string
  tokens: string
  word_count: string
}

type RawThemeScore = {
  section_id: string
  constitution_id: string
  year_th: string
  topic: string
  theme: string
  theme_score: string
}

// ---------------------------------------------------------------------------
// Module-level cache — parsed once per server process
// ---------------------------------------------------------------------------

let _docs: ConstitutionDoc[] | null = null

function dataPath(filename: string) {
  return path.join(process.cwd(), "data", filename)
}

function parseTokens(raw: string): string[] {
  try {
    // Raw looks like "['word1', 'word2', ...]"
    return raw
      .replace(/^\[|\]$/g, "")
      .split(",")
      .map((t) => t.trim().replace(/^['"]|['"]$/g, ""))
      .filter(Boolean)
  } catch {
    return []
  }
}

export function loadData(): ConstitutionDoc[] {
  if (_docs) return _docs

  // --- Load theme scores ---
  const themeRaw = fs.readFileSync(
    dataPath("section_theme_scores.csv"),
    "utf-8",
  )
  const themeResult = Papa.parse<RawThemeScore>(themeRaw, {
    header: true,
    skipEmptyLines: true,
  })
  const themesBySection = new Map<string, ThemeScore[]>()
  for (const row of themeResult.data) {
    const score: ThemeScore = {
      topic: parseInt(row.topic, 10),
      theme: row.theme,
      score: parseFloat(row.theme_score),
    }
    const existing = themesBySection.get(row.section_id)
    if (existing) {
      existing.push(score)
    } else {
      themesBySection.set(row.section_id, [score])
    }
  }

  // --- Load sections ---
  const sectionsRaw = fs.readFileSync(
    dataPath("preprocessed_data.csv"),
    "utf-8",
  )
  const sectionsResult = Papa.parse<RawSection>(sectionsRaw, {
    header: true,
    skipEmptyLines: true,
  })

  // Group by doc_id
  const docMap = new Map<string, ConstitutionSection[]>()
  for (const row of sectionsResult.data) {
    const section: ConstitutionSection = {
      section_id: row.section_id,
      doc_id: row.doc_id,
      doc_type: row.doc_type as DocType,
      year_th: parseInt(row.year_th, 10),
      year_ce: parseInt(row.year_ce, 10),
      name_short: row.name_short,
      era: row.era as Era,
      regime_type: row.regime_type as RegimeType,
      parent_doc_id: row.parent_doc_id || null,
      chapter_number: parseInt(row.chapter_number, 10) || 0,
      chapter_title: row.chapter_title || "",
      sub_section_number: row.sub_section_number
        ? parseInt(row.sub_section_number, 10)
        : null,
      section_number: parseInt(row.section_number, 10) || 0,
      section_role: row.section_role as SectionRole,
      target_chapter: row.target_chapter
        ? parseInt(row.target_chapter, 10)
        : null,
      target_section_no: row.target_section_no
        ? parseFloat(row.target_section_no)
        : null,
      change_mode: row.change_mode as ChangeMode,
      text: row.text,
      tokens: parseTokens(row.tokens),
      word_count: parseInt(row.word_count, 10) || 0,
      themes: themesBySection.get(row.section_id) ?? [],
    }

    const existing = docMap.get(row.doc_id)
    if (existing) {
      existing.push(section)
    } else {
      docMap.set(row.doc_id, [section])
    }
  }

  // --- Build ConstitutionDoc objects ---
  _docs = Array.from(docMap.entries()).map(([doc_id, sections]) => {
    const first = sections[0]

    // Aggregate theme profile
    const themeProfile: Record<string, number> = {}
    for (const section of sections) {
      for (const ts of section.themes) {
        themeProfile[ts.theme] = (themeProfile[ts.theme] ?? 0) + ts.score
      }
    }

    const chapters = new Set(sections.map((s) => s.chapter_number))

    return {
      doc_id,
      doc_type: first.doc_type,
      year_th: first.year_th,
      year_ce: first.year_ce,
      name_short: first.name_short,
      era: first.era,
      regime_type: first.regime_type,
      parent_doc_id: first.parent_doc_id,
      sections,
      section_count: sections.length,
      word_count_total: sections.reduce((s, r) => s + r.word_count, 0),
      chapter_count: chapters.size,
      theme_profile: themeProfile,
    }
  })

  // Sort by year
  _docs.sort((a, b) => a.year_ce - b.year_ce)

  return _docs
}

// ---------------------------------------------------------------------------
// Aggregation helpers
// ---------------------------------------------------------------------------

export function getOverviewStats(docs: ConstitutionDoc[]) {
  const totalSections = docs.reduce((s, d) => s + d.section_count, 0)
  const totalWords = docs.reduce((s, d) => s + d.word_count_total, 0)
  const fullDocs = docs.filter((d) => d.doc_type === "full")
  const longestDoc = docs.reduce((a, b) =>
    a.section_count > b.section_count ? a : b,
  )
  const yearMin = Math.min(...docs.map((d) => d.year_ce))
  const yearMax = Math.max(...docs.map((d) => d.year_ce))

  const byRegime = { civilian: 0, military: 0, semi_military: 0 }
  const byDocType = { full: 0, amendment: 0, interim: 0 }
  for (const d of docs) {
    byRegime[d.regime_type] += d.section_count
    byDocType[d.doc_type] += 1
  }

  return {
    totalDocs: docs.length,
    totalSections,
    totalWords,
    totalFullDocs: fullDocs.length,
    yearMin,
    yearMax,
    longestDoc,
    byRegime,
    byDocType,
  }
}

export function getEraStats(docs: ConstitutionDoc[]) {
  const eraMap = new Map<
    string,
    {
      docs: number
      sections: number
      regimes: Record<string, number>
      themeProfile: Record<string, number>
    }
  >()

  for (const d of docs) {
    const existing = eraMap.get(d.era)
    if (!existing) {
      eraMap.set(d.era, {
        docs: 1,
        sections: d.section_count,
        regimes: { [d.regime_type]: 1 },
        themeProfile: { ...d.theme_profile },
      })
    } else {
      existing.docs++
      existing.sections += d.section_count
      existing.regimes[d.regime_type] =
        (existing.regimes[d.regime_type] ?? 0) + 1
      for (const [theme, score] of Object.entries(d.theme_profile)) {
        existing.themeProfile[theme] =
          (existing.themeProfile[theme] ?? 0) + score
      }
    }
  }

  return eraMap
}
