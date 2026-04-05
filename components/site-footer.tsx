import Link from "next/link"
import { Separator } from "@/components/ui/separator"

export function SiteFooter() {
  return (
    <footer className="bg-primary text-primary-foreground mt-12">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h4 className="text-base font-bold mb-1">India Business Dispatch</h4>
            <p className="text-xs opacity-70 mb-4">
              {"インド・ビジネス・ディスパッチ"}
            </p>
            <p className="text-xs opacity-80 leading-relaxed max-w-xs">
              {"日本企業のためのインドビジネス情報プラットフォーム。信頼できる情報を毎日お届けします。"}
            </p>
          </div>
          <div>
            <h5 className="text-sm font-bold mb-3 opacity-90">{"カテゴリ"}</h5>
            <ul className="flex flex-col gap-2 text-xs opacity-75">
              <li>
                <Link href="/" className="hover:opacity-100 transition-opacity">
                  {"経済"}
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:opacity-100 transition-opacity">
                  {"政策"}
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:opacity-100 transition-opacity">
                  {"規制"}
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:opacity-100 transition-opacity">
                  {"企業動向"}
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:opacity-100 transition-opacity">
                  {"スタートアップ"}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 className="text-sm font-bold mb-3 opacity-90">{"このサイトについて"}</h5>
            <ul className="flex flex-col gap-2 text-xs opacity-75">
              <li>
                <Link href="/" className="hover:opacity-100 transition-opacity">
                  {"運営者情報"}
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:opacity-100 transition-opacity">
                  {"プライバシーポリシー"}
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:opacity-100 transition-opacity">
                  {"お問い合わせ"}
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <Separator className="my-8 opacity-20" />
        <p className="text-center text-xs opacity-60">
          &copy; {new Date().getFullYear()} India Business Dispatch. All rights
          reserved.
        </p>
      </div>
    </footer>
  )
}
