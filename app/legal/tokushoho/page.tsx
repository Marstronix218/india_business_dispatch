import type { Metadata } from "next"
import type { ReactNode } from "react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | IndoBiz Japan",
  description:
    "IndoBiz Japan の特定商取引法に基づく表記です。販売事業者、所在地、料金、支払方法、解約条件等を記載しています。",
}

interface DisclosureRow {
  label: string
  content: ReactNode
}

const rows: DisclosureRow[] = [
  {
    label: "販売事業者名",
    content: "グローバルランチャーズ株式会社",
  },
  {
    label: "運営統括責任者",
    content: "岸田 高明",
  },
  {
    label: "所在地",
    content: "〒466-0051 愛知県名古屋市昭和区御器所2丁目4-14-1",
  },
  {
    label: "電話番号",
    content: (
      <>
        050-3629-1977
        <br />
        <span className="text-xs text-muted-foreground">
          ※受付時間：平日10:00–18:00（土日祝・年末年始を除く）。お問い合わせは原則メールにて承ります。
        </span>
      </>
    ),
  },
  {
    label: "メールアドレス",
    content: (
      <a
        href="mailto:info@g-launchers.com"
        className="text-accent underline-offset-2 hover:underline"
      >
        info@g-launchers.com
      </a>
    ),
  },
  {
    label: "サービス名",
    content: "IndoBiz Japan（インドビジネス情報配信サービス）",
  },
  {
    label: "販売価格",
    content: (
      <>
        個人向け有料会員プラン：月額 1,000円（税込）
        <br />
        <span className="text-xs text-muted-foreground">
          価格は申込画面および Stripe Checkout 画面に明示されます。
        </span>
        <br />
        法人パイロットプラン：個別お見積もり（
        <a
          href="/contact?leadType=expansion"
          className="text-accent underline-offset-2 hover:underline"
        >
          お問い合わせ
        </a>
        ）
      </>
    ),
  },
  {
    label: "商品代金以外の必要料金",
    content: (
      <ul className="list-disc space-y-1 pl-5">
        <li>消費税：表示価格に含まれます。</li>
        <li>
          インターネット接続料金・通信料：本サービスの利用に必要な通信料はお客様のご負担となります。
        </li>
        <li>クレジットカード決済手数料：ありません。</li>
      </ul>
    ),
  },
  {
    label: "支払方法",
    content: (
      <>
        クレジットカード決済（Stripe, Inc. を通じた処理）
        <br />
        <span className="text-xs text-muted-foreground">
          対応ブランド：Visa / Mastercard / American Express / JCB / Diners Club / Discover
        </span>
      </>
    ),
  },
  {
    label: "支払時期",
    content: (
      <ul className="list-disc space-y-1 pl-5">
        <li>初回：お申し込み完了時に課金されます（無料トライアル期間中は課金されません）。</li>
        <li>2回目以降：毎月、契約更新日に自動課金されます。</li>
        <li>無料トライアル：お申し込みから7日間。期間内に解約された場合は課金されません。</li>
      </ul>
    ),
  },
  {
    label: "サービス提供時期",
    content:
      "決済完了後、ただちにご利用いただけます。無料トライアルの場合はお申し込み完了後ただちに開始されます。",
  },
  {
    label: "返品・キャンセル（解約）について",
    content: (
      <div className="space-y-3">
        <p>
          本サービスはデジタルコンテンツ・情報配信サービスの性質上、ご購入後の返金・返品は原則として承っておりません。
        </p>
        <p>
          解約はマイページの請求管理画面（Stripe カスタマーポータル）からいつでも手続きいただけます。解約手続き後も、当月のお支払い済み期間の末日までは引き続きサービスをご利用いただけます。
        </p>
        <p>
          無料トライアル期間内に解約された場合、料金は一切発生しません。
        </p>
        <p>
          当社の責めに帰すべき事由によりサービスを提供できなかった場合は、別途ご相談の上、未利用期間に応じた返金対応を行います。
        </p>
      </div>
    ),
  },
  {
    label: "動作環境",
    content: (
      <ul className="list-disc space-y-1 pl-5">
        <li>
          対応ブラウザ：最新版の Google Chrome / Safari / Microsoft Edge / Firefox
        </li>
        <li>JavaScript および Cookie が有効である必要があります。</li>
        <li>
          スマートフォン・タブレットからもご利用いただけます（iOS / Android 最新版を推奨）。
        </li>
      </ul>
    ),
  },
  {
    label: "特別な販売条件",
    content:
      "本サービスは日本国内の事業者および居住者を主な対象としています。法人プランは最低契約期間6か月、初月無料で提供します。",
  },
]

export default function TokushohoPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <div className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground">
            // COMMERCE DISCLOSURE
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            特定商取引法に基づく表記
          </h1>
          <p className="text-sm text-muted-foreground">
            最終更新日：2026年5月17日
          </p>
        </div>

        <div className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
          <dl className="divide-y divide-border">
            {rows.map((row) => (
              <div
                key={row.label}
                className="grid gap-2 py-5 first:pt-0 last:pb-0 md:grid-cols-[200px_1fr] md:gap-6"
              >
                <dt className="text-sm font-semibold text-foreground">
                  {row.label}
                </dt>
                <dd className="text-sm leading-7 text-muted-foreground">
                  {row.content}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="mt-6 text-xs leading-6 text-muted-foreground">
          本ページに記載のない事項については、
          <a
            href="/terms"
            className="text-accent underline-offset-2 hover:underline"
          >
            利用規約・プライバシーポリシー
          </a>
          に従います。
        </p>
      </main>

      <SiteFooter />
    </div>
  )
}
