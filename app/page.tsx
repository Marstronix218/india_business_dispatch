import { NewsList } from "@/components/news-list"
import { ArticleStoreProvider } from "@/components/article-store-provider"
import { listPublishedArticles } from "@/lib/supabase/article-repository"
import { hasSupabaseConfig } from "@/lib/supabase/client"
import { getPublicSeedArticles } from "@/lib/news-data"

export const revalidate = 0

export default async function HomePage() {
  const initial = hasSupabaseConfig()
    ? await listPublishedArticles()
    : getPublicSeedArticles()

  return (
    <ArticleStoreProvider initial={initial}>
      <NewsList />
    </ArticleStoreProvider>
  )
}
