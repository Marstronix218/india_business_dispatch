import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PRICING_PLANS } from "@/lib/site-config"

export function PricingSection() {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium uppercase tracking-[0.18em] text-accent">
            Pricing
          </p>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">
            法人パイロットと無料会員の導線を分けた料金設計
          </h2>
          <p className="max-w-3xl text-sm leading-7 text-muted-foreground">
            最初の一か月は無料、最低契約期間は6か月を前提にしています。法人プランは資料請求を主導線にし、無料会員は情報収集フェーズの入口として位置付けています。
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/contact?leadType=expansion">
            導入を相談する
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        {PRICING_PLANS.map((plan) => (
          <Card
            key={plan.id}
            id={plan.id}
            className={plan.featured ? "border-accent shadow-lg shadow-accent/10" : ""}
          >
            <CardHeader className="gap-3">
              <div className="space-y-1">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription>{plan.audience}</CardDescription>
              </div>
              <div className="space-y-1">
                <p className="text-2xl font-semibold text-foreground">
                  {plan.priceLabel}
                </p>
                <p className="text-xs text-muted-foreground">{plan.termLabel}</p>
                {plan.seatsLabel && (
                  <p className="text-xs font-medium text-accent">{plan.seatsLabel}</p>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">
                {plan.summary}
              </p>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-2 text-sm text-foreground"
                  >
                    <Check className="mt-0.5 size-4 text-accent" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                asChild
                className="w-full"
                variant={plan.featured ? "default" : "outline"}
              >
                <Link href={plan.ctaHref}>{plan.ctaLabel}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
