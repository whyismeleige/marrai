'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus, Trash2, RefreshCw, Loader2, AlertCircle,
  AlertTriangle, CheckCircle, Clock, ExternalLink, X,
  ChevronDown, ChevronUp,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BrandPage, PageStatus } from '@/lib/mongodb'

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: PageStatus }) {
  const map: Record<PageStatus, { label: string; cls: string; icon: React.ReactNode }> = {
    unaudited: {
      label: 'Unaudited',
      cls: 'bg-muted text-muted-foreground border-border',
      icon: <Clock className="h-3 w-3" />,
    },
    auditing: {
      label: 'Auditing…',
      cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      icon: <Loader2 className="h-3 w-3 animate-spin" />,
    },
    good: {
      label: 'Good',
      cls: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
      icon: <CheckCircle className="h-3 w-3" />,
    },
    needs_work: {
      label: 'Needs Work',
      cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      icon: <AlertTriangle className="h-3 w-3" />,
    },
    critical: {
      label: 'Critical',
      cls: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
      icon: <AlertCircle className="h-3 w-3" />,
    },
  }
  const { label, cls, icon } = map[status]
  return (
    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', cls)}>
      {icon} {label}
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
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', url: url.trim(), label: label.trim() }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      onAdded()
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
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
          type="text"
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

// ─── Page row ─────────────────────────────────────────────────────────────────

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
    <tr className="border-b border-border/60 hover:bg-muted/20 transition-colors group">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
            alt=""
            className="w-4 h-4 rounded-sm shrink-0"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className="min-w-0">
            {page.label && (
              <p className="text-xs font-semibold text-foreground">{page.label}</p>
            )}
            <p className="text-xs text-muted-foreground truncate max-w-[200px]">{page.url}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          {page.score !== undefined ? (
            <span className={cn(
              'text-sm font-bold',
              page.score >= 70 ? 'text-green-500' :
              page.score >= 45 ? 'text-amber-500' : 'text-red-500'
            )}>
              {page.score}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <StatusBadge status={isAuditing ? 'auditing' : page.status} />
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {page.lastAuditedAt
          ? new Date(page.lastAuditedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
          : '—'}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <a
            href={page.url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors"
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

// ─── Main component ───────────────────────────────────────────────────────────

export default function PagesPage() {
  const [pages, setPages] = useState<BrandPage[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [auditingId, setAuditingId] = useState<string | null>(null)
  const [sortAsc, setSortAsc] = useState(true) // worst first by default (asc score)
  const [auditingAll, setAuditingAll] = useState(false)

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch('/api/pages')
      const data = await res.json()
      setPages(data.pages ?? [])
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPages()
  }, [fetchPages])

  // Poll when any page is auditing
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
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Pages</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track and audit every page on your site.
          </p>
        </div>
        <div className="flex gap-2">
          {pages.length > 0 && (
            <button
              onClick={auditAll}
              disabled={auditingAll}
              className="h-9 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              {auditingAll
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <RefreshCw className="h-3.5 w-3.5" />
              }
              Audit all
            </button>
          )}
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary h-9 px-4 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add page
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      ) : pages.length === 0 ? (
        <div className="surface-card rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Plus className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">No pages yet</h3>
          <p className="text-sm text-muted-foreground mb-5">
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
                    {sortAsc ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
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