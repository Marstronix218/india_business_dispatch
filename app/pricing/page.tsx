import { MembershipCaptureForm } from "@/components/membership-capture-form"
import { PricingSection } from "@/components/pricing-section"
import { SiteFooter } from "@/components/site-footer"
import { SitePageHeader } from "@/components/site-page-header"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SitePageHeader
        title="価格"
        description="法人パイロットの料金イメージと、無料会員登録の入口をこのページにまとめています。"
      />

      <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <PricingSection />

        <section
          id="free-member"
          className="mx-auto max-w-3xl rounded-3xl border border-border bg-card p-6 shadow-sm md:p-8"
        >
          <MembershipCaptureForm />
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
