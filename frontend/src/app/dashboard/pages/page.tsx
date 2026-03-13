'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  Plus, RefreshCw, Loader2, X, Trash2,
  ExternalLink, AlertCircle, AlertTriangle, CheckCircle2,
  FileText,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BrandPage } from '@/lib/mongodb'

// ─── Score badge ──────────────────────────────────────────────────────────────

function ScoreBadge({ score }: { score?: number }) {
  if (score === undefined) {
    return (
      <span className="inline-flex items-center text-xs text-muted-foreground font-medium">
        —
      </span>
    )
  }
  const color =
    score >= 70 ? 'text-green-600 dark:text-green-400 bg-green-500/10 border-green-500/20' :
    score >= 45 ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20' :
                  'text-red-600 dark:text-red-400 bg-red-500/10 border-red-500/20'
  return (
    <span className={cn('inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full border', color)}>
      {score}
    </span>
  )
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: BrandPage['status'] }) {
  if (status === 'auditing') return (
    <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
      <Loader2 className="h-3 w-3 animate-spin" /> Auditing…
    </span>
  )
  if (status === 'good') return (
    <span className="inline-flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
      <CheckCircle2 className="h-3 w-3" /> Audited
    </span>
  )
  return (
    <span className="inline-flex items-center text-xs text-muted-foreground font-medium">
      Not audited
    </span>
  )
}

