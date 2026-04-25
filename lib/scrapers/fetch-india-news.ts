import { XMLParser } from "fast-xml-parser"
import type { RawSourceArticle } from "@/lib/automation"
import { isLikelyArticleUrl } from "@/lib/source-url-utils"

const USER_AGENT =
  "Mozilla/5.0 (compatible; IndiaBusinessDispatch/1.0; +https://example.com/bot)"

interface Connector {
  connectorId: string
  source: string
  url: string
  /**
   * true の場合、フィード全体がインド関連と仮定して取得（フィルタ無し）。
   * false の場合、各記事の title/body に "India|Indian|インド|印度|RBI|Modi" 等が
   * 含まれるかチェックし、含まれないものは除外する。
   */
  alreadyIndiaFocused: boolean
}

const INDIA_KEYWORD_PATTERN = /(india|indian|delhi|mumbai|bengaluru|bangalore|chennai|kolkata|hyderabad|pune|ahmedabad|modi|rbi|sensex|nifty|rupee|インド|印度|モディ|ニューデリー|ムンバイ|भारत|भारतीय|दिल्ली|मुंबई|मोदी|आरबीआई)/i

function isIndiaRelevant(title: string, body: string): boolean {
  return INDIA_KEYWORD_PATTERN.test(`${title} ${body}`)
}

