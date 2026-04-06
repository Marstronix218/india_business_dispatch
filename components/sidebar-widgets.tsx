"use client"

import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, Bookmark } from "lucide-react"
import { CATEGORY_LABELS } from "@/lib/news-data"
import { useArticles } from "@/lib/article-store"

export function TrendingWidget() {
  const allArticles = useArticles()
  const trending = allArticles.filter((a) => a.category !== "column").slice(
    0,
    5
  )

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
        <TrendingUp className="size-4 text-accent" />
        {"注目のニュース"}
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
  const allArticles = useArticles()
  const categoryCounts = allArticles.reduce(
    (acc, article) => {
      acc[article.category] = (acc[article.category] || 0) + 1
      return acc
    },
    {} as Record<string, number>
  )

  return (
    <div className="bg-card rounded-lg border border-border p-4">
      <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
        <Bookmark className="size-4 text-accent" />
        {"カテゴリ別記事数"}
      </h3>
      <Separator className="mb-3" />
      <ul className="flex flex-col gap-2">
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
              {"件"}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function AboutWidget() {
  return (
    <div className="bg-primary text-primary-foreground rounded-lg p-4">
      <h3 className="text-sm font-bold mb-2">
        {"India Business Dispatch とは"}
      </h3>
      <p className="text-xs leading-relaxed opacity-90">
        {"日本企業のためのインドビジネス情報プラットフォーム。経済・政策・規制・企業動向を毎日配信し、意思決定に必要な情報を一元化しています。"}
      </p>
    </div>
  )
}
