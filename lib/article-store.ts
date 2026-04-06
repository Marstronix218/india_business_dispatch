"use client"

import { useSyncExternalStore, useCallback } from "react"
import { NEWS_ARTICLES, type NewsArticle } from "./news-data"

// Simple external store for articles so admin edits propagate to the news list
let articles: NewsArticle[] = [...NEWS_ARTICLES]
let listeners: Set<() => void> = new Set()

function emitChange() {
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function getSnapshot() {
  return articles
}

export function addArticle(article: NewsArticle) {
  articles = [article, ...articles]
  emitChange()
}

export function updateArticle(id: string, updated: Partial<NewsArticle>) {
  articles = articles.map((a) => (a.id === id ? { ...a, ...updated } : a))
  emitChange()
}

export function deleteArticle(id: string) {
  articles = articles.filter((a) => a.id !== id)
  emitChange()
}

export function getArticleById(id: string) {
  return articles.find((a) => a.id === id)
}

export function useArticles() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}

export function useNextId() {
  const articles = useArticles()
  return useCallback(() => {
    const maxId = articles.reduce(
      (max, a) => Math.max(max, parseInt(a.id, 10) || 0),
      0
    )
    return String(maxId + 1)
  }, [articles])
}
