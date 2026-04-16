"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  COMPANY_SIZE_LABELS,
  LEAD_TYPE_LABELS,
  type CompanySize,
  type LeadInquiry,
  type LeadType,
} from "@/lib/site-config"

interface LeadCaptureFormProps {
  initialLeadType?: LeadType
  title?: string
  description?: string
  compact?: boolean
}

const EMPTY_INQUIRY: LeadInquiry = {
  leadType: "expansion",
  companyName: "",
  contactName: "",
  email: "",
  companySize: "under_50",
  message: "",
}

export function LeadCaptureForm({
  initialLeadType = "expansion",
  title = "インド進出・採用の相談フォーム",
  description = "記事詳細、価格ページ、ヘッダーのCTAからこのフォームへ遷移します。",
  compact = false,
}: LeadCaptureFormProps) {
  const [form, setForm] = useState<LeadInquiry>({
    ...EMPTY_INQUIRY,
    leadType: initialLeadType,
  })

  useEffect(() => {
    setForm((current) => ({ ...current, leadType: initialLeadType }))
  }, [initialLeadType])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (
      !form.companyName.trim() ||
      !form.contactName.trim() ||
      !form.email.trim() ||
      !form.message.trim()
    ) {
      toast.error("会社名・担当者名・メールアドレス・相談内容を入力してください。")
      return
    }

    toast.success("お問い合わせを受け付けました。24時間以内を目安にご連絡します。")
    setForm({
      ...EMPTY_INQUIRY,
      leadType: form.leadType,
    })
  }

  const messagePlaceholder =
    form.leadType === "expansion"
      ? "想定時期、検討中の州、事業テーマ、必要な調査内容を入力してください。"
      : "採用したい職種、採用人数、現地採用か駐在採用か、課題を入力してください。"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>

      <div className={`grid gap-4 ${compact ? "grid-cols-1" : "md:grid-cols-2"}`}>
        <div className="space-y-2">
          <Label htmlFor="leadType">相談種別</Label>
          <Select
            value={form.leadType}
            onValueChange={(value) =>
              setForm((current) => ({
                ...current,
                leadType: value as LeadType,
              }))
            }
          >
            <SelectTrigger id="leadType" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(LEAD_TYPE_LABELS) as LeadType[]).map((type) => (
                <SelectItem key={type} value={type}>
                  {LEAD_TYPE_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="companySize">会社規模</Label>
          <Select
            value={form.companySize}
            onValueChange={(value) =>
              setForm((current) => ({
                ...current,
                companySize: value as CompanySize,
              }))
            }
          >
            <SelectTrigger id="companySize" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(COMPANY_SIZE_LABELS) as CompanySize[]).map((size) => (
                <SelectItem key={size} value={size}>
                  {COMPANY_SIZE_LABELS[size]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className={`grid gap-4 ${compact ? "grid-cols-1" : "md:grid-cols-2"}`}>
        <div className="space-y-2">
          <Label htmlFor="companyName">会社名</Label>
          <Input
            id="companyName"
            value={form.companyName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                companyName: event.target.value,
              }))
            }
            placeholder="株式会社サンプル"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactName">担当者名</Label>
          <Input
            id="contactName"
            value={form.contactName}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                contactName: event.target.value,
              }))
            }
            placeholder="山田 太郎"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">メールアドレス</Label>
        <Input
          id="email"
          type="email"
          value={form.email}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              email: event.target.value,
            }))
          }
          placeholder="name@company.co.jp"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">相談内容</Label>
        <Textarea
          id="message"
          value={form.message}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              message: event.target.value,
            }))
          }
          placeholder={messagePlaceholder}
          className="min-h-32"
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs leading-relaxed text-muted-foreground">
          最低6か月の法人パイロットを前提に、初月無料の想定でご案内します。
        </p>
        <Button type="submit">相談内容を送信</Button>
      </div>
    </form>
  )
}
