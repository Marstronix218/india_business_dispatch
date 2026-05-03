"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { NewsCardTile } from "@/components/news-card"
import type { NewsArticle } from "@/lib/news-data"

export function TopicCarousel({ articles }: { articles: NewsArticle[] }) {
  const scrollerRef = useRef<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateState = useCallback(() => {
    const el = scrollerRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 4)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4)
  }, [])

  useEffect(() => {
    updateState()
    const el = scrollerRef.current
    if (!el) return
    const onScroll = () => updateState()
    el.addEventListener("scroll", onScroll, { passive: true })
    const ro = new ResizeObserver(updateState)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", onScroll)
      ro.disconnect()
    }
  }, [updateState, articles.length])

  function scrollByPage(direction: 1 | -1) {
    const el = scrollerRef.current
    if (!el) return
    const card = el.querySelector<HTMLElement>("[data-carousel-card]")
    const cardWidth = card?.offsetWidth ?? el.clientWidth / 3
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    el.scrollBy({ left: direction * (cardWidth + gap) * 3, behavior: "smooth" })
  }

  if (articles.length === 0) return null

  return (
    <div className="relative min-w-0 overflow-hidden">
      <div
        ref={scrollerRef}
        className="-mx-4 flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-1 [scrollbar-width:none] sm:-mx-0 sm:gap-6 sm:px-0 [&::-webkit-scrollbar]:hidden"
      >
        {articles.map((article) => (
          <div
            key={article.id}
            data-carousel-card
            className="w-[82vw] max-w-[22rem] shrink-0 snap-start sm:w-[calc(50%-12px)] sm:max-w-none lg:w-[calc((100%-48px)/3)]"
          >
            <NewsCardTile article={article} />
          </div>
        ))}
      </div>

      {articles.length > 3 && (
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="前へ"
            onClick={() => scrollByPage(-1)}
            disabled={!canScrollLeft}
            className="grid size-8 place-items-center rounded-full border border-border bg-card text-foreground transition-opacity hover:border-accent hover:text-accent disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            aria-label="次へ"
            onClick={() => scrollByPage(1)}
            disabled={!canScrollRight}
            className="grid size-8 place-items-center rounded-full border border-border bg-card text-foreground transition-opacity hover:border-accent hover:text-accent disabled:opacity-30"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      )}
    </div>
  )
}
