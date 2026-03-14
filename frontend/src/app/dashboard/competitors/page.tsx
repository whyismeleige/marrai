'use client'

// src/app/dashboard/competitors/page.tsx
import { useState, useEffect, useCallback } from 'react'
import { Plus, Loader2, RefreshCw, Trash2, BarChart3, TrendingUp, TrendingDown, Minus, Target } from 'lucide-react'
import toast from 'react-hot-toast'
import { cn } from '@/lib/utils'
import type { Competitor, CategoryScores } from '@/lib/mongodb'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreBg(score?: number) {
  if (score === undefined) return 'text-muted-foreground'
  if (score >= 70) return 'text-emerald-500'
  if (score >= 45) return 'text-amber-500'
  return 'text-red-500'
}

function scoreBgFull(score?: number) {
  if (score === undefined) return 'bg-muted/50'
  if (score >= 70) return 'bg-emerald-500'
  if (score >= 45) return 'bg-amber-500'
  return 'bg-red-500'
}

// ─── Add Competitor Modal ─────────────────────────────────────────────────────

function AddModal({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const [domain, setDomain] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    setError('')
    const d = domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    if (!d) { setError('Domain is required'); return }

    setLoading(true)
    try {
      const res = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', domain: d }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to add competitor'); setLoading(false); return }

      toast.success(`${d} added to competitors!`)
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
        <h3 className="text-base font-semibold text-foreground mb-1">Add a competitor</h3>
        <p className="text-xs text-muted-foreground mb-5">
          Enter a competitor's domain to benchmark your AEO score against theirs.
        </p>

        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          Domain
        </label>
        <input
          autoFocus
          type="text"
          placeholder="competitor.com"
          value={domain}
          onChange={e => setDomain(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && submit()}
          className={cn(
            'w-full h-10 px-3 rounded-xl border bg-input text-sm text-foreground placeholder:text-muted-foreground',
            'focus:outline-none focus:ring-2 focus:ring-ring transition mb-1',
            error ? 'border-destructive' : 'border-border'
          )}
        />
        {error && <p className="text-xs text-destructive mb-3">{error}</p>}

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
            {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : 'Add Competitor'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Competitor Card ──────────────────────────────────────────────────────────

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

  const CATEGORIES = [
    { key: 'schema',    label: 'Schema',    max: 25, mine: myScores.schema,    theirs: competitor.categoryScores?.schema },
    { key: 'content',   label: 'Content',   max: 30, mine: myScores.content,   theirs: competitor.categoryScores?.content },
    { key: 'technical', label: 'Technical', max: 25, mine: myScores.technical, theirs: competitor.categoryScores?.technical },
    { key: 'structure', label: 'Structure', max: 20, mine: myScores.structure, theirs: competitor.categoryScores?.structure },
  ]

  return (
    <div className="surface-card rounded-2xl p-4 sm:p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5 min-w-0">
          <img
            src={`https://www.google.com/s2/favicons?domain=${competitor.domain}&sz=16`}
            alt=""
            className="w-5 h-5 rounded-sm shrink-0"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{competitor.domain}</p>
            {competitor.lastAuditedAt && (
              <p className="text-xs text-muted-foreground">
                Checked {new Date(competitor.lastAuditedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onAudit(id)}
            disabled={isAuditing}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-40"
            title="Re-audit competitor"
          >
            {isAuditing
              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
              : <RefreshCw className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={() => onDelete(id)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors"
            title="Remove competitor"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Scores comparison */}
      {competitor.score !== undefined && competitor.status === 'done' ? (
        <>
          {/* Overall score comparison */}
          <div className="flex items-center justify-between mb-4 p-3 rounded-xl bg-muted/40 border border-border/60">
            <div className="text-center">
              <div className={`text-xl font-black tabular-nums ${myScores.overall !== null ? scoreBg(myScores.overall) : 'text-muted-foreground'}`}>
                {myScores.overall ?? '—'}
              </div>
              <div className="text-[10px] text-muted-foreground font-medium mt-0.5">You</div>
            </div>

            <div className="flex items-center gap-1.5 px-2">
              {overall === 'ahead' && <TrendingUp className="h-4 w-4 text-emerald-500" />}
              {overall === 'behind' && <TrendingDown className="h-4 w-4 text-red-500" />}
              {overall === 'tied' && <Minus className="h-4 w-4 text-muted-foreground" />}
              {overall === null && <Minus className="h-4 w-4 text-muted-foreground" />}
              <span className={cn(
                'text-xs font-semibold',
                overall === 'ahead' ? 'text-emerald-500' :
                overall === 'behind' ? 'text-red-500' : 'text-muted-foreground'
              )}>
                {overall === 'ahead' ? 'Ahead' : overall === 'behind' ? 'Behind' : '—'}
              </span>
            </div>

            <div className="text-center">
              <div className={`text-xl font-black tabular-nums ${scoreBg(competitor.score)}`}>
                {competitor.score}
              </div>
              <div className="text-[10px] text-muted-foreground font-medium mt-0.5">Them</div>
            </div>
          </div>

          {/* Category breakdown */}
          <div className="space-y-2.5">
            {CATEGORIES.map(({ key, label, max, mine, theirs }) => (
              <div key={key}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground font-medium">{label}</span>
                  <div className="flex items-center gap-1.5 tabular-nums">
                    <span className={cn('font-bold', scoreBg(mine || undefined))}>{mine}/{max}</span>
                    <span className="text-muted-foreground/40">vs</span>
                    <span className={cn('font-bold', scoreBg(theirs))}>{theirs ?? '?'}/{max}</span>
                  </div>
                </div>
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  {/* Theirs */}
                  <div
                    className="absolute inset-y-0 left-0 rounded-full bg-muted-foreground/25"
                    style={{ width: `${theirs !== undefined ? (theirs / max) * 100 : 0}%` }}
                  />
                  {/* Mine */}
                  <div
                    className={cn('absolute inset-y-0 left-0 rounded-full opacity-80', scoreBgFull(mine || undefined))}
                    style={{ width: `${(mine / max) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="py-5 text-center">
          <p className="text-sm text-muted-foreground mb-3">
            {isAuditing ? 'Analyzing competitor site…' : 'Not yet audited'}
          </p>
          {!isAuditing && (
            <button onClick={() => onAudit(id)} className="btn-primary h-9 px-4 text-xs mx-auto">
              Audit now
            </button>
          )}
          {isAuditing && <Loader2 className="h-5 w-5 text-primary animate-spin mx-auto" />}
        </div>
      )}
    </div>
  )
}

// ─── Empty State ─────────────────────────────────────────────────────────────

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="surface-card rounded-2xl p-10 sm:p-14 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
        <Target className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-lg font-black tracking-tight text-foreground mb-2">
        No competitors tracked yet
      </h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto leading-relaxed">
        Add up to 3 competitor domains and see exactly where you stand in AI search visibility.
      </p>

      {/* Benefit pills */}
      <div className="flex flex-wrap gap-2 justify-center mb-7">
        {['See their AEO score', 'Compare category by category', 'Find their gaps'].map(b => (
          <span key={b} className="text-xs px-2.5 py-1 rounded-full bg-muted border border-border text-muted-foreground">
            {b}
          </span>
        ))}
      </div>

      <button onClick={onAdd} className="btn-primary h-10 px-6 text-sm mx-auto">
        <Plus className="h-4 w-4" />
        Add first competitor
      </button>
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

      const pages = pagesData.pages ?? []
      const scored = pages.filter((p: any) => p.score !== undefined)
      if (scored.length) {
        const avg = Math.round(scored.reduce((acc: number, p: any) => acc + p.score, 0) / scored.length)
        setMyScore(avg)
        const catAvg = (key: string) =>
          Math.round(scored.reduce((acc: number, p: any) => acc + (p.categoryScores?.[key] ?? 0), 0) / scored.length)
        setMyCats({
          schema: catAvg('schema'),
          content: catAvg('content'),
          technical: catAvg('technical'),
          structure: catAvg('structure'),
        })
      }
    } catch {}
    setLoading(false)
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  useEffect(() => {
    const hasAuditing = competitors.some(c => c.status === 'auditing')
    if (!hasAuditing) return
    const timer = setTimeout(fetchAll, 3000)
    return () => clearTimeout(timer)
  }, [competitors, fetchAll])

  async function auditCompetitor(id: string) {
    const toastId = toast.loading('Auditing competitor…')
    try {
      await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'audit', competitorId: id }),
      })
      toast.success('Competitor audit started', { id: toastId })
      await fetchAll()
    } catch {
      toast.error('Failed to start competitor audit.', { id: toastId })
    }
  }

  async function deleteCompetitor(id: string) {
    if (!confirm('Remove this competitor?')) return
    const toastId = toast.loading('Removing competitor…')
    try {
      const res = await fetch(`/api/competitors?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setCompetitors(prev => prev.filter(c => (c._id as any).toString() !== id))
      toast.success('Competitor removed', { id: toastId })
    } catch {
      toast.error('Failed to remove competitor.', { id: toastId })
    }
  }

  const myScores = {
    overall: myScore,
    schema: myCats.schema,
    content: myCats.content,
    technical: myCats.technical,
    structure: myCats.structure,
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-5 sm:mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">Competitors</h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Compare your AEO score against up to 3 competitors.
          </p>
        </div>
        {competitors.length < 3 && (
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary h-9 px-3 sm:px-4 text-sm flex items-center gap-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden xs:inline">Add competitor</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      ) : competitors.length === 0 ? (
        <EmptyState onAdd={() => setShowModal(true)} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitors.map(c => (
            <CompetitorCard
              key={(c._id as any).toString()}
              competitor={c}
              myScores={myScores}
              onAudit={auditCompetitor}
              onDelete={deleteCompetitor}
            />
          ))}
        </div>
      )}

      {showModal && (
        <AddModal
          onClose={() => setShowModal(false)}
          onAdded={fetchAll}
        />
      )}
    </div>
  )
}