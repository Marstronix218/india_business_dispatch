"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowLeft,
  ExternalLink,
  Eye,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Send,
  Sparkles,
  Trash2,
} from "lucide-react"
import { toast } from "sonner"
import { ArticleFormDialog } from "@/components/admin/article-form-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useArticles } from "@/lib/article-store"
import {
  CATEGORY_LABELS,
  CATEGORY_OPTIONS,
  INDUSTRY_LABELS,
  MARKET_METRIC_ORDER,
  WORKFLOW_STATUS_LABELS,
  type Category,
  type NewsArticle,
} from "@/lib/news-data"

type StatusTab = "all" | "published" | "review"

const STATUS_TAB_LABELS: Record<StatusTab, string> = {
  all: "すべて",
  published: "公開中",
  review: "要確認",
}

export default function AdminPage() {
  const router = useRouter()
  const articles = useArticles()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all")
  const [statusTab, setStatusTab] = useState<StatusTab>("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isScraping, setIsScraping] = useState(false)
  const [isPublishing, setIsPublishing] = useState<string | null>(null)
  const [isCleaningUp, setIsCleaningUp] = useState(false)

  const counts = useMemo(() => {
    const published = articles.filter((a) => a.workflowStatus === "published").length
    const review = articles.filter((a) => a.workflowStatus === "review").length
    const unsynthesized = articles.filter((a) => a.isSynthesized === false).length
    return { all: articles.length, published, review, unsynthesized }
  }, [articles])

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase()

    return [...articles]
      .filter((article) => {
        const haystack = [article.title, article.summary, ...article.implications]
          .join(" ")
          .toLowerCase()

        const matchesQuery = !query || haystack.includes(query)
        const matchesCategory =
          categoryFilter === "all" || article.category === categoryFilter
        const matchesStatus =
          statusTab === "all" || article.workflowStatus === statusTab

        return matchesQuery && matchesCategory && matchesStatus
      })
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      )
  }, [articles, categoryFilter, search, statusTab])

  function openCreateDialog() {
    setEditingId(null)
    setFormOpen(true)
  }

  function openEditDialog(id: string) {
    setEditingId(id)
    setFormOpen(true)
  }

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`「${title}」を削除しますか？`)) return
    try {
      const response = await fetch(`/api/admin/articles/${id}`, {
        method: "DELETE",
        credentials: "same-origin",
      })
      const data = (await response.json()) as { ok?: boolean; error?: string }
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? `HTTP ${response.status}`)
      }
      toast.success("記事を削除しました。")
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : "不明なエラー"
      toast.error(`削除失敗: ${message}`)
    }
  }

  async function handlePublish(article: NewsArticle) {
    setIsPublishing(article.id)
    try {
      const response = await fetch(`/api/admin/articles/${article.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          workflowStatus: "published",
          visibility: "public",
        }),
      })
      const data = (await response.json()) as { ok?: boolean; error?: string }
      if (!response.ok || !data.ok) {
        throw new Error(data.error ?? `HTTP ${response.status}`)
      }
      toast.success("公開しました。")
      router.refresh()
    } catch (error) {
      const message = error instanceof Error ? error.message : "不明なエラー"
      toast.error(`公開失敗: ${message}`)
    } finally {
      setIsPublishing(null)
    }
  }

  async function handleCleanupUnsynthesized() {
    if (counts.unsynthesized === 0) return
    if (
      !window.confirm(
        `未合成の下書き ${counts.unsynthesized} 件をすべて削除します。よろしいですか？`,
      )
    )
      return
    setIsCleaningUp(true)
    const targets = articles.filter((a) => a.isSynthesized === false)
    let deleted = 0
    let failed = 0
    for (const article of targets) {
      try {
        const response = await fetch(`/api/admin/articles/${article.id}`, {
          method: "DELETE",
          credentials: "same-origin",
        })
        if (response.ok) deleted += 1
        else failed += 1
      } catch {
        failed += 1
      }
    }
    setIsCleaningUp(false)
    if (failed === 0) {
      toast.success(`未合成の下書き ${deleted} 件を削除しました。`)
    } else {
      toast.warning(`削除 ${deleted} 件 / 失敗 ${failed} 件`)
    }
    router.refresh()
  }

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      })
    } catch {
      // ignore
    }
    router.replace("/admin/login")
    router.refresh()
  }

  async function handleRunScrape() {
    setIsScraping(true)
    try {
      const response = await fetch("/api/scrape/python", { method: "POST" })
      const data = (await response.json()) as {
        ok?: boolean
        error?: string
        fetchErrors?: Array<{ connectorId?: string; error?: string }>
        summary?: {
          fetched?: number
          published?: number
          reviewQueue?: number
          failed?: number
        }
      }

      if (!response.ok) throw new Error(data?.error ?? `HTTP ${response.status}`)
      if (!data.ok) throw new Error(data.error ?? "スクレイピング実行に失敗しました")

      const errorCount = Array.isArray(data.fetchErrors) ? data.fetchErrors.length : 0
      if ((data.summary?.fetched ?? 0) === 0) {
        toast.warning(`取得 0件。フィードエラー ${errorCount} 件`)
        return
      }
      toast.success(
        `取得 ${data.summary?.fetched ?? 0} / 公開 ${data.summary?.published ?? 0} / 要確認 ${data.summary?.reviewQueue ?? 0}`,
      )
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "不明なエラーが発生しました"
      toast.error(`スクレイピング失敗: ${message}`)
    } finally {
      setIsScraping(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4" />
              サイトへ戻る
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <h1 className="text-lg font-semibold text-foreground">記事管理</h1>
          </div>

          <div className="flex items-center gap-2">
            <Button onClick={openCreateDialog} size="sm">
              <Plus className="size-4" />
              新規追加
            </Button>
            <Button
              onClick={handleRunScrape}
              variant="outline"
              size="sm"
              disabled={isScraping}
            >
              <RefreshCw className={`size-4 ${isScraping ? "animate-spin" : ""}`} />
              スクレイピング
            </Button>
            <Button onClick={handleLogout} variant="ghost" size="sm">
              <LogOut className="size-4" />
              ログアウト
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
          {(Object.keys(STATUS_TAB_LABELS) as StatusTab[]).map((tab) => {
            const count =
              tab === "all"
                ? counts.all
                : tab === "published"
                  ? counts.published
                  : counts.review
            const isActive = statusTab === tab
            return (
              <button
                key={tab}
                type="button"
                onClick={() => setStatusTab(tab)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-foreground text-background"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary"
                }`}
              >
                {STATUS_TAB_LABELS[tab]}
                <span className="ml-2 text-xs opacity-70">{count}</span>
              </button>
            )
          })}
        </div>

        {counts.unsynthesized > 0 && (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-500/40 bg-amber-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <AlertTriangle className="size-5 shrink-0 text-amber-600" />
              <div className="text-sm">
                <p className="font-medium text-foreground">
                  未合成の下書きが {counts.unsynthesized} 件あります
                </p>
                <p className="text-muted-foreground">
                  LLMで生成されていない古い下書きで、本文・示唆が定型文です。一括削除を推奨します。
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCleanupUnsynthesized}
              disabled={isCleaningUp}
            >
              <Trash2 className="size-4" />
              {isCleaningUp ? "削除中…" : `${counts.unsynthesized} 件を一括削除`}
            </Button>
          </div>
        )}

        <div className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[1.5fr_0.7fr]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="タイトル、要約、示唆で検索"
              className="pl-9"
            />
          </div>

          <Select
            value={categoryFilter}
            onValueChange={(value) => setCategoryFilter(value as Category | "all")}
          >
            <SelectTrigger>
              <SelectValue placeholder="カテゴリ" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべてのカテゴリ</SelectItem>
              {CATEGORY_OPTIONS.map((category) => (
                <SelectItem key={category} value={category}>
                  {CATEGORY_LABELS[category]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
            条件に一致する記事はありません。
          </div>
        ) : (
          <div className="space-y-4">
            {filteredArticles.map((article) => {
              const isReview = article.workflowStatus === "review"
              const isUnsynthesized = article.isSynthesized === false

              return (
                <div
                  key={article.id}
                  className={`flex flex-col gap-4 rounded-3xl border p-5 lg:flex-row lg:items-start lg:justify-between ${
                    isUnsynthesized
                      ? "border-amber-500/40 bg-amber-500/5"
                      : "border-border bg-card"
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant={
                          article.workflowStatus === "published"
                            ? "default"
                            : "outline"
                        }
                        className={
                          article.workflowStatus === "review"
                            ? "border-amber-500/50 text-amber-700"
                            : ""
                        }
                      >
                        {WORKFLOW_STATUS_LABELS[article.workflowStatus]}
                      </Badge>
                      {article.isSynthesized ? (
                        <Badge variant="outline" className="border-emerald-500/50 text-emerald-700">
                          <Sparkles className="size-3" />
                          AI生成
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-500/50 text-amber-700">
                          <AlertTriangle className="size-3" />
                          未合成
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {CATEGORY_LABELS[article.category]}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {article.publishedAt}
                      </span>
                      {article.sourceUrl && (
                        <a
                          href={article.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
                        >
                          <ExternalLink className="size-3" />
                          原文
                        </a>
                      )}
                    </div>

                    <div className="space-y-2">
                      <h2 className="text-lg font-semibold text-foreground">
                        {article.title}
                      </h2>
                      <p className="max-w-3xl line-clamp-3 text-sm leading-7 text-muted-foreground">
                        {article.summary}
                      </p>
                    </div>

                    {article.marketSnapshot && (
                      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                        {MARKET_METRIC_ORDER.map((key) => {
                          const metric = article.marketSnapshot?.[key]
                          if (!metric) return null

                          return (
                            <div
                              key={key}
                              className="rounded-xl border border-border bg-secondary/30 px-3 py-2"
                            >
                              <p className="text-xs font-medium text-foreground">
                                {metric.label}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {metric.value} {metric.unit}
                              </p>
                              <p className="text-xs text-foreground">
                                {metric.change}
                              </p>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {article.industryTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {article.industryTags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {INDUSTRY_LABELS[tag]}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {article.implications.length > 0 && (
                      <ul className="space-y-1 text-sm text-muted-foreground">
                        {article.implications.slice(0, 3).map((implication) => (
                          <li key={implication}>{implication}</li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {isReview && article.isSynthesized && (
                      <Button
                        size="sm"
                        onClick={() => handlePublish(article)}
                        disabled={isPublishing === article.id}
                      >
                        <Send className="size-4" />
                        {isPublishing === article.id ? "公開中…" : "公開する"}
                      </Button>
                    )}
                    {article.workflowStatus === "published" ? (
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/article/${article.id}`}>
                          <Eye className="size-4" />
                          <span className="sr-only">プレビュー</span>
                        </Link>
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" disabled>
                        <Eye className="size-4" />
                        <span className="sr-only">プレビュー不可</span>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(article.id)}
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">編集</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive"
                      onClick={() => handleDelete(article.id, article.title)}
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">削除</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      <ArticleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingId={editingId}
      />
    </div>
  )
}
