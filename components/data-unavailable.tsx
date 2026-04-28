import Link from "next/link"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export function DataUnavailable({
  title = "現在記事を取得できません",
  description = "データベースに接続できないため、記事を表示できません。しばらくしてから再度アクセスしてください。",
  showHomeLink = false,
}: {
  title?: string
  description?: string
  showHomeLink?: boolean
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-md space-y-3 text-center">
          <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
          <p className="text-sm leading-7 text-muted-foreground">{description}</p>
          {showHomeLink && (
            <Link
              href="/"
              className="inline-block text-sm text-accent underline-offset-4 hover:underline"
            >
              トップに戻る
            </Link>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
