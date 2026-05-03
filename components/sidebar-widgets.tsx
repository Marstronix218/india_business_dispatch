"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import {
  formatArticleShortDate,
  type ImagePlaceholderTone,
  type NewsArticle,
} from "@/lib/news-data"
import type { MarketSnapshotLive } from "@/lib/market-data"
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

type IndicatorRow = {
  label: string
  sub: string
  value: string
  change: string
  up: boolean
}

function rowsFromLive(snapshot: MarketSnapshotLive): IndicatorRow[] {
  // pick top 4: INR/JPY, USD/INR, Nifty, Brent
  const wanted = ["INR/JPY", "USD/INR", "Nifty 50", "Brent"]
  const map = new Map(snapshot.items.map((q) => [q.label, q]))
  return wanted
    .map((w) => map.get(w))
    .filter((q): q is NonNullable<typeof q> => Boolean(q))
    .map((q) => ({
      label: q.label,
      sub: q.sub,
      value: q.value,
      change: q.change,
      up: q.direction === "up",
    }))
}

function formatLiveAsOf(ts: number): string {
  const d = new Date(ts * 1000)
  return d.toLocaleString("ja-JP", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  })
}

export function MarketIndicatorWidget() {
  const articles = usePublicArticles()
  const fallbackArticle = articles.find((a) => a.marketSnapshot)
  const [snapshot, setSnapshot] = useState<MarketSnapshotLive | null>(null)
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const res = await fetch("/api/market/snapshot", { cache: "no-store" })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as MarketSnapshotLive
        if (!cancelled) {
          setSnapshot(data)
          setErrored(false)
        }
      } catch {
        if (!cancelled) setErrored(true)
      }
    }
    load()
    const id = setInterval(load, 5 * 60 * 1000)
    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [])

  let rows: IndicatorRow[] = []
  let asOfLabel = ""
  let href: string | null = null

  if (snapshot) {
    rows = rowsFromLive(snapshot)
    asOfLabel = `ライブ · ${formatLiveAsOf(snapshot.asOf)}`
  } else if (fallbackArticle?.marketSnapshot) {
    const m = fallbackArticle.marketSnapshot
    rows = [
      { ...m.fx, sub: "₹/¥", up: m.fx.change.startsWith("+") },
      { ...m.equities, sub: "指数", up: m.equities.change.startsWith("+") },
      { ...m.rates, sub: "利回り%", up: m.rates.change.startsWith("+") },
      { ...m.oil, sub: "USD/bbl", up: m.oil.change.startsWith("+") },
    ]
    asOfLabel = `スナップショット · ${m.fx.asOf}`
    href = `/article/${fallbackArticle.id}`
  } else if (errored) {
    return null
  } else {
    // initial loading: render empty card with placeholder
    rows = [
      { label: "INR/JPY", sub: "₹/¥", value: "—", change: "—", up: false },
      { label: "USD/INR", sub: "$/₹", value: "—", change: "—", up: false },
      { label: "Nifty 50", sub: "指数", value: "—", change: "—", up: false },
      { label: "Brent", sub: "USD/bbl", value: "—", change: "—", up: false },
    ]
    asOfLabel = "ロード中…"
  }

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    href ? (
      <Link
        href={href}
        className="block rounded-md border border-border bg-card p-5 transition-shadow hover:shadow-md"
      >
        {children}
      </Link>
    ) : (
      <div className="block rounded-md border border-border bg-card p-5">
        {children}
      </div>
    )

  return (
    <Wrapper>
      <RailHead
        label={snapshot ? "マーケット指標(ライブ)" : "マーケット指標"}
        en="MARKET"
        icon="📊"
      />
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
        {asOfLabel}
      </p>
    </Wrapper>
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
  imageUrl?: string
  imageCredit?: string
}

