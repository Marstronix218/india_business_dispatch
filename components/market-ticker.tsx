type TickerItem = {
  label: string
  value: string
  change: string
  direction: "up" | "down" | "flat"
}

const ITEMS: TickerItem[] = [
  { label: "INR/JPY", value: "1.83", change: "+0.7%", direction: "up" },
  { label: "USD/INR", value: "83.42", change: "-0.2%", direction: "down" },
  { label: "Nifty 50", value: "24,515", change: "+0.5%", direction: "up" },
  { label: "Sensex", value: "80,612", change: "+0.4%", direction: "up" },
  { label: "10Y IN", value: "7.03", change: "-0.04", direction: "down" },
  { label: "Brent", value: "82.6", change: "+1.1%", direction: "up" },
  { label: "Gold INR", value: "71,820", change: "+0.3%", direction: "up" },
  { label: "RBI Repo", value: "6.50", change: "flat", direction: "flat" },
]

function TickerRow({ keyPrefix }: { keyPrefix: string }) {
  return (
    <div className="flex items-center gap-8 px-4">
      {ITEMS.map((item, index) => (
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

export function MarketTicker() {
  return (
    <div className="marquee-wrap overflow-hidden border-b border-border bg-card">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2 sm:px-6 lg:px-8">
        <span className="shrink-0 bg-foreground px-2 py-1 font-mono text-[10px] tracking-[0.2em] text-background">
          LIVE · 16 APR 15:00 IST
        </span>
        <div className="flex-1 overflow-hidden">
          <div className="marquee-ticker flex w-max">
            <TickerRow keyPrefix="a" />
            <TickerRow keyPrefix="b" />
          </div>
        </div>
      </div>
    </div>
  )
}
