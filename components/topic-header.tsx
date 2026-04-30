import type { TopicSection } from "@/lib/news-data"

export function TopicHeader({
  section,
  count,
}: {
  section: TopicSection
  count: number
}) {
  return (
    <div className="mb-4">
      <div className="mb-2 flex items-end justify-between gap-4">
        <div className="flex items-baseline gap-3">
          <span
            className="size-2.5 rounded-sm"
            style={{ background: section.accent }}
          />
          <h2 className="font-serif text-2xl font-bold tracking-tight">
            {section.label}
          </h2>
          <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
            // {section.enLabel.toUpperCase()}
          </span>
        </div>
        <span className="shrink-0 font-mono text-xs text-muted-foreground">
          {count}記事
        </span>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">{section.kicker}</p>
      <div className="topic-rule" />
    </div>
  )
}
