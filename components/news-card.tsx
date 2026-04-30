import Link from "next/link"
import Image from "next/image"
import {
  CATEGORY_LABELS,
  INDUSTRY_LABELS,
  deriveImageTone,
  formatArticleDate,
  formatArticleShortDate,
  type ImagePlaceholderTone,
  type NewsArticle,
} from "@/lib/news-data"
import { resolveArticleImageUrl } from "@/lib/image-utils"

const TONE_TO_STRIPE: Record<ImagePlaceholderTone, string> = {
  warm: "ph-stripe-warm",
  cool: "ph-stripe-cool",
  green: "ph-stripe-green",
  default: "ph-stripe",
}

function PlaceholderImg({
  tone,
  label,
}: {
  tone: ImagePlaceholderTone
  label: string
}) {
  return (
    <div
      className={`absolute inset-0 ${TONE_TO_STRIPE[tone]} grid place-items-center`}
    >
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
        {label}
      </span>
    </div>
  )
}

function CardBadges({
  article,
  position = "top-left",
}: {
  article: NewsArticle
  position?: "top-left" | "top-left-tight"
}) {
  const industry = article.industryTags[0]
  const offset = position === "top-left-tight" ? "left-2 top-2" : "left-3 top-3"
  return (
    <div className={`absolute ${offset} z-10 flex flex-wrap gap-1`}>
      <span className="bg-accent px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-accent-foreground">
        {CATEGORY_LABELS[article.category]}
      </span>
      {industry && article.category !== "column" && (
        <span className="bg-primary px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-primary-foreground">
          {INDUSTRY_LABELS[industry]}
        </span>
      )}
    </div>
  )
}

export function NewsCardHero({ article }: { article: NewsArticle }) {
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)
  const tone = deriveImageTone(article)

  return (
    <Link
      href={`/article/${article.id}`}
      className="card-hover group relative block aspect-[16/10] overflow-hidden rounded-md bg-muted"
    >
      <CardBadges article={article} />
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={article.title}
          fill
          priority
          loading="eager"
          fetchPriority="high"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 66vw"
        />
      ) : (
        <PlaceholderImg tone={tone} label="hero photo · 1600×1000" />
      )}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/30 to-transparent p-6">
        <p className="font-mono text-xs text-white/70">
          {formatArticleDate(article.publishedAt)} · {article.source}
        </p>
        <h2 className="mt-2 text-balance font-serif text-2xl font-bold leading-[1.25] text-white md:text-[28px]">
          {article.title}
        </h2>
        <p className="mt-2 line-clamp-2 max-w-prose text-sm text-white/80">
          {article.summary}
        </p>
      </div>
    </Link>
  )
}

export function NewsCardMosaic({
  article,
  priority = false,
}: {
  article: NewsArticle
  stacked?: boolean
  priority?: boolean
}) {
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)
  const tone = deriveImageTone(article)

  return (
    <Link
      href={`/article/${article.id}`}
      className="card-hover group relative block h-full min-h-[8rem] overflow-hidden rounded-md bg-muted"
    >
      <CardBadges article={article} position="top-left-tight" />
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={article.title}
          fill
          priority={priority}
          loading={priority ? "eager" : undefined}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 1024px) 100vw, 33vw"
        />
      ) : (
        <PlaceholderImg tone={tone} label="photo" />
      )}
      <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/30 to-transparent p-3">
        <p className="font-mono text-[10px] text-white/70">
          {formatArticleShortDate(article.publishedAt)}
        </p>
        <h3 className="mt-1 line-clamp-3 text-sm font-semibold leading-snug text-white">
          {article.title}
        </h3>
      </div>
    </Link>
  )
}

export function NewsCardTile({ article }: { article: NewsArticle }) {
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)
  const tone = deriveImageTone(article)

  return (
    <Link href={`/article/${article.id}`} className="card-hover group block">
      <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-muted">
        <CardBadges article={article} position="top-left-tight" />
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <PlaceholderImg tone={tone} label="photo" />
        )}
      </div>
      <div className="pt-3">
        <p className="font-mono text-[10px] tracking-wider text-muted-foreground">
          {formatArticleDate(article.publishedAt)} · {article.source}
        </p>
        <h3 className="mt-1.5 line-clamp-3 font-serif text-[17px] font-bold leading-snug text-foreground transition-colors group-hover:text-accent">
          {article.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {article.summary}
        </p>
      </div>
    </Link>
  )
}

export function NewsCardFeature({ article }: { article: NewsArticle }) {
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)
  const tone = deriveImageTone(article)
  const industry = article.industryTags[0]

  return (
    <Link
      href={`/article/${article.id}`}
      className="card-hover group block h-full"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-muted">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
        ) : (
          <PlaceholderImg tone={tone} label="feature" />
        )}
        <div className="absolute left-3 top-3 flex gap-1">
          <span className="bg-accent px-1.5 py-0.5 text-[10px] font-bold text-white">
            {CATEGORY_LABELS[article.category]}
          </span>
          {industry && article.category !== "column" && (
            <span className="bg-primary px-1.5 py-0.5 text-[10px] font-bold text-white">
              {INDUSTRY_LABELS[industry]}
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-3 font-mono text-[10px] tracking-wider text-foreground/40">
          FEATURE
        </div>
      </div>
      <div className="pt-4">
        <p className="font-mono text-[10px] tracking-wider text-muted-foreground">
          {formatArticleDate(article.publishedAt)} · {article.source}
        </p>
        <h3 className="mt-2 text-balance font-serif text-2xl font-bold leading-snug transition-colors group-hover:text-accent">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {article.summary}
        </p>
      </div>
    </Link>
  )
}
