import { redirect } from "next/navigation"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { ProfileForm } from "@/components/profile-form"
import { getSessionUser } from "@/lib/supabase/server-auth"

export const metadata = {
  title: "マイページ | IndoBiz Japan",
}

export default async function ProfilePage() {
  const user = await getSessionUser()
  if (!user) {
    redirect("/login?next=/profile")
  }

  const email = user.email ?? ""
  const fullName = (user.user_metadata?.full_name as string | undefined) ?? ""

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 space-y-1">
          <div className="font-mono text-[11px] tracking-[0.22em] text-muted-foreground">
            // MY PAGE
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight">マイページ</h1>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm md:p-8">
          <ProfileForm email={email} fullName={fullName} />
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
