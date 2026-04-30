import Link from "next/link"
import Image from "next/image"
import {
  deriveImageTone,
  formatArticleDate,
  type NewsArticle,
} from "@/lib/news-data"
import { resolveArticleImageUrl } from "@/lib/image-utils"

const STATS: Array<{ label: string; value: string }> = [
  { label: "進出日系企業", value: "1,440社" },
  { label: "直接投資 (FY25)", value: "$58億" },
  { label: "本誌追跡 提携案件", value: "312件" },
  { label: "スタートアップ提携", value: "+24% YoY" },
]

const TONE_TO_STRIPE: Record<string, string> = {
  warm: "ph-stripe-warm",
  cool: "ph-stripe-cool",
  green: "ph-stripe-green",
  default: "ph-stripe",
}

function CollabCard({ article }: { article: NewsArticle }) {
  const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)
  const tone = deriveImageTone(article)
  return (
    <Link
      href={`/article/${article.id}`}
      className="group block"
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-sm bg-white/10">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 1024px) 100vw, 25vw"
          />
        ) : (
          <div
            className={`absolute inset-0 ${TONE_TO_STRIPE[tone]} grid place-items-center`}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
              collab photo
            </span>
          </div>
        )}
        <div className="absolute left-2 top-2 flex gap-1">
          <span className="bg-accent px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white">
            日印連携
          </span>
        </div>
      </div>
      <p className="mt-2.5 font-mono text-[10px] tracking-wider opacity-70">
        {formatArticleDate(article.publishedAt)}
      </p>
      <h3 className="mt-1 font-serif text-base font-bold leading-snug transition-colors group-hover:text-accent">
        {article.title}
      </h3>
      <p className="mt-1.5 line-clamp-2 text-xs opacity-75">{article.summary}</p>
    </Link>
  )
}

export function JapanIndiaBand({ articles }: { articles: NewsArticle[] }) {
  if (articles.length === 0) return null
  const featured = articles.slice(0, 3)
  return (
    <section className="my-12 overflow-hidden rounded-md bg-primary text-primary-foreground">
      <div className="grid gap-0 lg:grid-cols-[280px_1fr]">
        <div className="relative p-7 lg:border-r lg:border-white/15">
          <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] opacity-80">
            <span>FOCUS</span>
            <span className="h-px w-8 bg-white/40" />
            <span>VOL.04</span>
          </div>
          <h2 className="mt-3 font-serif text-3xl font-bold leading-[1.2]">
            日印
            <br />
            連携
            <br />
            <span className="text-accent">Bridge</span>
          </h2>
          <p className="mt-4 text-sm leading-relaxed opacity-85">
            日本企業の進出、共同開発、政府間プログラム、人材交流を編集部が継続追跡。
          </p>
          <div className="mt-5 flex items-center gap-3 font-mono text-[11px] opacity-80">
            <span className="border border-white/30 px-2 py-1">🇯🇵 日本</span>
            <span>×</span>
            <span className="border border-white/30 px-2 py-1">🇮🇳 India</span>
          </div>
          <Link
            href="/?filter=collab"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline"
          >
            連携記事をすべて見る →
          </Link>
        </div>
        <div className="grid gap-5 p-7 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((article) => (
            <CollabCard key={article.id} article={article} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 border-t border-white/15 px-7 py-3 font-mono text-[11px] sm:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label}>
            <span className="opacity-60">{stat.label}</span>
            <span className="ml-1 font-bold">{stat.value}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
