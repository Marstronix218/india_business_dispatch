import Link from "next/link"
import Image from "next/image"
import { Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  CONTENT_TYPE_LABELS,
  MARKET_METRIC_ORDER,
  VISIBILITY_LABELS,
  formatArticleShortDate,
  type MarketSnapshot,
  type NewsArticle,
} from "@/lib/news-data"
import { resolveArticleImageUrl } from "@/lib/image-utils"
import { resolveSourceArticleUrl } from "@/lib/source-url-utils"

function ArticleMeta({ article }: { article: NewsArticle }) {
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
      <Badge className={`${CATEGORY_COLORS[article.category]} border-none px-3 py-1`}>
        {CATEGORY_LABELS[article.category]}
      </Badge>
      <span className="flex items-center gap-1">
        <Clock className="size-3" />
        {formatArticleShortDate(article.publishedAt)}
      </span>
      <Badge variant="outline" className="px-2 py-0.5">
        {CONTENT_TYPE_LABELS[article.contentType]}
      </Badge>
      <Badge variant="outline" className="px-2 py-0.5">
        {VISIBILITY_LABELS[article.visibility]}
      </Badge>
    </div>
  )
}

function MarketSnapshotRow({ snapshot }: { snapshot: MarketSnapshot }) {
  return (
    <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground md:grid-cols-4">
      {MARKET_METRIC_ORDER.map((key) => {
        const metric = snapshot[key]
        return (
          <div
            key={key}
            className="rounded-md border border-border/80 bg-secondary/40 px-2 py-1.5"
          >
            <p className="font-medium text-foreground">{metric.label}</p>
            <p className="mt-0.5">
              {metric.value}
              {metric.unit ? ` ${metric.unit}` : ""}
            </p>
            <p className={metric.change.startsWith("-") ? "text-rose-600" : "text-emerald-700"}>
              {metric.change}
            </p>
          </div>
        )
      })}
    </div>
  )
}

function ArticleContent({
  article,
  titleClassName,
  summaryClassName,
  showMarketSnapshot = true,
}: {
  article: NewsArticle
  titleClassName: string
  summaryClassName: string
  showMarketSnapshot?: boolean
}) {
  const sourceArticleUrl = resolveSourceArticleUrl(article.sourceUrl, article.title)

  return (
    <div className="min-w-0 space-y-1.5">
      <ArticleMeta article={article} />
      <div className="space-y-1">
        <h2 className={titleClassName}>{article.title}</h2>
        <p className={summaryClassName}>{article.summary}</p>
      </div>
      {showMarketSnapshot && article.marketSnapshot && (
        <MarketSnapshotRow snapshot={article.marketSnapshot} />
      )}
      {sourceArticleUrl ? (
        <a
          href={sourceArticleUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(event) => event.stopPropagation()}
          className="w-fit text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          出典: {article.source}
        </a>
      ) : (
        <p className="text-xs text-muted-foreground">出典: {article.source}</p>
      )}
    </div>
  )
}

export function NewsCardFeatured({ article }: { article: NewsArticle }) {
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)

  return (
    <Link
      href={`/article/${article.id}`}
      className="group flex overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-shadow hover:shadow-lg"
    >
      {imageSrc && (
        <div className="relative hidden min-h-[170px] w-52 shrink-0 overflow-hidden bg-muted sm:block">
          <Image
            src={imageSrc}
            alt={article.title}
            fill
            priority
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="208px"
          />
        </div>
      )}
      <div className="flex-1 p-3 md:p-4">
        <ArticleContent
          article={article}
          titleClassName="line-clamp-2 text-lg font-semibold leading-tight text-foreground transition-colors group-hover:text-primary md:text-xl"
          summaryClassName="line-clamp-2 text-sm leading-6 text-muted-foreground"
          showMarketSnapshot={false}
        />
      </div>
    </Link>
  )
}

export function NewsCardGridItem({ article }: { article: NewsArticle }) {
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)

  return (
    <Link
      href={`/article/${article.id}`}
      className="group flex overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
    >
      {imageSrc && (
        <div className="relative min-h-[106px] w-28 shrink-0 overflow-hidden bg-muted">
          <Image
            src={imageSrc}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="112px"
          />
        </div>
      )}
      <div className="flex-1 p-2.5">
        <ArticleContent
          article={article}
          titleClassName="line-clamp-2 text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary"
          summaryClassName="line-clamp-1 text-xs leading-5 text-muted-foreground"
          showMarketSnapshot={false}
        />
      </div>
    </Link>
  )
}

export function NewsCardCompact({ article }: { article: NewsArticle }) {
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)

  return (
    <Link
      href={`/article/${article.id}`}
      className="group flex gap-4 rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      {imageSrc && (
        <div className="relative hidden h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:block">
          <Image
            src={imageSrc}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="96px"
          />
        </div>
      )}
      <div className="min-w-0 space-y-2">
        <ArticleMeta article={article} />
        <h3 className="line-clamp-2 text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
          {article.title}
        </h3>
        <p className="line-clamp-3 text-sm leading-7 text-muted-foreground">
          {article.summary}
        </p>
      </div>
    </Link>
  )
}
