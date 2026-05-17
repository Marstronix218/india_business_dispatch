import type { Metadata } from "next"
import type { ReactNode } from "react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "利用規約 | IndoBiz Japan",
  description:
    "IndoBiz Japan の利用規約およびプライバシーポリシーです。",
}

const prohibitedActions = [
  "法令または公序良俗に違反する行為",
  "当サイトまたは第三者の知的財産権を侵害する行為",
  "当サイトの無断転載、複製、再配布、商用利用",
  "サービス運営を妨害する行為",
  "不正アクセス、スクレイピング、システム負荷行為",
  "虚偽情報の登録",
  "その他運営者が不適切と判断する行為",
]

const collectedInformation = [
  "氏名・メールアドレス・所属企業名",
  "問い合わせ内容",
  "IPアドレス・Cookie情報",
  "アクセス履歴・利用端末情報・サービス利用履歴",
]

const usagePurposes = [
  "問い合わせ対応",
  "サービスの提供・改善",
  "会員管理",
  "請求・契約管理",
  "メール配信（メルマガ・通知等）",
  "利用状況の分析",
  "不正利用の防止",
  "法令対応",
]

const thirdPartyDisclosureCases = [
  "本人の同意がある場合",
  "法令に基づく場合",
  "業務委託先に必要範囲で提供する場合",
  "事業承継の場合",
]

function LegalSection({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <section className="space-y-3">
      <h2 className="font-serif text-xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="space-y-3 text-base leading-8 text-muted-foreground">
        {children}
      </div>
    </section>
  )
}

