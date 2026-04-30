export type Direction = "up" | "down" | "flat"

export interface LiveQuote {
  symbol: string
  label: string
  sub: string
  value: string
  change: string
  changeAbs: string
  direction: Direction
}

export interface MarketSnapshotLive {
  asOf: number
  items: LiveQuote[]
}

interface SymbolSpec {
  symbol: string
  label: string
  sub: string
  format: (price: number) => string
  decimals?: number
}

const SYMBOLS: SymbolSpec[] = [
  {
    symbol: "INRJPY=X",
    label: "INR/JPY",
    sub: "₹/¥",
    format: (p) => p.toFixed(4),
  },
  {
    symbol: "USDINR=X",
    label: "USD/INR",
    sub: "$/₹",
    format: (p) => p.toFixed(2),
  },
  {
    symbol: "^NSEI",
    label: "Nifty 50",
    sub: "指数",
    format: (p) => Math.round(p).toLocaleString("en-IN"),
  },
  {
    symbol: "^BSESN",
    label: "Sensex",
    sub: "指数",
    format: (p) => Math.round(p).toLocaleString("en-IN"),
  },
  {
    symbol: "BZ=F",
    label: "Brent",
    sub: "USD/bbl",
    format: (p) => p.toFixed(2),
  },
  {
    symbol: "GC=F",
    label: "Gold",
    sub: "USD/oz",
    format: (p) => Math.round(p).toLocaleString("en-US"),
  },
]

interface YahooMeta {
  symbol?: string
  regularMarketPrice?: number
  chartPreviousClose?: number
  previousClose?: number
  regularMarketTime?: number
}

async function fetchOne(spec: SymbolSpec): Promise<LiveQuote | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(spec.symbol)}?interval=1d&range=2d`
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 300 },
    })
    if (!res.ok) return null
    const json = (await res.json()) as {
      chart?: { result?: Array<{ meta?: YahooMeta }> }
    }
    const meta = json.chart?.result?.[0]?.meta
    if (!meta?.regularMarketPrice) return null
    const price = meta.regularMarketPrice
    const prev = meta.chartPreviousClose ?? meta.previousClose ?? price
    const diff = price - prev
    const pct = prev !== 0 ? (diff / prev) * 100 : 0
    const direction: Direction = diff > 0 ? "up" : diff < 0 ? "down" : "flat"
    const sign = diff > 0 ? "+" : diff < 0 ? "" : ""
    return {
      symbol: spec.symbol,
      label: spec.label,
      sub: spec.sub,
      value: spec.format(price),
      change: `${sign}${pct.toFixed(2)}%`,
      changeAbs: `${sign}${diff.toFixed(2)}`,
      direction,
    }
  } catch {
    return null
  }
}

export async function fetchMarketSnapshot(): Promise<MarketSnapshotLive | null> {
  const results = await Promise.all(SYMBOLS.map(fetchOne))
  const items = results.filter((r): r is LiveQuote => r !== null)
  if (items.length === 0) return null
  return {
    asOf: Math.floor(Date.now() / 1000),
    items,
  }
}

export function formatAsOf(ts: number, locale = "ja-JP"): string {
  const d = new Date(ts * 1000)
  return d.toLocaleString(locale, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Tokyo",
  })
}
