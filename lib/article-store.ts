"use client"

import { useCallback, useEffect, useSyncExternalStore } from "react"
import { NEWS_ARTICLES, type NewsArticle } from "./news-data"

let articles: NewsArticle[] = [...NEWS_ARTICLES]
let hydrated = false
const listeners = new Set<() => void>()

function emitChange() {
  listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return articles
}

function getNumericSuffix(id: string) {
  const match = id.match(/(\d+)$/)
  return match ? Number.parseInt(match[1], 10) : 0
}

export function hydrateArticles(next: NewsArticle[]) {
  articles = [...next]
  hydrated = true
  emitChange()
}

export function isHydrated() {
  return hydrated
}

export function addArticle(article: NewsArticle) {
  articles = [article, ...articles]
  emitChange()
}

export type ImportedArticle = Omit<NewsArticle, "id">

export function importArticles(imported: ImportedArticle[]) {
  const existingKeys = new Set(
    articles.map((article) => `${article.title}::${article.publishedAt}`),
  )
  let nextId = articles.reduce((max, article) => {
    return Math.max(max, getNumericSuffix(article.id))
  }, 0)

  const merged: NewsArticle[] = []

  imported.forEach((candidate) => {
    const dedupeKey = `${candidate.title}::${candidate.publishedAt}`
    if (existingKeys.has(dedupeKey)) {
      return
    }

    nextId += 1
    existingKeys.add(dedupeKey)
    merged.push({
      id: String(nextId),
      ...candidate,
    })
  })

  if (merged.length === 0) {
    return []
  }

  articles = [...merged, ...articles]
  emitChange()

  return merged
}

export function updateArticle(id: string, updated: Partial<NewsArticle>) {
  articles = articles.map((article) =>
    article.id === id ? { ...article, ...updated } : article,
  )
  emitChange()
}

export function deleteArticle(id: string) {
  articles = articles.filter((article) => article.id !== id)
  emitChange()
}

export function getArticleById(id: string) {
  return articles.find((article) => article.id === id)
}

export function useArticles() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function usePublicArticles() {
  const allArticles = useArticles()
  return allArticles.filter((article) => article.workflowStatus === "published")
}

export function useNextId() {
  const currentArticles = useArticles()

  return useCallback(() => {
    const maxId = currentArticles.reduce((max, article) => {
      return Math.max(max, getNumericSuffix(article.id))
    }, 0)

    return String(maxId + 1)
  }, [currentArticles])
}

export function useHydrateArticles(initial: NewsArticle[] | undefined) {
  useEffect(() => {
    if (!initial) return
    hydrateArticles(initial)
  }, [initial])
}
