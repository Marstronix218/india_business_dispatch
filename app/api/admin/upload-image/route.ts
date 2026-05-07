import { NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/admin-auth"
import { uploadGeneratedImage } from "@/lib/supabase/image-storage"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const ALLOWED_CONTENT_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

const MAX_BYTES = 8 * 1024 * 1024

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid form data" },
      { status: 400 },
    )
  }

  const file = formData.get("image")
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "image field is required" },
      { status: 400 },
    )
  }

  const extension = ALLOWED_CONTENT_TYPES[file.type]
  if (!extension) {
    return NextResponse.json(
      { ok: false, error: `unsupported content type: ${file.type}` },
      { status: 400 },
    )
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: "file too large (max 8MB)" },
      { status: 400 },
    )
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await uploadGeneratedImage(buffer, {
      contentType: file.type,
      extension,
    })
    return NextResponse.json({ ok: true, url: result.publicUrl, path: result.path })
  } catch (error) {
    const message = error instanceof Error ? error.message : "upload failed"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
