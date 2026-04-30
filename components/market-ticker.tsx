"use client"

import { useEffect, useState } from "react"
import type { LiveQuote, MarketSnapshotLive } from "@/lib/market-data"

const FALLBACK_ITEMS: LiveQuote[] = [
  { symbol: "INRJPY=X", label: "INR/JPY", sub: "₹/¥", value: "—", change: "—", changeAbs: "—", direction: "flat" },
  { symbol: "USDINR=X", label: "USD/INR", sub: "$/₹", value: "—", change: "—", changeAbs: "—", direction: "flat" },
  { symbol: "^NSEI", label: "Nifty 50", sub: "指数", value: "—", change: "—", changeAbs: "—", direction: "flat" },
  { symbol: "^BSESN", label: "Sensex", sub: "指数", value: "—", change: "—", changeAbs: "—", direction: "flat" },
  { symbol: "BZ=F", label: "Brent", sub: "USD/bbl", value: "—", change: "—", changeAbs: "—", direction: "flat" },
  { symbol: "GC=F", label: "Gold", sub: "USD/oz", value: "—", change: "—", changeAbs: "—", direction: "flat" },
]

function TickerRow({ keyPrefix, items }: { keyPrefix: string; items: LiveQuote[] }) {
  return (
    <div className="flex items-center gap-8 px-4">
      {items.map((item, index) => (
        <span
          key={`${keyPrefix}-${index}`}
          className="flex items-baseline gap-2 whitespace-nowrap font-mono text-xs"
        >
          <span className="text-muted-foreground">{item.label}</span>
          <span className="font-semibold tabular-nums">{item.value}</span>
          <span
            className={
              item.direction === "up"
                ? "text-emerald-700"
                : item.direction === "down"
                  ? "text-accent"
                  : "text-muted-foreground"
            }
          >
            {item.direction === "up" ? "▲" : item.direction === "down" ? "▼" : "—"}{" "}
            {item.change}
          </span>
        </span>
      ))}
    </div>
  )
}

function formatBadge(asOf: number | null): string {
  if (!asOf) return "LOADING"
  const d = new Date(asOf * 1000)
  const date = d
    .toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      timeZone: "Asia/Kolkata",
    })
    .toUpperCase()
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  })
  return `LIVE · ${date} ${time} IST`
}

export function MarketTicker() {
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

  const items = snapshot?.items ?? FALLBACK_ITEMS
  const badgeText = errored
    ? "OFFLINE"
    : snapshot
      ? formatBadge(snapshot.asOf)
      : "LOADING"

  return (
    <div className="marquee-wrap overflow-hidden border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <span className="shrink-0 bg-foreground px-2 py-1 font-mono text-[10px] tracking-[0.2em] text-background">
          {badgeText}
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="marquee-ticker flex w-max">
            <TickerRow keyPrefix="a" items={items} />
            <TickerRow keyPrefix="b" items={items} />
          </div>
        </div>
      </div>
    </div>
  )
}
