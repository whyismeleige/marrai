import { auth } from '@clerk/nextjs/server'
import { getBrandByUserId, getBrandPages } from '@/lib/mongodb'
import type { BrandPage, CategoryScores } from '@/lib/mongodb'
import Link from 'next/link'
import {
  ArrowRight, RefreshCw, AlertCircle, AlertTriangle,
  Lightbulb, FileText, Calendar, Zap,
} from 'lucide-react'
import DashboardScoreRing from '@/components/dashboard/score-ring'
import DashboardSparkline from '@/components/dashboard/sparkline'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function avgScore(pages: BrandPage[]): number {
  const scored = pages.filter(p => p.score !== undefined)
  if (!scored.length) return 0
  return Math.round(scored.reduce((acc, p) => acc + (p.score ?? 0), 0) / scored.length)
}

function avgCatScores(pages: BrandPage[]): CategoryScores {
  const scored = pages.filter(p => p.categoryScores)
  if (!scored.length) return { schema: 0, content: 0, technical: 0, structure: 0 }
  const sum = scored.reduce(
    (acc, p) => ({
      schema:    acc.schema    + (p.categoryScores?.schema    ?? 0),
      content:   acc.content   + (p.categoryScores?.content   ?? 0),
      technical: acc.technical + (p.categoryScores?.technical ?? 0),
      structure: acc.structure + (p.categoryScores?.structure ?? 0),
    }),
    { schema: 0, content: 0, technical: 0, structure: 0 }
  )
  return {
    schema:    Math.round(sum.schema    / scored.length),
    content:   Math.round(sum.content   / scored.length),
    technical: Math.round(sum.technical / scored.length),
    structure: Math.round(sum.structure / scored.length),
  }
}

function getTopIssues(pages: BrandPage[]) {
  const all = pages.flatMap(p => p.findings ?? [])
  const critical = all.filter(f => f.priority === 'critical')
  const warnings = all.filter(f => f.priority === 'warning')
  return [...critical, ...warnings].slice(0, 3)
}

function getSparklineData(pages: BrandPage[]): { score: number }[] {
  // Combine all audit history entries, sort by date, take last 5
  const all = pages
    .flatMap(p => p.auditHistory)
    .sort((a, b) => new Date(a.auditedAt).getTime() - new Date(b.auditedAt).getTime())
  const last5 = all.slice(-5)
  if (last5.length === 0) return []
  return last5.map(s => ({ score: s.score }))
}

function lastAuditDate(pages: BrandPage[]): Date | null {
  const dates = pages.map(p => p.lastAuditedAt).filter(Boolean) as Date[]
  if (!dates.length) return null
  return new Date(Math.max(...dates.map(d => new Date(d).getTime())))
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

// ─── Category bar ─────────────────────────────────────────────────────────────

function CatBar({
  label,
  score,
  max,
}: {
  label: string
  score: number
  max: number
}) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0
  const color =
    pct >= 70 ? 'bg-green-500' :
    pct >= 45 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="text-foreground font-semibold">{score}/{max}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { userId } = await auth()
  const brand = await getBrandByUserId(userId!)
  const pages = brand?._id ? await getBrandPages(brand._id.toString()) : []

  const score    = avgScore(pages)
  const cats     = avgCatScores(pages)
  const issues   = getTopIssues(pages)
  const spark    = getSparklineData(pages)
  const lastDate = lastAuditDate(pages)
  const audited  = pages.filter(p => p.status !== 'unaudited').length
  const hasData  = pages.some(p => p.score !== undefined)

  return (
    <div className="p-6 lg:p-8 pt-6 lg:pt-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground">
            AEO Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {brand?.brandName} · {brand?.domain}
          </p>
        </div>
        <Link
          href="/dashboard/pages"
          className="btn-primary h-9 px-4 text-xs hidden sm:flex"
        >
          <Zap className="h-3.5 w-3.5" />
          Add Page
        </Link>
      </div>

      {/* ── Top row: Score + Sparkline ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* Score ring */}
        <div className="surface-card rounded-2xl p-6 flex flex-col items-center justify-center md:col-span-1">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            AEO Score
          </p>
          <DashboardScoreRing score={hasData ? score : null} />
          <p className="text-xs text-muted-foreground mt-3">
            {hasData
              ? score >= 70 ? '🟢 Looking good!'
              : score >= 45 ? '🟡 Room to improve'
              : '🔴 Needs attention'
              : 'No audits yet'}
          </p>
        </div>

        {/* Score trend */}
        <div className="surface-card rounded-2xl p-6 md:col-span-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
            Score Trend
          </p>
          {spark.length >= 2 ? (
            <DashboardSparkline data={spark} />
          ) : (
            <div className="h-32 flex items-center justify-center">
              <p className="text-sm text-muted-foreground text-center">
                Audit at least 2 pages to see your trend.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Middle row: Category breakdown + Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Category breakdown */}
        <div className="surface-card rounded-2xl p-6">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">
            Category Breakdown
          </p>
          <div className="space-y-4">
            <CatBar label="Schema Markup"    score={cats.schema}    max={30} />
            <CatBar label="Content Quality"  score={cats.content}   max={30} />
            <CatBar label="Technical SEO"    score={cats.technical} max={20} />
            <CatBar label="Structure"        score={cats.structure} max={20} />
          </div>
        </div>

        {/* Stats */}
        <div className="surface-card rounded-2xl p-6 flex flex-col justify-between">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">
            Quick Stats
          </p>
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between py-3 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Pages audited</span>
              </div>
              <span className="text-sm font-bold text-foreground">
                {audited} / {pages.length}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-border/60">
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Last audit</span>
              </div>
              <span className="text-sm font-medium text-foreground">
                {lastDate ? formatDate(lastDate) : '—'}
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div className="flex items-center gap-2.5">
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Critical issues</span>
              </div>
              <span className="text-sm font-bold text-red-500">
                {pages.flatMap(p => p.findings ?? []).filter(f => f.priority === 'critical').length}
              </span>
            </div>
          </div>

          <Link
            href="/dashboard/pages"
            className="mt-5 h-9 w-full rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center gap-1.5 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Re-audit all pages
          </Link>
        </div>
      </div>

      {/* ── Bottom: Top 3 issues ── */}
      <div className="surface-card rounded-2xl p-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-5">
          Top Critical Issues
        </p>

        {issues.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">
              {hasData
                ? '🎉 No critical issues found across your pages!'
                : 'Audit your pages to see issues here.'}
            </p>
            {!hasData && (
              <Link
                href="/dashboard/pages"
                className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary hover:underline"
              >
                Add and audit your first page
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {issues.map((issue, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-4 p-4 rounded-xl bg-muted/40 border border-border/60"
              >
                <div className="flex items-start gap-3">
                  {issue.priority === 'critical' ? (
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm text-foreground leading-relaxed">{issue.text}</p>
                </div>
                <Link
                  href="/dashboard/pages"
                  className="shrink-0 h-7 px-3 rounded-lg bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors flex items-center gap-1"
                >
                  Fix it <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}