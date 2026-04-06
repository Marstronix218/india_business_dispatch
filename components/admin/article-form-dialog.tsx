"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CATEGORY_LABELS, type Category } from "@/lib/news-data"
import {
  addArticle,
  updateArticle,
  getArticleById,
  useNextId,
} from "@/lib/article-store"
import { toast } from "sonner"

interface ArticleFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingId: string | null
}

const EMPTY_FORM = {
  title: "",
  summary: "",
  category: "economy" as Category,
  date: new Date().toISOString().slice(0, 10),
  source: "",
  sourceUrl: "",
  body: "",
  interpretation: "",
  isBreaking: false,
}

export function ArticleFormDialog({
  open,
  onOpenChange,
  editingId,
}: ArticleFormDialogProps) {
  const [form, setForm] = useState(EMPTY_FORM)
  const getNextId = useNextId()

  const isEditing = editingId !== null

  useEffect(() => {
    if (open && editingId) {
      const article = getArticleById(editingId)
      if (article) {
        setForm({
          title: article.title,
          summary: article.summary,
          category: article.category,
          date: article.date,
          source: article.source,
          sourceUrl: article.sourceUrl || "",
          body: article.body,
          interpretation: article.interpretation || "",
          isBreaking: article.isBreaking || false,
        })
      }
    } else if (open && !editingId) {
      setForm({
        ...EMPTY_FORM,
        date: new Date().toISOString().slice(0, 10),
      })
    }
  }, [open, editingId])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!form.title.trim() || !form.summary.trim() || !form.body.trim()) {
      toast.error("タイトル、要約、本文は必須です")
      return
    }

    if (isEditing && editingId) {
      updateArticle(editingId, {
        ...form,
        sourceUrl: form.sourceUrl || undefined,
        interpretation: form.interpretation || undefined,
      })
      toast.success("記事を更新しました")
    } else {
      addArticle({
        ...form,
        id: getNextId(),
        sourceUrl: form.sourceUrl || undefined,
        interpretation: form.interpretation || undefined,
      })
      toast.success("記事を作成しました")
    }

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {isEditing ? "記事を編集" : "新規記事を作成"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-2">
          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="title">
              {"タイトル"}
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Input
              id="title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="記事のタイトルを入力..."
            />
          </div>

          {/* Summary */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="summary">
              {"要約"}
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Textarea
              id="summary"
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              placeholder="1-2行の記事要約..."
              className="min-h-20"
            />
          </div>

          {/* Category + Date row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label>{"カテゴリ"}</Label>
              <Select
                value={form.category}
                onValueChange={(v) =>
                  setForm({ ...form, category: v as Category })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {CATEGORY_LABELS[cat]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="date">{"公開日"}</Label>
              <Input
                id="date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>

          {/* Source + Source URL row */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="source">{"出典名"}</Label>
              <Input
                id="source"
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                placeholder="例: Reuters, 編集部"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="sourceUrl">{"出典URL"}</Label>
              <Input
                id="sourceUrl"
                type="url"
                value={form.sourceUrl}
                onChange={(e) => setForm({ ...form, sourceUrl: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          {/* Body */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="body">
              {"本文"}
              <span className="text-destructive ml-1">*</span>
            </Label>
            <Textarea
              id="body"
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              placeholder="段落は空行で区切ってください..."
              className="min-h-40"
            />
          </div>

          {/* Interpretation */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="interpretation">
              {"日本企業への示唆（任意）"}
            </Label>
            <Textarea
              id="interpretation"
              value={form.interpretation}
              onChange={(e) =>
                setForm({ ...form, interpretation: e.target.value })
              }
              placeholder="この記事が日本企業にどう影響するか..."
              className="min-h-20"
            />
          </div>

          {/* Breaking toggle */}
          <div className="flex items-center gap-3">
            <Switch
              id="isBreaking"
              checked={form.isBreaking}
              onCheckedChange={(checked) =>
                setForm({ ...form, isBreaking: checked })
              }
            />
            <Label htmlFor="isBreaking">{"速報としてマークする"}</Label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {"キャンセル"}
            </Button>
            <Button type="submit">
              {isEditing ? "更新する" : "公開する"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