// ─── Add page modal ───────────────────────────────────────────────────────────

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
    if (!url.trim()) { setError('URL is required'); return }
    setLoading(true)
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', url: url.trim(), label: label.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to add page')
      onAdded()
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="surface-card rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-foreground">Add Page</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <label className="block text-xs font-medium text-muted-foreground mb-1">Page URL *</label>
        <input
          autoFocus
          type="url"
          inputMode="url"
          placeholder="https://example.com/pricing"
          value={url}
          onChange={e => { setUrl(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          className={cn(
            'w-full h-10 px-3 rounded-xl border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition mb-3',
            error ? 'border-destructive' : 'border-border'
          )}
        />

        <label className="block text-xs font-medium text-muted-foreground mb-1">Label (optional)</label>
        <input
          type="text"
          placeholder="e.g. Homepage, Pricing, Blog"
          value={label}
          onChange={e => setLabel(e.target.value)}
          className="w-full h-10 px-3 rounded-xl border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition mb-4"
        />

        {error && <p className="text-xs text-destructive mb-3">{error}</p>}

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 h-10 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition">
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

// ─── Desktop table row ────────────────────────────────────────────────────────

function PageRow({
  page,
  onAudit,
  onDelete,
  auditingId,
}: {
  page: BrandPage
  onAudit: (id: string) => void
  onDelete: (id: string) => void
  auditingId: string | null
}) {
  const id = (page._id as any).toString()
  const isAuditing = page.status === 'auditing' || auditingId === id
  const domain = new URL(page.url).hostname.replace('www.', '')

  return (
    <tr className="border-b border-border/60 hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=14`}
            alt=""
            className="w-3.5 h-3.5 rounded-sm shrink-0"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate max-w-[200px]">
              {page.label || domain}
            </p>
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
              {page.url.replace(/^https?:\/\//, '')}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <ScoreBadge score={page.score} />
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={page.status} />
      </td>
      <td className="px-4 py-3">
        <span className="text-xs text-muted-foreground">
          {page.lastAuditedAt
            ? new Date(page.lastAuditedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
            : '—'}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <a
            href={page.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
          <button
            onClick={() => onAudit(id)}
            disabled={isAuditing}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-40"
          >
            {isAuditing
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <RefreshCw className="h-3.5 w-3.5" />
            }
          </button>
          <button
            onClick={() => onDelete(id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  )
}

// ─── Mobile page card ─────────────────────────────────────────────────────────

function MobilePageCard({
  page,
  onAudit,
  onDelete,
  auditingId,
}: {
  page: BrandPage
  onAudit: (id: string) => void
  onDelete: (id: string) => void
  auditingId: string | null
}) {
  const id = (page._id as any).toString()
  const isAuditing = page.status === 'auditing' || auditingId === id
  const domain = new URL(page.url).hostname.replace('www.', '')

  return (
    <div className="flex items-center gap-3 p-4 border-b border-border/60 last:border-b-0">
      {/* Favicon + info */}
      <img
        src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
        alt=""
        className="w-4 h-4 rounded-sm shrink-0 mt-0.5"
        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">
          {page.label || domain}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <StatusBadge status={isAuditing ? 'auditing' : page.status} />
          {page.lastAuditedAt && (
            <span className="text-[10px] text-muted-foreground">
              {new Date(page.lastAuditedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}
        </div>
      </div>

      {/* Score */}
      <ScoreBadge score={page.score} />

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onAudit(id)}
          disabled={isAuditing}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-40"
        >
          {isAuditing
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <RefreshCw className="h-3.5 w-3.5" />
          }
        </button>
        <button
          onClick={() => onDelete(id)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function PagesPage() {
  const [pages, setPages] = useState<BrandPage[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [auditingId, setAuditingId] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true)
  const [auditingAll, setAuditingAll] = useState(false)

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch('/api/pages')
      const data = await res.json()
      setPages(data.pages ?? [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchPages() }, [fetchPages])

  useEffect(() => {
    const hasAuditing = pages.some(p => p.status === 'auditing')
    if (!hasAuditing) return
    const timer = setTimeout(fetchPages, 3000)
    return () => clearTimeout(timer)
  }, [pages, fetchPages])

  async function auditPage(id: string) {
    setAuditingId(id)
    await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'audit', pageId: id }),
    })
    await fetchPages()
    setAuditingId(null)
  }

  async function auditAll() {
    setAuditingAll(true)
    await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'audit_all' }),
    })
    await fetchPages()
    setAuditingAll(false)
  }

  async function deletePage(id: string) {
    if (!confirm('Remove this page?')) return
    await fetch(`/api/pages?id=${id}`, { method: 'DELETE' })
    setPages(prev => prev.filter(p => (p._id as any).toString() !== id))
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
            Track and audit every page on your site.
          </p>
        </div>
        {/* Action buttons — stack icon-only on small mobile */}
        <div className="flex items-center gap-2">
          {pages.length > 0 && (
            <button
              onClick={auditAll}
              disabled={auditingAll}
              className="h-9 px-3 sm:px-4 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {auditingAll
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <RefreshCw className="h-3.5 w-3.5" />
              }
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

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      ) : pages.length === 0 ? (
        <div className="surface-card rounded-2xl p-10 sm:p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">No pages yet</h3>
          <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto">
            Add your homepage, pricing page, or any blog post to start auditing.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary h-10 px-5 text-sm mx-auto"
          >
            <Plus className="h-4 w-4" /> Add your first page
          </button>
        </div>
      ) : (
        <div className="surface-card rounded-2xl overflow-hidden">
          {/* Mobile: card list (hidden on sm+) */}
          <div className="sm:hidden">
            {sorted.map(page => (
              <MobilePageCard
                key={(page._id as any).toString()}
                page={page}
                onAudit={auditPage}
                onDelete={deletePage}
                auditingId={auditingId}
              />
            ))}
          </div>

          {/* Desktop: table (hidden below sm) */}
          <div className="hidden sm:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-muted/30">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Page</th>
                  <th className="px-4 py-3 text-left">
                    <button
                      onClick={() => setSortAsc(p => !p)}
                      className="flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Score
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Last Audit</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(page => (
                  <PageRow
                    key={(page._id as any).toString()}
                    page={page}
                    onAudit={auditPage}
                    onDelete={deletePage}
                    auditingId={auditingId}
                  />
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-2.5 border-t border-border/60 bg-muted/10">
            <p className="text-xs text-muted-foreground">
              {pages.length} page{pages.length !== 1 ? 's' : ''} · Sorted by score (worst first)
            </p>
          </div>
        </div>
      )}

      {showModal && (
        <AddPageModal
          onClose={() => setShowModal(false)}
          onAdded={() => { setShowModal(false); fetchPages() }}
        />
      )}
    </div>
  )
}