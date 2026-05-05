import type { Metadata } from "next"
import type { ReactNode } from "react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export const metadata: Metadata = {
  title: "利用規約 | India Business Dispatch",
  description:
    "India Business Dispatch の利用規約およびプライバシーポリシーです。",
}

const prohibitedActions = [
  "法令または公序良俗に違反する行為",
  "当サイトまたは第三者の知的財産権を侵害する行為",
  "当サイトの無断転載、複製、再配布、商用利用",
  "サービス運営を妨害する行為",
  "不正アクセス、スクレイピング、システム負荷行為",
  "虚偽情報登録",
  "その他運営者が不適切と判断する行為",
]

const collectedInformation = [
  "氏名",
  "メールアドレス",
  "所属企業名",
  "問い合わせ内容",
  "IPアドレス",
  "Cookie情報",
  "アクセス履歴",
  "利用端末情報",
  "サービス利用履歴",
]

const usagePurposes = [
  "問い合わせ対応",
  "サービス提供・改善",
  "会員管理",
  "請求・契約管理",
  "メール配信",
  "利用分析",
  "不正利用防止",
  "法令対応",
]

const thirdPartyDisclosureCases = [
  "本人同意がある場合",
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
      <div className="space-y-3 text-sm leading-8 text-muted-foreground">
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
            India Business Dispatch 利用規約
          </h1>
          <p className="text-sm text-muted-foreground">
            最終更新日：2026年5月5日
          </p>
        </div>

        <div className="mt-8 space-y-10 rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
          <div className="space-y-3 text-sm leading-8 text-muted-foreground">
            <p>
              本利用規約（以下「本規約」といいます。）は、India Business
              Dispatch（以下「当サイト」といいます。）が提供するウェブサイト、ニュース配信サービス、関連コンテンツおよび付随サービス（以下総称して「本サービス」といいます。）の利用条件を定めるものです。
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
                "掲載情報は、公開情報、第三者情報源、AI生成補助、独自編集等を通じて作成されます。",
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
                "当サイト上の文章、編集物、デザイン、ロゴ、AI生成コンテンツその他の著作権・知的財産権は、当サイト運営者または正当な権利者に帰属します。",
                "外部ニュースソース、引用元記事、商標、画像等の権利は各権利者に帰属します。",
                "利用者は、私的利用または法令上認められる場合を除き、事前許可なく複製、転載、配布、改変してはなりません。",
              ]}
            />
          </LegalSection>

          <LegalSection title="第5条（外部リンク・第三者情報）">
            <NumberedList
              items={[
                "当サイトには第三者サイトへのリンクが含まれる場合があります。",
                "外部サイトの内容、正確性、安全性について当サイトは責任を負いません。",
                "外部サービス利用は利用者自身の責任で行うものとします。",
              ]}
            />
          </LegalSection>

          <LegalSection title="第6条（免責事項）">
            <NumberedList
              items={[
                "当サイト運営者は、本サービス利用により生じた損害について、故意または重過失がある場合を除き責任を負いません。",
                "情報利用による投資判断、経営判断、契約判断その他一切の結果について利用者自身が責任を負うものとします。",
                "システム障害、通信障害、外部要因等によるサービス停止・中断・変更について責任を負いません。",
                "当サイトは、著作権・権利侵害の指摘を受けた場合、合理的範囲で速やかに確認・修正・削除対応を行います。",
              ]}
            />
          </LegalSection>

          <LegalSection title="第7条（サービス変更・停止）">
            <p>
              当サイト運営者は、事前通知なく本サービス内容の変更、中断、終了を行うことができます。
            </p>
          </LegalSection>

          <LegalSection title="第8条（規約変更）">
            <NumberedList
              items={[
                "当サイト運営者は、必要に応じて本規約を変更できます。",
                "変更後は当サイト上への掲載時点で効力を生じます。",
              ]}
            />
          </LegalSection>

          <LegalSection title="第9条（準拠法・管轄）">
            <NumberedList
              items={[
                "本規約は日本法に準拠します。",
                "本サービスに関する紛争は、運営者所在地を管轄する日本の裁判所を第一審専属的合意管轄裁判所とします。",
              ]}
            />
          </LegalSection>

          <LegalSection title="第10条（運営者情報）">
            <dl className="space-y-2">
              <div>
                <dt className="inline font-semibold text-foreground">運営者名: </dt>
                <dd className="inline">
                  Global Launchers / Capital Launchers（正式法人名に応じて修正）
                </dd>
              </div>
              <div>
                <dt className="inline font-semibold text-foreground">所在地: </dt>
                <dd className="inline">愛知県名古屋市（正式住所を記載）</dd>
              </div>
              <div>
                <dt className="inline font-semibold text-foreground">
                  お問い合わせ先:{" "}
                </dt>
                <dd className="inline">（問い合わせ用メールアドレス）</dd>
              </div>
            </dl>
          </LegalSection>
        </div>

        <div className="mt-10 space-y-2">
          <div className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground">
            // PRIVACY POLICY
          </div>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            India Business Dispatch プライバシーポリシー
          </h2>
          <p className="text-sm text-muted-foreground">
            最終更新日：2026年5月5日
          </p>
        </div>

        <div className="mt-8 space-y-10 rounded-lg border border-border bg-card p-6 shadow-sm md:p-8">
          <p className="text-sm leading-8 text-muted-foreground">
            当サイトは、利用者の個人情報保護を重要視し、関連法令（個人情報保護法、GDPR等必要に応じて）を踏まえ、以下の方針で情報を管理します。
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
                "当サイトは利便性向上、アクセス解析、マーケティングのためCookie等を使用する場合があります。",
                "利用者はブラウザ設定によりCookieを制限できます。",
              ]}
            />
          </LegalSection>

          <LegalSection title="第4条（第三者提供）">
            <p>当サイトは、以下の場合を除き個人情報を第三者提供しません。</p>
            <BulletList items={thirdPartyDisclosureCases} />
          </LegalSection>

          <LegalSection title="第5条（外部サービス）">
            <p>
              当サイトは、Google
              Analytics、決済システム、メール配信システム等外部サービスを利用する場合があります。これら第三者サービスの利用には各社ポリシーが適用されます。
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
            <p>個人情報に関する問い合わせ先：</p>
            <dl className="space-y-2">
              <div>
                <dt className="inline font-semibold text-foreground">運営者: </dt>
                <dd className="inline">Global Launchers / Capital Launchers</dd>
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
