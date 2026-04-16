import { getPublicSeedArticles } from "@/lib/news-data"
import { ArticleView } from "@/components/article-view"

export function generateStaticParams() {
  return getPublicSeedArticles().map((article) => ({
    id: article.id,
  }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const article = getPublicSeedArticles().find((a) => a.id === id)
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
  return <ArticleView id={id} />
}
