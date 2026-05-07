import { useMemo, useState } from "react"
import type { Route } from "./+types/home"
import {
  loadData,
  getOverviewStats,
  getEraStats,
} from "~/data/constitutions.server"
import {
  ERA_LABELS,
  ERAS_ORDERED,
  THEMES_ORDERED,
  THEME_SHORT,
  type ConstitutionDoc,
} from "~/data/types"
import { cn } from "~/lib/utils"
import {
  REGIME_LABEL,
  REGIME_CLASSES,
  REGIME_BAR_CLASSES,
  SectionLabel,
  StatCard,
  DocTypeBadge,
  RegimeBadge,
  SortIcon,
} from "~/components/badges"
import { DocDrawer } from "~/components/doc-drawer"
import { Timeline } from "~/components/timeline"
import {
  RegimeBar,
  DocTypeDonut,
  ThemeHeatmap,
  EraTable,
} from "~/components/charts"

// ---------------------------------------------------------------------------
// Meta + Loader
// ---------------------------------------------------------------------------

export function meta() {
  return [
    { title: "Twenty Constitutions" },
    { name: "description", content: "89 years of Thai constitutional history" },
  ]
}

export async function loader(_: Route.LoaderArgs) {
  const docs = loadData()
  const stats = getOverviewStats(docs)
  const eraStats = getEraStats(docs)

  const timelineDocs = docs.filter((d) => d.doc_type !== "amendment")

  const eraThemeMatrix = ERAS_ORDERED.map((era) => {
    const eraData = eraStats.get(era)
    return {
      era,
      themes: THEMES_ORDERED.map((theme) => ({
        theme,
        score: eraData?.themeProfile[theme] ?? 0,
      })),
    }
  })

  const maxThemeScore = Math.max(
    ...eraThemeMatrix.flatMap((row) => row.themes.map((t) => t.score)),
  )

  const eraBreakdown = ERAS_ORDERED.map((era) => {
    const data = eraStats.get(era)
    return {
      era,
      docs: data?.docs ?? 0,
      sections: data?.sections ?? 0,
      regimes: data?.regimes ?? {},
    }
  })

  return {
    docs,
    stats,
    timelineDocs,
    eraThemeMatrix,
    maxThemeScore,
    eraBreakdown,
  }
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type SortKey = "year_ce" | "section_count" | "word_count_total" | "name_short"
type SortDir = "asc" | "desc"

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Home({ loaderData }: Route.ComponentProps) {
  const {
    docs,
    stats,
    timelineDocs,
    eraThemeMatrix,
    maxThemeScore,
    eraBreakdown,
  } = loaderData

  const [activeDoc, setActiveDoc] = useState<ConstitutionDoc | null>(null)
  const [query, setQuery] = useState("")
  const [regimeFilter, setRegimeFilter] = useState<Set<string>>(new Set())
  const [typeFilter, setTypeFilter] = useState<Set<string>>(new Set())
  const [eraFilter, setEraFilter] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>("year_ce")
  const [sortDir, setSortDir] = useState<SortDir>("asc")

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  function toggleSet(set: Set<string>, val: string): Set<string> {
    const next = new Set(set)
    next.has(val) ? next.delete(val) : next.add(val)
    return next
  }

  const filteredDocs = useMemo(() => {
    let result = docs
    if (query.trim()) {
      const q = query.toLowerCase()
      result = result.filter(
        (d) =>
          d.name_short.toLowerCase().includes(q) ||
          String(d.year_ce).includes(q) ||
          ERA_LABELS[d.era]?.toLowerCase().includes(q),
      )
    }
    if (regimeFilter.size > 0)
      result = result.filter((d) => regimeFilter.has(d.regime_type))
    if (typeFilter.size > 0)
      result = result.filter((d) => typeFilter.has(d.doc_type))
    if (eraFilter) result = result.filter((d) => d.era === eraFilter)

    return [...result].sort((a, b) => {
      let av: string | number = a[sortKey]
      let bv: string | number = b[sortKey]
      if (typeof av === "string") av = av.toLowerCase()
      if (typeof bv === "string") bv = bv.toLowerCase()
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === "asc" ? cmp : -cmp
    })
  }, [docs, query, regimeFilter, typeFilter, eraFilter, sortKey, sortDir])

  const activeEraLabel = eraFilter
    ? ERA_LABELS[eraFilter as keyof typeof ERA_LABELS]
    : null
  const hasFilters = !!(
    query ||
    regimeFilter.size > 0 ||
    typeFilter.size > 0 ||
    eraFilter
  )

  return (
    <div className="min-h-screen bg-background">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-screen-xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <span className="font-heading text-sm font-black tracking-widest text-foreground uppercase">
              Twenty Constitutions
            </span>
            <span className="ml-3 hidden text-xs text-muted-foreground sm:inline">
              รัฐธรรมนูญแห่งราชอาณาจักรไทย
            </span>
          </div>
          <nav className="hidden items-center gap-4 text-xs font-medium tracking-wider text-muted-foreground uppercase sm:flex">
            <span className="text-foreground">Overview</span>
            <span>Constitutions</span>
            <span>Themes</span>
            <span>Explorer</span>
            <span>Compare</span>
          </nav>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border bg-card">
        <img
          src="/Democracy-monument-removebg-preview.png"
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute right-0 -bottom-25 z-0 w-full sm:h-[200%] sm:w-auto"
          style={{ filter: "grayscale(100%)", opacity: 0.18, maxWidth: "none" }}
        />
        <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14">
          <h1
            className="font-heading text-4xl leading-none font-black uppercase sm:text-5xl lg:text-6xl"
            style={{ letterSpacing: "-0.02em" }}
          >
            TWENTY
            <br />
            CONSTITUTIONS
            <br />
            <span style={{ color: "var(--gold)" }}>DIGITIZATION.</span>
          </h1>
          <p className="mt-4 max-w-lg text-sm text-muted-foreground">
            89 years of Thai constitutional history — 38 documents, 2,797
            sections, 13 thematic dimensions.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold tracking-widest text-muted-foreground uppercase">
              Download data
            </span>
            <a
              href="https://www.kaggle.com/datasets/microhum/twenty-constitutions-digitization"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-foreground transition-colors hover:border-ink-60 hover:bg-ink-10"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 32 32"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M16 2C8.268 2 2 8.268 2 16s6.268 14 14 14 14-6.268 14-14S23.732 2 16 2z"
                  fill="currentColor"
                  opacity="0.15"
                />
                <path
                  d="M8 24V8h4v8l6-8h5l-7 9 7 7h-5l-6-7v7H8z"
                  fill="currentColor"
                />
              </svg>
              Kaggle
            </a>
            <a
              href="#"
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground opacity-50"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.418 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.009-.868-.013-1.703-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.163 22 16.418 22 12c0-5.523-4.477-10-10-10z" />
              </svg>
              GitHub
              <span className="text-[9px] tracking-wider uppercase">soon</span>
            </a>
            <a
              href="#"
              className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-sm border border-border bg-card px-3 py-1.5 text-[11px] font-medium text-muted-foreground opacity-50"
            >
              <span aria-hidden="true" className="text-sm leading-none">
                🤗
              </span>
              Hugging Face
              <span className="text-[9px] tracking-wider uppercase">soon</span>
            </a>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-screen-xl space-y-10 px-4 py-8 sm:px-6">
        {/* ── Stats ── */}
        <section>
          <SectionLabel>At a glance</SectionLabel>
          <div className="mt-3 grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-6">
            <StatCard value={stats.totalDocs} label="Constitutions" />
            <StatCard
              value={stats.totalSections.toLocaleString()}
              label="Sections"
            />
            <StatCard
              value={`${stats.yearMin}–${stats.yearMax}`}
              label="Year range"
              sub={`${stats.yearMax - stats.yearMin} years`}
            />
            <StatCard
              value={stats.totalFullDocs}
              label="Full constitutions"
              sub={`${stats.totalDocs - stats.totalFullDocs} amendments & interim`}
            />
            <StatCard
              value={stats.longestDoc.name_short}
              label="Longest document"
              sub={`${stats.longestDoc.section_count} sections`}
            />
            <StatCard
              value={(stats.totalWords / 1000).toFixed(0) + "k"}
              label="Total words"
            />
          </div>
        </section>

        {/* ── Timeline ── */}
        <section>
          <div className="flex items-baseline justify-between">
            <SectionLabel>Constitutional timeline</SectionLabel>
            <p className="text-[10px] text-muted-foreground">
              Row height = section count · Fill = regime · Click to open
            </p>
          </div>
          <div className="mt-3 border border-border bg-card p-5">
            <Timeline docs={timelineDocs} onDocClick={setActiveDoc} />
            <div className="mt-5 flex gap-5 border-t border-border pt-3">
              {(["civilian", "semi_military", "military"] as const).map((r) => (
                <div key={r} className="flex items-center gap-1.5">
                  <div
                    className={cn("h-2.5 w-5 shrink-0", REGIME_BAR_CLASSES[r])}
                  />
                  <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
                    {REGIME_LABEL[r]}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Doc type + Regime ── */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <section>
            <SectionLabel>Document types</SectionLabel>
            <div className="mt-3 border border-border bg-card p-4">
              <DocTypeDonut byDocType={stats.byDocType} />
            </div>
          </section>
          <section>
            <SectionLabel>Sections by regime</SectionLabel>
            <div className="mt-3 border border-border bg-card p-4">
              <RegimeBar byRegime={stats.byRegime} />
            </div>
          </section>
        </div>

        {/* ── Theme × Era heatmap ── */}
        <section>
          <SectionLabel>Thematic weight by era</SectionLabel>
          <p className="mt-1 text-xs text-muted-foreground">
            Darker = stronger thematic presence. Click a row to filter the
            constitution table below.
          </p>
          <div className="mt-3 border border-border bg-card p-5">
            <ThemeHeatmap
              matrix={eraThemeMatrix}
              maxScore={maxThemeScore}
              activeEra={eraFilter}
              onEraClick={setEraFilter}
            />
          </div>
        </section>

        {/* ── Era breakdown ── */}
        <section>
          <SectionLabel>Era breakdown</SectionLabel>
          <div className="mt-3 border border-border bg-card p-5">
            <EraTable breakdown={eraBreakdown} />
          </div>
        </section>

        {/* ── Constitution table ── */}
        <section>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionLabel>All constitutions</SectionLabel>
            <span className="text-[10px] text-muted-foreground">
              {filteredDocs.length} of {docs.length} shown
            </span>
          </div>

          {/* Filters */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <div className="relative">
              <svg
                className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-muted-foreground"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
              >
                <circle
                  cx="5"
                  cy="5"
                  r="3.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                />
                <path
                  d="M8 8l2.5 2.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, year or era…"
                className="h-7 w-full rounded-sm border border-border bg-card pr-3 pl-7 text-xs text-foreground placeholder:text-muted-foreground focus:border-ink-60 focus:outline-none sm:w-56"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path
                      d="M2 2l6 6M8 2L2 8"
                      stroke="currentColor"
                      strokeWidth="1.2"
                    />
                  </svg>
                </button>
              )}
            </div>

            {(["civilian", "semi_military", "military"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRegimeFilter((prev) => toggleSet(prev, r))}
                className={cn(
                  "rounded-sm border px-2 py-1 text-[10px] font-medium tracking-wider uppercase transition-colors",
                  regimeFilter.has(r)
                    ? REGIME_CLASSES[r]
                    : "border-border text-muted-foreground hover:border-ink-40 hover:text-foreground",
                )}
              >
                {REGIME_LABEL[r]}
              </button>
            ))}

            {(["full", "amendment", "interim"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter((prev) => toggleSet(prev, t))}
                className={cn(
                  "rounded-sm px-2 py-1 text-[10px] font-medium tracking-wider uppercase transition-colors",
                  typeFilter.has(t)
                    ? "bg-ink-100 text-white"
                    : "border border-border text-muted-foreground hover:border-ink-40 hover:text-foreground",
                )}
              >
                {t}
              </button>
            ))}

            {activeEraLabel && (
              <button
                onClick={() => setEraFilter(null)}
                className="flex items-center gap-1 rounded-sm bg-ink-10 px-2 py-1 text-[10px] font-medium text-foreground transition-colors hover:bg-ink-20"
              >
                {activeEraLabel}
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path
                    d="M1.5 1.5l5 5M6.5 1.5l-5 5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                </svg>
              </button>
            )}

            {hasFilters && (
              <button
                onClick={() => {
                  setQuery("")
                  setRegimeFilter(new Set())
                  setTypeFilter(new Set())
                  setEraFilter(null)
                }}
                className="text-[10px] text-muted-foreground underline underline-offset-2 hover:text-foreground"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Table */}
          <div className="mt-2 overflow-x-auto border border-border bg-card">
            <table className="w-full min-w-[640px] border-collapse text-xs">
              <thead>
                <tr className="border-b border-border">
                  {[
                    { label: "Year", key: "year_ce" as SortKey },
                    { label: "Name", key: "name_short" as SortKey },
                    { label: "Type", key: null },
                    { label: "Era", key: null },
                    { label: "Regime", key: null },
                    { label: "Sections", key: "section_count" as SortKey },
                    { label: "Top Theme", key: null },
                  ].map(({ label, key }) => (
                    <th
                      key={label}
                      className={cn(
                        "px-4 py-2.5 text-left font-medium tracking-wider text-muted-foreground uppercase",
                        key &&
                          "cursor-pointer select-none hover:text-foreground",
                      )}
                      onClick={key ? () => handleSort(key) : undefined}
                    >
                      {label}
                      {key && (
                        <SortIcon active={sortKey === key} dir={sortDir} />
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-8 text-center text-muted-foreground"
                    >
                      No constitutions match the current filters.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => {
                    const topTheme = Object.entries(doc.theme_profile).sort(
                      (a, b) => b[1] - a[1],
                    )[0]
                    return (
                      <tr
                        key={doc.doc_id}
                        className="cursor-pointer border-b border-border transition-colors last:border-0 hover:bg-muted/50"
                        onClick={() => setActiveDoc(doc)}
                      >
                        <td className="px-4 py-2 text-muted-foreground tabular-nums">
                          {doc.year_ce}
                        </td>
                        <td className="px-4 py-2 font-medium text-foreground">
                          {doc.name_short}
                        </td>
                        <td className="px-4 py-2">
                          <DocTypeBadge type={doc.doc_type} />
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {ERA_LABELS[doc.era]}
                        </td>
                        <td className="px-4 py-2">
                          <RegimeBadge regime={doc.regime_type} />
                        </td>
                        <td className="px-4 py-2 text-foreground tabular-nums">
                          {doc.section_count}
                        </td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {topTheme
                            ? (THEME_SHORT[topTheme[0]] ?? topTheme[0])
                            : "—"}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* ── Footer ── */}
      <footer className="mt-12 border-t border-border bg-card">
        <div className="mx-auto max-w-screen-xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          <span>Made with Claude </span>
          <span style={{ color: "var(--gold)" }}>♥</span>
          <span>
            {" "}
            by ทีมงาน Production ชุมชนนิมนต์ยิ้ม season 67 และ
            สภาผู้แทนราษฎรอีสานใต้ชุดที่ 67
          </span>
        </div>
      </footer>

      {/* ── Doc Drawer ── */}
      {activeDoc && (
        <DocDrawer
          doc={activeDoc}
          allDocs={docs}
          onClose={() => setActiveDoc(null)}
        />
      )}
    </div>
  )
}
