import { MembershipCaptureForm } from "@/components/membership-capture-form"
import { PricingSection } from "@/components/pricing-section"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-2">
          <div className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground">
            // PRICING
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            価格
          </h1>
          <p className="max-w-3xl text-base leading-8 text-muted-foreground">
            法人パイロットの料金イメージと、無料会員登録の入口をこのページにまとめています。
          </p>
        </div>

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
