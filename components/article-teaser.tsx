import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Lock } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  formatArticleDate,
  type NewsArticle,
} from "@/lib/news-data"
import { resolveArticleImageUrl } from "@/lib/image-utils"

const TEASER_LENGTH = 150

export function ArticleTeaser({ article }: { article: NewsArticle }) {
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)
  const teaser = article.summary.slice(0, TEASER_LENGTH).trimEnd()
  const truncated = article.summary.length > TEASER_LENGTH
  const next = encodeURIComponent(`/article/${article.id}`)

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          トップに戻る
        </Link>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <article className="space-y-5">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={`${CATEGORY_COLORS[article.category]} border-none`}>
                {CATEGORY_LABELS[article.category]}
              </Badge>
            </div>

            <h1 className="text-balance font-serif text-4xl font-bold leading-tight tracking-tight text-foreground">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
              <span>{formatArticleDate(article.publishedAt)}</span>
            </div>
          </div>

          {imageSrc && (
            <div className="relative mx-auto aspect-[4/3] w-full max-w-md overflow-hidden rounded-2xl border border-border bg-muted">
              <Image
                src={imageSrc}
                alt={article.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 448px"
              />
            </div>
          )}

          <section className="space-y-4 rounded-3xl border border-border bg-card p-5 sm:p-6">
            <p className="text-base leading-8 text-foreground">
              {teaser}
              {truncated ? "…" : ""}
            </p>
          </section>

          <section className="rounded-3xl border-2 border-accent/40 bg-card p-6 text-center sm:p-8">
            <Lock className="mx-auto size-6 text-accent" />
            <h2 className="mt-3 font-serif text-xl font-bold text-foreground">
              続きを読むには登録が必要です
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              無料アカウントでフルテキスト・示唆・関連記事をお読みいただけます。
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <Button asChild>
                <Link href={`/signup?next=${next}`}>新規登録（無料）</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/login?next=${next}`}>ログイン</Link>
              </Button>
            </div>
          </section>
        </article>
      </main>

      <SiteFooter />
    </div>
  )
}