const CONNECTORS: Connector[] = [
  {
    connectorId: "times-of-india-business",
    source: "Times of India Business",
    url: "https://timesofindia.indiatimes.com/rssfeeds/1898055.cms",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "hindustan-times-business",
    source: "Hindustan Times Business",
    url: "https://www.hindustantimes.com/feeds/rss/business/rssfeed.xml",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "mint-companies",
    source: "Mint Companies",
    url: "https://www.livemint.com/rss/companies",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "economic-times-top",
    source: "Economic Times",
    url: "https://economictimes.indiatimes.com/rssfeedstopstories.cms",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "the-hindu-business",
    source: "The Hindu Business",
    url: "https://www.thehindu.com/business/feeder/default.rss",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "indian-express-business",
    source: "Indian Express Business",
    url: "https://indianexpress.com/section/business/feed/",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "google-news-rbi",
    source: "Google News RSS (RBI)",
    url:
      "https://news.google.com/rss/search?q=RBI+india+monetary+policy&hl=en-IN&gl=IN&ceid=IN:en",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "google-news-modi-economy",
    source: "Google News RSS (Modi Economy)",
    url:
      "https://news.google.com/rss/search?q=Modi+india+economy+budget&hl=en-IN&gl=IN&ceid=IN:en",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "google-news-india-gdp",
    source: "Google News RSS (India GDP)",
    url:
      "https://news.google.com/rss/search?q=india+GDP+growth+inflation&hl=en-IN&gl=IN&ceid=IN:en",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "google-news-india-manufacturing",
    source: "Google News RSS (India Manufacturing)",
    url:
      "https://news.google.com/rss/search?q=india+manufacturing+PLI+scheme&hl=en-IN&gl=IN&ceid=IN:en",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "google-news-india-tech",
    source: "Google News RSS (India Tech)",
    url:
      "https://news.google.com/rss/search?q=india+startup+IPO+investment&hl=en-IN&gl=IN&ceid=IN:en",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "google-news-india-trade",
    source: "Google News RSS (India Trade)",
    url:
      "https://news.google.com/rss/search?q=india+trade+export+import+tariff&hl=en-IN&gl=IN&ceid=IN:en",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "bbc-asia",
    source: "BBC News (Asia)",
    url: "https://feeds.bbci.co.uk/news/world/asia/rss.xml",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "bbc-business",
    source: "BBC News (Business)",
    url: "https://feeds.bbci.co.uk/news/business/rss.xml",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "cnn-world",
    source: "CNN World",
    url: "http://rss.cnn.com/rss/edition_world.rss",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "cnn-business",
    source: "CNN Business",
    url: "http://rss.cnn.com/rss/money_news_international.rss",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "aljazeera",
    source: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "bloomberg-markets",
    source: "Bloomberg Markets",
    url: "https://feeds.bloomberg.com/markets/news.rss",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "ft-companies",
    source: "Financial Times (Companies)",
    url: "https://www.ft.com/companies?format=rss",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "wsj-world",
    source: "Wall Street Journal (World)",
    url: "https://feeds.a.dj.com/rss/RSSWorldNews.xml",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "nikkei-asia",
    source: "Nikkei Asia",
    url: "https://asia.nikkei.com/rss/feed/nar",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "nhk-business",
    source: "NHK ビジネス",
    url: "https://www3.nhk.or.jp/rss/news/cat5.xml",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "nhk-top",
    source: "NHK 主要ニュース",
    url: "https://www3.nhk.or.jp/rss/news/cat0.xml",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "asahi-top",
    source: "朝日新聞",
    url: "https://www.asahi.com/rss/asahi/newsheadlines.rdf",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "mainichi-flash",
    source: "毎日新聞",
    url: "https://mainichi.jp/rss/etc/mainichi-flash.rss",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "google-news-jp-india-business",
    source: "Google News (JP, インドビジネス)",
    url:
      "https://news.google.com/rss/search?q=%E3%82%A4%E3%83%B3%E3%83%89+%E3%83%93%E3%82%B8%E3%83%8D%E3%82%B9&hl=ja&gl=JP&ceid=JP:ja",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "google-news-jp-india-economy",
    source: "Google News (JP, インド経済)",
    url:
      "https://news.google.com/rss/search?q=%E3%82%A4%E3%83%B3%E3%83%89+%E7%B5%8C%E6%B8%88&hl=ja&gl=JP&ceid=JP:ja",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "ndtv-business",
    source: "NDTV Business",
    url: "https://feeds.feedburner.com/ndtvprofit-latest",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "news18-business",
    source: "News18 Business",
    url: "https://www.news18.com/rss/business.xml",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "firstpost-business",
    source: "Firstpost Business",
    url: "https://www.firstpost.com/rss/business.xml",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "business-today",
    source: "Business Today",
    url: "https://www.businesstoday.in/rssfeeds/?id=home",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "aaj-tak",
    source: "Aaj Tak (हिन्दी)",
    url: "https://www.aajtak.in/rssfeeds/?id=home",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "dainik-jagran-business",
    source: "Dainik Jagran (हिन्दी)",
    url: "https://www.jagran.com/news/business/feed.xml",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "bhaskar",
    source: "Dainik Bhaskar (हिन्दी)",
    url: "https://www.bhaskar.com/rss-v1--category-1700.xml",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "bbc-hindi",
    source: "BBC Hindi",
    url: "https://feeds.bbci.co.uk/hindi/rss.xml",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "google-news-reuters-india",
    source: "Reuters (via Google News)",
    url:
      "https://news.google.com/rss/search?q=site:reuters.com+india+business&hl=en&gl=IN&ceid=IN:en",
    alreadyIndiaFocused: true,
  },
  {
    connectorId: "dw-asia",
    source: "Deutsche Welle (Asia)",
    url: "https://rss.dw.com/rdf/rss-en-asia",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "dw-business",
    source: "Deutsche Welle (Business)",
    url: "https://rss.dw.com/rdf/rss-en-bus",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "france24",
    source: "France 24",
    url: "https://www.france24.com/en/rss",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "channel-news-asia",
    source: "Channel News Asia",
    url: "https://www.channelnewsasia.com/api/v1/rss-outbound-feed?_format=xml",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "scmp",
    source: "South China Morning Post",
    url: "https://www.scmp.com/rss/91/feed",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "nyt-world",
    source: "New York Times (World)",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "guardian-world",
    source: "The Guardian (World)",
    url: "https://www.theguardian.com/world/rss",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "le-monde-en",
    source: "Le Monde (English)",
    url: "https://www.lemonde.fr/en/rss/une.xml",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "korea-herald-business",
    source: "Korea Herald (Business)",
    url: "https://www.koreaherald.com/rss/020401000000.xml",
    alreadyIndiaFocused: false,
  },
  {
    connectorId: "strait-times-asia",
    source: "Straits Times (Asia)",
    url: "https://www.straitstimes.com/news/asia/rss.xml",
    alreadyIndiaFocused: false,
  },
]

