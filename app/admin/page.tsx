"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus, Pencil, Trash2, Eye, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { CATEGORY_LABELS, type Category } from "@/lib/news-data"
import { useArticles, deleteArticle } from "@/lib/article-store"
import { Toaster, toast } from "sonner"
import { ArticleFormDialog } from "@/components/admin/article-form-dialog"

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`
}

export default function AdminPage() {
  const articles = useArticles()
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState<Category | "all">("all")
  const [formOpen, setFormOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const filtered = articles.filter((a) => {
    const matchesSearch =
      !search.trim() ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase())
    const matchesCategory =
      filterCategory === "all" || a.category === filterCategory
    return matchesSearch && matchesCategory
  })

  function handleDelete(id: string, title: string) {
    if (window.confirm(`「${title}」を削除しますか？`)) {
      deleteArticle(id)
      toast.success("記事を削除しました")
    }
  }

  function handleEdit(id: string) {
    setEditingId(id)
    setFormOpen(true)
  }

  function handleCreate() {
    setEditingId(null)
    setFormOpen(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Toaster position="top-right" richColors />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b border-border">
        <div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">{"サイトに戻る"}</span>
            </Link>
            <Separator orientation="vertical" className="h-5" />
            <h1 className="text-base font-bold text-foreground">
              {"記事管理"}
            </h1>
          </div>
          <Button size="sm" onClick={handleCreate}>
            <Plus className="size-4 mr-1" />
            {"新規記事"}
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6">
        {/* Filters */}
        <div className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="記事を検索..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => setFilterCategory("all")}
              className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                filterCategory === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {"全て"}
            </button>
            {(Object.keys(CATEGORY_LABELS) as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`shrink-0 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  filterCategory === cat
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {CATEGORY_LABELS[cat]}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
          <span>
            {"全 "}
            {articles.length}
            {" 件"}
          </span>
          {filtered.length !== articles.length && (
            <span>
              {"（表示: "}
              {filtered.length}
              {" 件）"}
            </span>
          )}
        </div>

        {/* Article list */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {filtered.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              {"該当する記事がありません"}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filtered.map((article) => (
                <div
                  key={article.id}
                  className="flex items-start gap-4 p-4 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge
                        variant="outline"
                        className="text-[10px] shrink-0"
                      >
                        {CATEGORY_LABELS[article.category]}
                      </Badge>
                      {article.isBreaking && (
                        <Badge className="bg-accent text-accent-foreground text-[10px]">
                          {"速報"}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDate(article.date)}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground leading-snug mb-1 line-clamp-2">
                      {article.title}
                    </h3>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {article.summary}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                      <span>
                        {"出典: "}
                        {article.source}
                      </span>
                      {article.sourceUrl && (
                        <a
                          href={article.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-accent hover:underline"
                        >
                          {"(リンク)"}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Link href={`/article/${article.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="size-8 p-0 text-muted-foreground"
                      >
                        <Eye className="size-4" />
                        <span className="sr-only">{"プレビュー"}</span>
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-8 p-0 text-muted-foreground"
                      onClick={() => handleEdit(article.id)}
                    >
                      <Pencil className="size-4" />
                      <span className="sr-only">{"編集"}</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-8 p-0 text-destructive"
                      onClick={() => handleDelete(article.id, article.title)}
                    >
                      <Trash2 className="size-4" />
                      <span className="sr-only">{"削除"}</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
