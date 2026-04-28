import { ArticleStoreProvider } from "@/components/article-store-provider"
import { listAllArticles } from "@/lib/supabase/article-repository"
import { hasSupabaseConfig } from "@/lib/supabase/client"

export const revalidate = 0
export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const initial = hasSupabaseConfig() ? await listAllArticles() : []

  return <ArticleStoreProvider initial={initial}>{children}</ArticleStoreProvider>
}
