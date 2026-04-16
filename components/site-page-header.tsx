import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SitePageHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              トップに戻る
            </Link>
            <div className="space-y-2">
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
                {description}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/pricing#free-member">無料会員登録</Link>
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
