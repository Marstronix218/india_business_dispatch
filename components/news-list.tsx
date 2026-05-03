"use client"

import { useDeferredValue, useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Search } from "lucide-react"
import { NewsCardHero, NewsCardMosaic } from "@/components/news-card"
import { TopicCarousel } from "@/components/topic-carousel"
import { TopicHeader } from "@/components/topic-header"
import { JapanIndiaBand } from "@/components/japan-india-band"
import { MarketTicker } from "@/components/market-ticker"
import {
  TrendingWidget,
  MarketIndicatorWidget,
  CitySpotlightWidget,
  PitchWidget,
  SocialWidget,
  NewsletterCTA,
} from "@/components/sidebar-widgets"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Input } from "@/components/ui/input"
import { usePublicArticles } from "@/lib/article-store"
import {
  INDUSTRY_LABELS,
  INDUSTRY_OPTIONS,
  TOPIC_SECTIONS,
  computePopularityScore,
  deriveTopicSection,
  type IndustryTag,
  type NewsArticle,
  type TopicSectionKey,
} from "@/lib/news-data"

const INDUSTRY_VISIBLE_SECTIONS: ReadonlyArray<TopicSectionKey | null> = [
  null,
  "industry",
  "strategy",
]

export function NewsList() {
  const searchParams = useSearchParams()
  const [activeSection, setActiveSection] = useState<TopicSectionKey | null>(
    null,
  )
  const [selectedIndustries, setSelectedIndustries] = useState<IndustryTag[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const publicArticles = usePublicArticles()

  useEffect(() => {
    const sectionParam = searchParams.get("section")
    const nextSection = TOPIC_SECTIONS.some((s) => s.key === sectionParam)
      ? (sectionParam as TopicSectionKey)
      : null

    const nextTags = searchParams
      .getAll("tag")
      .filter((tag): tag is IndustryTag =>
        INDUSTRY_OPTIONS.includes(tag as IndustryTag),
      )

    setActiveSection(nextSection)
    setSelectedIndustries(
      nextSection === null || INDUSTRY_VISIBLE_SECTIONS.includes(nextSection)
        ? nextTags
        : [],
    )
  }, [searchParams])

  const showIndustryFilter = INDUSTRY_VISIBLE_SECTIONS.includes(activeSection)

  const sortedArticles = useMemo(() => {
    const query = deferredSearchQuery.trim().toLowerCase()
    const industryFilterActive =
      showIndustryFilter && selectedIndustries.length > 0
    const now = Date.now()

    return [...publicArticles]
      .filter((article) => {
        const matchesSection =
          activeSection === null || deriveTopicSection(article) === activeSection

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

        return matchesSection && matchesIndustry && matchesQuery
      })
      .sort((left, right) => {
        const diff =
          computePopularityScore(right, now) - computePopularityScore(left, now)
        if (diff !== 0) return diff
        return (
          new Date(right.publishedAt).getTime() -
          new Date(left.publishedAt).getTime()
        )
      })
  }, [
    activeSection,
    deferredSearchQuery,
    publicArticles,
    selectedIndustries,
    showIndustryFilter,
  ])

  const [hero, mosaic1, mosaic2, mosaic3, ...rest] = sortedArticles
  const collabHighlights = sortedArticles
    .filter((a) => a.japanIndiaCollaboration)
    .slice(0, 3)

  const filterActive =
    activeSection !== null ||
    (showIndustryFilter && selectedIndustries.length > 0) ||
    deferredSearchQuery.trim().length > 0

  const sectionsBySection = useMemo(() => {
    const collabIds = new Set(collabHighlights.map((a) => a.id))
    const buckets = new Map<TopicSectionKey, NewsArticle[]>()
    for (const section of TOPIC_SECTIONS) buckets.set(section.key, [])
    for (const article of rest) {
      // skip articles already shown in JapanIndiaBand to avoid duplication
      if (!filterActive && collabIds.has(article.id)) continue
      const key = deriveTopicSection(article)
      buckets.get(key)?.push(article)
    }
    return buckets
  }, [rest, collabHighlights, filterActive])

  function selectSection(section: TopicSectionKey | null) {
    setActiveSection(section)
    if (!INDUSTRY_VISIBLE_SECTIONS.includes(section)) {
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

  const industryFilterApplied =
    showIndustryFilter && selectedIndustries.length > 0
  const hasResults = sortedArticles.length > 0

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <FilterRibbon
        activeSection={activeSection}
        onSelectSection={selectSection}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />
      <MarketTicker />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {showIndustryFilter && (
          <div className="-mx-1 mb-4 flex gap-4 overflow-x-auto px-1 pt-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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

        {(activeSection || industryFilterApplied || searchQuery) && (
          <div className="mb-4 flex items-center gap-3 text-sm text-muted-foreground">
            <span>{sortedArticles.length}件を表示中</span>
            <button
              type="button"
              onClick={() => {
                setActiveSection(null)
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
          <>
            {hero && (
              <section className="mb-12 grid gap-3 lg:auto-rows-fr lg:grid-cols-3 lg:grid-rows-3">
                <div className="lg:col-span-2 lg:row-span-3">
                  <NewsCardHero article={hero} />
                </div>
                {mosaic1 && <NewsCardMosaic article={mosaic1} priority />}
                {mosaic2 && <NewsCardMosaic article={mosaic2} priority />}
                {mosaic3 && <NewsCardMosaic article={mosaic3} />}
              </section>
            )}

            {!filterActive && collabHighlights.length > 0 && (
              <JapanIndiaBand articles={collabHighlights} />
            )}

            <div className="grid min-w-0 gap-10 lg:grid-cols-4">
              <div className="min-w-0 space-y-12 lg:col-span-3">
                {filterActive ? (
                  <FilteredResults articles={rest} />
                ) : (
                  TOPIC_SECTIONS.map((section) => {
                    const items = sectionsBySection.get(section.key) ?? []
                    if (items.length === 0) return null
                    return (
                      <section key={section.key} className="min-w-0">
                        <TopicHeader section={section} count={items.length} />
                        <TopicCarousel articles={items} />
                      </section>
                    )
                  })
                )}

                {!filterActive && <ArchiveBlock />}
              </div>

              <aside className="space-y-5 self-start lg:col-span-1 lg:sticky lg:top-4">
                <TrendingWidget />
                <MarketIndicatorWidget />
                <CitySpotlightWidget />
                <PitchWidget />
                <SocialWidget />
                <NewsletterCTA />
              </aside>
            </div>
          </>
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

function FilteredResults({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null
  return (
    <section className="min-w-0">
      <div className="mb-4">
        <div className="mb-2 flex items-end justify-between gap-4">
          <div className="flex items-baseline gap-3">
            <span className="size-2.5 rounded-sm bg-accent" />
            <h2 className="font-serif text-2xl font-bold tracking-tight">
              検索結果
            </h2>
            <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
              // RESULTS
            </span>
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            {articles.length}記事
          </span>
        </div>
        <div className="topic-rule" />
      </div>
      <TopicCarousel articles={articles} />
    </section>
  )
}

function ArchiveBlock() {
  return (
    <div className="mt-12 border-t-2 border-foreground pt-6">
      <div className="flex items-baseline justify-between">
        <h3 className="font-serif text-2xl font-bold">アーカイブ</h3>
        <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
          // ARCHIVE
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        過去30日で公開された全記事を時系列で。月別アーカイブ、業界別タグ、原典ソースから絞り込みできます。
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        {INDUSTRY_OPTIONS.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-border px-3 py-1 text-xs text-foreground/80 transition-colors hover:border-accent hover:bg-muted"
          >
            #{INDUSTRY_LABELS[tag]}
          </span>
        ))}
      </div>
    </div>
  )
}

function FilterRibbon({
  activeSection,
  onSelectSection,
  searchQuery,
  onSearchChange,
}: {
  activeSection: TopicSectionKey | null
  onSelectSection: (section: TopicSectionKey | null) => void
  searchQuery: string
  onSearchChange: (value: string) => void
}) {
  return (
    <div className="border-b border-border bg-secondary/40">
      <div className="mx-auto flex max-w-7xl items-center gap-5 overflow-x-auto px-4 py-2 text-xs sm:px-6 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <span className="shrink-0 font-mono tracking-widest text-muted-foreground">
          FILTER
        </span>
        <CategoryLink
          active={activeSection === null}
          onClick={() => onSelectSection(null)}
          label="すべて"
        />
        {TOPIC_SECTIONS.map((section) => (
          <CategoryLink
            key={section.key}
            active={activeSection === section.key}
            onClick={() => onSelectSection(section.key)}
            label={section.label}
          />
        ))}
        <div className="ml-auto flex shrink-0 items-center gap-2 text-muted-foreground">
          <Search className="size-3.5" />
          <Input
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="記事を検索…"
            className="h-7 w-40 border-none bg-transparent px-0 text-xs shadow-none focus-visible:ring-0"
          />
        </div>
      </div>
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
  const padding = size === "sm" ? "py-1.5 text-xs" : "py-1.5 text-xs"
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 whitespace-nowrap border-b-2 ${padding} transition-colors ${
        active
          ? "border-accent font-semibold text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  )
}
