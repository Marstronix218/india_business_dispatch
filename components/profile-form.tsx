"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { getSupabaseBrowserClient } from "@/lib/supabase/browser-auth"
import { toast } from "sonner"
import Link from "next/link"

interface ProfileFormProps {
  email: string
  fullName: string
}

export function ProfileForm({ email, fullName: initialFullName }: ProfileFormProps) {
  const [fullName, setFullName] = useState(initialFullName)
  const [savingName, setSavingName] = useState(false)

  const [changingPassword, setChangingPassword] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [savingPassword, setSavingPassword] = useState(false)

  async function handleSaveName() {
    if (savingName) return
    setSavingName(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName.trim() },
      })
      if (error) throw error
      toast.success("表示名を保存しました。")
    } catch (error) {
      const message = error instanceof Error ? error.message : "不明なエラー"
      toast.error(`保存失敗: ${message}`)
    } finally {
      setSavingName(false)
    }
  }

  async function handleSavePassword() {
    if (savingPassword) return
    if (newPassword.length < 8) {
      toast.error("パスワードは8文字以上で入力してください。")
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error("パスワードが一致しません。")
      return
    }
    setSavingPassword(true)
    try {
      const supabase = getSupabaseBrowserClient()
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      toast.success("パスワードを変更しました。")
      setNewPassword("")
      setConfirmPassword("")
      setChangingPassword(false)
    } catch (error) {
      const message = error instanceof Error ? error.message : "不明なエラー"
      toast.error(`変更失敗: ${message}`)
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Account info */}
      <section className="space-y-5">
        <h2 className="font-serif text-xl font-bold tracking-tight">アカウント情報</h2>

        <div className="space-y-2">
          <Label htmlFor="email">メールアドレス</Label>
          <Input id="email" type="email" value={email} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">メールアドレスは変更できません。</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">表示名</Label>
          <div className="flex gap-2">
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="例：山田 太郎"
            />
            <Button onClick={handleSaveName} disabled={savingName} className="shrink-0">
              {savingName ? "保存中…" : "保存"}
            </Button>
          </div>
        </div>
      </section>

      <Separator />

      {/* Password change */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl font-bold tracking-tight">パスワード</h2>
          {!changingPassword && (
            <Button variant="outline" size="sm" onClick={() => setChangingPassword(true)}>
              パスワードを変更
            </Button>
          )}
        </div>

        {changingPassword && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">新しいパスワード（8文字以上）</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="新しいパスワード"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">パスワード（確認）</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="同じパスワードを再入力"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSavePassword} disabled={savingPassword}>
                {savingPassword ? "変更中…" : "パスワードを変更する"}
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  setChangingPassword(false)
                  setNewPassword("")
                  setConfirmPassword("")
                }}
              >
                キャンセル
              </Button>
            </div>
          </div>
        )}
      </section>

      <Separator />

      {/* Plan */}
      <section className="space-y-4">
        <h2 className="font-serif text-xl font-bold tracking-tight">プラン</h2>
        <div className="flex items-center justify-between rounded-xl border border-border bg-card px-5 py-4">
          <div>
            <p className="font-semibold">Free（無料）</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              全記事の閲覧、カテゴリフィルター、市況ウィジェット
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href="/pricing">プランを見る</Link>
          </Button>
        </div>
      </section>
    </div>
  )
}