function stripHtml(value: string): string {
  return value
    .replace(/<a\b[^>]*>[\s\S]*?<\/a>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/https?:\/\/\S+/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function buildEvidenceSnippets(text: string, maxItems = 3): string[] {
  const cleaned = stripHtml(text)
  if (!cleaned) return []
  const parts = cleaned.split(/(?<=[.!?。])\s+/)
  const snippets: string[] = []
  for (const part of parts) {
    const snippet = part.trim()
    if (snippet.length < 40) continue
    snippets.push(snippet.slice(0, 220))
    if (snippets.length >= maxItems) break
  }
  return snippets
}

function parseDateToIsoDate(value: string): string {
  if (!value) return new Date().toISOString().slice(0, 10)
  const ts = Date.parse(value)
  if (Number.isNaN(ts)) return new Date().toISOString().slice(0, 10)
  return new Date(ts).toISOString().slice(0, 10)
}

async function mapWithConcurrencyLimit<T, R>(
  items: readonly T[],
  concurrency: number,
  mapper: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results: R[] = new Array(items.length)
  const workerCount = Math.max(1, Math.min(concurrency, items.length))
  let nextIndex = 0

  const workers = Array.from({ length: workerCount }, async () => {
    while (true) {
      const currentIndex = nextIndex
      nextIndex += 1
      if (currentIndex >= items.length) break
      results[currentIndex] = await mapper(items[currentIndex], currentIndex)
    }
  })

  await Promise.all(workers)
  return results
}

async function resolveFinalUrl(url: string, timeoutMs = 10_000): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      redirect: "follow",
      headers: { "user-agent": USER_AGENT },
      signal: controller.signal,
    })
    return response.url || url
  } catch {
    return url
  } finally {
    clearTimeout(timer)
  }
}

async function fetchText(url: string, timeoutMs = 15_000): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, {
      headers: { "user-agent": USER_AGENT },
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return await response.text()
  } finally {
    clearTimeout(timer)
  }
}

interface RssItem {
  title?: unknown
  link?: unknown
  guid?: unknown
  pubDate?: unknown
  published?: unknown
  description?: unknown
  content?: unknown
}

function stringifyField(value: unknown): string {
  if (typeof value === "string") return value
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>
    if (typeof obj["#text"] === "string") return obj["#text"] as string
    if (typeof obj._ === "string") return obj._ as string
    if (typeof obj["@_href"] === "string") return obj["@_href"] as string
  }
  return ""
}

interface ParsedCandidate {
  item: RssItem
  title: string
  link: string
  pubDateRaw: string
  body: string
}

