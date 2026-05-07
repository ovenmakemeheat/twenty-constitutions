import { cn } from "~/lib/utils"
import { ERA_LABELS, ERAS_ORDERED, THEMES_ORDERED, THEME_SHORT, ERA_YEARS } from "~/data/types"
import { REGIME_LABEL, REGIME_BAR_CLASSES, RegimeBadge } from "~/components/badges"

// ---------------------------------------------------------------------------
// RegimeBar
// ---------------------------------------------------------------------------

export function RegimeBar({ byRegime }: { byRegime: Record<string, number> }) {
  const total = Object.values(byRegime).reduce((a, b) => a + b, 0)
  const order = ["civilian", "semi_military", "military"] as const
  return (
    <div className="space-y-3">
      <div className="flex h-8 w-full overflow-hidden rounded-sm">
        {order.map((r) => {
          const pct = ((byRegime[r] ?? 0) / total) * 100
          return (
            <div
              key={r}
              className={cn("transition-all", REGIME_BAR_CLASSES[r])}
              style={{ width: `${pct}%` }}
              title={`${REGIME_LABEL[r]}: ${byRegime[r]} sections (${pct.toFixed(1)}%)`}
            />
          )
        })}
      </div>
      <div className="flex flex-wrap gap-4">
        {order.map((r) => {
          const pct = (((byRegime[r] ?? 0) / total) * 100).toFixed(1)
          return (
            <div key={r} className="flex items-center gap-1.5">
              <div className={cn("size-3 shrink-0 rounded-sm", REGIME_BAR_CLASSES[r])} />
              <span className="text-xs text-muted-foreground">{REGIME_LABEL[r]}</span>
              <span className="text-xs font-medium tabular-nums text-foreground">{pct}%</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// DocTypeDonut
// ---------------------------------------------------------------------------

export function DocTypeDonut({ byDocType }: { byDocType: Record<string, number> }) {
  const total = Object.values(byDocType).reduce((a, b) => a + b, 0)
  const types = [
    { key: "full", label: "Full", color: "var(--ink-100)" },
    { key: "interim", label: "Interim", color: "var(--ink-40)" },
    { key: "amendment", label: "Amendment", color: "var(--ink-20)" },
  ]
  let cumPct = 0
  const stops = types
    .map(({ key, color }) => {
      const pct = ((byDocType[key] ?? 0) / total) * 100
      const start = cumPct
      cumPct += pct
      return `${color} ${start.toFixed(1)}% ${cumPct.toFixed(1)}%`
    })
    .join(", ")

  return (
    <div className="flex items-center gap-6">
      <div
        className="size-24 shrink-0 rounded-full"
        style={{
          background: `conic-gradient(${stops})`,
          WebkitMask: "radial-gradient(circle, transparent 35%, black 36%)",
          mask: "radial-gradient(circle, transparent 35%, black 36%)",
        }}
      />
      <div className="space-y-2">
        {types.map(({ key, label, color }) => {
          const count = byDocType[key] ?? 0
          const pct = ((count / total) * 100).toFixed(0)
          return (
            <div key={key} className="flex items-center gap-2">
              <div className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: color }} />
              <span className="text-xs text-muted-foreground">{label}</span>
              <span className="text-xs font-medium tabular-nums text-foreground">
                {count}
                <span className="ml-1 text-muted-foreground">({pct}%)</span>
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// ThemeHeatmap
// ---------------------------------------------------------------------------

export function ThemeHeatmap({
  matrix,
  maxScore,
  activeEra,
  onEraClick,
}: {
  matrix: Array<{ era: string; themes: Array<{ theme: string; score: number }> }>
  maxScore: number
  activeEra: string | null
  onEraClick: (era: string | null) => void
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-[10px]">
        <thead>
          <tr>
            <th className="w-28 pb-1 text-left font-medium uppercase tracking-wider text-muted-foreground" />
            {THEMES_ORDERED.map((theme) => (
              <th
                key={theme}
                className="pb-2 font-medium text-muted-foreground"
                style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", height: 90 }}
              >
                {THEME_SHORT[theme] ?? theme}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row) => {
            const isActive = activeEra === row.era
            return (
              <tr
                key={row.era}
                className={cn(
                  "cursor-pointer border-t border-border transition-colors",
                  isActive ? "bg-ink-10" : "hover:bg-muted/30",
                )}
                onClick={() => onEraClick(isActive ? null : row.era)}
                title={`Filter table to ${ERA_LABELS[row.era as keyof typeof ERA_LABELS]}`}
              >
                <td
                  className={cn(
                    "whitespace-nowrap py-1.5 pr-3 text-left text-[10px] font-medium uppercase tracking-wider",
                    isActive ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {isActive && <span className="mr-1 text-gold">▶</span>}
                  {ERA_LABELS[row.era as keyof typeof ERA_LABELS]}
                </td>
                {row.themes.map(({ theme, score }) => {
                  const intensity = maxScore > 0 ? score / maxScore : 0
                  const l = 1 - intensity * 0.75
                  return (
                    <td key={theme} className="p-px" title={`${theme}: ${score.toFixed(1)}`}>
                      <div
                        className="size-6 rounded-sm"
                        style={{ backgroundColor: `oklch(${l} 0.003 80)` }}
                      />
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      <div className="mt-3 flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground">Low</span>
        <div className="flex h-3 w-24">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex-1"
              style={{ backgroundColor: `oklch(${1 - (i / 9) * 0.75} 0.003 80)` }}
            />
          ))}
        </div>
        <span className="text-[10px] text-muted-foreground">High</span>
        <span className="ml-2 text-[10px] text-muted-foreground">· Click a row to filter table</span>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// EraTable
// ---------------------------------------------------------------------------

export function EraTable({
  breakdown,
}: {
  breakdown: Array<{ era: string; docs: number; sections: number; regimes: Record<string, number> }>
}) {
  return (
    <table className="w-full border-collapse text-xs">
      <thead>
        <tr className="border-b border-border">
          {["Era", "Period", "Docs", "Sections", "Dominant Regime"].map((h) => (
            <th
              key={h}
              className="pb-2 text-left font-medium uppercase tracking-wider text-muted-foreground"
            >
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {breakdown.map((row) => {
          const dominant = Object.entries(row.regimes).sort((a, b) => b[1] - a[1])[0]?.[0]
          return (
            <tr key={row.era} className="border-b border-border last:border-0">
              <td className="py-2 font-medium text-foreground">
                {ERA_LABELS[row.era as keyof typeof ERA_LABELS]}
              </td>
              <td className="py-2 tabular-nums text-muted-foreground">
                {ERA_YEARS[row.era as keyof typeof ERA_YEARS]}
              </td>
              <td className="py-2 tabular-nums text-foreground">{row.docs}</td>
              <td className="py-2 tabular-nums text-foreground">{row.sections.toLocaleString()}</td>
              <td className="py-2">{dominant && <RegimeBadge regime={dominant} />}</td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
