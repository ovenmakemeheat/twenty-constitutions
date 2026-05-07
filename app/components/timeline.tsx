import { useEffect, useState } from "react"
import { cn } from "~/lib/utils"
import { ERA_LABELS, THEME_SHORT, type ConstitutionDoc } from "~/data/types"
import { REGIME_LABEL, REGIME_BAR_CLASSES } from "~/components/badges"

// ---------------------------------------------------------------------------
// Tooltip
// ---------------------------------------------------------------------------

type TooltipState = {
  doc: ConstitutionDoc
  leftPct: number
  widthPct: number
  rowTop: number
  rowH: number
} | null

function TimelineTooltip({
  doc,
  leftPct,
  rowTop,
  rowH,
}: NonNullable<TooltipState>) {
  const [phase, setPhase] = useState<"idle" | "line" | "panel">("idle")
  const topTheme = Object.entries(doc.theme_profile).sort((a, b) => b[1] - a[1])[0]

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("line"), 10)
    const t2 = setTimeout(() => setPhase("panel"), 180)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  const STEM_H = 28
  const ARM_W = 48

  return (
    <div
      className="pointer-events-none absolute z-50"
      style={{ top: rowTop + rowH, left: `${leftPct}%` }}
    >
      <div
        style={{
          width: 1,
          height: phase === "idle" ? 0 : STEM_H,
          backgroundColor: "var(--ink-100)",
          transition: "height 150ms ease-out",
        }}
      />
      <div className="flex items-start">
        <div
          style={{
            width: phase === "panel" ? ARM_W : 0,
            height: 1,
            backgroundColor: "var(--ink-100)",
            transition: "width 120ms ease-out",
            flexShrink: 0,
          }}
        />
        <div
          style={{
            opacity: phase === "panel" ? 1 : 0,
            transform: phase === "panel" ? "translateX(0)" : "translateX(-6px)",
            transition: "opacity 150ms ease-out 120ms, transform 150ms ease-out 120ms",
          }}
        >
          <div className="w-52 border border-ink-80 bg-ink-100 p-3 text-white shadow-lg">
            <div className="font-heading text-sm font-black leading-tight">{doc.name_short}</div>
            <div className="mt-2 space-y-1 text-[10px]">
              {[
                ["Year", doc.year_ce],
                ["Type", doc.doc_type],
                ["Regime", REGIME_LABEL[doc.regime_type] ?? doc.regime_type],
                ["Era", ERA_LABELS[doc.era]],
              ].map(([k, v]) => (
                <div key={String(k)} className="flex justify-between">
                  <span className="text-ink-40">{k}</span>
                  <span>{v}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-ink-80 pt-1">
                <span className="text-ink-40">Sections</span>
                <span className="font-medium tabular-nums">{doc.section_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-40">Words</span>
                <span className="tabular-nums">{doc.word_count_total.toLocaleString()}</span>
              </div>
              {topTheme && (
                <div className="flex justify-between">
                  <span className="text-ink-40">Top theme</span>
                  <span className="text-right">{THEME_SHORT[topTheme[0]] ?? topTheme[0]}</span>
                </div>
              )}
              {doc.parent_doc_id && (
                <div className="flex justify-between border-t border-ink-80 pt-1">
                  <span className="text-ink-40">Amends</span>
                  <span className="tabular-nums">{doc.parent_doc_id.replace("const_", "")}</span>
                </div>
              )}
            </div>
            <div className="mt-2 border-t border-ink-80 pt-2 text-[9px] text-ink-40">
              Click to open →
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Timeline
// ---------------------------------------------------------------------------

export function Timeline({
  docs,
  onDocClick,
}: {
  docs: ConstitutionDoc[]
  onDocClick: (doc: ConstitutionDoc) => void
}) {
  const [tooltip, setTooltip] = useState<TooltipState>(null)

  const minYear = 1932
  const maxYear = 2022
  const span = maxYear - minYear
  const maxSections = Math.max(...docs.map((d) => d.section_count))
  const sorted = [...docs].sort((a, b) => a.year_ce - b.year_ce)

  let accTop = 0
  const rows = sorted.map((doc, i) => {
    const nextYear = sorted[i + 1]?.year_ce ?? maxYear
    const leftPct = ((doc.year_ce - minYear) / span) * 100
    const widthPct = ((nextYear - doc.year_ce) / span) * 100
    const rowH = Math.round(16 + (doc.section_count / maxSections) * 24)
    const rowTop = accTop
    accTop += rowH + 1
    return { doc, leftPct, widthPct, rowH, rowTop }
  })

  return (
    <div className="relative">
      <div className="space-y-px">
        {rows.map(({ doc, leftPct, widthPct, rowH, rowTop }) => {
          const isMilitary = doc.regime_type === "military"
          const textColor = isMilitary ? "text-white" : "text-ink-100"
          const isHovered = tooltip?.doc.doc_id === doc.doc_id

          return (
            <div
              key={doc.doc_id}
              className="relative w-full cursor-pointer"
              style={{ height: rowH }}
              onMouseEnter={() => setTooltip({ doc, leftPct, widthPct, rowTop, rowH })}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => {
                setTooltip(null)
                onDocClick(doc)
              }}
            >
              <div className="absolute inset-0 bg-ink-10" />
              <div
                className={cn(
                  "absolute top-0 h-full transition-opacity",
                  REGIME_BAR_CLASSES[doc.regime_type] ?? "bg-ink-20",
                  isHovered && "opacity-80",
                )}
                style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
              />
              <div
                className="absolute top-0 flex h-full items-center gap-1.5 overflow-hidden px-2"
                style={{ left: `${leftPct}%`, maxWidth: `${widthPct}%` }}
              >
                <span className={cn("whitespace-nowrap text-[10px] font-medium leading-none", textColor)}>
                  {doc.name_short}
                </span>
                {rowH >= 24 && (
                  <span className={cn("shrink-0 text-[9px] tabular-nums opacity-70", textColor)}>
                    {doc.section_count}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {tooltip && <TimelineTooltip {...tooltip} />}

      <div className="relative mt-3 w-full border-t border-border pt-1.5">
        {[1932, 1945, 1957, 1968, 1978, 1991, 2001, 2010, 2021].map((yr) => (
          <span
            key={yr}
            className="absolute -translate-x-1/2 text-[9px] tabular-nums text-muted-foreground"
            style={{ left: `${((yr - minYear) / span) * 100}%` }}
          >
            {yr}
          </span>
        ))}
      </div>
    </div>
  )
}
