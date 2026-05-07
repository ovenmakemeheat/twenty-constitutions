import { cn } from "~/lib/utils"

export const REGIME_LABEL: Record<string, string> = {
  civilian: "Civilian",
  military: "Military",
  semi_military: "Semi-Military",
}

export const REGIME_CLASSES: Record<string, string> = {
  civilian: "text-ink-100 border border-gold",
  military: "bg-ink-80 text-white",
  semi_military: "bg-ink-40 text-ink-100",
}

export const REGIME_BAR_CLASSES: Record<string, string> = {
  civilian: "bg-gold",
  military: "bg-ink-80",
  semi_military: "bg-ink-40",
}

export const DOCTYPE_CLASSES: Record<string, string> = {
  full: "border border-ink-40 text-ink-60",
  amendment: "border border-dashed border-ink-40 text-ink-60",
  interim: "bg-ink-10 text-ink-60",
}

export function RegimeBadge({ regime }: { regime: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-sm px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        REGIME_CLASSES[regime] ?? "bg-ink-10 text-ink-100",
      )}
    >
      {REGIME_LABEL[regime] ?? regime}
    </span>
  )
}

export function DocTypeBadge({ type }: { type: string }) {
  return (
    <span
      className={cn(
        "inline-block rounded-sm px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
        DOCTYPE_CLASSES[type] ?? "border border-ink-20 text-ink-60",
      )}
    >
      {type}
    </span>
  )
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
      {children}
    </h2>
  )
}

export function StatCard({
  value,
  label,
  sub,
}: {
  value: string | number
  label: string
  sub?: string
}) {
  return (
    <div className="border border-border bg-card p-5">
      <div
        className="font-heading text-4xl font-black leading-none tracking-tight text-foreground"
        style={{ fontFeatureSettings: '"tnum"' }}
      >
        {value}
      </div>
      <div className="mt-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  )
}

export function SortIcon({ active, dir }: { active: boolean; dir: "asc" | "desc" }) {
  return (
    <span
      className={cn(
        "ml-1 inline-block text-[9px]",
        active ? "text-foreground" : "text-muted-foreground/40",
      )}
    >
      {active ? (dir === "asc" ? "↑" : "↓") : "↕"}
    </span>
  )
}
