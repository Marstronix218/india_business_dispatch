import { LeadCaptureForm } from "@/components/lead-capture-form"
import { SiteFooter } from "@/components/site-footer"
import { SitePageHeader } from "@/components/site-page-header"
import { type LeadType } from "@/lib/site-config"

export default async function ContactPage({
  searchParams,
}: {
  searchParams: Promise<{ leadType?: LeadType }>
}) {
  const params = await searchParams
  const initialLeadType = params.leadType === "hiring" ? "hiring" : "expansion"

  return (
    <div className="min-h-screen bg-background">
      <SitePageHeader
        title="お問い合わせ"
        description="インド進出の検討、人材採用、既進出後の運用課題まで、相談内容をこのページで受け付けます。"
      />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8">
          <LeadCaptureForm
            initialLeadType={initialLeadType}
            title="インド進出・採用の相談フォーム"
            description="進出相談か採用相談かを選び、状況がわかる範囲で入力してください。"
          />
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
