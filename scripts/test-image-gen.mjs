#!/usr/bin/env node
// Smoke-test the OpenAI image gen + Supabase Storage upload path locally,
// without going through Next.js. Mirrors what lib/image-gen/openai-client.ts does.
//
// Usage:  node scripts/test-image-gen.mjs

import { readFileSync } from "node:fs"
import { resolve } from "node:path"

// Load .env.local (no dotenv dependency)
const envPath = resolve(process.cwd(), ".env.local")
for (const line of readFileSync(envPath, "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
  if (!m) continue
  if (process.env[m[1]] === undefined) {
    let val = m[2].trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    process.env[m[1]] = val
  }
}

const provider = (process.env.IMAGE_PROVIDER ?? "openai").toLowerCase()
console.log(`[test] IMAGE_PROVIDER=${provider}`)
if (provider !== "openai") {
  console.error(`[test] IMAGE_PROVIDER must be "openai" for this test. Got: ${provider}`)
  process.exit(1)
}

const required = ["OPENAI_API_KEY", "NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]
for (const k of required) {
  if (!process.env[k]) {
    console.error(`[test] missing env: ${k}`)
    process.exit(1)
  }
}

const model = process.env.OPENAI_IMAGE_MODEL ?? "gpt-image-1-mini"
const size = process.env.OPENAI_IMAGE_SIZE ?? "1024x1024"
const quality = process.env.OPENAI_IMAGE_QUALITY ?? "low"
const format = process.env.OPENAI_IMAGE_FORMAT ?? "jpeg"
const compression = Number(process.env.OPENAI_IMAGE_COMPRESSION ?? 75)
const bucket = process.env.SUPABASE_IMAGE_BUCKET ?? "article-images"

console.log(`[test] model=${model} size=${size} quality=${quality} format=${format} bucket=${bucket}`)

const prompt =
  "A wide editorial photograph of an anonymous Indian semiconductor fabrication facility at dawn, photojournalism style, soft natural lighting, no text, no logos, no brand names, no company signage, no identifiable companies, no recognizable real persons"

console.log(`[test] step 1/2 — calling OpenAI images.generate ...`)
const body = {
  model,
  prompt,
  size,
  quality,
  n: 1,
  output_format: format,
}
if (format !== "png") body.output_compression = compression

const t0 = Date.now()
const oaiRes = await fetch("https://api.openai.com/v1/images/generations", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  },
  body: JSON.stringify(body),
})
const oaiText = await oaiRes.text()
if (!oaiRes.ok) {
  console.error(`[test] OpenAI HTTP ${oaiRes.status}: ${oaiText.slice(0, 500)}`)
  process.exit(2)
}
const oaiJson = JSON.parse(oaiText)
const b64 = oaiJson?.data?.[0]?.b64_json
if (!b64) {
  console.error(`[test] OpenAI response had no b64_json`)
  console.error(JSON.stringify(oaiJson).slice(0, 500))
  process.exit(2)
}
const buf = Buffer.from(b64, "base64")
console.log(`[test] OpenAI OK in ${Date.now() - t0}ms — ${buf.length} bytes`)

console.log(`[test] step 2/2 — uploading to Supabase Storage ...`)
const now = new Date()
const yyyy = now.getUTCFullYear()
const mm = String(now.getUTCMonth() + 1).padStart(2, "0")
const dd = String(now.getUTCDate()).padStart(2, "0")
const ext = format === "jpeg" ? "jpg" : format
const path = `${yyyy}/${mm}/${dd}/${crypto.randomUUID()}.${ext}`
const contentType = format === "png" ? "image/png" : format === "webp" ? "image/webp" : "image/jpeg"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/$/, "")
const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/${bucket}/${path}`, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    "Content-Type": contentType,
    "x-upsert": "false",
    "cache-control": "31536000",
  },
  body: buf,
})
const uploadText = await uploadRes.text()
if (!uploadRes.ok) {
  console.error(`[test] Supabase upload HTTP ${uploadRes.status}: ${uploadText.slice(0, 500)}`)
  process.exit(3)
}

const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
console.log(`[test] OK — uploaded to: ${publicUrl}`)
