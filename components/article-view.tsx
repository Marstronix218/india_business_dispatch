"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, ExternalLink } from "lucide-react"
import { NewsCardTile } from "@/components/news-card"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { Badge } from "@/components/ui/badge"
import { usePublicArticles } from "@/lib/article-store"
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  INDUSTRY_LABELS,
  MARKET_METRIC_ORDER,
  formatArticleDate,
  getAllSources,
} from "@/lib/news-data"
import { formatSummaryParagraphs } from "@/lib/summary-utils"
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
  const summaryParagraphs = formatSummaryParagraphs(detailedSummary)
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)
  const allSources = getAllSources(article)

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

              <div className="space-y-3">
                <h1 className="text-balance font-serif text-4xl font-bold leading-tight tracking-tight text-foreground">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground">
                  <span>{formatArticleDate(article.publishedAt)}</span>
                </div>
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

            {article.marketSnapshot && (
              <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
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

            <section className="space-y-4 rounded-3xl border border-border bg-card p-5 sm:p-6">
              {summaryParagraphs.map((paragraph, idx) => (
                <p
                  key={idx}
                  className="whitespace-pre-line text-base leading-8 text-foreground"
                >
                  {paragraph}
                </p>
              ))}
            </section>

            <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                日本企業への示唆
              </p>
              <ul className="mt-3 space-y-2">
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

            {allSources.length > 0 && (
              <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                  参考記事
                </p>
                <ul className="mt-3 space-y-2">
                  {allSources.map((src, idx) => (
                    <li
                      key={`${idx}-${src.originalUrl}`}
                      className="text-sm leading-7 text-foreground"
                    >
                      {src.originalUrl ? (
                        <a
                          href={src.originalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-start gap-1 hover:text-accent hover:underline"
                        >
                          <span>{src.originalTitle}</span>
                          <ExternalLink className="mt-1.5 size-3 shrink-0" />
                        </a>
                      ) : (
                        <span>{src.originalTitle}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {article.industryTags.length > 0 && (
              <section className="rounded-3xl border border-border bg-card p-5 sm:p-6">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-accent">
                  業界タグ
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {article.industryTags.map((tag) => (
                    <Badge
                      key={tag}
                      asChild
                      variant="outline"
                      className="px-3 py-1"
                    >
                      <Link href={`/?tag=${tag}`}>{INDUSTRY_LABELS[tag]}</Link>
                    </Badge>
                  ))}
                </div>
              </section>
            )}

            {relatedArticles.length > 0 && (
              <section>
                <div className="mb-4 flex items-end justify-between gap-4">
                  <div className="flex items-baseline gap-3">
                    <span className="size-2.5 rounded-sm bg-accent" />
                    <h2 className="font-serif text-2xl font-bold tracking-tight">
                      関連記事
                    </h2>
                    <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground">
                      // RELATED
                    </span>
                  </div>
                </div>
                <div className="topic-rule mb-6" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {relatedArticles.map((related) => (
                    <NewsCardTile key={related.id} article={related} />
                  ))}
                </div>
              </section>
            )}
        </article>
      </main>

      <SiteFooter />
    </div>
  )
}
