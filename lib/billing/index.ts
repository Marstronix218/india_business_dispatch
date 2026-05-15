/**
 * Fetches account-level spend from the OpenAI and Anthropic organization billing
 * APIs for the admin dashboard. Both lookups need an org-level Admin key that is
 * separate from the runtime `OPENAI_API_KEY` / `ANTHROPIC_API_KEY`; when the Admin
 * key is unset the provider is simply reported as not configured.
 */

export interface BillingSummary {
  /** Whether the provider's Admin key is configured. */
  configured: boolean
  /** Total spend in USD across the window, when the lookup succeeded. */
  totalUsd?: number
  /** Per-day spend in USD, ascending by date (provider-defined day buckets). */
  daily?: { date: string; usd: number }[]
  /** Window length in days the figures cover. */
  days?: number
  /** Human-readable error when the lookup failed. */
  error?: string
}

const DAY_MS = 24 * 60 * 60 * 1000

/** Midnight UTC, `days` days before today — used as the billing window start. */
function windowStart(days: number): Date {
  const start = new Date(Date.now() - days * DAY_MS)
  start.setUTCHours(0, 0, 0, 0)
  return start
}

function errorSummary(days: number, error: unknown): BillingSummary {
  return {
    configured: true,
    days,
    error: error instanceof Error ? error.message : "不明なエラー",
  }
}

/** Coerce arbitrary JSON values to a finite number (provider APIs occasionally
 *  return decimals as strings, so accept those without poisoning the total). */
function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value)
  return Number.isFinite(n) ? n : 0
}

interface OpenAiCostsResponse {
  data?: {
    start_time: number
    results?: { amount?: { value?: number } }[]
  }[]
}

/**
 * OpenAI organization costs — `GET /v1/organization/costs` with 1-day buckets.
 * `limit` of `days + 1` covers the whole window in a single page.
 */
export async function getOpenAiCosts(days = 30): Promise<BillingSummary> {
  const key = process.env.OPENAI_ADMIN_KEY
  if (!key) return { configured: false }

  try {
    const start = windowStart(days)
    const url = new URL("https://api.openai.com/v1/organization/costs")
    url.searchParams.set("start_time", String(Math.floor(start.getTime() / 1000)))
    url.searchParams.set("bucket_width", "1d")
    url.searchParams.set("limit", String(days + 1))

    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => "")
      throw new Error(`OpenAI ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`)
    }

    const json = (await res.json()) as OpenAiCostsResponse
    const daily = (json.data ?? []).map((bucket) => ({
      date: new Date(toNumber(bucket.start_time) * 1000).toISOString().slice(0, 10),
      usd: (bucket.results ?? []).reduce(
        (sum, r) => sum + toNumber(r.amount?.value),
        0,
      ),
    }))
    const totalUsd = daily.reduce((sum, d) => sum + d.usd, 0)
    return { configured: true, totalUsd, daily, days }
  } catch (error) {
    return errorSummary(days, error)
  }
}

interface AnthropicCostResponse {
  data?: {
    starting_at: string
    results?: { amount?: string | number }[]
  }[]
}

/**
 * Anthropic organization cost report — `GET /v1/organizations/cost_report`, which
 * returns 1-day buckets with `amount` as a decimal string.
 */
export async function getAnthropicCosts(days = 30): Promise<BillingSummary> {
  const key = process.env.ANTHROPIC_ADMIN_KEY
  if (!key) return { configured: false }

  try {
    const start = windowStart(days)
    const url = new URL("https://api.anthropic.com/v1/organizations/cost_report")
    url.searchParams.set("starting_at", start.toISOString())
    url.searchParams.set("limit", String(days + 1))

    const res = await fetch(url, {
      headers: {
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      cache: "no-store",
    })
    if (!res.ok) {
      const detail = await res.text().catch(() => "")
      throw new Error(
        `Anthropic ${res.status}${detail ? `: ${detail.slice(0, 200)}` : ""}`,
      )
    }

    const json = (await res.json()) as AnthropicCostResponse
    const daily = (json.data ?? []).map((bucket) => ({
      date: (bucket.starting_at ?? "").slice(0, 10),
      usd: (bucket.results ?? []).reduce(
        (sum, r) => sum + toNumber(r.amount),
        0,
      ),
    }))
    const totalUsd = daily.reduce((sum, d) => sum + d.usd, 0)
    return { configured: true, totalUsd, daily, days }
  } catch (error) {
    return errorSummary(days, error)
  }
}
