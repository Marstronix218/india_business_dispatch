import Link from "next/link"
import { Separator } from "@/components/ui/separator"
import { CATEGORY_OPTIONS, CATEGORY_LABELS } from "@/lib/news-data"

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-3">
          <div className="space-y-3">
            <h4 className="text-xl font-semibold">India Business Dispatch</h4>
            <p className="max-w-sm text-sm leading-7 text-primary-foreground/75">
              日本企業向けに、インド市場の短報、業界別ウォッチ、進出・採用の示唆を届ける v1 プロダクトです。
            </p>
          </div>

          <div className="space-y-3">
            <h5 className="text-sm font-semibold uppercase tracking-[0.18em]">
              Categories
            </h5>
            <ul className="space-y-2 text-sm text-primary-foreground/75">
              {CATEGORY_OPTIONS.map((category) => (
                <li key={category}>
                  <Link href="/" className="transition-opacity hover:opacity-100">
                    {CATEGORY_LABELS[category]}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="text-sm font-semibold uppercase tracking-[0.18em]">
              Navigation
            </h5>
            <ul className="space-y-2 text-sm text-primary-foreground/75">
              <li>
                <Link href="/pricing#free-member" className="transition-opacity hover:opacity-100">
                  無料会員登録
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="transition-opacity hover:opacity-100">
                  料金プラン
                </Link>
              </li>
              <li>
                <Link href="/contact?leadType=expansion" className="transition-opacity hover:opacity-100">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <Separator className="my-8 bg-primary-foreground/15" />

        <p className="text-center text-xs text-primary-foreground/60">
          &copy; {new Date().getFullYear()} India Business Dispatch. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
