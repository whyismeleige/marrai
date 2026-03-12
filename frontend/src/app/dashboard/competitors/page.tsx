'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, RefreshCw, Trash2, Loader2, X, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Competitor } from '@/lib/mongodb'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CATS = ['schema', 'content', 'technical', 'structure'] as const

function scoreColor(s: number | undefined) {
  if (s === undefined) return 'text-muted-foreground'
  if (s >= 70) return 'text-green-500'
  if (s >= 45) return 'text-amber-500'
  return 'text-red-500'
}

function scoreBg(s: number | undefined) {
  if (s === undefined) return 'bg-muted'
  if (s >= 70) return 'bg-green-500'
  if (s >= 45) return 'bg-amber-500'
  return 'bg-red-500'
}

// ─── Add competitor modal ─────────────────────────────────────────────────────

function AddModal({
  onClose,
  onAdded,
}: {
  onClose: () => void
  onAdded: () => void
}) {
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (!domain.trim()) { setError('Domain is required'); return }
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', domain: domain.trim() }),
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
      <div className="surface-card rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-foreground">Add Competitor</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Domain</label>
        <input
          autoFocus
          type="text"
          placeholder="e.g. competitor.com"
          value={domain}
          onChange={e => { setDomain(e.target.value); setError('') }}
          onKeyDown={e => e.key === 'Enter' && submit()}
          className={cn(
            'w-full h-10 px-3 rounded-xl border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition mb-4',
            error ? 'border-destructive' : 'border-border'
          )}
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
            {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Add Competitor'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Competitor card ──────────────────────────────────────────────────────────

function CompetitorCard({
  competitor,
  myScores,
  onAudit,
  onDelete,
}: {
  competitor: Competitor
  myScores: { overall: number | null; schema: number; content: number; technical: number; structure: number }
  onAudit: (id: string) => void
  onDelete: (id: string) => void
}) {
  const id = (competitor._id as any).toString()
  const isAuditing = competitor.status === 'auditing'

  function compare(myVal: number | null, theirVal: number | undefined) {
    if (myVal === null || theirVal === undefined) return null
    if (myVal > theirVal) return 'ahead'
    if (myVal < theirVal) return 'behind'
    return 'tied'
  }

  const overall = compare(myScores.overall, competitor.score)

  return (
    <div className="surface-card rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <img
            src={`https://www.google.com/s2/favicons?domain=${competitor.domain}&sz=16`}
            alt=""
            className="w-5 h-5 rounded-sm shrink-0"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div>
            <p className="text-sm font-semibold text-foreground">{competitor.domain}</p>
            {competitor.lastAuditedAt && (
              <p className="text-xs text-muted-foreground">
                Last checked {new Date(competitor.lastAuditedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-1">
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
          <button
            onClick={() => onDelete(id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Score comparison */}
      {competitor.score !== undefined ? (
        <>
          <div className="flex items-center justify-between mb-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Them</p>
              <p className={cn('text-2xl font-black', scoreColor(competitor.score))}>
                {competitor.score}
              </p>
            </div>

            <div className="flex flex-col items-center gap-1">
              {overall === 'ahead' && (
                <>
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <span className="text-[10px] font-semibold text-green-500">You're ahead</span>
                </>
              )}
              {overall === 'behind' && (
                <>
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  <span className="text-[10px] font-semibold text-red-500">Falling behind</span>
                </>
              )}
              {overall === 'tied' && (
                <>
                  <Minus className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] font-semibold text-muted-foreground">Tied</span>
                </>
              )}
              {overall === null && <span className="text-xs text-muted-foreground">vs</span>}
            </div>

            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">You</p>
              <p className={cn('text-2xl font-black', scoreColor(myScores.overall ?? undefined))}>
                {myScores.overall ?? '—'}
              </p>
            </div>
          </div>

          {/* Category bars */}
          <div className="space-y-2.5">
            {CATS.map(cat => {
              const theirScore = competitor.categoryScores?.[cat]
              const myScore = myScores[cat]
              const cmp = compare(myScore, theirScore)
              return (
                <div key={cat}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground capitalize">{cat}</span>
                    <span className="flex items-center gap-1">
                      {cmp === 'ahead' && <TrendingUp className="h-3 w-3 text-green-500" />}
                      {cmp === 'behind' && <TrendingDown className="h-3 w-3 text-red-500" />}
                      <span className="text-foreground font-medium">{myScore} vs {theirScore ?? '?'}</span>
                    </span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    {/* Their bar */}
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-muted-foreground/30"
                      style={{ width: `${theirScore !== undefined ? (theirScore / 30) * 100 : 0}%` }}
                    />
                    {/* My bar */}
                    <div
                      className={cn('absolute inset-y-0 left-0 rounded-full opacity-80', scoreBg(myScore || undefined))}
                      style={{ width: `${(myScore / 30) * 100}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <div className="py-6 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            {isAuditing ? 'Auditing competitor…' : 'Not yet audited'}
          </p>
          {!isAuditing && (
            <button
              onClick={() => onAudit(id)}
              className="btn-primary h-9 px-4 text-xs mx-auto"
            >
              Audit now
            </button>
          )}
          {isAuditing && (
            <Loader2 className="h-5 w-5 text-primary animate-spin mx-auto" />
          )}
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [myScore, setMyScore] = useState<number | null>(null)
  const [myCats, setMyCats] = useState({ schema: 0, content: 0, technical: 0, structure: 0 })

  const fetchAll = useCallback(async () => {
    try {
      const [compRes, pagesRes] = await Promise.all([
        fetch('/api/competitors'),
        fetch('/api/pages'),
      ])
      const compData = await compRes.json()
      const pagesData = await pagesRes.json()
      setCompetitors(compData.competitors ?? [])

      // Compute my avg score from pages
      const pages = pagesData.pages ?? []
      const scored = pages.filter((p: any) => p.score !== undefined)
      if (scored.length) {
        const avg = Math.round(scored.reduce((acc: number, p: any) => acc + p.score, 0) / scored.length)
        setMyScore(avg)
        const catAvg = (key: string) =>
          Math.round(scored.reduce((acc: number, p: any) => acc + (p.categoryScores?.[key] ?? 0), 0) / scored.length)
        setMyCats({ schema: catAvg('schema'), content: catAvg('content'), technical: catAvg('technical'), structure: catAvg('structure') })
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  // Poll while any competitor is auditing
  useEffect(() => {
    const hasAuditing = competitors.some(c => c.status === 'auditing')
    if (!hasAuditing) return
    const timer = setTimeout(fetchAll, 3000)
    return () => clearTimeout(timer)
  }, [competitors, fetchAll])

  async function auditCompetitor(id: string) {
    await fetch('/api/competitors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'audit', competitorId: id }),
    })
    await fetchAll()
  }

  async function deleteCompetitor(id: string) {
    if (!confirm('Remove this competitor?')) return
    await fetch(`/api/competitors?id=${id}`, { method: 'DELETE' })
    setCompetitors(prev => prev.filter(c => (c._id as any).toString() !== id))
  }

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">Competitors</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Compare your AEO score against up to 3 competitors.
          </p>
        </div>
        {competitors.length < 3 && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary h-9 px-4 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add competitor
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      ) : competitors.length === 0 ? (
        <div className="surface-card rounded-2xl p-12 text-center">
          <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
            <Plus className="h-5 w-5 text-muted-foreground" />
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">No competitors yet</h3>
          <p className="text-sm text-muted-foreground mb-5">
            Add up to 3 competitor domains and benchmark your AEO performance.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary h-10 px-5 text-sm mx-auto"
          >
            <Plus className="h-4 w-4" /> Add first competitor
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitors.map(comp => (
            <CompetitorCard
              key={(comp._id as any).toString()}
              competitor={comp}
              myScores={{ overall: myScore, ...myCats }}
              onAudit={auditCompetitor}
              onDelete={deleteCompetitor}
            />
          ))}
        </div>
      )}

      {showModal && (
        <AddModal
          onClose={() => setShowModal(false)}
          onAdded={() => { setShowModal(false); fetchAll() }}
        />
      )}
    </div>
  )
}