import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function SiteHeader() {
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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <Link href="/" className="inline-flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="India Business Dispatch"
              width={48}
              height={48}
              priority
              className="size-12 shrink-0 rounded-lg"
            />
            <span className="flex flex-col gap-0.5">
              <span className="text-2xl font-semibold tracking-tight text-foreground">
                India Business Dispatch
              </span>
              <span className="text-sm text-muted-foreground">
                日本企業向けインド市場インテリジェンス
              </span>
            </span>
          </Link>

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
      </div>
    </header>
  )
}
