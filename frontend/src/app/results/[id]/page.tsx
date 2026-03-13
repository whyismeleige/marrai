import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Cpu, CheckCircle, XCircle, AlertTriangle,
  Lightbulb, FileText, Globe, ShieldCheck, BarChart3,
  Brain, ExternalLink, Zap, Sparkles, ArrowRight,
} from 'lucide-react'
import { getAudit } from '@/lib/mongodb'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import { RefreshButton } from '@/components/ui/refresh-button'

/* ─── Types ──────────────────────────────────────────────── */

type Priority  = 'critical' | 'warning' | 'suggestion'
type Category  = 'schema' | 'content' | 'technical' | 'structure'

interface Finding {
  text: string
  priority: Priority
  category: Category
}

/* ─── Helpers ────────────────────────────────────────────── */

function scoreGrade(s: number): { label: string; color: string; bg: string; ring: string; border: string } {
  if (s >= 80) return {
    label: 'Excellent',
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-500/10',
    ring: 'stroke-emerald-500',
    border: 'border-emerald-500/25',
  }
  if (s >= 60) return {
    label: 'Good',
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-500/10',
    ring: 'stroke-blue-500',
    border: 'border-blue-500/25',
  }
  if (s >= 40) return {
    label: 'Moderate',
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-500/10',
    ring: 'stroke-amber-500',
    border: 'border-amber-500/25',
  }
  return {
    label: 'Needs work',
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-500/10',
    ring: 'stroke-red-500',
    border: 'border-red-500/25',
  }
}

function priorityIcon(p: Priority) {
  if (p === 'critical') return <XCircle       className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
  if (p === 'warning')  return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
  return                       <Lightbulb     className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
}

function priorityCls(p: Priority) {
  if (p === 'critical') return 'border-red-500/20 bg-red-500/5'
  if (p === 'warning')  return 'border-amber-500/20 bg-amber-500/5'
  return                       'border-blue-500/20 bg-blue-500/5'
}

