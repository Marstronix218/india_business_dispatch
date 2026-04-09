"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Menu, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { CATEGORY_LABELS, type Category } from "@/lib/news-data"

const NAV_CATEGORIES: Category[] = [
  "economy",
  "policy",
  "regulation",
  "corporate",
  "startup",
  "social",
  "culture",
  "column",
]

export function SiteHeader({
  onSearch,
  onCategorySelect,
  activeCategory,
}: {
  onSearch?: (query: string) => void
  onCategorySelect?: (category: Category | null) => void
  activeCategory?: Category | null
}) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch?.(searchQuery)
  }

  const today = new Date()
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`
  const dayNames = ["日", "月", "火", "水", "木", "金", "土"]
  const dayStr = dayNames[today.getDay()]

  return (
    <header className="bg-card border-b border-border">
      {/* Top bar */}
      <div className="border-b border-border">
        <div className="mx-auto max-w-6xl flex items-center justify-between px-4 py-2">
          <time className="text-xs text-muted-foreground tracking-wide">
            {dateStr}（{dayStr}）
          </time>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="検索を開く"
            >
              <Search className="size-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Logo */}
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex flex-col">
            <span className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
              India Business Dispatch
            </span>
            <span className="text-[10px] tracking-widest text-muted-foreground md:text-xs">
              {"インド・ビジネス・ディスパッチ"}
            </span>
          </Link>
          <button
            className="md:hidden text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="メニュー"
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>
        </div>
      </div>

      {/* Search bar (expandable) */}
      {searchOpen && (
        <div className="border-t border-border bg-secondary/50">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                type="search"
                placeholder="キーワードで検索..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  onSearch?.(e.target.value)
                }}
                className="bg-card"
                autoFocus
              />
              <Button type="submit" variant="default" size="sm">
                検索
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Category nav - desktop */}
      <nav className="hidden md:block border-t border-border">
        <div className="mx-auto max-w-6xl px-4">
          <ul className="flex items-center gap-0 -mb-px">
            <li>
              <button
                onClick={() => onCategorySelect?.(null)}
                className={`inline-block px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                  activeCategory === null || activeCategory === undefined
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {"すべて"}
              </button>
            </li>
            {NAV_CATEGORIES.map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => onCategorySelect?.(cat)}
                  className={`inline-block px-4 py-2.5 text-sm font-medium transition-colors border-b-2 ${
                    activeCategory === cat
                      ? "border-primary text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="md:hidden border-t border-border bg-card">
          <ul className="flex flex-col">
            <li>
              <button
                onClick={() => {
                  onCategorySelect?.(null)
                  setMobileMenuOpen(false)
                }}
                className={`w-full text-left px-6 py-3 text-sm font-medium border-b border-border transition-colors ${
                  activeCategory === null || activeCategory === undefined
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                {"すべてのニュース"}
              </button>
            </li>
            {NAV_CATEGORIES.map((cat) => (
              <li key={cat}>
                <button
                  onClick={() => {
                    onCategorySelect?.(cat)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full text-left px-6 py-3 text-sm font-medium border-b border-border transition-colors ${
                    activeCategory === cat
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  )
}
