import { NextResponse } from "next/server"
import {
  COMPANY_SIZE_LABELS,
  LEAD_TYPE_LABELS,
  type CompanySize,
  type LeadInquiry,
  type LeadType,
} from "@/lib/site-config"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

const LEAD_RECIPIENT = process.env.LEADS_TO_EMAIL || "info@g-launchers.com"
const LEAD_FROM_EMAIL =
  process.env.LEADS_FROM_EMAIL || "IndoBiz Japan <onboarding@resend.dev>"

type LeadBody = Partial<Record<keyof LeadInquiry, unknown>>

function isLeadType(value: unknown): value is LeadType {
  return typeof value === "string" && value in LEAD_TYPE_LABELS
}

function isCompanySize(value: unknown): value is CompanySize {
  return typeof value === "string" && value in COMPANY_SIZE_LABELS
}

function normalizeString(value: unknown): string {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeLead(body: LeadBody): LeadInquiry | { error: string } {
  const leadType = isLeadType(body.leadType) ? body.leadType : null
  const companySize = isCompanySize(body.companySize) ? body.companySize : null
  const companyName = normalizeString(body.companyName)
  const contactName = normalizeString(body.contactName)
  const email = normalizeString(body.email)
  const message = normalizeString(body.message)

  if (!leadType) return { error: "leadType is required" }
  if (!companySize) return { error: "companySize is required" }
  if (!companyName) return { error: "companyName is required" }
  if (!contactName) return { error: "contactName is required" }
  if (!email) return { error: "email is required" }
  if (!message) return { error: "message is required" }

  return {
    leadType,
    companySize,
    companyName,
    contactName,
    email,
    message,
  }
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

function buildEmail(lead: LeadInquiry) {
  const rows = [
    ["相談種別", LEAD_TYPE_LABELS[lead.leadType]],
    ["会社規模", COMPANY_SIZE_LABELS[lead.companySize]],
    ["会社名", lead.companyName],
    ["担当者名", lead.contactName],
    ["メールアドレス", lead.email],
    ["相談内容", lead.message],
  ] as const

  const text = rows.map(([label, value]) => `${label}: ${value}`).join("\n\n")
  const htmlRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <th style="padding:8px 12px;text-align:left;background:#f5f5f5;border:1px solid #ddd;width:140px;">${escapeHtml(label)}</th>
          <td style="padding:8px 12px;border:1px solid #ddd;white-space:pre-wrap;">${escapeHtml(value)}</td>
        </tr>
      `,
    )
    .join("")

  return {
    subject: `【IndoBiz Japan】${LEAD_TYPE_LABELS[lead.leadType]} - ${lead.companyName}`,
    text,
    html: `<table style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px;">${htmlRows}</table>`,
  }
}

async function sendLeadEmail(lead: LeadInquiry) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured")
  }

  const email = buildEmail(lead)
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: LEAD_FROM_EMAIL,
      to: [LEAD_RECIPIENT],
      reply_to: lead.email,
      subject: email.subject,
      text: email.text,
      html: email.html,
    }),
  })

  if (!response.ok) {
    throw new Error(await response.text())
  }
}

export async function POST(request: Request) {
  let body: LeadBody
  try {
    body = (await request.json()) as LeadBody
  } catch {
    return NextResponse.json({ ok: false, error: "invalid json" }, { status: 400 })
  }

  const lead = normalizeLead(body)
  if ("error" in lead) {
    return NextResponse.json({ ok: false, error: lead.error }, { status: 400 })
  }

  try {
    await sendLeadEmail(lead)
  } catch (error) {
    console.error("Failed to send lead email", error)
    return NextResponse.json({ ok: false, error: "email send failed" }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
