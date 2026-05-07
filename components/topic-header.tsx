import type { CategorySection } from "@/lib/news-data"

export function TopicHeader({
  section,
  count,
}: {
  section: CategorySection
  count: number
}) {
  return (
    <div className="mb-4 min-w-0">
      <div className="mb-2 flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            className="size-2.5 shrink-0 rounded-sm"
            style={{ background: section.accent }}
          />
          <h2 className="shrink-0 font-serif text-2xl font-bold tracking-tight">
            {section.label}
          </h2>
          <span className="min-w-0 font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
            // {section.enLabel.toUpperCase()}
          </span>
        </div>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {count}記事
        </span>
      </div>
      <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
        {section.kicker}
      </p>
      <div className="topic-rule" />
    </div>
  )
}