const CITIES: City[] = [
  {
    name: "Mumbai",
    jp: "ムンバイ",
    tag: "金融・港湾",
    pop: "2,041万",
    gdp: "$3,100億",
    note: "西部回廊の物流ハブ。港湾混雑が緩和傾向で完成車・部品の輸送リードタイムが安定化。",
    tone: "warm",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/2/2b/Mumbai_Bandra-Worli_Sea_Link.jpg",
    imageCredit: "Bandra-Worli Sea Link · Wikimedia",
  },
  {
    name: "Delhi NCR",
    jp: "デリー首都圏",
    tag: "二輪・電装・行政",
    pop: "3,200万",
    gdp: "$3,700億",
    note: "Honda・Yamaha・Maruti Suzuki の量産拠点が集中。中央官庁との折衝・規制対応の起点。",
    tone: "cool",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/4/40/Jama_Masjid_2011.jpg",
    imageCredit: "Jama Masjid · Wikimedia",
  },
  {
    name: "Gurgaon",
    jp: "グルガオン",
    tag: "IT・GCC・R&D",
    pop: "150万",
    gdp: "$420億",
    note: "NCR の高層オフィス集積地。日系を含む GCC や外資系本社機能の受け皿として存在感が強い。",
    tone: "cool",
    imageUrl:
      "https://commons.wikimedia.org/wiki/Special:FilePath/DLF%20Cyber%20Hub,%20Gurgaon%202.jpg",
    imageCredit: "DLF Cyber Hub, Gurgaon · Wikimedia",
  },
  {
    name: "Bengaluru",
    jp: "ベンガルール",
    tag: "IT・GCC・R&D",
    pop: "1,330万",
    gdp: "$1,100億",
    note: "日系GCC(グローバル・キャパビリティ・センター)設置の最有力候補。女性エンジニア比率が上昇傾向。",
    tone: "green",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/c/cd/View_from_Visvesvaraya_Industrial_and_Technological_Museum_%282025%29_02.jpg",
    imageCredit: "Bengaluru skyline · Wikimedia",
  },
  {
    name: "Chennai",
    jp: "チェンナイ",
    tag: "自動車・部品",
    pop: "1,170万",
    gdp: "$840億",
    note: "日系自動車・部品の集積地。タミル・ナードゥ州が人材定着・電動化補助の制度運用で先行。",
    tone: "cool",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/3/32/Chennai_Central.jpg",
    imageCredit: "Chennai Central · Wikimedia",
  },
  {
    name: "Pune",
    jp: "プネ",
    tag: "製造・自動車",
    pop: "720万",
    gdp: "$690億",
    note: "Bajaj・Volkswagen・Tata Motors の重工業ベルト。日系工作機械・部品メーカーの集積も進む。",
    tone: "warm",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Pune_West_skyline_-_March_2017.jpg/1280px-Pune_West_skyline_-_March_2017.jpg",
    imageCredit: "Pune West skyline · Wikimedia",
  },
  {
    name: "Hyderabad",
    jp: "ハイデラバード",
    tag: "IT・製薬・半導体",
    pop: "1,100万",
    gdp: "$750億",
    note: "テランガナ州主導でファブ誘致と製薬クラスターを拡大。日系製薬・素材の現地化検討が増加。",
    tone: "green",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/8/88/Downtown_hyderabad_drone.png",
    imageCredit: "Hyderabad downtown · Wikimedia",
  },
  {
    name: "Ahmedabad",
    jp: "アフマダーバード",
    tag: "半導体・化学",
    pop: "850万",
    gdp: "$680億",
    note: "グジャラート州の半導体クラスター形成が加速。GIFT City で金融・データセンター特区も拡張中。",
    tone: "warm",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Sabarmati_riverside.jpg/1280px-Sabarmati_riverside.jpg",
    imageCredit: "Sabarmati Riverside · Wikimedia",
  },
  {
    name: "Kolkata",
    jp: "コルカタ",
    tag: "東部物流・素材",
    pop: "1,500万",
    gdp: "$1,500億",
    note: "東インド・ASEAN接続の起点。鉄鋼・化学の集積地で、北東州への物流ハブとしての存在感が再評価。",
    tone: "cool",
    imageUrl:
      "https://upload.wikimedia.org/wikipedia/commons/d/d7/Kolkata_maidan.jpg",
    imageCredit: "Kolkata Maidan · Wikimedia",
  },
]

export function CitySpotlightWidget() {
  const [index, setIndex] = useState(0)
  const city = CITIES[index]
  const canGoBack = index > 0
  const canGoForward = index < CITIES.length - 1

  return (
    <div className="rounded-md border border-border bg-card p-5">
      <RailHead label="都市スポットライト" en="CITY FOCUS" icon="📍" />
      <div className="relative mb-3 aspect-[16/10] overflow-hidden rounded-sm bg-muted">
        {city.imageUrl ? (
          <Image
            src={city.imageUrl}
            alt={`${city.name} cityscape`}
            fill
            className="object-cover"
            sizes="320px"
          />
        ) : (
          <div
            className={`absolute inset-0 ${TONE_TO_STRIPE[city.tone]} grid place-items-center`}
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-foreground/40">
              {city.name.toLowerCase()} skyline
            </span>
          </div>
        )}
        <div className="absolute bottom-2 left-2">
          <span className="bg-foreground px-2 py-0.5 font-mono text-[10px] tracking-wider text-background">
            {city.tag}
          </span>
        </div>
        {city.imageCredit && (
          <div className="absolute right-1.5 top-1.5">
            <span className="bg-black/40 px-1.5 py-0.5 font-mono text-[8px] tracking-wider text-white/80">
              {city.imageCredit}
            </span>
          </div>
        )}
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
      <div className="mt-3 flex items-center justify-end gap-1.5">
        <button
          type="button"
          onClick={() => setIndex((current) => Math.max(0, current - 1))}
          disabled={!canGoBack}
          aria-label="前の都市"
          className="grid size-7 place-items-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronLeft className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => setIndex((current) => Math.min(CITIES.length - 1, current + 1))}
          disabled={!canGoForward}
          aria-label="次の都市"
          className="grid size-7 place-items-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight className="size-3.5" />
        </button>
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
