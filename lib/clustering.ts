import type { RawSourceArticle } from "@/lib/automation"

const STOPWORDS = new Set<string>([
  "the", "a", "an", "and", "or", "but", "nor", "so", "yet", "for",
  "of", "to", "in", "on", "at", "by", "from", "with", "about", "as",
  "into", "like", "through", "after", "over", "between", "out", "against",
  "during", "without", "before", "under", "around", "among", "off",
  "is", "are", "was", "were", "be", "been", "being", "am",
  "has", "have", "had", "having", "do", "does", "did", "done",
  "will", "would", "shall", "should", "can", "could", "may", "might", "must",
  "this", "that", "these", "those", "there", "here", "their", "they", "them",
  "its", "it", "his", "her", "our", "your", "my", "we", "you", "he", "she",
  "who", "what", "when", "where", "why", "how", "which", "whose",
  "said", "says", "told", "according", "also", "more", "than", "such", "per",
  "one", "two", "three", "new", "last", "first", "next", "year", "years",
  "day", "days", "week", "month", "time", "since", "now", "already", "still",
  "all", "any", "some", "each", "every", "few", "many", "most", "other",
  "if", "because", "while", "though", "although", "unless", "until",
  "not", "no", "only", "just", "very", "too", "even", "back", "up", "down",
  "news", "report", "reports", "reuters", "pib", "google", "india", "indian",
  "business", "economy", "economic", "market", "markets", "company", "companies",
  "industry", "industries", "sector", "sectors", "growth", "global", "trade",
  "investment", "investments", "investor", "investors", "deal", "billion", "million",
  "share", "shares", "stock", "stocks", "price", "prices", "high", "low",
  "government", "policy", "minister", "ministry", "official", "officials",
  "country", "world", "international", "national", "local", "state", "states",
  "ltd", "inc", "corp", "group", "holdings", "limited",
  "rupee", "rupees",
  "は", "が", "の", "を", "に", "で", "と", "も", "から", "まで",
  "これ", "その", "あの", "この", "それ", "あれ", "ここ", "そこ", "どこ",
  "です", "ます", "した", "する", "ある", "いる", "なる", "れる", "られる",
  "こと", "もの", "ため", "よう", "という", "について", "として", "による",
  "など", "および", "または", "および", "一方", "また", "さらに",
])

const MIN_TOKEN_LENGTH = 3

export function extractKeywords(title: string, body: string, n: number): string[] {
  const weightedText = `${title} ${title} ${title} ${body ?? ""}`

  const rawTokens = weightedText
    .split(/[\s\n\r\t]+/)
    .map((token) => token.replace(/[^\p{L}\p{N}]/gu, ""))
    .filter(Boolean)

  const scores = new Map<string, number>()

  for (const raw of rawTokens) {
    if (raw.length < MIN_TOKEN_LENGTH) continue
    const lower = raw.toLowerCase()
    if (STOPWORDS.has(lower)) continue

    const isProperNoun = /^[A-Z]/.test(raw)
    const boost = isProperNoun ? 2 : 0
    scores.set(lower, (scores.get(lower) ?? 0) + 1 + boost)
  }

  return [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, n)
    .map(([token]) => token)
}

export interface ClusterOptions {
  minSharedKeywords: number
  windowHours: number
  keywordsPerArticle: number
}

class UnionFind {
  private readonly parent: number[]
  constructor(size: number) {
    this.parent = Array.from({ length: size }, (_, i) => i)
  }
  find(x: number): number {
    let root = x
    while (this.parent[root] !== root) root = this.parent[root]
    while (this.parent[x] !== root) {
      const next = this.parent[x]
      this.parent[x] = root
      x = next
    }
    return root
  }
  union(a: number, b: number) {
    const ra = this.find(a)
    const rb = this.find(b)
    if (ra !== rb) this.parent[ra] = rb
  }
}

function parsePublishedAt(value: string): number {
  const ts = Date.parse(value)
  if (!Number.isNaN(ts)) return ts
  const dateOnly = Date.parse(`${value}T00:00:00Z`)
  return Number.isNaN(dateOnly) ? 0 : dateOnly
}

export function clusterArticles(
  raws: RawSourceArticle[],
  opts: ClusterOptions,
): RawSourceArticle[][] {
  if (raws.length === 0) return []

  const { minSharedKeywords, windowHours, keywordsPerArticle } = opts
  const windowMs = windowHours * 60 * 60 * 1000

  const indexed = raws.map((article) => ({
    article,
    keywords: new Set(extractKeywords(article.title, article.bodyText ?? "", keywordsPerArticle)),
    publishedMs: parsePublishedAt(article.publishedAt),
  }))

  const uf = new UnionFind(raws.length)

  for (let i = 0; i < indexed.length; i++) {
    for (let j = i + 1; j < indexed.length; j++) {
      const timeOk = Math.abs(indexed[i].publishedMs - indexed[j].publishedMs) <= windowMs
      if (!timeOk) continue

      let shared = 0
      for (const kw of indexed[i].keywords) {
        if (indexed[j].keywords.has(kw)) {
          shared++
          if (shared >= minSharedKeywords) break
        }
      }
      if (shared >= minSharedKeywords) uf.union(i, j)
    }
  }

  const groups = new Map<number, RawSourceArticle[]>()
  for (let i = 0; i < raws.length; i++) {
    const root = uf.find(i)
    const group = groups.get(root) ?? []
    group.push(raws[i])
    groups.set(root, group)
  }

  return [...groups.values()]
}

export function debugClusterDetails(
  raws: RawSourceArticle[],
  opts: ClusterOptions,
): {
  total: number
  multi: Array<{ size: number; titles: string[]; keywords: string[] }>
  singletons: Array<{ source: string; title: string; keywords: string[] }>
} {
  const { keywordsPerArticle } = opts
  const indexed = raws.map((article) => ({
    article,
    keywords: extractKeywords(article.title, article.bodyText ?? "", keywordsPerArticle),
  }))

  const clusters = clusterArticles(raws, opts)
  const multi = clusters
    .filter((c) => c.length > 1)
    .map((c) => ({
      size: c.length,
      titles: c.map((a) => `${a.source}: ${a.title.slice(0, 100)}`),
      keywords: [
        ...new Set(
          c.flatMap((a) => indexed.find((it) => it.article === a)?.keywords ?? []),
        ),
      ].slice(0, 12),
    }))

  const singletons = clusters
    .filter((c) => c.length === 1)
    .slice(0, 40)
    .map((c) => {
      const a = c[0]
      const kws = indexed.find((it) => it.article === a)?.keywords ?? []
      return { source: a.source, title: a.title.slice(0, 100), keywords: kws.slice(0, 8) }
    })

  return { total: raws.length, multi, singletons }
}

export function readClusterOptionsFromEnv(): ClusterOptions {
  return {
    minSharedKeywords: toPositiveInt(process.env.CLUSTER_MIN_SHARED_KEYWORDS, 2),
    windowHours: toPositiveInt(process.env.CLUSTER_TIME_WINDOW_HOURS, 48),
    keywordsPerArticle: toPositiveInt(process.env.CLUSTER_KEYWORDS_PER_ARTICLE, 20),
  }
}

function toPositiveInt(value: string | undefined, fallback: number): number {
  const n = value ? Number(value) : NaN
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : fallback
}
