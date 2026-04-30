"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import {
  formatArticleShortDate,
  type ImagePlaceholderTone,
  type NewsArticle,
} from "@/lib/news-data"
import { usePublicArticles } from "@/lib/article-store"
import { resolveArticleImageUrl } from "@/lib/image-utils"

const TONE_TO_STRIPE: Record<ImagePlaceholderTone, string> = {
  warm: "ph-stripe-warm",
  cool: "ph-stripe-cool",
  green: "ph-stripe-green",
  default: "ph-stripe",
}

function RailHead({
  label,
  en,
  icon,
}: {
  label: string
  en: string
  icon: React.ReactNode
}) {
  return (
    <div className="mb-3 flex items-center justify-between border-b-2 border-foreground pb-2">
      <div className="flex items-center gap-2">
        <span className="text-accent">{icon}</span>
        <h3 className="font-serif text-base font-bold">{label}</h3>
      </div>
      <span className="font-mono text-[9px] tracking-[0.2em] text-muted-foreground">
        {en}
      </span>
    </div>
  )
}

export function TrendingWidget() {
  const allArticles = usePublicArticles()
  const trending = allArticles.filter((a) => a.category !== "column").slice(0, 5)

  if (trending.length === 0) return null

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <RailHead label="アクセスランキング" en="TRENDING" icon="📈" />
      <ul className="space-y-3">
        {trending.map((article, index) => (
          <li key={article.id} className="flex gap-3">
            <span
              className={
                "w-7 shrink-0 font-serif text-2xl font-black leading-none " +
                (index < 3 ? "text-accent" : "text-border")
              }
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="min-w-0">
              <Link
                href={`/article/${article.id}`}
                className="line-clamp-2 text-xs font-semibold leading-snug hover:text-accent"
              >
                {article.title}
              </Link>
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                {formatArticleShortDate(article.publishedAt)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function MarketIndicatorWidget() {
  const articles = usePublicArticles()
  const latest = articles.find((a) => a.marketSnapshot)
  if (!latest?.marketSnapshot) return null
  const m = latest.marketSnapshot
  const rows: Array<{
    label: string
    sub: string
    value: string
    change: string
    up: boolean
  }> = [
    { ...m.fx, sub: "₹/¥", up: m.fx.change.startsWith("+") },
    { ...m.equities, sub: "指数", up: m.equities.change.startsWith("+") },
    { ...m.rates, sub: "利回り%", up: m.rates.change.startsWith("+") },
    { ...m.oil, sub: "USD/bbl", up: m.oil.change.startsWith("+") },
  ]

  return (
    <Link
      href={`/article/${latest.id}`}
      className="block rounded-md border border-border bg-card p-5 transition-shadow hover:shadow-md"
    >
      <RailHead label="マーケット指標" en="MARKET" icon="📊" />
      <ul className="divide-y divide-border">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex items-baseline justify-between py-2.5"
          >
            <div>
              <div className="text-xs font-semibold">{row.label}</div>
              <div className="font-mono text-[10px] text-muted-foreground">
                {row.sub}
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-base font-bold tabular-nums">
                {row.value}
              </div>
              <div
                className={
                  "font-mono text-[11px] " +
                  (row.up ? "text-emerald-700" : "text-accent")
                }
              >
                {row.up ? "▲" : "▼"} {row.change}
              </div>
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 font-mono text-[9px] tracking-wider text-muted-foreground">
        {m.fx.asOf}
      </p>
    </Link>
  )
}

type City = {
  name: string
  jp: string
  tag: string
  pop: string
  gdp: string
  note: string
  tone: ImagePlaceholderTone
}

const CITIES: City[] = [
  {
    name: "Mumbai",
    jp: "ムンバイ",
    tag: "金融・港湾",
    pop: "2,041万",
    gdp: "$3,100億",
    note: "西部回廊の物流ハブ。港湾混雑が緩和傾向。",
    tone: "warm",
  },
  {
    name: "Bengaluru",
    jp: "ベンガルール",
    tag: "IT・スタートアップ",
    pop: "1,330万",
    gdp: "$1,100億",
    note: "GCC設置と研究開発拠点が集積。女性エンジニア比率が上昇。",
    tone: "green",
  },
  {
    name: "Chennai",
    jp: "チェンナイ",
    tag: "自動車・製造",
    pop: "1,170万",
    gdp: "$840億",
    note: "日系自動車・部品の集積地。タミル・ナードゥ州の人材定着策が進む。",
    tone: "cool",
  },
  {
    name: "Ahmedabad",
    jp: "アフマダーバード",
    tag: "半導体・化学",
    pop: "850万",
    gdp: "$680億",
    note: "グジャラート州の半導体クラスター形成が加速。",
    tone: "warm",
  },
]

export function CitySpotlightWidget() {
  const [index, setIndex] = useState(0)
  const city = CITIES[index]

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <RailHead label="都市スポットライト" en="CITY FOCUS" icon="📍" />
      <div className="relative mb-3 aspect-[16/10] overflow-hidden rounded-sm bg-muted">
        <div
          className={`absolute inset-0 ${TONE_TO_STRIPE[city.tone]} grid place-items-center`}
        >
          <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
            {city.name.toLowerCase()} skyline
          </span>
        </div>
        <div className="absolute bottom-2 left-2">
          <span className="bg-foreground px-2 py-0.5 font-mono text-[10px] tracking-wider text-background">
            {city.tag}
          </span>
        </div>
      </div>
      <div className="flex items-baseline justify-between">
        <h4 className="font-serif text-xl font-bold">{city.jp}</h4>
        <span className="font-mono text-[10px] text-muted-foreground">
          {city.name}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 font-mono text-[11px]">
        <div className="rounded bg-muted p-2">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
            人口
          </div>
          <div className="font-bold">{city.pop}</div>
        </div>
        <div className="rounded bg-muted p-2">
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
            GDP
          </div>
          <div className="font-bold">{city.gdp}</div>
        </div>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        {city.note}
      </p>
      <div className="mt-3 flex items-center gap-1.5">
        {CITIES.map((_, i) => (
          <button
            type="button"
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`city ${i + 1}`}
            className={
              "h-1.5 rounded-full transition-all " +
              (i === index ? "w-6 bg-accent" : "w-1.5 bg-border")
            }
          />
        ))}
      </div>
    </div>
  )
}

export function PitchWidget() {
  return (
    <div className="relative overflow-hidden rounded-md bg-foreground p-5 text-background">
      <span className="pointer-events-none absolute -right-4 -top-4 select-none font-serif text-[100px] font-black leading-none opacity-10">
        IBD
      </span>
      <div className="mb-2 font-mono text-[10px] tracking-[0.22em] opacity-70">
        SPONSORED · 我が社
      </div>
      <h3 className="font-serif text-lg font-bold leading-tight">
        進出 0→1 を、
        <br />
        編集部の知見で。
      </h3>
      <p className="mt-3 text-xs leading-relaxed opacity-80">
        市場調査、現地パートナー紹介、規制適合まで。週次レポート＋専任アナリスト。
      </p>
      <div className="relative mt-4 grid aspect-video place-items-center rounded-sm bg-white/10">
        <span className="grid size-12 place-items-center rounded-full bg-accent">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <span className="absolute bottom-2 left-2 font-mono text-[9px] opacity-60">
          PITCH · 1:24
        </span>
      </div>
      <Link
        href="/contact?leadType=expansion"
        className="mt-4 inline-flex w-full items-center justify-center rounded-sm bg-accent py-2 text-xs font-bold text-white hover:opacity-90"
      >
        無料相談を予約 →
      </Link>
    </div>
  )
}

type SocialPost = {
  handle: string
  time: string
  body: string
  reposts: number
  likes: number
}

const SOCIAL_POSTS: SocialPost[] = [
  {
    handle: "@ibd_editor",
    time: "2時間前",
    body: "半導体パッケージ支援第2弾、後工程と封止材が焦点。日系の装置・治具メーカーは早期に州別の補助条件比較を。",
    reposts: 28,
    likes: 142,
  },
  {
    handle: "@logi_chen",
    time: "6時間前",
    body: "ナバシェバ港の通関リードタイム、3月比で約20%短縮を確認。在庫水準の見直しタイミング。",
    reposts: 14,
    likes: 89,
  },
  {
    handle: "@meti_ind",
    time: "昨日",
    body: "日印スタートアップ・ブリッジ第3期、10社採択。クリーンテックとAgriTech中心。詳細は次号で。",
    reposts: 41,
    likes: 203,
  },
]

export function SocialWidget() {
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <RailHead label="編集部ソーシャル" en="X / FEED" icon="𝕏" />
      <ul className="space-y-4">
        {SOCIAL_POSTS.map((post) => (
          <li key={post.handle} className="text-xs">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-mono font-semibold text-foreground">
                {post.handle}
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">
                {post.time}
              </span>
            </div>
            <p className="leading-relaxed text-foreground/85">{post.body}</p>
            <div className="mt-1.5 flex gap-4 font-mono text-[10px] text-muted-foreground">
              <span>↻ {post.reposts}</span>
              <span>♥ {post.likes}</span>
            </div>
          </li>
        ))}
      </ul>
      <span className="mt-3 block text-center font-mono text-[10px] tracking-wider text-muted-foreground">
        @ibd_editor をフォロー →
      </span>
    </div>
  )
}

export function NewsletterCTA() {
  return (
    <div className="rounded-md bg-accent p-5 text-white">
      <div className="mb-2 font-mono text-[10px] tracking-[0.22em] opacity-80">
        DAILY · 6:30 JST
      </div>
      <h3 className="font-serif text-lg font-bold leading-tight">
        朝6:30、5分で読むインド経済。
      </h3>
      <p className="mt-2 text-xs opacity-90">
        編集部が当日の重要記事を3本に絞って解説。
      </p>
      <form
        className="mt-3 flex"
        onSubmit={(event) => event.preventDefault()}
      >
        <input
          type="email"
          name="email"
          required
          placeholder="email@company.co.jp"
          className="flex-1 rounded-l-sm bg-white/95 px-3 py-2 text-xs text-foreground outline-none placeholder:text-muted-foreground"
        />
        <button
          type="submit"
          className="rounded-r-sm bg-foreground px-3 text-xs font-bold text-background"
        >
          登録
        </button>
      </form>
    </div>
  )
}

export function CollabHighlightWidget({
  articles,
}: {
  articles: NewsArticle[]
}) {
  if (articles.length === 0) return null
  return (
    <div className="rounded-md border border-border bg-card p-5">
      <RailHead label="日印連携ハイライト" en="JAPAN × INDIA" icon="🤝" />
      <ul className="space-y-4">
        {articles.slice(0, 3).map((article) => {
          const imageSrc = resolveArticleImageUrl(article.imageUrl, article.id)
          return (
            <li key={article.id}>
              <Link
                href={`/article/${article.id}`}
                className="group flex gap-3"
              >
                <div className="relative size-16 shrink-0 overflow-hidden rounded bg-muted">
                  {imageSrc ? (
                    <Image
                      src={imageSrc}
                      alt={article.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="absolute inset-0 ph-stripe-green" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="line-clamp-3 text-xs font-semibold leading-snug group-hover:text-accent">
                    {article.title}
                  </p>
                  <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                    {formatArticleShortDate(article.publishedAt)}
                  </p>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
