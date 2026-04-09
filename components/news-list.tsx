"use client"

import { useState, useMemo } from "react"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { NewsCardLeadHorizontal, NewsCardCompact } from "@/components/news-card"
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
        <div className="mx-auto max-w-5xl px-4 py-4">
          {/* Results info */}
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

          {filteredArticles.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-muted-foreground text-sm">
                {"該当するニュースが見つかりませんでした。"}
              </p>
            </div>
          ) : (
            <>
              {/* Lead article - horizontal */}
              {featuredArticle && (
                <NewsCardLeadHorizontal article={featuredArticle} />
              )}

              {/* Grid of articles - 2 columns on desktop */}
              {restArticles.length > 0 && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {restArticles.map((article) => (
                    <NewsCardCompact
                      key={article.id}
                      article={article}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
