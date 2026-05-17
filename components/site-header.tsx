import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { HeaderAuthControls } from "@/components/header-auth-controls"

function formatTokyoDate(date: Date) {
  const parts = new Intl.DateTimeFormat("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    weekday: "short",
  }).formatToParts(date)

  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? ""

  return `${value("year")}年${value("month")}月${value("day")}日 (${value("weekday")})`
}

function BrandWordmark({ compact = false }: { compact?: boolean }) {
  return (
    <span
      className={
        compact
          ? "font-serif text-sm font-bold tracking-normal"
          : "font-serif text-[32px] font-bold tracking-normal"
      }
    >
      <span className="text-primary">IndoBiz</span>{" "}
      <span className="text-accent">Japan</span>
    </span>
  )
}

export function SiteHeader() {
  const dateStr = formatTokyoDate(new Date())

  return (
    <header className="border-b border-border bg-background">
      <div className="bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-[11px] sm:px-6 lg:px-8">
          <p className="font-semibold tracking-[0.22em] text-primary-foreground">
            INDOBIZ JAPAN
          </p>
          <div className="flex items-center gap-4 opacity-90">
            <span className="hidden sm:inline">
              日本企業向けインド市場インテリジェンス
            </span>
            <time className="font-mono" suppressHydrationWarning>
              {dateStr}
            </time>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="relative size-12 shrink-0 overflow-hidden rounded-md border border-border bg-background">
              <Image
                src="/logo.png"
                alt="IndoBiz Japan logo"
                width={48}
                height={48}
                className="size-full object-contain"
                priority
              />
            </span>
            <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1 leading-tight">
              <BrandWordmark />
              <span className="text-xs text-muted-foreground">
                日本企業向けインド市場インテリジェンス · 編集部監修
              </span>
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <HeaderAuthControls />
            <Button asChild size="sm">
              <Link href="/contact?leadType=expansion">お問い合わせ</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
