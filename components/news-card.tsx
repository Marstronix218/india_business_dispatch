import Link from "next/link"
import Image from "next/image"
import {
  formatArticleShortDate,
  type NewsArticle,
} from "@/lib/news-data"
import { resolveArticleImageUrl } from "@/lib/image-utils"

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

export function NewsCardMosaic({ article }: { article: NewsArticle }) {
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)

  return (
    <Link
      href={`/article/${article.id}`}
      className="group relative block aspect-[4/3] overflow-hidden rounded-2xl bg-muted shadow-sm transition-shadow hover:shadow-lg"
    >
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
            titleClassName="line-clamp-2 text-base md:text-lg"
          />
        </>
      ) : (
        <CardFallback
          article={article}
          titleClassName="line-clamp-2 text-base md:text-lg"
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
            titleClassName="line-clamp-2 text-sm md:text-base"
          />
        </>
      ) : (
        <CardFallback
          article={article}
          titleClassName="line-clamp-2 text-sm md:text-base"
        />
      )}
    </Link>
  )
}
