import { createClient, type SupabaseClient } from "@supabase/supabase-js"

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`環境変数 ${name} が設定されていません`)
  return value
}

let cachedAnon: SupabaseClient | null = null
let cachedService: SupabaseClient | null = null

export function getAnonClient(): SupabaseClient {
  if (cachedAnon) return cachedAnon
  cachedAnon = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    { auth: { persistSession: false } },
  )
  return cachedAnon
}

export function getServiceClient(): SupabaseClient {
  if (cachedService) return cachedService
  cachedService = createClient(
    requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    { auth: { persistSession: false } },
  )
  return cachedService
}

export function hasSupabaseConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  )
}
