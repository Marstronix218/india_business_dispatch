"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Clock, ExternalLink, Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { SiteFooter } from "@/components/site-footer"
import { CATEGORY_LABELS, CATEGORY_COLORS } from "@/lib/news-data"
import { useArticles } from "@/lib/article-store"

function formatDateFull(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`
}

export function ArticleView({ id }: { id: string }) {
  const articles = useArticles()
  const article = articles.find((a) => a.id === id)

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-xl font-bold text-foreground mb-2">
            {"記事が見つかりません"}
          </h1>
          <Link href="/" className="text-sm text-accent hover:underline">
            {"トップに戻る"}
          </Link>
        </div>
      </div>
    )
  }

  const relatedArticles = articles
    .filter((a) => a.category === article.category && a.id !== article.id)
    .slice(0, 3)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Minimal header for article page */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="mx-auto max-w-3xl flex items-center justify-between px-4 py-3">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">{"トップに戻る"}</span>
          </Link>
          <Link href="/" className="text-sm font-bold text-foreground">
            India Business Dispatch
          </Link>
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            <Share2 className="size-4" />
            <span className="sr-only">{"共有"}</span>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-4 py-8">
          {/* Article header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              {article.isBreaking && (
                <Badge className="bg-accent text-accent-foreground text-[10px] uppercase tracking-wider">
                  {"速報"}
                </Badge>
              )}
              <Badge
                variant="outline"
                className={`text-[10px] ${CATEGORY_COLORS[article.category]} border-none`}
              >
                {CATEGORY_LABELS[article.category]}
              </Badge>
            </div>

            <h1 className="text-2xl font-bold text-foreground leading-snug mb-4 md:text-3xl text-balance">
              {article.title}
            </h1>

            <p className="text-base text-muted-foreground leading-relaxed mb-4">
              {article.summary}
            </p>

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {formatDateFull(article.date)}
              </span>
              {article.sourceUrl ? (
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors underline-offset-2 hover:underline"
                >
                  <ExternalLink className="size-3" />
                  {"出典: "}
                  {article.source}
                </a>
              ) : (
                <span className="flex items-center gap-1">
                  <ExternalLink className="size-3" />
                  {"出典: "}
                  {article.source}
                </span>
              )}
            </div>
          </div>

          <Separator className="mb-8" />

          {/* Hero image */}
          {article.imageUrl && (
            <div className="relative w-full aspect-[16/9] overflow-hidden rounded-lg mb-8 bg-muted">
              <Image
                src={article.imageUrl}
                alt={article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
                priority
              />
            </div>
          )}

          {/* Article body */}
          <div className="prose-custom">
            {article.body.split("\n\n").map((paragraph, i) => (
              <p
                key={i}
                className="text-sm text-foreground leading-7 mb-5 md:text-base"
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Interpretation box */}
          {article.interpretation && (
            <div className="my-8 bg-secondary rounded-lg border-l-4 border-accent p-5">
              <h3 className="text-sm font-bold text-foreground mb-2">
                {"日本企業への示唆"}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {article.interpretation}
              </p>
            </div>
          )}

          <Separator className="my-8" />

          {/* Related articles */}
          {relatedArticles.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-foreground mb-4">
                {"関連ニュース"}
              </h2>
              <div className="flex flex-col gap-3">
                {relatedArticles.map((related) => (
                  <Link
                    key={related.id}
                    href={`/article/${related.id}`}
                    className="group flex items-start gap-3 py-3 border-b border-border last:border-none"
                  >
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 mt-0.5 ${CATEGORY_COLORS[related.category]} border-none`}
                    >
                      {CATEGORY_LABELS[related.category]}
                    </Badge>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
                        {related.title}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        {formatDateFull(related.date)}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Back to top */}
          <div className="mt-10 text-center">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="size-3 mr-1" />
                {"トップページに戻る"}
              </Button>
            </Link>
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  )
}
