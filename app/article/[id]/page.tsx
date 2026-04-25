import { getPublicSeedArticles } from "@/lib/news-data"
import { ArticleView } from "@/components/article-view"
import { ArticleStoreProvider } from "@/components/article-store-provider"
import {
  getArticleById,
  listPublishedArticles,
} from "@/lib/supabase/article-repository"
import { hasSupabaseConfig } from "@/lib/supabase/client"

export const revalidate = 0

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const article = hasSupabaseConfig()
    ? await getArticleById(id)
    : getPublicSeedArticles().find((a) => a.id === id) ?? null
  if (!article) return { title: "記事が見つかりません | India Business Dispatch" }

  return {
    title: `${article.title} | India Business Dispatch`,
    description: article.summary,
  }
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const initial = hasSupabaseConfig()
    ? await listPublishedArticles()
    : getPublicSeedArticles()

  return (
    <ArticleStoreProvider initial={initial}>
      <ArticleView id={id} />
    </ArticleStoreProvider>
  )
}