function priorityBadge(p: Priority) {
  if (p === 'critical') return { label: 'Critical',   cls: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' }
  if (p === 'warning')  return { label: 'Warning',    cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' }
  return                       { label: 'Suggestion', cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' }
}

/* ─── Score Ring SVG ─────────────────────────────────────── */

function ScoreRing({ score, grade }: { score: number; grade: ReturnType<typeof scoreGrade> }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <div className="relative w-36 h-36 sm:w-44 sm:h-44 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="8" className="stroke-muted" />
        <circle
          cx="60" cy="60" r={r}
          fill="none" strokeWidth="8"
          className={`score-ring ${grade.ring}`}
          strokeDashoffset={circ - dash}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl sm:text-4xl font-black text-foreground tabular-nums leading-none">{score}</span>
        <span className="text-[11px] font-semibold text-muted-foreground mt-1">/ 100</span>
      </div>
    </div>
  )
}

/* ─── Category Bar ───────────────────────────────────────── */

function CategoryBar({
  label, score, max, icon: Icon, color,
}: {
  label: string; score: number; max: number; icon: React.ElementType; color: string
}) {
  const pct = max > 0 ? Math.round((score / max) * 100) : 0
  const barColor = pct >= 70 ? 'bg-emerald-500' : pct >= 45 ? 'bg-amber-500' : 'bg-red-500'

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Icon className={`h-3.5 w-3.5 ${color}`} />
          <span className="text-xs font-semibold text-muted-foreground">{label}</span>
        </div>
        <span className="text-xs font-bold text-foreground tabular-nums">{score}<span className="text-muted-foreground font-normal">/{max}</span></span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

/* ─── Header ─────────────────────────────────────────────── */

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Cpu className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-foreground">Marrai</span>
        </Link>
        <div className="flex items-center gap-2">
          <AnimatedThemeToggler />
          <Link
            href="/audit"
            className="h-8 px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            New audit
          </Link>
        </div>
      </div>
    </header>
  )
}

/* ─── Page ───────────────────────────────────────────────── */

export default async function ResultsPage({ params }: { params: { id: string } }) {
  const audit = await getAudit(params.id)
  if (!audit) notFound()

  // ── Pending / processing ──────────────────────────────────
  if (audit.status === 'pending' || audit.status === 'processing') {
    const statusSteps = ['Fetching page…', 'Analysing content…', 'Scoring signals…']
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center px-5 py-20">
          <div className="surface-card rounded-2xl p-8 sm:p-10 max-w-sm w-full text-center">
            {/* Spinner */}
            <div className="relative w-16 h-16 mx-auto mb-6">
              <svg className="w-16 h-16 -rotate-90 spin-slow" viewBox="0 0 64 64">
                <circle cx="32" cy="32" r="26" fill="none" strokeWidth="4" className="stroke-muted" />
                <circle cx="32" cy="32" r="26" fill="none" strokeWidth="4"
                  className="stroke-primary" strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 26 * 0.3} ${2 * Math.PI * 26 * 0.7}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h2 className="text-lg font-black text-foreground mb-2">Analysing your page</h2>
            <p className="text-sm text-muted-foreground mb-7">This takes 30–60 seconds. Sit tight.</p>
            <div className="space-y-2 text-left mb-7">
              {statusSteps.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span className={`w-1.5 h-1.5 rounded-full ${i < 2 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                  <span className={i < 2 ? 'text-foreground' : 'text-muted-foreground/50'}>{s}</span>
                </div>
              ))}
            </div>
            <RefreshButton />
          </div>
        </div>
      </div>
    )
  }

  // ── Failed ────────────────────────────────────────────────
  if (audit.status === 'failed') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center px-5 py-20">
          <div className="surface-card rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-lg font-black text-foreground mb-2">Analysis failed</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {audit.issues?.[0] || 'Something went wrong. Please try again.'}
            </p>
            <Link
              href="/audit"
              className="btn-primary h-10 px-5 text-sm mx-auto inline-flex"
            >
              Try again
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Completed ─────────────────────────────────────────────
  const grade     = scoreGrade(audit.score)
  const catScores = audit.categoryScores ?? { schema: 0, content: 0, technical: 0, structure: 0 }

  let findings: Finding[] = audit.findings ?? []
  if (!findings.length) {
    findings = [
      ...(audit.issues          ?? []).map(t => ({ text: t, priority: 'critical'   as Priority, category: 'technical' as Category })),
      ...(audit.warnings        ?? []).map(t => ({ text: t, priority: 'warning'    as Priority, category: 'content'   as Category })),
      ...(audit.recommendations ?? []).map(t => ({ text: t, priority: 'suggestion' as Priority, category: 'content'   as Category })),
    ]
  }

  const criticals   = findings.filter(f => f.priority === 'critical')
  const warnings    = findings.filter(f => f.priority === 'warning')
  const suggestions = findings.filter(f => f.priority === 'suggestion')

  const domain = (() => {
    try { return new URL(audit.url).hostname.replace(/^www\./, '') } catch { return audit.url }
  })()

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-5 py-8 sm:py-10">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 fade-up">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span className="text-border">/</span>
          <Link href="/audit" className="hover:text-foreground transition-colors">Audit</Link>
          <span className="text-border">/</span>
          <span className="text-foreground font-medium truncate max-w-[180px]">{domain}</span>
        </div>

        {/* ── Hero score card ── */}
        <div className="surface-card rounded-2xl p-6 sm:p-8 mb-4 fade-up">
          <div className="grid sm:grid-cols-[auto,1fr] gap-6 sm:gap-8 items-center">

            {/* Score ring */}
            <div className="flex flex-col items-center gap-3">
              <ScoreRing score={audit.score} grade={grade} />
              <div className={`text-sm font-bold px-3.5 py-1 rounded-full border ${grade.bg} ${grade.color} ${grade.border}`}>
                {grade.label}
              </div>
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <img
                  src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
                  alt="" className="w-4 h-4 rounded-sm"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                />
                <span className="text-sm text-muted-foreground truncate">{audit.url}</span>
                <a href={audit.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
                  <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground transition-colors" />
                </a>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mb-2">
                AEO Score: {audit.score}/100
              </h1>

              <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                {audit.score >= 80
                  ? 'Your page is well-optimised for AI search. Focus on schema richness to push further.'
                  : audit.score >= 60
                  ? 'Good foundation — a few targeted improvements will significantly boost your AI visibility.'
                  : audit.score >= 40
                  ? 'Moderate optimisation needed. Address the critical issues below for quick wins.'
                  : 'Significant AEO work needed. Start with schema markup and content structure today.'}
              </p>

              {/* Category bars */}
              <div className="space-y-3">
                <CategoryBar label="Schema & AI Signals" score={catScores.schema}    max={25} icon={Brain}       color="text-violet-500" />
                <CategoryBar label="Content Quality"      score={catScores.content}   max={30} icon={FileText}    color="text-blue-500"   />
                <CategoryBar label="Technical Signals"    score={catScores.technical} max={25} icon={ShieldCheck} color="text-emerald-500" />
                <CategoryBar label="Page Structure"       score={catScores.structure} max={20} icon={BarChart3}   color="text-amber-500"  />
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick stats ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4 fade-up delay-100">
          {[
            {
              label: 'Word count',
              value: audit.wordCount ? audit.wordCount.toLocaleString() : '—',
              sub: audit.wordCount && audit.wordCount >= 600 ? 'Good ✓' : audit.wordCount ? 'Needs more' : '',
              ok: (audit.wordCount ?? 0) >= 600,
            },
            {
              label: 'Schema types',
              value: audit.schemaTypes?.length ? String(audit.schemaTypes.length) : 'None',
              sub: audit.schemaTypes?.slice(0, 2).join(', ') || 'Not found',
              ok: (audit.schemaTypes?.length ?? 0) > 0,
            },
            {
              label: 'Question H2s',
              value: String(audit.questionHeadings ?? 0),
              sub: (audit.questionHeadings ?? 0) >= 3 ? 'Good ✓' : 'Add more',
              ok: (audit.questionHeadings ?? 0) >= 3,
            },
            {
              label: 'Images w/o alt',
              value: `${audit.imagesWithoutAlt ?? '—'}`,
              sub: (audit.imagesWithoutAlt ?? 0) === 0 ? 'All good ✓' : 'Fix alt text',
              ok: (audit.imagesWithoutAlt ?? 0) === 0,
            },
          ].map(item => (
            <div key={item.label} className="surface-card rounded-xl p-4">
              <div className={`text-2xl font-black tabular-nums mb-0.5 ${item.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
                {item.value}
              </div>
              <div className="text-xs text-muted-foreground font-medium">{item.label}</div>
              {item.sub && (
                <div className={`text-[11px] mt-0.5 ${item.ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {item.sub}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* ── Findings ── */}
        {[
          { items: criticals,   heading: 'Critical Issues',  subtext: 'Fix these first — they have the biggest impact on your AEO score.',  icon: XCircle,       iconCls: 'text-red-500',    bgCls: 'bg-red-500/10',    borderCls: 'border-red-500/20'    },
          { items: warnings,    heading: 'Warnings',         subtext: 'These are impacting your score and should be addressed soon.',         icon: AlertTriangle, iconCls: 'text-amber-500',  bgCls: 'bg-amber-500/10',  borderCls: 'border-amber-500/20'  },
          { items: suggestions, heading: 'Suggestions',      subtext: 'Improvements that will give you an edge over competitors.',           icon: Lightbulb,     iconCls: 'text-blue-500',   bgCls: 'bg-blue-500/10',   borderCls: 'border-blue-500/20'   },
        ].map(({ items, heading, subtext, icon: Icon, iconCls, bgCls, borderCls }) =>
          items.length > 0 && (
            <div key={heading} className="surface-card rounded-2xl mb-4 overflow-hidden fade-up delay-150">
              {/* Header */}
              <div className={`px-5 sm:px-6 py-4 border-b border-border/60 flex items-center gap-3`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bgCls} border ${borderCls}`}>
                  <Icon className={`h-4 w-4 ${iconCls}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-foreground">{heading}</h2>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bgCls} ${iconCls} border ${borderCls}`}>
                      {items.length}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{subtext}</p>
                </div>
              </div>

              {/* Items */}
              <ul className="divide-y divide-border/60">
                {items.map((f, i) => {
                  const badge = priorityBadge(f.priority)
                  return (
                    <li key={i} className="px-5 sm:px-6 py-4 flex items-start gap-3 hover:bg-muted/20 transition-colors">
                      {priorityIcon(f.priority)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-relaxed">{f.text}</p>
                        {f.category && (
                          <span className="mt-1.5 inline-flex items-center text-[11px] font-semibold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md capitalize">
                            {f.category}
                          </span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        )}

        {/* ── CTA Banner ── */}
        <div className="relative overflow-hidden surface-card rounded-2xl p-6 sm:p-8 text-center fade-up delay-200">
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center top, oklch(0.70 0.20 264 / 0.4) 0%, transparent 60%)' }}
          />
          <div className="relative">
            <div className="badge mx-auto mb-5">
              <Sparkles className="h-3 w-3 text-primary" />
              Want a deeper analysis?
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-foreground mb-2">
              Get a full AEO strategy from our team
            </h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto leading-relaxed">
              Our AEO specialists will build a custom roadmap to get your business cited by ChatGPT, Perplexity, and Gemini.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <a
                href="mailto:hello@marrai.in?subject=AEO%20Audit%20Enquiry"
                className="btn-primary h-11 px-6 text-sm"
              >
                <Zap className="h-4 w-4" />
                Talk to an expert
              </a>
              <Link href="/audit" className="btn-outline h-11 px-6 text-sm">
                Audit another page
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}