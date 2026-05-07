"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-auth"

export function HeaderAuthControls() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const supabase = getSupabaseBrowserClient()
    let active = true

    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      setEmail(data.user?.email ?? null)
      setLoaded(true)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setEmail(session?.user?.email ?? null)
      },
    )

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  async function handleLogout() {
    const supabase = getSupabaseBrowserClient()
    await supabase.auth.signOut()
    router.refresh()
  }

  if (!loaded) {
    return <div className="h-8 w-32" aria-hidden />
  }

  if (email) {
    return (
      <div className="flex items-center gap-2">
        <span
          className="hidden max-w-[12rem] truncate text-xs text-muted-foreground sm:inline"
          title={email}
        >
          {email}
        </span>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          ログアウト
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link href="/login">ログイン</Link>
      </Button>
      <Button asChild variant="outline" size="sm">
        <Link href="/signup">新規登録</Link>
      </Button>
    </div>
  )
}
