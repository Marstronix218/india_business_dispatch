"use client"

import { useState } from "react"
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
import {
  DIGEST_FREQUENCY_LABELS,
  type DigestFrequency,
  type MembershipSignup,
} from "@/lib/site-config"

const EMPTY_SIGNUP: MembershipSignup = {
  companyName: "",
  contactName: "",
  email: "",
  frequency: "weekly",
}

export function MembershipCaptureForm() {
  const [form, setForm] = useState<MembershipSignup>(EMPTY_SIGNUP)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.contactName.trim() || !form.email.trim()) {
      toast.error("担当者名とメールアドレスを入力してください。")
      return
    }

    toast.success("無料会員登録を受け付けました。ダイジェスト配信の案内をお送りします。")
    setForm(EMPTY_SIGNUP)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
        <h3 className="text-lg font-semibold text-foreground">無料会員登録</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          日次または週次のダイジェストを受け取り、法人向けパイロット情報も先行で確認できます。
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="membershipCompany">会社名</Label>
        <Input
          id="membershipCompany"
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
        <Label htmlFor="membershipName">担当者名</Label>
        <Input
          id="membershipName"
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

      <div className="space-y-2">
        <Label htmlFor="membershipEmail">メールアドレス</Label>
        <Input
          id="membershipEmail"
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
        <Label htmlFor="membershipFrequency">配信頻度</Label>
        <Select
          value={form.frequency}
          onValueChange={(value) =>
            setForm((current) => ({
              ...current,
              frequency: value as DigestFrequency,
            }))
          }
        >
          <SelectTrigger id="membershipFrequency" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {(Object.keys(DIGEST_FREQUENCY_LABELS) as DigestFrequency[]).map(
              (frequency) => (
                <SelectItem key={frequency} value={frequency}>
                  {DIGEST_FREQUENCY_LABELS[frequency]}
                </SelectItem>
              ),
            )}
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" className="w-full">
        無料で登録する
      </Button>
    </form>
  )
}
