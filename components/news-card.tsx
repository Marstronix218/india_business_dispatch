import Link from "next/link"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import {
  CATEGORY_LABELS,
  CATEGORY_COLORS,
  type NewsArticle,
} from "@/lib/news-data"
import { Clock, ArrowRight } from "lucide-react"

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

export function NewsCardFeatured({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/article/${article.id}`}
      className="group block bg-card rounded-lg border border-border overflow-hidden hover:shadow-md transition-shadow"
    >
      {article.imageUrl && (
        <div className="relative w-full aspect-[20/9] overflow-hidden bg-muted">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      )}
      <div className="p-3 md:p-4">
        <div className="flex items-center gap-2 mb-2">
          {article.isBreaking && (
            <Badge className="bg-accent text-accent-foreground text-[10px] uppercase tracking-wider">
              速報
            </Badge>
          )}
          <Badge
            variant="outline"
            className={`text-[10px] ${CATEGORY_COLORS[article.category]} border-none`}
          >
            {CATEGORY_LABELS[article.category]}
          </Badge>
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="size-3" />
            {formatDate(article.date)}
          </span>
        </div>
        <h2 className="text-base font-bold text-foreground leading-snug mb-1.5 group-hover:text-primary transition-colors md:text-lg text-balance">
          {article.title}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2 line-clamp-2">
          {article.summary}
        </p>
        {article.interpretation && (
          <div className="bg-secondary rounded-md px-3 py-2 border-l-2 border-accent">
            <p className="text-xs font-medium text-secondary-foreground mb-0.5">
              {"日本企業への示唆"}
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed line-clamp-1">
              {article.interpretation}
            </p>
          </div>
        )}
        <div className="mt-2 flex items-center text-xs text-muted-foreground">
          {article.sourceUrl ? (
            <button
              type="button"
              className="hover:text-foreground transition-colors underline-offset-2 hover:underline cursor-pointer"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.open(article.sourceUrl, "_blank", "noopener,noreferrer")
              }}
            >
              {"出典: "}
              {article.source}
            </button>
          ) : (
            <span>
              {"出典: "}
              {article.source}
            </span>
          )}
          <ArrowRight className="size-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
    </Link>
  )
}

export function NewsCardCompact({ article }: { article: NewsArticle }) {
  return (
    <Link
      href={`/article/${article.id}`}
      className="group flex gap-3 py-3 border-b border-border last:border-none hover:bg-secondary/30 transition-colors -mx-2 px-2 rounded"
    >
      {article.imageUrl && (
        <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded bg-muted">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="80px"
          />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <Badge
            variant="outline"
            className={`text-[10px] ${CATEGORY_COLORS[article.category]} border-none`}
          >
            {CATEGORY_LABELS[article.category]}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {formatDate(article.date)}
          </span>
        </div>
        <h3 className="text-sm font-bold text-foreground leading-snug mb-0.5 group-hover:text-primary transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-xs text-muted-foreground leading-tight line-clamp-1">
          {article.summary}
        </p>
      </div>
      <div className="flex items-center shrink-0">
        <ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  )
}
