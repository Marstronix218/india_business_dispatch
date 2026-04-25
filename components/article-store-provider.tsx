"use client"

import { useHydrateArticles } from "@/lib/article-store"
import type { NewsArticle } from "@/lib/news-data"

export function ArticleStoreProvider({
  initial,
  children,
}: {
  initial: NewsArticle[]
  children: React.ReactNode
}) {
  useHydrateArticles(initial)

  return <>{children}</>
}