function NumberedList({ items }: { items: string[] }) {
  return (
    <ol className="list-decimal space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ol>
  )
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-2 pl-5">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  )
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <div className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground">
            // TERMS & PRIVACY
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            IndoBiz Japan 利用規約
          </h1>
          <p className="text-xs text-muted-foreground">
            最終更新日：2026年5月16日
          </p>
        </div>

        <div className="mt-8 space-y-10 rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="space-y-3 text-base leading-8 text-muted-foreground">
            <p>
              本利用規約（以下「本規約」といいます。）は、IndoBiz Japan（以下「当サイト」といいます。）が提供するウェブサイト、ニュース配信サービス、関連コンテンツおよび付随サービス（以下総称して「本サービス」といいます。）の利用条件を定めるものです。
            </p>
            <p>
              当サイトを利用するすべての利用者（以下「利用者」といいます。）は、本規約に同意した上で本サービスを利用するものとします。
            </p>
          </div>

          <LegalSection title="第1条（適用）">
            <NumberedList
              items={[
                "本規約は、利用者と当サイト運営者との間の本サービス利用に関する一切の関係に適用されます。",
                "当サイト運営者は、本サービスに関し、本規約のほか個別ルール、ガイドライン、免責事項等を定めることがあります。これらは本規約の一部を構成します。",
                "本規約と個別規定が矛盾する場合、個別規定が優先されます。",
              ]}
            />
          </LegalSection>

          <LegalSection title="第2条（サービス内容）">
            <NumberedList
              items={[
                "当サイトは、インドのビジネス、経済、規制、市場動向等に関する情報提供を目的とします。",
                "掲載記事は、当サイト運営者が複数の公開情報を参照・収集し、独自に編集・作成したものです。参照した情報源は、各記事内に参考記事として明示しています。",
                "当サイトは、情報の正確性、完全性、最新性、有用性を保証するものではありません。",
                "当サイトの情報は一般的参考情報であり、投資、法務、税務、経営判断その他専門判断を直接構成するものではありません。",
              ]}
            />
          </LegalSection>

          <LegalSection title="第3条（禁止事項）">
            <p>利用者は、以下の行為を行ってはなりません。</p>
            <BulletList items={prohibitedActions} />
          </LegalSection>

          <LegalSection title="第4条（知的財産権）">
            <NumberedList
              items={[
                "当サイト上の文章、編集物、デザイン、ロゴ、AI補助生成コンテンツその他著作権・知的財産権は、当サイト運営者に帰属します。",
                "各記事内に明示した参考記事（外部ニュースソース）の権利は、各権利者に帰属します。",
                "利用者は、私的利用または法令上認められる場合を除き、事前許可なく複製、転載、配布、改変してはなりません。",
              ]}
            />
          </LegalSection>

          <LegalSection title="第5条（外部リンク・第三者情報）">
            <NumberedList
              items={[
                "当サイトには第三者サイトへのリンクが含まれる場合があります。",
                "外部サイトの内容、正確性、安全性について当サイトは責任を負いません。",
                "外部サービスの利用は利用者自身の責任で行うものとします。",
              ]}
            />
          </LegalSection>

          <LegalSection title="第6条（免責事項）">
            <NumberedList
              items={[
                "当サイト運営者は、本サービス利用により生じた損害について、故意または重過失がある場合を除き責任を負いません。",
                "情報利用による投資判断、経営判断、契約判断その他一切の結果について、利用者自身が責任を負うものとします。",
                "システム障害、通信障害、外部要因等によるサービス停止・中断・変更について責任を負いません。",
                "当サイトは、著作権・権利侵害の指摘を受けた場合、合理的範囲で速やかに確認・修正・削除対応を行います。",
              ]}
            />
          </LegalSection>

          <LegalSection title="第7条（有料サービス・料金）">
            <NumberedList
              items={[
                "当サイトは、将来的に有料プランを提供する場合があります。料金・内容は別途定める料金表に従います。",
                "支払い済みの利用料金は、法令に定める場合または当サイトが別途定める場合を除き、返金しません。",
                "決済はStripe等の第三者決済サービスを通じて行います。決済サービスの利用には各社の利用規約が適用されます。",
              ]}
            />
          </LegalSection>

          <LegalSection title="第8条（サービス変更・停止）">
            <p>
              当サイト運営者は、事前通知なく本サービス内容の変更、中断、終了を行うことができます。
            </p>
          </LegalSection>

          <LegalSection title="第9条（規約変更）">
            <NumberedList
              items={[
                "当サイト運営者は、必要に応じて本規約を変更できます。",
                "変更後は当サイト上への掲載時点で効力を生じます。",
              ]}
            />
          </LegalSection>

          <LegalSection title="第10条（準拠法・管轄）">
            <NumberedList
              items={[
                "本規約は日本法に準拠します。",
                "本サービスに関する紛争は、運営者所在地を管轄する日本の裁判所を第一審専属的合意管轄裁判所とします。",
              ]}
            />
          </LegalSection>

          <LegalSection title="第11条（運営者情報）">
            <dl className="space-y-2">
              <div>
                <dt className="inline font-semibold text-foreground">運営者名: </dt>
                <dd className="inline">グローバルランチャーズ株式会社</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-foreground">所在地: </dt>
                <dd className="inline">愛知県名古屋市昭和区</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-foreground">
                  お問い合わせ:{" "}
                </dt>
                <dd className="inline">info@g-launchers.com</dd>
              </div>
              <div className="pt-2 text-xs">
                ※特定商取引法に基づく表記は
                <a
                  href="/legal/tokushoho"
                  className="text-accent underline-offset-2 hover:underline"
                >
                  こちら
                </a>
                をご覧ください。
              </div>
            </dl>
          </LegalSection>
        </div>

        <div className="mt-10 space-y-2">
          <div className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground">
            // PRIVACY POLICY
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            IndoBiz Japan プライバシーポリシー
          </h2>
          <p className="text-xs text-muted-foreground">
            最終更新日：2026年5月16日
          </p>
        </div>

        <div className="mt-8 space-y-10 rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
          <p className="text-base leading-8 text-muted-foreground">
            グローバルランチャーズ株式会社（以下「当社」といいます。）は、IndoBiz Japan（以下「当サイト」といいます。）における利用者の個人情報保護を重要視し、個人情報の保護に関する法律（以下「個人情報保護法」といいます。）およびEU一般データ保護規則（GDPR）等の関連法令を踏まえ、以下の方針で情報を管理します。
          </p>

          <LegalSection title="第1条（取得する情報）">
            <p>当サイトは以下の情報を取得する場合があります。</p>
            <BulletList items={collectedInformation} />
          </LegalSection>

          <LegalSection title="第2条（利用目的）">
            <p>取得情報は以下の目的で利用します。</p>
            <BulletList items={usagePurposes} />
          </LegalSection>

          <LegalSection title="第3条（Cookie等の利用）">
            <NumberedList
              items={[
                "当サイトは、利便性向上、アクセス解析、マーケティングのためCookie等を使用する場合があります。",
                "利用者はブラウザ設定によりCookieを制限できます。ただし、一部サービスが利用できなくなる場合があります。",
              ]}
            />
          </LegalSection>

          <LegalSection title="第4条（第三者提供）">
            <p>当社は、以下の場合を除き個人情報を第三者に提供しません。</p>
            <BulletList items={thirdPartyDisclosureCases} />
          </LegalSection>

          <LegalSection title="第5条（外部サービスの利用）">
            <p>
              当サイトは、Google Analytics、決済システム（Stripe等）、メール配信システム等の外部サービスを利用する場合があります。これら第三者サービスの利用には各社のプライバシーポリシーが適用されます。
            </p>
          </LegalSection>

          <LegalSection title="第6条（安全管理）">
            <p>
              当サイトは、個人情報漏洩、改ざん、不正アクセス防止のため合理的な安全管理措置を講じます。
            </p>
          </LegalSection>

          <LegalSection title="第7条（開示・訂正・削除）">
            <p>
              利用者は、法令に基づき自己情報の開示、訂正、削除を求めることができます。
            </p>
          </LegalSection>

          <LegalSection title="第8条（未成年者）">
            <p>
              未成年者が利用する場合、必要に応じ保護者同意を前提とします。
            </p>
          </LegalSection>

          <LegalSection title="第9条（ポリシー変更）">
            <p>
              当サイトは必要に応じて本ポリシーを変更できます。変更後は掲載時点で効力を生じます。
            </p>
          </LegalSection>

          <LegalSection title="第10条（お問い合わせ窓口）">
            <dl className="space-y-2">
              <div>
                <dt className="inline font-semibold text-foreground">運営者: </dt>
                <dd className="inline">グローバルランチャーズ株式会社</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-foreground">所在地: </dt>
                <dd className="inline">愛知県名古屋市昭和区</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-foreground">メール: </dt>
                <dd className="inline">info@g-launchers.com</dd>
              </div>
            </dl>
          </LegalSection>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
