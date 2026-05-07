export type DocType = "full" | "amendment" | "interim"
export type RegimeType = "civilian" | "military" | "semi_military"
export type SectionRole = "content" | "wrapper" | "quoted"
export type ChangeMode =
  | "content"
  | "meta"
  | "amended"
  | "new"
  | "new_content"
  | "text_substitution"
  | "reinstate"
  | "chapter_amended"
  | "chapter_new"
  | "chapter_repealed"
  | "renumber"

export type Era =
  | "early_democracy"
  | "post_coup_1947"
  | "dictatorship"
  | "democratic_spring"
  | "semi_democracy"
  | "modern_democracy"
  | "post_coup_2006"
  | "post_coup_2014"

export type ThemeScore = {
  topic: number
  theme: string
  score: number
}

export type ConstitutionSection = {
  section_id: string
  doc_id: string
  doc_type: DocType
  year_th: number
  year_ce: number
  name_short: string
  era: Era
  regime_type: RegimeType
  parent_doc_id: string | null
  chapter_number: number
  chapter_title: string
  sub_section_number: number | null
  section_number: number
  section_role: SectionRole
  target_chapter: number | null
  target_section_no: number | null
  change_mode: ChangeMode
  text: string
  tokens: string[]
  word_count: number
  themes: ThemeScore[]
}

export type ConstitutionDoc = {
  doc_id: string
  doc_type: DocType
  year_th: number
  year_ce: number
  name_short: string
  era: Era
  regime_type: RegimeType
  parent_doc_id: string | null
  sections: ConstitutionSection[]
  section_count: number
  word_count_total: number
  chapter_count: number
  theme_profile: Record<string, number>
}

export const ERA_LABELS: Record<Era, string> = {
  early_democracy: "Early Democracy",
  post_coup_1947: "Post-Coup 1947",
  dictatorship: "Dictatorship",
  democratic_spring: "Democratic Spring",
  semi_democracy: "Semi-Democracy",
  modern_democracy: "Modern Democracy",
  post_coup_2006: "Post-Coup 2006",
  post_coup_2014: "Post-Coup 2014",
}

export const ERA_YEARS: Record<Era, string> = {
  early_democracy: "1932–1946",
  post_coup_1947: "1947–1951",
  dictatorship: "1952–1972",
  democratic_spring: "1973–1976",
  semi_democracy: "1977–1991",
  modern_democracy: "1992–2005",
  post_coup_2006: "2006–2013",
  post_coup_2014: "2014–2021",
}

export const ERAS_ORDERED: Era[] = [
  "early_democracy",
  "post_coup_1947",
  "dictatorship",
  "democratic_spring",
  "semi_democracy",
  "modern_democracy",
  "post_coup_2006",
  "post_coup_2014",
]

export const THEMES_ORDERED = [
  "นิติบัญญัติ",
  "บริหาร",
  "สถาบันพระมหากษัตริย์",
  "สิทธิ-เสรีภาพ-หน้าที่",
  "แนวนโยบายแห่งรัฐ",
  "พรรคการเมืองและการเลือกตั้ง",
  "ตุลาการ",
  "ท้องถิ่น",
  "ตรวจสอบอำนาจรัฐ/ต้านทุจริต",
  "จริยธรรมทางการเมือง",
  "การคลังและงบประมาณ",
  "การมีส่วนร่วมทางการเมือง",
  "อื่น ๆ (emergent)",
]

export const THEME_SHORT: Record<string, string> = {
  นิติบัญญัติ: "Legislature",
  บริหาร: "Executive",
  สถาบันพระมหากษัตริย์: "Monarchy",
  "สิทธิ-เสรีภาพ-หน้าที่": "Rights & Duties",
  แนวนโยบายแห่งรัฐ: "State Policy",
  พรรคการเมืองและการเลือกตั้ง: "Elections",
  ตุลาการ: "Judiciary",
  ท้องถิ่น: "Local Gov.",
  "ตรวจสอบอำนาจรัฐ/ต้านทุจริต": "Oversight",
  จริยธรรมทางการเมือง: "Ethics",
  การคลังและงบประมาณ: "Finance",
  การมีส่วนร่วมทางการเมือง: "Participation",
  "อื่น ๆ (emergent)": "Other",
}
