"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  CATEGORY_OPTIONS,
  CATEGORY_LABELS,
  type Category,
} from "@/lib/news-data"

interface SiteHeaderProps {
  activeCategory: Category | null
  onCategorySelect: (category: Category | null) => void
}

export function SiteHeader({
  activeCategory,
  onCategorySelect,
}: SiteHeaderProps) {
  const today = new Date()
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`

  return (
    <header className="border-b border-border bg-background">
      <div className="border-b border-border/70 bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 text-xs sm:px-6 lg:px-8">
          <p className="tracking-[0.18em]">INDIA BUSINESS DISPATCH</p>
          <time className="opacity-80">{dateStr}</time>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <Link href="/" className="inline-flex flex-col gap-1">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                India Business Dispatch
              </span>
              <span className="text-sm text-muted-foreground">
                日本企業向けインド市場インテリジェンス
              </span>
            </Link>
            <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
              インド進出と採用判断に必要な情報だけを、日本語で一覧把握できる形に整理しています。
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline">
              <Link href="/pricing#free-member">無料会員登録</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/pricing">価格</Link>
            </Button>
            <Button asChild>
              <Link href="/contact?leadType=expansion">お問い合わせ</Link>
            </Button>
          </div>
        </div>

        <nav className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onCategorySelect(null)}
            className={`rounded-full border px-4 py-2 text-sm transition-colors ${
              activeCategory === null
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:text-foreground"
            }`}
          >
            すべて
          </button>
          {CATEGORY_OPTIONS.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onCategorySelect(category)}
              className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                activeCategory === category
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:text-foreground"
              }`}
            >
              {CATEGORY_LABELS[category]}
            </button>
          ))}
        </nav>
      </div>
    </header>
  )
}
