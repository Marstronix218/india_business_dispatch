import { NewsList } from "@/components/news-list"
import { ArticleStoreProvider } from "@/components/article-store-provider"
import { DataUnavailable } from "@/components/data-unavailable"
import { listPublishedArticles } from "@/lib/supabase/article-repository"
import { hasSupabaseConfig } from "@/lib/supabase/client"

export const revalidate = 0

export default async function HomePage() {
  if (!hasSupabaseConfig()) {
    return <DataUnavailable />
  }

  const articles = await listPublishedArticles()
  if (articles.length === 0) {
    return <DataUnavailable />
  }

  return (
    <ArticleStoreProvider initial={articles}>
      <NewsList />
    </ArticleStoreProvider>
  )
}
