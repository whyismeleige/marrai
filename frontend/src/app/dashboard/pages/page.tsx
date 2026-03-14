'use client'

// src/app/dashboard/pages/page.tsx
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Plus, RefreshCw, Trash2, Loader2, ArrowUpDown,
  Globe, AlertCircle, CheckCircle2, Clock, ChevronRight,
  Zap, FileSearch,
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
  if (status === 'auditing') return <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
  if (status === 'good')     return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
  if (status === 'critical') return <AlertCircle className="h-3.5 w-3.5 text-red-500" />
  if (status === 'needs_work') return <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
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
          Enter the full URL of a page you want to track and audit.
        </p>

        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Page URL <span className="text-red-500">*</span>
        </label>
        <input
          autoFocus
          type="url"
          placeholder="https://yoursite.com/pricing"
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
          Label <span className="text-muted-foreground/50">(optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Homepage, Pricing, Blog"
          value={label}
          onChange={e => setLabel(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          className="w-full h-10 px-3 rounded-xl border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition mb-4"
        />

        {error && <p className="text-xs text-destructive mb-3">{error}</p>}

        <div className="flex gap-2">
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
            {loading
              ? <Loader2 className="h-4 w-4 animate-spin mx-auto" />
              : 'Add Page'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Page Row Card ────────────────────────────────────────────────────────────

function PageCard({
  page,
  onAudit,
  onDelete,
  auditing,
}: {
  page: BrandPage
  onAudit: (id: string) => void
  onDelete: (id: string) => void
  auditing: boolean
}) {
  const id = (page._id as any).toString()
  const domain = getDomain(page.url)
  const isAuditing = page.status === 'auditing' || auditing

  return (
    <div className="surface-card rounded-2xl p-4 sm:p-5 flex items-center gap-3 sm:gap-4 group">

      {/* Favicon + domain */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
          alt=""
          className="w-5 h-5 rounded-sm shrink-0"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            {statusIcon(page.status)}
            <p className="text-sm font-semibold text-foreground truncate">
              {page.label || domain}
            </p>
          </div>
          <p className="text-xs text-muted-foreground truncate">{page.url}</p>
        </div>
      </div>

      {/* Score badge */}
      <div className={cn(
        'shrink-0 text-xs font-bold px-2.5 py-1 rounded-lg tabular-nums',
        scoreBg(page.score)
      )}>
        {page.score !== undefined ? `${page.score}/100` : '—'}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {/* View details */}
        <Link
          href={`/dashboard/pages/${id}`}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
          title="View audit details"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>

        {/* Re-audit */}
        <button
          onClick={() => onAudit(id)}
          disabled={isAuditing}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-40"
          title="Re-audit"
        >
          {isAuditing
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <RefreshCw className="h-3.5 w-3.5" />}
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(id)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
          title="Remove page"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="surface-card rounded-2xl p-10 sm:p-14 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
        <FileSearch className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-lg font-black tracking-tight text-foreground mb-2">
        No pages tracked yet
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto leading-relaxed">
        Add your homepage, pricing page, or any page you want to optimize for AI search visibility.
      </p>

      {/* Suggestions */}
      <div className="flex flex-wrap gap-2 justify-center mb-7">
        {['Homepage', 'Pricing', 'About Us', 'Blog', 'Contact'].map(label => (
          <span
            key={label}
            className="text-xs px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground"
          >
            {label}
          </span>
        ))}
      </div>

      <button onClick={onAdd} className="btn-primary h-10 px-6 text-sm mx-auto">
        <Plus className="h-4 w-4" />
        Add your first page
      </button>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function PagesPage() {
  const [pages, setPages] = useState<BrandPage[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [auditingId, setAuditingId] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(false)
  const [auditingAll, setAuditingAll] = useState(false)

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch('/api/pages')
      const data = await res.json()
      setPages(data.pages ?? [])
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
        <div className="flex items-center gap-2">
          {pages.length > 0 && (
            <button
              onClick={auditAll}
              disabled={auditingAll || pages.some(p => p.status === 'auditing')}
              className="h-9 px-3 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {auditingAll
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <Zap className="h-3.5 w-3.5" />}
              <span className="hidden sm:inline">Audit all</span>
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary h-9 px-3 sm:px-4 text-sm flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden xs:inline">Add page</span>
          </button>
        </div>
      </div>

      {/* Sort bar */}
      {pages.length > 1 && (
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs text-muted-foreground">
            {pages.length} page{pages.length !== 1 ? 's' : ''} tracked
          </p>
          <button
            onClick={() => setSortAsc(prev => !prev)}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowUpDown className="h-3 w-3" />
            Score: {sortAsc ? 'Low → High' : 'High → Low'}
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      ) : pages.length === 0 ? (
        <EmptyState onAdd={() => setShowModal(true)} />
      ) : (
        <div className="space-y-2">
          {sorted.map(page => (
            <PageCard
              key={(page._id as any).toString()}
              page={page}
              onAudit={auditPage}
              onDelete={deletePage}
              auditing={auditingId === (page._id as any).toString()}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <AddPageModal
          onClose={() => setShowModal(false)}
          onAdded={fetchPages}
        />
      )}
    </div>
  )
}