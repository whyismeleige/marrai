'use client'

// src/app/dashboard/pages/page.tsx
import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  Plus, RefreshCw, Trash2, Loader2, ArrowUpDown,
  Globe, AlertCircle, CheckCircle2, Clock, ChevronRight,
  Zap, FileSearch, XCircle,
} from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import type { BrandPage, PageStatus } from '@/lib/mongodb'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreBg(score?: number) {
  if (score === undefined) return 'bg-muted text-muted-foreground'
  if (score >= 70) return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
  if (score >= 45) return 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
  return 'bg-red-500/10 text-red-600 dark:text-red-400'
}

function statusIcon(status: PageStatus) {
  if (status === 'auditing')   return <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
  if (status === 'good')       return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
  if (status === 'critical')   return <AlertCircle className="h-3.5 w-3.5 text-red-500" />
  if (status === 'needs_work') return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
  if (status === 'failed')     return <XCircle className="h-3.5 w-3.5 text-red-400" />
  return <Clock className="h-3.5 w-3.5 text-muted-foreground" />
}

function getDomain(url: string) {
  try { return new URL(url).hostname.replace(/^www\./, '') } catch { return url }
}

// ─── Add Page Modal ───────────────────────────────────────────────────────────

function AddPageModal({
  onClose,
  onAdded,
}: {
  onClose: () => void
  onAdded: () => void
}) {
  const [url, setUrl] = useState('')
  const [label, setLabel] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    setError('')
    const trimmed = url.trim()
    if (!trimmed) { setError('URL is required'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', url: trimmed, label: label.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to add page'); setLoading(false); return }

      toast.success('Page added successfully!')
      onAdded()
      onClose()
    } catch {
      setError('Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm px-4 pb-4 sm:pb-0"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="surface-card w-full max-w-md rounded-2xl p-6 shadow-2xl">
        <h3 className="text-base font-semibold text-foreground mb-1">Add a page</h3>
        <p className="text-xs text-muted-foreground mb-5">
          Enter the full URL of any page you want to track and audit.
        </p>

        <label className="block text-xs font-medium text-muted-foreground mb-1.5">URL</label>
        <input
          autoFocus
          type="url"
          placeholder="https://yoursite.com/about"
          value={url}
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          className={cn(
            'w-full h-10 px-3 rounded-xl border bg-input text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring transition mb-3',
            error ? 'border-destructive' : 'border-border'
          )}
        />

        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Label <span className="font-normal">(optional)</span>
        </label>
        <input
          type="text"
          placeholder="Homepage, Pricing page…"
          value={label}
          onChange={e => setLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          className="w-full h-10 px-3 rounded-xl border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition mb-1"
        />
        {error && <p className="text-xs text-destructive mt-2 mb-1">{error}</p>}

        <div className="flex gap-2 mt-4">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={loading}
            className="btn-primary flex-1 h-10 text-sm disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Add Page'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PagesPage() {
  const [pages, setPages] = useState<BrandPage[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [sortAsc, setSortAsc] = useState(false)
  const [auditingId, setAuditingId] = useState<string | null>(null)
  const [auditingAll, setAuditingAll] = useState(false)

  // Track which pages were auditing before the last fetch so we can detect
  // auditing → failed transitions and fire a toast for each one.
  const prevAuditingRef = useRef<Set<string>>(new Set())

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch('/api/pages')
      const data = await res.json()
      const newPages: BrandPage[] = data.pages ?? []

      // Detect auditing → failed transitions
      newPages.forEach(p => {
        const id = (p._id as any).toString()
        if (p.status === 'failed' && prevAuditingRef.current.has(id)) {
          const label = p.label || getDomain(p.url)
          const msg = (p as any).errorMessage || 'Could not reach the website'
          toast.error(`Audit failed for "${label}" — ${msg}`, { duration: 6000 })
        }
      })

      // Update ref with the current set of auditing IDs
      prevAuditingRef.current = new Set(
        newPages
          .filter(p => p.status === 'auditing')
          .map(p => (p._id as any).toString())
      )

      setPages(newPages)
    } catch {
      // Silently fail — user still sees stale data
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchPages() }, [fetchPages])

  // Poll while any page is auditing
  useEffect(() => {
    const hasAuditing = pages.some(p => p.status === 'auditing')
    if (!hasAuditing) return
    const timer = setTimeout(fetchPages, 3000)
    return () => clearTimeout(timer)
  }, [pages, fetchPages])

  async function auditPage(id: string) {
    setAuditingId(id)
    const toastId = toast.loading('Starting audit…')
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'audit', pageId: id }),
      })
      if (!res.ok) throw new Error()
      // Mark this page as auditing in our ref so the transition detection works
      prevAuditingRef.current.add(id)
      toast.success('Audit started — results will appear shortly', { id: toastId })
      await fetchPages()
    } catch {
      toast.error('Failed to start audit. Try again.', { id: toastId })
    }
    setAuditingId(null)
  }

  async function auditAll() {
    setAuditingAll(true)
    const toastId = toast.loading(`Auditing all ${pages.length} pages…`)
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'audit_all' }),
      })
      const data = await res.json()
      toast.success(`Audit started for ${data.started} pages`, { id: toastId })
      await fetchPages()
    } catch {
      toast.error('Failed to start bulk audit. Try again.', { id: toastId })
    }
    setAuditingAll(false)
  }

  async function deletePage(id: string) {
    if (!confirm('Remove this page from tracking?')) return
    const toastId = toast.loading('Removing page…')
    try {
      const res = await fetch(`/api/pages?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setPages(prev => prev.filter(p => (p._id as any).toString() !== id))
      toast.success('Page removed', { id: toastId })
    } catch {
      toast.error('Failed to remove page.', { id: toastId })
    }
  }

  const sorted = [...pages].sort((a, b) => {
    const sa = a.score ?? -1
    const sb = b.score ?? -1
    return sortAsc ? sa - sb : sb - sa
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between mb-5 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">Pages</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Track and audit every page for AI search visibility.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {pages.length > 1 && (
            <button
              onClick={auditAll}
              disabled={auditingAll || pages.some(p => p.status === 'auditing')}
              className="h-9 px-3 sm:px-4 text-sm rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {auditingAll ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">Audit all</span>
            </button>
          )}
          {pages.length < 20 && (
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary h-9 px-3 sm:px-4 text-sm flex items-center gap-1.5 shrink-0"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden xs:inline">Add page</span>
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      ) : pages.length === 0 ? (
        <div className="surface-card rounded-2xl p-10 sm:p-14 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
            <FileSearch className="h-7 w-7 text-primary" />
          </div>
          <h3 className="text-lg font-black tracking-tight text-foreground mb-2">No pages tracked yet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto leading-relaxed">
            Add your homepage and key landing pages to start measuring your AEO score.
          </p>
          <button onClick={() => setShowModal(true)} className="btn-primary h-10 px-6 text-sm mx-auto">
            <Plus className="h-4 w-4" />
            Add your first page
          </button>
        </div>
      ) : (
        <div className="surface-card rounded-2xl overflow-hidden">
          {/* Table header */}
          <div className="flex items-center px-4 py-2.5 border-b border-border bg-muted/30">
            <div className="flex-1 text-xs font-medium text-muted-foreground">Page</div>
            <button
              onClick={() => setSortAsc(v => !v)}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors mr-4"
            >
              Score
              <ArrowUpDown className="h-3 w-3" />
            </button>
            <div className="w-16 text-xs font-medium text-muted-foreground text-center hidden sm:block">Status</div>
            <div className="w-20" />
          </div>

          {/* Rows */}
          <div className="divide-y divide-border">
            {sorted.map(page => {
              const id = (page._id as any).toString()
              const isFailed = page.status === 'failed'
              const errMsg = (page as any).errorMessage as string | undefined

              return (
                <div key={id} className={cn(
                  'flex items-center px-4 py-3 gap-3 hover:bg-muted/20 transition-colors group',
                  isFailed && 'bg-red-500/3'
                )}>
                  {/* Icon + label */}
                  <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-foreground truncate">
                        {page.label || getDomain(page.url)}
                      </p>
                      {isFailed && (
                        <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 shrink-0">
                          Audit failed
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {isFailed && errMsg
                        ? errMsg
                        : getDomain(page.url)}
                    </p>
                  </div>

                  {/* Score */}
                  <div className={cn(
                    'text-sm font-bold tabular-nums px-2.5 py-1 rounded-lg shrink-0',
                    isFailed ? 'text-muted-foreground' : scoreBg(page.score)
                  )}>
                    {isFailed ? '—' : (page.score !== undefined ? page.score : '—')}
                  </div>

                  {/* Status icon */}
                  <div className="w-16 flex justify-center hidden sm:flex">
                    {statusIcon(page.status)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 w-20 justify-end">
                    {!isFailed && page.status !== 'auditing' && (
                      <Link
                        href={`/dashboard/pages/${id}`}
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors opacity-0 group-hover:opacity-100"
                        title="View report"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                    <button
                      onClick={() => auditPage(id)}
                      disabled={page.status === 'auditing' || auditingId === id}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-40"
                      title={isFailed ? 'Retry audit' : 'Re-audit'}
                    >
                      {page.status === 'auditing' || auditingId === id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <RefreshCw className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => deletePage(id)}
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      title="Remove page"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground mt-4 text-center">
        {pages.length}/20 pages tracked
      </p>

      {showModal && (
        <AddPageModal
          onClose={() => setShowModal(false)}
          onAdded={fetchPages}
        />
      )}
    </div>
  )
}