"use client"

import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, Bookmark, LineChart } from "lucide-react"
import { CATEGORY_LABELS } from "@/lib/news-data"
import { usePublicArticles } from "@/lib/article-store"

export function TrendingWidget() {
  const allArticles = usePublicArticles()
  const trending = allArticles.filter((a) => a.category !== "column").slice(
    0,
    5
  )

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
        <TrendingUp className="size-4 text-accent" />
        {"アクセスランキング"}
      </h3>
      <Separator className="mb-3" />
      <ul className="flex flex-col gap-3">
        {trending.map((article, index) => (
          <li key={article.id}>
            <Link
              href={`/article/${article.id}`}
              className="group flex gap-3 items-start"
            >
              <span className="text-lg font-bold text-muted-foreground/40 leading-none shrink-0 w-6 text-right">
                {index + 1}
              </span>
              <span className="text-xs font-medium text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                {article.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function CategoryWidget() {
  const allArticles = usePublicArticles()
  const categoryCounts = allArticles.reduce(
    (acc, article) => {
      acc[article.category] = (acc[article.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="bg-card rounded-lg border border-border p-3">
      <h3 className="text-xs font-bold text-foreground flex items-center gap-2 mb-2 uppercase tracking-wide opacity-70">
        <Bookmark className="size-3" />
        {"カテゴリ"}
      </h3>
      <Separator className="mb-2" />
      <ul className="flex flex-col gap-1.5">
        {Object.entries(categoryCounts).map(([cat, count]) => (
          <li
            key={cat}
            className="flex items-center justify-between text-xs"
          >
            <span className="text-muted-foreground">
              {CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}
            </span>
            <span className="text-foreground font-medium">
              {count}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AboutWidget() {
  return (
    <div className="bg-secondary rounded-lg p-2.5 border border-border/50">
      <p className="text-xs leading-relaxed text-secondary-foreground opacity-80">
        {"India Business Dispatch: 日本企業向けインド市場インテリジェンス"}
      </p>
    </div>
  )
}

export function MarketIndicatorWidget() {
  const articles = usePublicArticles()
  const latest = articles.find((a) => a.marketSnapshot)
  if (!latest?.marketSnapshot) return null
  const m = latest.marketSnapshot
  const metrics = [m.fx, m.equities, m.rates]

  return (
    <Link
      href={`/article/${latest.id}`}
      className="block bg-card rounded-lg border border-border p-4 hover:shadow-md transition-shadow"
    >
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
        <LineChart className="size-4 text-accent" />
        {"市況スナップショット"}
      </h3>
      <Separator className="mb-3" />
      <ul className="flex flex-col gap-2">
        {metrics.map((metric) => (
          <li
            key={metric.label}
            className="flex items-baseline justify-between text-xs"
          >
            <span className="text-muted-foreground">{metric.label}</span>
            <span className="font-mono tabular-nums text-foreground">
              {metric.value}{" "}
              <span className="text-muted-foreground">{metric.change}</span>
            </span>
          </li>
        ))}
      </ul>
    </Link>
  )
}
