"use client"

import { useState, useMemo } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { NewsCardFeatured, NewsCardGridItem } from "@/components/news-card"
import { TrendingWidget } from "@/components/sidebar-widgets"
import { type Category } from "@/lib/news-data"
import { useArticles } from "@/lib/article-store"

export function NewsList() {
  const [activeCategory, setActiveCategory] = useState<Category | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const allArticles = useArticles()

  const filteredArticles = useMemo(() => {
    let articles = allArticles

    if (activeCategory) {
      articles = articles.filter((a) => a.category === activeCategory)
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      articles = articles.filter(
        (a) =>
          a.title.toLowerCase().includes(query) ||
          a.summary.toLowerCase().includes(query)
      )
    }

    // ソート：新しい日付から古い日付順
    articles = articles.sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    return articles
  }, [activeCategory, searchQuery])

  const featuredArticle = filteredArticles[0]
  const restArticles = filteredArticles.slice(1)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SiteHeader
        onSearch={setSearchQuery}
        onCategorySelect={setActiveCategory}
        activeCategory={activeCategory}
      />

      <main className="flex-1">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
          <div className="mx-auto max-w-7xl">
          {(activeCategory || searchQuery) && (
            <div className="mb-4 flex items-center gap-2">
              <p className="text-sm text-muted-foreground">
                {filteredArticles.length}
                {"件の記事"}
                {activeCategory && (
                  <button
                    onClick={() => setActiveCategory(null)}
                    className="ml-2 text-xs text-accent hover:underline"
                  >
                    {"フィルタを解除"}
                  </button>
                )}
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="ml-2 text-xs text-accent hover:underline"
                  >
                    {"検索をクリア"}
                  </button>
                )}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-6 md:flex-row">
            {/* Main column - article list */}
            <div className="flex-1 min-w-0">
              {filteredArticles.length === 0 ? (
                <div className="py-20 text-center">
                  <p className="text-muted-foreground text-sm">
                    {"該当するニュースが見つかりませんでした。"}
                  </p>
                </div>
              ) : (
                <>
                  {/* Featured article - horizontal layout */}
                  {featuredArticle && (
                    <NewsCardFeatured article={featuredArticle} />
                  )}

                  {/* Rest of articles - 2-column grid */}
                  {restArticles.length > 0 && (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {restArticles.map((article) => (
                        <NewsCardGridItem
                          key={article.id}
                          article={article}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Sidebar - right column (lighter) */}
            <aside className="w-full md:w-72 shrink-0 order-last md:order-none">
              <TrendingWidget />
            </aside>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
