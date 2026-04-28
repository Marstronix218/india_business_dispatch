import { ArticleView } from "@/components/article-view"
import { ArticleStoreProvider } from "@/components/article-store-provider"
import { DataUnavailable } from "@/components/data-unavailable"
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
  if (!hasSupabaseConfig()) {
    return { title: "記事を取得できません | India Business Dispatch" }
  }
  const article = await getArticleById(id)
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

  if (!hasSupabaseConfig()) {
    return <DataUnavailable showHomeLink />
  }

  const articles = await listPublishedArticles()
  if (articles.length === 0) {
    return <DataUnavailable showHomeLink />
  }

  return (
    <ArticleStoreProvider initial={articles}>
      <ArticleView id={id} />
    </ArticleStoreProvider>
  )
}