async function parseRss(
  xml: string,
  connector: Connector,
  limit: number,
): Promise<RawSourceArticle[]> {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
    processEntities: false,
  })
  const parsed = parser.parse(xml) as Record<string, unknown>

  const channel = (parsed.rss as Record<string, unknown> | undefined)?.channel as
    | Record<string, unknown>
    | undefined
  const rawItems = channel?.item ?? (parsed as Record<string, unknown>).entry ?? []
  const items: RssItem[] = Array.isArray(rawItems) ? (rawItems as RssItem[]) : [rawItems as RssItem]

  // Collect candidates that pass basic filters (no network calls yet).
  // Over-fetch slightly so that URL-quality filtering still yields `limit` results.
  const candidates: ParsedCandidate[] = []
  for (const item of items) {
    if (candidates.length >= limit * 2) break

    const title = stringifyField(item.title).trim()
    const link = stringifyField(item.link).trim()
    if (!title || !link) continue
    if (!isLikelyArticleUrl(link)) continue

    const pubDateRaw = stringifyField(item.pubDate) || stringifyField(item.published)
    const description = stringifyField(item.description) || stringifyField(item.content)
    const body = stripHtml(description)

    if (!connector.alreadyIndiaFocused && !isIndiaRelevant(title, body)) continue

    candidates.push({ item, title, link, pubDateRaw, body })
  }

  // Resolve redirect URLs in parallel, but only for Google News links which
  // require following a redirect to reach the actual article URL.
  const resolved = await mapWithConcurrencyLimit(candidates, 4, async ({ link }) => {
    if (!link.startsWith("https://news.google.com/")) return link
    return resolveFinalUrl(link, 8_000)
  })

  const fetchedAt = new Date().toISOString()
  const output: RawSourceArticle[] = []

  for (let i = 0; i < candidates.length; i++) {
    if (output.length >= limit) break
    const { item, title, link, pubDateRaw, body } = candidates[i]
    const canonical = resolved[i]
    if (!isLikelyArticleUrl(canonical)) continue

    const publishedAt = parseDateToIsoDate(pubDateRaw)

    output.push({
      connectorId: connector.connectorId,
      externalId: stringifyField(item.guid) || link,
      source: connector.source,
      title,
      url: canonical,
      publishedAt,
      bodyText: body || title,
      imageUrl: undefined,
      originalTitle: title,
      originalPublishedAt: publishedAt,
      canonicalUrl: canonical,
      fetchedAt,
      extractedBy: "rss-link+description",
      sourceLanguage: "en",
      evidenceSnippets: buildEvidenceSnippets(body || title),
    })
  }

  return output
}

interface GNewsArticle {
  title?: string
  url?: string
  description?: string
  content?: string
  image?: string
  publishedAt?: string
  source?: { name?: string }
}

async function fetchGNews(limit: number): Promise<{
  articles: RawSourceArticle[]
  error?: string
}> {
  const apiKey = (process.env.GNEWS_API_KEY ?? "").trim()
  if (!apiKey) {
    return { articles: [], error: "skipped: GNEWS_API_KEY not set" }
  }

  const query = (process.env.GNEWS_QUERY ?? "").trim()
    || "india business OR india economy OR india infrastructure OR india regulation"
  const lang = (process.env.GNEWS_LANG ?? "").trim() || "en"
  const country = (process.env.GNEWS_COUNTRY ?? "").trim() || "in"
  const max = Math.min(Math.max(limit, 1), 50)

  const params = new URLSearchParams({ q: query, lang, country, max: String(max), apikey: apiKey })
  const endpoint = `https://gnews.io/api/v4/search?${params.toString()}`

  let payload: { articles?: GNewsArticle[] }
  try {
    const text = await fetchText(endpoint, 20_000)
    payload = JSON.parse(text) as { articles?: GNewsArticle[] }
  } catch (error) {
    return { articles: [], error: error instanceof Error ? error.message : String(error) }
  }

  const rows = payload.articles ?? []

  // Filter rows that pass basic checks before making any network calls.
  interface GNewsCandidate {
    row: GNewsArticle
    title: string
    link: string
  }
  const candidates: GNewsCandidate[] = []
  for (const row of rows) {
    const title = (row.title ?? "").trim()
    const link = (row.url ?? "").trim()
    if (!title || !link) continue
    if (!isLikelyArticleUrl(link)) continue
    candidates.push({ row, title, link })
  }

  // Resolve final URLs in parallel (GNews API may return shortened/redirect links).
  const canonicals = await mapWithConcurrencyLimit(candidates, 4, ({ link }) =>
    resolveFinalUrl(link),
  )

  const fetchedAt = new Date().toISOString()
  const output: RawSourceArticle[] = []

  for (let i = 0; i < candidates.length; i++) {
    const { row, title } = candidates[i]
    const canonical = canonicals[i]
    if (!isLikelyArticleUrl(canonical)) continue

    const description = stripHtml(row.description ?? "")
    const content = stripHtml(row.content ?? "")
    const body = [description, content].filter(Boolean).join(" ").trim()
    const publishedAt = parseDateToIsoDate(row.publishedAt ?? "")

    output.push({
      connectorId: "gnews-api",
      externalId: canonical,
      source: row.source?.name ?? "GNews",
      title,
      url: canonical,
      publishedAt,
      bodyText: body || title,
      imageUrl: row.image || undefined,
      originalTitle: title,
      originalPublishedAt: publishedAt,
      canonicalUrl: canonical,
      fetchedAt,
      extractedBy: "gnews-api+url-resolve",
      sourceLanguage: lang,
      evidenceSnippets: buildEvidenceSnippets(body || title),
    })
  }

  return { articles: output }
}

