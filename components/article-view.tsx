"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { usePublicArticles } from "@/lib/article-store"
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CONTENT_TYPE_LABELS,
  INDUSTRY_LABELS,
  MARKET_METRIC_ORDER,
  VISIBILITY_LABELS,
  formatArticleDate,
} from "@/lib/news-data"
import { ensureMinimumSummaryLength } from "@/lib/summary-utils"
import { resolveArticleImageUrl } from "@/lib/image-utils"

export function ArticleView({ id }: { id: string }) {
  const articles = usePublicArticles()
  const article = articles.find((item) => item.id === id)

  if (!article) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground">
            記事が見つかりません
          </h1>
          <Link href="/" className="mt-3 inline-block text-sm text-accent hover:underline">
            トップに戻る
          </Link>
        </div>
      </div>
    )
  }

  const relatedArticles = articles
    .filter((item) => item.category === article.category && item.id !== article.id)
    .slice(0, 3)
  const detailedSummary = ensureMinimumSummaryLength(article.summary, 500)
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)

  const leadType = article.industryTags.includes("talent") ? "hiring" : "expansion"

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            トップに戻る
          </Link>
          <Link href="/" className="text-sm font-semibold text-foreground">
            India Business Dispatch
          </Link>
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/pricing">価格</Link>
            </Button>
            <Button asChild size="sm">
              <Link href={`/contact?leadType=${leadType}`}>お問い合わせ</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <article className="space-y-8">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={`${CATEGORY_COLORS[article.category]} border-none`}>
                  {CATEGORY_LABELS[article.category]}
                </Badge>
                <Badge variant="outline">{CONTENT_TYPE_LABELS[article.contentType]}</Badge>
                <Badge variant="outline">{VISIBILITY_LABELS[article.visibility]}</Badge>
              </div>

              <div className="space-y-3">
                <h1 className="text-4xl font-semibold leading-tight tracking-tight text-foreground">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span>{formatArticleDate(article.publishedAt)}</span>
                  <span>出典: {article.source}</span>
                  {article.sourceUrl && (
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-accent hover:underline"
                    >
                      原文リンク
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {imageSrc && (
              <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-border bg-muted">
                <Image
                  src={imageSrc}
                  alt={article.title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 760px"
                />
              </div>
            )}

            {article.marketSnapshot && (
              <section className="rounded-3xl border border-border bg-card p-6">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
                  為替・市況
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {MARKET_METRIC_ORDER.map((key) => {
                    const metric = article.marketSnapshot?.[key]
                    if (!metric) return null

                    return (
                      <div
                        key={key}
                        className="rounded-2xl border border-border bg-secondary/30 p-4"
                      >
                        <p className="text-sm font-medium text-foreground">
                          {metric.label}
                        </p>
                        <p className="mt-2 text-xl font-semibold text-foreground">
                          {metric.value}
                        </p>
                        <p className="text-sm text-muted-foreground">{metric.unit}</p>
                        <p
                          className={`mt-2 text-sm font-medium ${
                            metric.change.startsWith("-")
                              ? "text-rose-600"
                              : "text-emerald-700"
                          }`}
                        >
                          {metric.change}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {metric.asOf}
                        </p>
                      </div>
                    )
                  })}
                </div>
              </section>
            )}

            <section className="rounded-3xl border border-border bg-card p-6">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
                要約
              </p>
              <p className="mt-4 whitespace-pre-line text-base leading-8 text-foreground">
                {detailedSummary}
              </p>
            </section>

            <section className="rounded-3xl border border-border bg-card p-6">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
                日本企業への示唆
              </p>
              <ul className="mt-4 space-y-3">
                {article.implications.map((implication) => (
                  <li
                    key={implication}
                    className="rounded-2xl border border-border bg-secondary/30 px-4 py-3 text-sm leading-7 text-foreground"
                  >
                    {implication}
                  </li>
                ))}
              </ul>
            </section>

            {article.industryTags.length > 0 && (
              <section className="rounded-3xl border border-border bg-card p-6">
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
                  業界タグ
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {article.industryTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="px-3 py-1">
                      {INDUSTRY_LABELS[tag]}
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {relatedArticles.length > 0 && (
              <section className="rounded-3xl border border-border bg-card p-6">
                <div className="mb-4 space-y-2">
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
                    Related
                  </p>
                  <h2 className="text-2xl font-semibold text-foreground">
                    関連する短報
                  </h2>
                </div>
                <div className="space-y-4">
                  {relatedArticles.map((related, index) => (
                    <div key={related.id}>
                      <Link
                        href={`/article/${related.id}`}
                        className="text-base font-semibold text-foreground hover:text-primary"
                      >
                        {related.title}
                      </Link>
                      <p className="mt-1 line-clamp-3 text-sm leading-7 text-muted-foreground">
                        {related.summary}
                      </p>
                      {index < relatedArticles.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </article>

          <aside className="space-y-6">
            <div className="rounded-3xl border border-border bg-card p-6">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
                この記事について
              </p>
              <div className="mt-4 space-y-3">
                <Button asChild className="w-full">
                  <Link href={`/contact?leadType=${leadType}`}>
                    この記事について相談する
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/pricing">料金を見る</Link>
                </Button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
