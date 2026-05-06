import { getServiceClient } from "./client"

const DEFAULT_BUCKET = "article-images"

export interface UploadResult {
  publicUrl: string
  path: string
}

export async function uploadGeneratedImage(
  body: Buffer | Uint8Array,
  opts: { contentType: string; extension: string },
): Promise<UploadResult> {
  const bucket = process.env.SUPABASE_IMAGE_BUCKET ?? DEFAULT_BUCKET
  const client = getServiceClient()

  const now = new Date()
  const yyyy = now.getUTCFullYear()
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0")
  const dd = String(now.getUTCDate()).padStart(2, "0")
  const path = `${yyyy}/${mm}/${dd}/${crypto.randomUUID()}.${opts.extension}`

  const { error: uploadError } = await client.storage
    .from(bucket)
    .upload(path, body, {
      contentType: opts.contentType,
      cacheControl: "31536000",
      upsert: false,
    })

  if (uploadError) {
    throw new Error(`Supabase Storage upload失敗 (bucket=${bucket}): ${uploadError.message}`)
  }

  const { data } = client.storage.from(bucket).getPublicUrl(path)
  if (!data?.publicUrl) {
    throw new Error("Supabase Storage publicUrlの取得に失敗")
  }

  return { publicUrl: data.publicUrl, path }
}
