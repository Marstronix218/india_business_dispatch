import Link from "next/link"
import Image from "next/image"
import {
  CATEGORY_LABELS,
  INDUSTRY_LABELS,
  formatArticleShortDate,
  type NewsArticle,
} from "@/lib/news-data"
import { resolveArticleImageUrl } from "@/lib/image-utils"

function CardBadges({ article }: { article: NewsArticle }) {
  const industry = article.industryTags[0]
  return (
    <div className="absolute left-3 top-3 z-10 flex flex-wrap gap-1">
      <span className="rounded bg-orange-500 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white">
        {CATEGORY_LABELS[article.category]}
      </span>
      {industry && article.category !== "column" && (
        <span className="rounded bg-orange-500 px-1.5 py-0.5 text-[10px] font-semibold tracking-wide text-white">
          {INDUSTRY_LABELS[industry]}
        </span>
      )}
    </div>
  )
}

function CardOverlay({
  article,
  titleClassName,
  dateClassName = "text-xs",
}: {
  article: NewsArticle
  titleClassName: string
  dateClassName?: string
}) {
  return (
    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4">
      <p className={`${dateClassName} text-white/70`}>
        {formatArticleShortDate(article.publishedAt)}
      </p>
      <h2 className={`${titleClassName} mt-1 font-semibold leading-tight text-white`}>
        {article.title}
      </h2>
    </div>
  )
}

function CardFallback({
  article,
  titleClassName,
  dateClassName = "text-xs",
}: {
  article: NewsArticle
  titleClassName: string
  dateClassName?: string
}) {
  return (
    <div className="flex h-full flex-col justify-end bg-secondary/60 p-4">
      <p className={`${dateClassName} text-muted-foreground`}>
        {formatArticleShortDate(article.publishedAt)}
      </p>
      <h2 className={`${titleClassName} mt-1 font-semibold leading-tight text-foreground`}>
        {article.title}
      </h2>
    </div>
  )
}

export function NewsCardHero({ article }: { article: NewsArticle }) {
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)

  return (
    <Link
      href={`/article/${article.id}`}
      className="group relative block aspect-[16/10] overflow-hidden rounded-2xl bg-muted shadow-sm transition-shadow hover:shadow-lg"
    >
      <CardBadges article={article} />
      {imageSrc ? (
        <>
          <Image
            src={imageSrc}
            alt={article.title}
            fill
            priority
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 66vw"
          />
          <CardOverlay
            article={article}
            titleClassName="line-clamp-3 text-2xl md:text-3xl"
            dateClassName="text-sm"
          />
        </>
      ) : (
        <CardFallback
          article={article}
          titleClassName="line-clamp-3 text-2xl md:text-3xl"
          dateClassName="text-sm"
        />
      )}
    </Link>
  )
}

export function NewsCardMosaic({
  article,
  stacked = false,
}: {
  article: NewsArticle
  stacked?: boolean
}) {
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)
  const shape = stacked ? "h-full min-h-[6rem]" : "aspect-[4/3]"

  return (
    <Link
      href={`/article/${article.id}`}
      className={`group relative block ${shape} overflow-hidden rounded-2xl bg-muted shadow-sm transition-shadow hover:shadow-lg`}
    >
      <CardBadges article={article} />
      {imageSrc ? (
        <>
          <Image
            src={imageSrc}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 33vw"
          />
          <CardOverlay
            article={article}
            titleClassName="line-clamp-3 text-base md:text-lg"
          />
        </>
      ) : (
        <CardFallback
          article={article}
          titleClassName="line-clamp-3 text-base md:text-lg"
        />
      )}
    </Link>
  )
}

export function NewsCardTile({ article }: { article: NewsArticle }) {
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)

  return (
    <Link
      href={`/article/${article.id}`}
      className="group relative block aspect-[16/10] overflow-hidden rounded-xl bg-muted shadow-sm transition-shadow hover:shadow-md"
    >
      <CardBadges article={article} />
      {imageSrc ? (
        <>
          <Image
            src={imageSrc}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <CardOverlay
            article={article}
            titleClassName="line-clamp-3 text-sm md:text-base"
          />
        </>
      ) : (
        <CardFallback
          article={article}
          titleClassName="line-clamp-3 text-sm md:text-base"
        />
      )}
    </Link>
  )
}
