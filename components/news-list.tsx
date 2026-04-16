"use client"

import { useDeferredValue, useMemo, useState } from "react"
import { Filter } from "lucide-react"
import { NewsCardFeatured, NewsCardGridItem } from "@/components/news-card"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Input } from "@/components/ui/input"
import { usePublicArticles } from "@/lib/article-store"
import {
  INDUSTRY_LABELS,
  INDUSTRY_OPTIONS,
  type Category,
  type IndustryTag,
} from "@/lib/news-data"

export function NewsList() {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [selectedIndustries, setSelectedIndustries] = useState<IndustryTag[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const publicArticles = usePublicArticles()

  const filteredArticles = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase()

    return [...publicArticles]
      .filter((article) => {
        const matchesCategory =
          activeCategory === null || article.category === activeCategory

        const matchesIndustry =
          selectedIndustries.length === 0 ||
          article.industryTags.some((tag) => selectedIndustries.includes(tag))

        const haystack = [
          article.title,
          article.summary,
          article.source,
          ...article.implications,
        ]
          .join(" ")
          .toLowerCase()

        const matchesQuery = !query || haystack.includes(query)

        return matchesCategory && matchesIndustry && matchesQuery
      })
      .sort((left, right) => {
        return (
          new Date(right.publishedAt).getTime() -
          new Date(left.publishedAt).getTime()
        )
      })
  }, [activeCategory, deferredSearchQuery, publicArticles, selectedIndustries])

  const featuredArticle =
    filteredArticles.find((article) => article.featured) ?? filteredArticles[0]
  const gridArticles = filteredArticles.filter(
    (article) => article.id !== featuredArticle?.id,
  )

  function toggleIndustry(tag: IndustryTag) {
    setSelectedIndustries((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader
        activeCategory={activeCategory}
        onCategorySelect={setActiveCategory}
      />

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">

        <div className="mb-4 grid gap-3 rounded-2xl border border-border bg-card p-3 lg:grid-cols-[1fr_auto]">
          <div className="relative w-full">
            <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="タイトル、要約、示唆で検索"
              className="pl-9"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {INDUSTRY_OPTIONS.map((tag) => {
              const active = selectedIndustries.includes(tag)
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleIndustry(tag)}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {INDUSTRY_LABELS[tag]}
                </button>
              )
            })}
          </div>
        </div>

        {(activeCategory || selectedIndustries.length > 0 || searchQuery) && (
          <div className="mb-4 flex items-center gap-3 text-sm text-muted-foreground">
            <span>{filteredArticles.length}件を表示中</span>
            <button
              type="button"
              onClick={() => {
                setActiveCategory(null)
                setSelectedIndustries([])
                setSearchQuery("")
              }}
              className="text-accent underline-offset-4 hover:underline"
            >
              フィルタを解除
            </button>
          </div>
        )}

        {featuredArticle ? (
          <div className="space-y-3">
            <NewsCardFeatured article={featuredArticle} />
            <div className="grid gap-3 lg:grid-cols-2">
              {gridArticles.map((article) => (
                <NewsCardGridItem key={article.id} article={article} />
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-border bg-card p-8 text-sm text-muted-foreground">
            条件に合う記事が見つかりませんでした。
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
