import Link from "next/link"
import { Button } from "@/components/ui/button"
import { HeaderAuthControls } from "@/components/header-auth-controls"
import { CATEGORY_LABELS, CATEGORY_OPTIONS } from "@/lib/news-data"

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"]

export function SiteHeader() {
  const today = new Date()
  const dateStr = `${today.getFullYear()}年${
    today.getMonth() + 1
  }月${today.getDate()}日 (${WEEKDAYS[today.getDay()]})`

  return (
    <header className="border-b border-border bg-background">
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-[11px] sm:px-6 lg:px-8">
          <p className="font-semibold tracking-[0.22em]">
            INDIA BUSINESS DISPATCH
          </p>
          <div className="flex items-center gap-4 opacity-90">
            <span className="hidden sm:inline">
              日本企業向けインド市場インテリジェンス
            </span>
            <time className="font-mono">{dateStr}</time>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-md bg-primary font-serif text-xl font-bold leading-none text-primary-foreground">
              IB<span className="text-accent">D</span>
            </span>
            <span className="flex flex-col gap-0.5 leading-tight">
              <span className="font-serif text-2xl font-bold tracking-tight text-foreground sm:text-[26px]">
                India Business Dispatch
              </span>
              <span className="text-xs text-muted-foreground">
                日本企業向けインド市場インテリジェンス · 編集部監修
              </span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <nav className="hidden items-center gap-5 text-sm lg:flex">
              {CATEGORY_OPTIONS.map((category) => (
                <Link
                  key={category}
                  href={`/?category=${category}`}
                  className="text-muted-foreground transition-colors hover:text-accent"
                >
                  {CATEGORY_LABELS[category]}
                </Link>
              ))}
            </nav>

            <div className="flex flex-wrap items-center gap-2">
              <HeaderAuthControls />
              <Button asChild size="sm">
                <Link href="/contact?leadType=expansion">お問い合わせ</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
