"use client"

import { useDeferredValue, useMemo, useState } from "react"
import { Search } from "lucide-react"
import {
  NewsCardHero,
  NewsCardMosaic,
  NewsCardTile,
} from "@/components/news-card"
import {
  MarketIndicatorWidget,
  TrendingWidget,
} from "@/components/sidebar-widgets"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Input } from "@/components/ui/input"
import { usePublicArticles } from "@/lib/article-store"
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  INDUSTRY_LABELS,
  INDUSTRY_OPTIONS,
  TOPIC_LABELS,
  TOPIC_OPTIONS,
  computePopularityScore,
  type Category,
  type IndustryTag,
  type NewsArticle,
  type Topic,
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

  const [hero, mosaic1, mosaic2, mosaic3, ...rest] = sortedArticles
  const collabHighlights = sortedArticles
    .filter((a) => a.japanIndiaCollaboration)
    .slice(0, 3)
  const tiles = rest

  const filterActive =
    activeCategory !== null ||
    (showIndustryFilter && selectedIndustries.length > 0) ||
    deferredSearchQuery.trim().length > 0

  const effectiveSections = useMemo(() => {
    if (filterActive) {
      return tiles.length > 0
        ? [{ key: "_all", label: "結果", articles: tiles }]
        : []
    }
    const buckets = new Map<Topic, NewsArticle[]>()
    const leftover: NewsArticle[] = []
    for (const a of tiles) {
      const t = (a.topics ?? [])[0]
      if (t) {
        const arr = buckets.get(t) ?? []
        arr.push(a)
        buckets.set(t, arr)
      } else {
        leftover.push(a)
      }
    }
    const sections: { key: string; label: string; articles: NewsArticle[] }[] =
      []
    for (const t of TOPIC_OPTIONS) {
      const items = buckets.get(t) ?? []
      if (items.length >= 2) {
        sections.push({ key: t, label: TOPIC_LABELS[t], articles: items })
      } else if (items.length === 1) {
        leftover.push(...items)
      }
    }
    if (leftover.length > 0) {
      sections.push({
        key: "_other",
        label: "最新ニュース",
        articles: leftover,
      })
    }
    return sections
  }, [filterActive, tiles])

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
          <div className="space-y-8">
            {hero && (
              <div className="grid gap-1 lg:auto-rows-fr lg:grid-cols-3 lg:grid-rows-3">
                <div className="lg:col-span-2 lg:row-span-3">
                  <NewsCardHero article={hero} />
                </div>
                {mosaic1 && <NewsCardMosaic article={mosaic1} stacked />}
                {mosaic2 && <NewsCardMosaic article={mosaic2} stacked />}
                {mosaic3 && <NewsCardMosaic article={mosaic3} stacked />}
              </div>
            )}

            {!filterActive && collabHighlights.length > 0 && (
              <section className="space-y-3">
                <SectionHeader label="日印連携 / Japan-India Collaboration" />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {collabHighlights.map((article) => (
                    <NewsCardTile key={article.id} article={article} />
                  ))}
                </div>
              </section>
            )}

            {effectiveSections.length > 0 && (
              <div className="grid gap-6 lg:grid-cols-4">
                <div className="space-y-8 lg:col-span-3">
                  {effectiveSections.map((section) => (
                    <section key={section.key} className="space-y-3">
                      <SectionHeader label={section.label} />
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {section.articles.map((article) => (
                          <NewsCardTile key={article.id} article={article} />
                        ))}
                      </div>
                    </section>
                  ))}
                </div>
                <aside className="space-y-4 lg:col-span-1">
                  <TrendingWidget />
                  <MarketIndicatorWidget />
                </aside>
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

function SectionHeader({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <h2 className="text-xs font-bold uppercase tracking-wide text-foreground">
        {label}
      </h2>
      <div className="h-px flex-1 bg-border" />
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
