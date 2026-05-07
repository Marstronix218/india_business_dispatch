"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Eye,
  LogOut,
  Pencil,
  Plus,
  RefreshCw,
  Search,
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
  CONTENT_TYPE_LABELS,
  CONTENT_TYPE_OPTIONS,
  INDUSTRY_LABELS,
  MARKET_METRIC_ORDER,
  VISIBILITY_LABELS,
  WORKFLOW_STATUS_LABELS,
  WORKFLOW_STATUS_OPTIONS,
  type Category,
  type ContentType,
  type WorkflowStatus,
} from "@/lib/news-data"

export default function AdminPage() {
  const router = useRouter()
  const articles = useArticles()
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<Category | "all">("all")
  const [contentTypeFilter, setContentTypeFilter] = useState<
    ContentType | "all"
  >("all")
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | "all">("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isScraping, setIsScraping] = useState(false)

  const filteredArticles = useMemo(() => {
    const query = search.trim().toLowerCase()

    return [...articles]
      .filter((article) => {
        const haystack = [
          article.title,
          article.summary,
          ...article.implications,
        ]
          .join(" ")
          .toLowerCase()

        const matchesQuery = !query || haystack.includes(query)
        const matchesCategory =
          categoryFilter === "all" || article.category === categoryFilter
        const matchesContentType =
          contentTypeFilter === "all" || article.contentType === contentTypeFilter
        const matchesStatus =
          statusFilter === "all" || article.workflowStatus === statusFilter

        return matchesQuery && matchesCategory && matchesContentType && matchesStatus
      })
      .sort((left, right) => {
        return (
          new Date(right.publishedAt).getTime() -
          new Date(left.publishedAt).getTime()
        )
      })
  }, [articles, categoryFilter, contentTypeFilter, search, statusFilter])

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

  async function handleLogout() {
    try {
      await fetch("/api/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      })
    } catch {
      // ignore — redirect anyway
    }
    router.replace("/admin/login")
    router.refresh()
  }

  async function handleRunScrape() {
    setIsScraping(true)

    try {
      const response = await fetch("/api/scrape/python", {
        method: "POST",
      })

      const data = (await response.json()) as {
        ok?: boolean
        error?: string
        warning?: string
        fetchErrors?: Array<{ connectorId?: string; error?: string }>
        summary?: {
          fetched?: number
          published?: number
          reviewQueue?: number
          failed?: number
        }
        result?: {
          published?: Array<Record<string, unknown>>
        }
      }

      if (!response.ok) {
        const serverMessage = data?.error ?? `HTTP ${response.status}`
        throw new Error(serverMessage)
      }

      if (!data.ok) {
        throw new Error(data.error ?? "スクレイピング実行に失敗しました")
      }

      const errorCount = Array.isArray(data.fetchErrors) ? data.fetchErrors.length : 0

      if ((data.summary?.fetched ?? 0) === 0) {
        toast.warning(
          `スクレイピング完了（取得0件）: フィード接続やURL品質判定で除外された可能性があります。取得失敗 ${errorCount}件`,
        )
        return
      }

      toast.success(
        `スクレイピング実行完了: 取得 ${data.summary?.fetched ?? 0}件 / 公開 ${data.summary?.published ?? 0}件 / 取得失敗 ${errorCount}件`,
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
            <div>
              <h1 className="text-lg font-semibold text-foreground">記事管理</h1>
              <p className="text-xs text-muted-foreground">
                500字要約と為替・市況4指標を含む新スキーマを管理
              </p>
            </div>
          </div>

          <Button onClick={openCreateDialog}>
            <Plus className="size-4" />
            新規追加
          </Button>
          <Button
            onClick={handleRunScrape}
            variant="outline"
            disabled={isScraping}
          >
            <RefreshCw className={`size-4 ${isScraping ? "animate-spin" : ""}`} />
            スクレイピング実行
          </Button>
          <Button onClick={handleLogout} variant="ghost" size="sm">
            <LogOut className="size-4" />
            ログアウト
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">登録記事数</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {articles.length}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">公開中</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {articles.filter((article) => article.workflowStatus === "published").length}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-sm text-muted-foreground">レビュー待ち / 失敗</p>
            <p className="mt-2 text-3xl font-semibold text-foreground">
              {
                articles.filter((article) => article.workflowStatus !== "published")
                  .length
              }
            </p>
          </div>
        </div>

        <div className="grid gap-4 rounded-3xl border border-border bg-card p-5 lg:grid-cols-[1.3fr_0.7fr_0.7fr_0.7fr]">
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

          <Select
            value={contentTypeFilter}
            onValueChange={(value) =>
              setContentTypeFilter(value as ContentType | "all")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="種別" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての種別</SelectItem>
              {CONTENT_TYPE_OPTIONS.map((contentType) => (
                <SelectItem key={contentType} value={contentType}>
                  {CONTENT_TYPE_LABELS[contentType]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(value) =>
              setStatusFilter(value as WorkflowStatus | "all")
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="公開状態" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべての状態</SelectItem>
              {WORKFLOW_STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {WORKFLOW_STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4">
          {filteredArticles.map((article) => (
            <div
              key={article.id}
              className="flex flex-col gap-4 rounded-3xl border border-border bg-card p-5 lg:flex-row lg:items-start lg:justify-between"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline">{CATEGORY_LABELS[article.category]}</Badge>
                  <Badge variant="outline">
                    {CONTENT_TYPE_LABELS[article.contentType]}
                  </Badge>
                  <Badge variant="outline">
                    {VISIBILITY_LABELS[article.visibility]}
                  </Badge>
                  <Badge variant="outline">
                    {WORKFLOW_STATUS_LABELS[article.workflowStatus]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {article.publishedAt}
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-lg font-semibold text-foreground">
                    {article.title}
                  </h2>
                  <p className="max-w-3xl line-clamp-4 text-sm leading-7 text-muted-foreground">
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
                          <p className="text-xs text-foreground">{metric.change}</p>
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

                <ul className="space-y-1 text-sm text-muted-foreground">
                  {article.implications.map((implication) => (
                    <li key={implication}>{implication}</li>
                  ))}
                </ul>
              </div>

              <div className="flex shrink-0 items-center gap-2">
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
          ))}
        </div>
      </main>

      <ArticleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingId={editingId}
      />
    </div>
  )
}
