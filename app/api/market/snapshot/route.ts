import { NextResponse } from "next/server"
import { fetchMarketSnapshot } from "@/lib/market-data"

export const revalidate = 300

export async function GET() {
  const snapshot = await fetchMarketSnapshot()
  if (!snapshot) {
    return NextResponse.json(
      { error: "fetch_failed" },
      {
        status: 502,
        headers: { "Cache-Control": "no-store" },
      },
    )
  }
  return NextResponse.json(snapshot, {
    headers: {
      "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600",
    },
  })
}
