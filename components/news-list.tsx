"use client"

import { useDeferredValue, useMemo, useState } from "react"
import { Search } from "lucide-react"
import {
  NewsCardHero,
  NewsCardMosaic,
  NewsCardTile,
} from "@/components/news-card"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Input } from "@/components/ui/input"
import { usePublicArticles } from "@/lib/article-store"
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  INDUSTRY_LABELS,
  INDUSTRY_OPTIONS,
  computePopularityScore,
  type Category,
  type IndustryTag,
} from "@/lib/news-data"

const INDUSTRY_VISIBLE_CATEGORIES: ReadonlyArray<Category | null> = [null, "economy"]

export function NewsList() {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [selectedIndustries, setSelectedIndustries] = useState<IndustryTag[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const publicArticles = usePublicArticles()

  const showIndustryFilter = INDUSTRY_VISIBLE_CATEGORIES.includes(activeCategory)

  const sortedArticles = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase()
    const industryFilterActive = showIndustryFilter && selectedIndustries.length > 0
    const now = Date.now()

    return [...publicArticles]
      .filter((article) => {
        const matchesCategory =
          activeCategory === null || article.category === activeCategory

        const matchesIndustry =
          !industryFilterActive ||
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
        const diff = computePopularityScore(right, now) - computePopularityScore(left, now)
        if (diff !== 0) return diff
        return (
          new Date(right.publishedAt).getTime() -
          new Date(left.publishedAt).getTime()
        )
      })
  }, [
    activeCategory,
    deferredSearchQuery,
    publicArticles,
    selectedIndustries,
    showIndustryFilter,
  ])

  const [hero, mosaic1, mosaic2, ...tiles] = sortedArticles

  function selectCategory(category: Category | null) {
    setActiveCategory(category)
    if (!INDUSTRY_VISIBLE_CATEGORIES.includes(category)) {
      setSelectedIndustries([])
    }
  }

  function toggleIndustry(tag: IndustryTag) {
    setSelectedIndustries((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    )
  }

  const industryFilterApplied = showIndustryFilter && selectedIndustries.length > 0
  const hasResults = sortedArticles.length > 0

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center">
          <nav className="-mx-1 flex flex-1 gap-5 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <CategoryLink
              active={activeCategory === null}
              onClick={() => selectCategory(null)}
              label="すべて"
            />
            {CATEGORY_OPTIONS.map((category) => (
              <CategoryLink
                key={category}
                active={activeCategory === category}
                onClick={() => selectCategory(category)}
                label={CATEGORY_LABELS[category]}
              />
            ))}
          </nav>

          <div className="relative w-full lg:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="タイトル・要約で検索"
              className="pl-9"
            />
          </div>
        </div>

        {showIndustryFilter && (
          <div className="-mx-1 mb-4 flex gap-4 overflow-x-auto border-t border-border/60 px-1 pt-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {INDUSTRY_OPTIONS.map((tag) => (
              <CategoryLink
                key={tag}
                active={selectedIndustries.includes(tag)}
                onClick={() => toggleIndustry(tag)}
                label={INDUSTRY_LABELS[tag]}
                size="sm"
              />
            ))}
          </div>
        )}

        {(activeCategory || industryFilterApplied || searchQuery) && (
          <div className="mb-4 flex items-center gap-3 text-sm text-muted-foreground">
            <span>{sortedArticles.length}件を表示中</span>
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

        {hasResults ? (
          <div className="space-y-4">
            {hero && (
              <div className="grid gap-4 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <NewsCardHero article={hero} />
                </div>
                {(mosaic1 || mosaic2) && (
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    {mosaic1 && <NewsCardMosaic article={mosaic1} />}
                    {mosaic2 && <NewsCardMosaic article={mosaic2} />}
                  </div>
                )}
              </div>
            )}

            {tiles.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {tiles.map((article) => (
                  <NewsCardTile key={article.id} article={article} />
                ))}
              </div>
            )}
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

function CategoryLink({
  active,
  onClick,
  label,
  size = "default",
}: {
  active: boolean
  onClick: () => void
  label: string
  size?: "default" | "sm"
}) {
  const padding = size === "sm" ? "py-1.5 text-xs" : "py-3 text-sm"
  return (
    <button
      type="button"
      onClick={onClick}
      className={`whitespace-nowrap border-b-2 ${padding} transition-colors ${
        active
          ? "border-accent text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  )
}
