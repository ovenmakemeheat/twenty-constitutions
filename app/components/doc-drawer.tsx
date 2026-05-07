import { useEffect, useRef, useState } from "react"
import { cn } from "~/lib/utils"
import {
  ERA_LABELS,
  THEMES_ORDERED,
  THEME_SHORT,
  type ConstitutionDoc,
  type ConstitutionSection,
} from "~/data/types"
import { DocTypeBadge, RegimeBadge } from "~/components/badges"

// ---------------------------------------------------------------------------
// SectionRow
// ---------------------------------------------------------------------------

function SectionRow({ section }: { section: ConstitutionSection }) {
  const [expanded, setExpanded] = useState(false)
  const topThemes = section.themes
    .filter((t) => t.score >= 0.3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)

  return (
    <div
      className="cursor-pointer px-5 py-3 transition-colors hover:bg-muted/40"
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="shrink-0 font-mono text-[10px] font-medium tabular-nums text-muted-foreground">
            §{section.section_number}
          </span>
          {section.change_mode !== "content" && (
            <span className="shrink-0 rounded-sm border border-dashed border-ink-40 px-1 py-px text-[9px] uppercase text-ink-60">
              {section.change_mode}
            </span>
          )}
          <p
            className={cn(
              "text-xs leading-relaxed text-foreground",
              !expanded && "line-clamp-2",
            )}
          >
            {section.text}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-[9px] tabular-nums text-muted-foreground">
            {section.word_count}w
          </span>
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            className={cn(
              "text-muted-foreground transition-transform",
              expanded && "rotate-180",
            )}
          >
            <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" fill="none" />
          </svg>
        </div>
      </div>
      {topThemes.length > 0 && (
        <div className="mt-1.5 flex flex-wrap gap-1">
          {topThemes.map((t) => (
            <span
              key={t.theme}
              className="rounded-sm bg-ink-10 px-1.5 py-px text-[9px] text-muted-foreground"
            >
              {THEME_SHORT[t.theme] ?? t.theme}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// DocDrawer
// ---------------------------------------------------------------------------

export function DocDrawer({
  doc,
  allDocs,
  onClose,
}: {
  doc: ConstitutionDoc
  allDocs: ConstitutionDoc[]
  onClose: () => void
}) {
  const [activeChapter, setActiveChapter] = useState<number | null>(null)
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose()
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [onClose])

  const [visible, setVisible] = useState(false)
  useEffect(() => {
    setTimeout(() => setVisible(true), 10)
  }, [])

  const maxThemeScore = Math.max(...Object.values(doc.theme_profile))

  const chapters = Array.from(
    new Map(
      doc.sections
        .filter((s) => s.chapter_number > 0)
        .map((s) => [s.chapter_number, s.chapter_title]),
    ).entries(),
  ).sort((a, b) => a[0] - b[0])

  const amendments = allDocs.filter(
    (d) => d.parent_doc_id === doc.doc_id && d.doc_type === "amendment",
  )

  const visibleSections =
    activeChapter == null
      ? doc.sections.filter((s) => s.section_role === "content").slice(0, 40)
      : doc.sections.filter(
          (s) => s.chapter_number === activeChapter && s.section_role === "content",
        )

  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-ink-100/40 transition-opacity duration-200",
          visible ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        ref={drawerRef}
        className={cn(
          "fixed right-0 top-0 z-50 flex h-full w-full max-w-2xl flex-col bg-card shadow-2xl transition-transform duration-300",
          visible ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border px-6 py-5">
          <div>
            <div className="flex items-center gap-2">
              <DocTypeBadge type={doc.doc_type} />
              <RegimeBadge regime={doc.regime_type} />
              <span className="text-xs text-muted-foreground">{ERA_LABELS[doc.era]}</span>
            </div>
            <h2 className="mt-2 font-heading text-2xl font-black leading-tight tracking-tight text-foreground">
              {doc.name_short}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {doc.year_ce} · {doc.section_count} sections ·{" "}
              {doc.word_count_total.toLocaleString()} words
              {doc.parent_doc_id && (
                <span className="ml-2 text-muted-foreground">
                  · Amends{" "}
                  <span className="font-medium">
                    {doc.parent_doc_id.replace("const_", "BE ")}
                  </span>
                </span>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="mt-1 rounded-sm p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar — chapters + theme profile */}
          <div className="flex w-44 shrink-0 flex-col overflow-y-auto border-r border-border">
            <div className="px-3 py-3">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Chapters
              </div>
              <button
                onClick={() => setActiveChapter(null)}
                className={cn(
                  "mb-px w-full rounded-sm px-2 py-1.5 text-left text-[11px] transition-colors",
                  activeChapter === null
                    ? "bg-ink-100 font-medium text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                All sections
              </button>
              {chapters.map(([num, title]) => (
                <button
                  key={num}
                  onClick={() => setActiveChapter(num)}
                  className={cn(
                    "mb-px w-full rounded-sm px-2 py-1.5 text-left text-[11px] leading-tight transition-colors",
                    activeChapter === num
                      ? "bg-ink-100 font-medium text-white"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {title || `Chapter ${num}`}
                </button>
              ))}
            </div>

            <div className="mt-auto border-t border-border px-3 py-3">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                Theme profile
              </div>
              {THEMES_ORDERED.filter((t) => (doc.theme_profile[t] ?? 0) > 0)
                .sort((a, b) => (doc.theme_profile[b] ?? 0) - (doc.theme_profile[a] ?? 0))
                .map((theme) => {
                  const score = doc.theme_profile[theme] ?? 0
                  const pct = maxThemeScore > 0 ? (score / maxThemeScore) * 100 : 0
                  return (
                    <div key={theme} className="mb-1.5">
                      <div className="mb-0.5 flex justify-between text-[9px] text-muted-foreground">
                        <span className="truncate">{THEME_SHORT[theme] ?? theme}</span>
                        <span className="tabular-nums">{score.toFixed(0)}</span>
                      </div>
                      <div className="h-1 w-full bg-ink-10">
                        <div className="h-full bg-ink-60" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>

          {/* Main — sections */}
          <div className="flex flex-1 flex-col overflow-y-auto">
            {amendments.length > 0 && (
              <div className="border-b border-border bg-ink-10 px-5 py-3">
                <p className="text-[11px] text-muted-foreground">
                  <span className="font-semibold text-foreground">
                    {amendments.length} amendment{amendments.length > 1 ? "s" : ""}
                  </span>{" "}
                  to this constitution:{" "}
                  {amendments.map((a) => (
                    <span key={a.doc_id} className="mr-1.5 font-medium text-foreground">
                      {a.name_short}
                    </span>
                  ))}
                </p>
              </div>
            )}

            <div className="divide-y divide-border">
              {visibleSections.map((s) => (
                <SectionRow key={s.section_id} section={s} />
              ))}
              {activeChapter === null &&
                doc.sections.filter((s) => s.section_role === "content").length > 40 && (
                  <div className="px-5 py-3 text-xs text-muted-foreground">
                    Showing first 40 of{" "}
                    {doc.sections.filter((s) => s.section_role === "content").length} sections.
                    Select a chapter to see all.
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
