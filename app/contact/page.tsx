import { LeadCaptureForm } from "@/components/lead-capture-form"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { LEAD_TYPE_LABELS, type LeadType } from "@/lib/site-config"

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ leadType?: LeadType }>
}) {
  const params = await searchParams
  const initialLeadType =
    params.leadType && params.leadType in LEAD_TYPE_LABELS
      ? params.leadType
      : "expansion"

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <div className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground">
            // CONTACT
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            お問い合わせ
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            インド進出の検討、人材採用、既進出後の運用課題まで、相談内容をこのページで受け付けます。
          </p>
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <LeadCaptureForm
            initialLeadType={initialLeadType}
            title="インド進出・採用の相談フォーム"
            description="相談種別を選び、状況がわかる範囲で入力してください。"
          />
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
