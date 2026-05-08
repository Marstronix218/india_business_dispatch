import { ArticleView } from "@/components/article-view"
import { ArticleStoreProvider } from "@/components/article-store-provider"
import { ArticleTeaser } from "@/components/article-teaser"
import { DataUnavailable } from "@/components/data-unavailable"
import {
  getArticleById,
  listPublishedArticles,
} from "@/lib/supabase/article-repository"
import { hasSupabaseConfig } from "@/lib/supabase/client"
import { getSessionUser } from "@/lib/supabase/server-auth"

export const revalidate = 0

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!hasSupabaseConfig()) {
    return { title: "記事を取得できません | IndoBiz Japan" }
  }
  const article = await getArticleById(id)
  if (!article) return { title: "記事が見つかりません | IndoBiz Japan" }

  return {
    title: `${article.title} | IndoBiz Japan`,
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

  const user = await getSessionUser()

  if (!user) {
    const article = await getArticleById(id)
    if (!article || article.workflowStatus !== "published") {
      return <DataUnavailable showHomeLink />
    }
    return <ArticleTeaser article={article} />
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
