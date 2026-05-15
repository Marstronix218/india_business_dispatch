"use client"

import { useEffect, useMemo, useState } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"

interface DailyStat {
  date: string
  articles: number
  images: number
}

interface BillingSummary {
  configured: boolean
  totalUsd?: number
  daily?: { date: string; usd: number }[]
  days?: number
  error?: string
}

interface StatsResponse {
  ok: boolean
  daily: DailyStat[]
  billing: { openai: BillingSummary; anthropic: BillingSummary }
  error?: string
}

const chartConfig = {
  articles: { label: "記事", color: "var(--chart-1)" },
  images: { label: "画像", color: "var(--chart-2)" },
} satisfies ChartConfig

function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value)
}

/** `2026-05-15` → `5/15` for compact axis ticks / tooltip labels. */
function formatDateLabel(value: string): string {
  const parts = value.split("-")
  return parts.length === 3 ? `${Number(parts[1])}/${Number(parts[2])}` : value
}

export function GenerationStats() {
  const [data, setData] = useState<StatsResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch("/api/admin/stats", { credentials: "same-origin" })
      .then(async (res) => {
        const json = (await res.json()) as StatsResponse
        if (!res.ok || !json.ok) {
          throw new Error(json.error ?? `HTTP ${res.status}`)
        }
        return json
      })
      .then((json) => {
        if (!cancelled) setData(json)
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "不明なエラー")
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const totals = useMemo(() => {
    const daily = data?.daily ?? []
    return {
      articles: daily.reduce((sum, d) => sum + d.articles, 0),
      images: daily.reduce((sum, d) => sum + d.images, 0),
    }
  }, [data])

  return (
    <section className="space-y-4">
      <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground">生成数の推移</h2>
            <p className="text-xs text-muted-foreground">
              過去30日間に生成された記事・画像の数（日本時間）
            </p>
          </div>
          {data && !error && (
            <div className="flex gap-4 text-right">
              <div>
                <p className="text-xs text-muted-foreground">記事合計</p>
                <p className="text-lg font-semibold text-foreground">
                  {totals.articles}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">画像合計</p>
                <p className="text-lg font-semibold text-foreground">
                  {totals.images}
                </p>
              </div>
            </div>
          )}
        </div>

        {loading ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            読み込み中…
          </div>
        ) : error ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-destructive">
            統計の取得に失敗しました: {error}
          </div>
        ) : !data || data.daily.length === 0 ? (
          <div className="flex h-[220px] items-center justify-center text-sm text-muted-foreground">
            表示できるデータがありません。
          </div>
        ) : (
          <ChartContainer
            config={chartConfig}
            className="aspect-auto h-[220px] w-full"
          >
            <BarChart data={data.daily} margin={{ left: -16, right: 4 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={formatDateLabel}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={32}
                allowDecimals={false}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) => formatDateLabel(String(value))}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="articles"
                fill="var(--color-articles)"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="images"
                fill="var(--color-images)"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <BillingCard
          title="OpenAI"
          summary={data?.billing.openai}
          loading={loading}
          fetchError={error}
        />
        <BillingCard
          title="Anthropic"
          summary={data?.billing.anthropic}
          loading={loading}
          fetchError={error}
        />
      </div>
    </section>
  )
}

function BillingCard({
  title,
  summary,
  loading,
  fetchError,
}: {
  title: string
  summary: BillingSummary | undefined
  loading: boolean
  fetchError: string | null
}) {
  return (
    <Card className="rounded-2xl">
      <CardHeader>
        <CardTitle className="text-sm">{title} 利用料金</CardTitle>
        <CardDescription className="text-xs">
          過去{summary?.days ?? 30}日間の請求額
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">読み込み中…</p>
        ) : fetchError ? (
          <p className="text-2xl font-semibold text-muted-foreground">—</p>
        ) : !summary || !summary.configured ? (
          <div className="space-y-1">
            <p className="text-2xl font-semibold text-muted-foreground">未設定</p>
            <p className="text-xs text-muted-foreground">
              管理者APIキーが設定されていません。
            </p>
          </div>
        ) : summary.error ? (
          <div className="space-y-1">
            <p className="text-2xl font-semibold text-destructive">取得失敗</p>
            <p className="break-words text-xs text-muted-foreground">
              {summary.error}
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            <p className="text-2xl font-semibold text-foreground">
              {formatUsd(summary.totalUsd ?? 0)}
            </p>
            <p className="text-xs text-muted-foreground">米ドル建て</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