export interface FetchIndiaNewsResult {
  rawArticles: RawSourceArticle[]
  errors: Array<{ connectorId: string; error: string }>
}

/**
 * 単独記事のタイトルから固有名詞らしき語を抽出して検索クエリ化、
 * Google News RSS で類似記事を 3 件まで取得する。
 */
export async function fetchSimilarArticles(
  seedTitle: string,
  excludeUrls: Set<string>,
  maxResults = 3,
): Promise<RawSourceArticle[]> {
  const tokens = seedTitle
    .replace(/[「」『』""''（）()\[\]【】、,。.!?]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length >= 3)

  const properNouns = tokens.filter((t) => /^[A-Z][A-Za-z0-9]+$/.test(t))
  const otherSignificant = tokens.filter(
    (t) => /^[A-Z]{2,}$/.test(t) || /[぀-ヿ一-鿿ऀ-ॿ]/.test(t),
  )

  const queryTerms = [...new Set([...properNouns, ...otherSignificant])].slice(0, 4)
  if (queryTerms.length === 0) return []

  const query = queryTerms.join(" ")
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=en-IN&gl=IN&ceid=IN:en`

  const fakeConnector: Connector = {
    connectorId: "augmentation-search",
    source: "Google News (関連記事自動検索)",
    url,
    alreadyIndiaFocused: true,
  }

  try {
    const xml = await fetchText(url, 15_000)
    const items = await parseRss(xml, fakeConnector, maxResults * 2)
    const filtered = items
      .filter((it) => {
        const key = (it.canonicalUrl ?? it.url).split("?")[0].replace(/\/+$/, "").toLowerCase()
        return !excludeUrls.has(key)
      })
      .slice(0, maxResults)
    return filtered
  } catch {
    return []
  }
}

export async function fetchIndiaNews(limitPerConnector = 6): Promise<FetchIndiaNewsResult> {
  const rawArticles: RawSourceArticle[] = []
  const errors: Array<{ connectorId: string; error: string }> = []

  const connectorResults = await mapWithConcurrencyLimit(
    CONNECTORS,
    4,
    async (connector) => {
      try {
        const xml = await fetchText(connector.url, 20_000)
        const items = await parseRss(xml, connector, limitPerConnector)
        return { items, error: null as null | { connectorId: string; error: string } }
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        return {
          items: [] as RawSourceArticle[],
          error: { connectorId: connector.connectorId, error: message },
        }
      }
    },
  )

  for (const result of connectorResults) {
    rawArticles.push(...result.items)
    if (result.error) errors.push(result.error)
  }

  try {
    const gnews = await fetchGNews(limitPerConnector)
    rawArticles.push(...gnews.articles)
    if (gnews.error) errors.push({ connectorId: "gnews-api", error: gnews.error })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    errors.push({ connectorId: "gnews-api", error: message })
  }

  return { rawArticles, errors }
}
