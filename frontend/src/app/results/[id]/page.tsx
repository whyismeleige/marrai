import { notFound } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Cpu, CheckCircle, XCircle, AlertTriangle,
  Lightbulb, FileText, Globe, ShieldCheck, BarChart3,
  Brain, List, Table2, Image, ExternalLink, RefreshCw,
  TrendingUp, Zap,
} from 'lucide-react'
import { getAudit } from '@/lib/mongodb'
import { ThemeToggle } from '@/components/ui/theme-toggle'

// ─── Types re-used from mongodb ──────────────────────────────────────────────

type Priority  = 'critical' | 'warning' | 'suggestion'
type Category  = 'schema' | 'content' | 'technical' | 'structure'

interface Finding {
  text: string
  priority: Priority
  category: Category
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function scoreGrade(s: number): { label: string; color: string; bg: string; ring: string } {
  if (s >= 80) return { label: 'Excellent',  color: 'text-green-600 dark:text-green-400',  bg: 'bg-green-500/10',  ring: 'stroke-green-500'  }
  if (s >= 60) return { label: 'Good',       color: 'text-blue-600 dark:text-blue-400',    bg: 'bg-blue-500/10',   ring: 'stroke-blue-500'   }
  if (s >= 40) return { label: 'Moderate',   color: 'text-amber-600 dark:text-amber-400',  bg: 'bg-amber-500/10',  ring: 'stroke-amber-500'  }
  return             { label: 'Needs work',  color: 'text-red-600 dark:text-red-400',      bg: 'bg-red-500/10',    ring: 'stroke-red-500'    }
}

function priorityBadge(p: Priority) {
  if (p === 'critical')   return { label: 'Critical',    cls: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' }
  if (p === 'warning')    return { label: 'Warning',     cls: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' }
  return                         { label: 'Suggestion',  cls: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' }
}

function priorityIcon(p: Priority) {
  if (p === 'critical') return <XCircle       className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
  if (p === 'warning')  return <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
  return                       <Lightbulb     className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
}

// Score ring SVG
function ScoreRing({ score, grade }: { score: number; grade: ReturnType<typeof scoreGrade> }) {
  const r = 52
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ

  return (
    <div className="relative w-40 h-40 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
        {/* Track */}
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="8" className="stroke-muted" />
        {/* Progress */}
        <circle
          cx="60" cy="60" r={r}
          fill="none" strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          className={grade.ring}
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-4xl font-black tabular-nums ${grade.color}`}>{score}</span>
        <span className="text-xs text-muted-foreground font-medium">/ 100</span>
      </div>
    </div>
  )
}

// Category score bar
function CategoryBar({
  label, score, max, icon: Icon, color,
}: {
  label: string; score: number; max: number; icon: React.ElementType; color: string
}) {
  const pct = Math.round((score / max) * 100)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-1.5 text-foreground font-medium">
          <Icon className={`h-3.5 w-3.5 ${color}`} />
          {label}
        </div>
        <span className="text-muted-foreground tabular-nums">{score}/{max}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            pct >= 80 ? 'bg-green-500' : pct >= 55 ? 'bg-blue-500' : pct >= 35 ? 'bg-amber-500' : 'bg-red-500'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// A single finding row
function FindingRow({ f }: { f: Finding }) {
  const badge  = priorityBadge(f.priority)
  const icon   = priorityIcon(f.priority)
  return (
    <div className="flex items-start gap-3 p-3.5 rounded-xl border border-border/60 bg-background hover:bg-muted/30 transition-colors">
      {icon}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">{f.text}</p>
      </div>
      <span className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${badge.cls}`}>
        {badge.label}
      </span>
    </div>
  )
}

// Header
function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-4xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[7px] bg-primary flex items-center justify-center">
            <Cpu className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-foreground">Marrai</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/audit"
            className="h-8 px-3.5 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 inline-flex items-center gap-1.5 transition-opacity"
          >
            New audit
          </Link>
        </div>
      </div>
    </header>
  )
}

// ─── Loading screen ───────────────────────────────────────────────────────────

const LOADING_STEPS = [
  'Fetching page content…',
  'Parsing schema markup…',
  'Scoring content quality…',
  'Analysing technical signals…',
]

function RefreshButton() {
  'use client'
  return (
    <button
      onClick={() => window.location.reload()}
      className="h-9 px-4 rounded-lg text-sm font-medium border border-border hover:bg-muted inline-flex items-center gap-1.5 transition-colors text-foreground"
    >
      <RefreshCw className="h-3.5 w-3.5" />
      Refresh
    </button>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ResultsPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  
  const audit = await getAudit(id)
  
  if (!audit) notFound()

  // ── Loading / processing state ────────────────────────────────────────────
  if (audit.status === 'pending' || audit.status === 'processing') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center px-5 py-20">
          <div className="surface-card rounded-2xl p-10 max-w-sm w-full text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
              <div className="relative w-full h-full rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="h-7 w-7 text-primary animate-pulse" />
              </div>
            </div>
            <h2 className="text-lg font-bold text-foreground mb-1">Analysing your page…</h2>
            <p className="text-sm text-muted-foreground mb-6">This usually takes 15–30 seconds</p>
            <div className="space-y-2 text-left mb-6">
              {LOADING_STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-2 text-sm">
                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${i < 2 ? 'bg-primary' : 'bg-muted-foreground/30'}`} />
                  <span className={i < 2 ? 'text-foreground' : 'text-muted-foreground/60'}>{s}</span>
                </div>
              ))}
            </div>
            <RefreshButton />
          </div>
        </div>
      </div>
    )
  }

  // ── Failed state ──────────────────────────────────────────────────────────
  if (audit.status === 'failed') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center px-5 py-20">
          <div className="surface-card rounded-2xl p-8 max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Analysis failed</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {audit.issues?.[0] || 'Something went wrong. Please try again.'}
            </p>
            <Link
              href="/audit"
              className="h-10 px-5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 inline-flex items-center gap-1.5 transition-opacity"
            >
              Try again
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // ── Completed ─────────────────────────────────────────────────────────────

  const grade     = scoreGrade(audit.score)
  const catScores = audit.categoryScores ?? { schema: 0, content: 0, technical: 0, structure: 0 }

  // Group findings by priority, falling back to legacy issues/warnings/recommendations
  let findings: Finding[] = audit.findings ?? []

  // Fallback: synthesise findings from legacy arrays if findings array is empty
  if (!findings.length) {
    const legacy: Finding[] = [
      ...(audit.issues          ?? []).map(t => ({ text: t, priority: 'critical'   as Priority, category: 'technical' as Category })),
      ...(audit.warnings        ?? []).map(t => ({ text: t, priority: 'warning'    as Priority, category: 'content'   as Category })),
      ...(audit.recommendations ?? []).map(t => ({ text: t, priority: 'suggestion' as Priority, category: 'content'   as Category })),
    ]
    findings = legacy
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

      <main className="flex-1 max-w-4xl mx-auto w-full px-5 py-10">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8 fade-up">
          <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link href="/audit" className="hover:text-foreground transition-colors">Audit</Link>
          <span>/</span>
          <span className="text-foreground truncate max-w-[200px]">{domain}</span>
        </div>

        {/* ── Hero score card ── */}
        <div className="surface-card rounded-2xl p-8 mb-5 fade-up">
          <div className="grid md:grid-cols-[auto,1fr] gap-8 items-center">

            {/* Score ring */}
            <div className="flex flex-col items-center gap-3">
              <ScoreRing score={audit.score} grade={grade} />
              <div className={`text-sm font-semibold px-3 py-1 rounded-full ${grade.bg} ${grade.color}`}>
                {grade.label}
              </div>
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground truncate">{audit.url}</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-foreground mb-2">
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
                <CategoryBar label="Schema & AI Signals" score={catScores.schema}    max={25} icon={Brain}       color="text-purple-500" />
                <CategoryBar label="Content Quality"      score={catScores.content}   max={30} icon={FileText}    color="text-blue-500"   />
                <CategoryBar label="Technical Signals"    score={catScores.technical} max={25} icon={ShieldCheck} color="text-green-500"  />
                <CategoryBar label="Page Structure"       score={catScores.structure} max={20} icon={BarChart3}   color="text-amber-500"  />
              </div>
            </div>
          </div>
        </div>

        {/* ── Quick stats grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 fade-up delay-100">
          {[
            {
              label: 'Word count',
              value: audit.wordCount ? `${audit.wordCount.toLocaleString()}` : '—',
              sub: audit.wordCount && audit.wordCount >= 600 ? 'Good ✓' : audit.wordCount ? 'Needs more' : '',
              ok: (audit.wordCount ?? 0) >= 600,
            },
            {
              label: 'Schema types',
              value: audit.schemaTypes?.length ? String(audit.schemaTypes.length) : 'None',
              sub: audit.schemaTypes?.join(', ') || 'Not found',
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
              <div className={`text-2xl font-black tabular-nums mb-0.5 ${item.ok ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'}`}>
                {item.value}
              </div>
              <div className="text-xs font-medium text-foreground mb-0.5">{item.label}</div>
              <div className="text-[11px] text-muted-foreground truncate">{item.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Findings ── */}
        {criticals.length > 0 && (
          <div className="surface-card rounded-2xl p-6 mb-4 fade-up delay-150">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                <XCircle className="h-4 w-4 text-red-500" />
              </div>
              <h2 className="font-bold text-foreground">
                Critical Issues
                <span className="ml-2 text-xs font-semibold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full">
                  {criticals.length}
                </span>
              </h2>
            </div>
            <div className="space-y-2">
              {criticals.map((f, i) => <FindingRow key={i} f={f} />)}
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="surface-card rounded-2xl p-6 mb-4 fade-up delay-200">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
              </div>
              <h2 className="font-bold text-foreground">
                Warnings
                <span className="ml-2 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full">
                  {warnings.length}
                </span>
              </h2>
            </div>
            <div className="space-y-2">
              {warnings.map((f, i) => <FindingRow key={i} f={f} />)}
            </div>
          </div>
        )}

        {suggestions.length > 0 && (
          <div className="surface-card rounded-2xl p-6 mb-4 fade-up delay-250">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Lightbulb className="h-4 w-4 text-blue-500" />
              </div>
              <h2 className="font-bold text-foreground">
                Suggestions
                <span className="ml-2 text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-full">
                  {suggestions.length}
                </span>
              </h2>
            </div>
            <div className="space-y-2">
              {suggestions.map((f, i) => <FindingRow key={i} f={f} />)}
            </div>
          </div>
        )}

        {/* ── Detailed signals ── */}
        <div className="surface-card rounded-2xl p-6 mb-5 fade-up delay-300">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </div>
            <h2 className="font-bold text-foreground">All Signals</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-2.5">
            {[
              { icon: Brain,      label: 'Schema markup',      value: audit.hasSchema ? (audit.schemaTypes?.join(', ') || 'Found') : 'Missing',           ok: audit.hasSchema },
              { icon: CheckCircle,label: 'FAQ schema',          value: audit.hasFaqSchema ? 'Present' : 'Not found',                                        ok: audit.hasFaqSchema },
              { icon: CheckCircle,label: 'Article schema',      value: audit.hasArticleSchema ? 'Present' : 'Not found',                                    ok: audit.hasArticleSchema },
              { icon: Globe,      label: 'OG tags',             value: audit.hasOgTags ? 'Present' : 'Missing',                                             ok: audit.hasOgTags },
              { icon: ShieldCheck,label: 'AI bots allowed',     value: audit.robotsBlocked ? 'Blocked ⚠' : 'Allowed ✓',                                    ok: !audit.robotsBlocked },
              { icon: FileText,   label: 'Meta description',    value: audit.hasMetaDescription ? `${audit.metaDescription?.slice(0, 50)}…` : 'Missing',   ok: audit.hasMetaDescription },
              { icon: FileText,   label: 'Meta title',          value: audit.metaTitle ? audit.metaTitle.slice(0, 50) : 'Missing',                         ok: !!audit.metaTitle },
              { icon: CheckCircle,label: 'Canonical tag',       value: audit.hasCanonical ? 'Present' : 'Missing',                                          ok: audit.hasCanonical },
              { icon: FileText,   label: 'H1 tag',              value: audit.h1Count === 1 ? `"${audit.h1Text?.slice(0, 40)}"` : `${audit.h1Count} found`, ok: audit.h1Count === 1 },
              { icon: List,       label: 'H2 headings',         value: `${audit.h2Count ?? 0} found`,                                                       ok: (audit.h2Count ?? 0) >= 3 },
              { icon: List,       label: 'Question headings',   value: `${audit.questionHeadings ?? 0} found`,                                             ok: (audit.questionHeadings ?? 0) >= 3 },
              { icon: List,       label: 'Lists & tables',      value: `${audit.listCount ?? 0} lists, ${audit.tableCount ?? 0} tables`,                   ok: ((audit.listCount ?? 0) + (audit.tableCount ?? 0)) >= 3 },
              { icon: FileText,   label: 'First para length',   value: `${audit.firstParaWordCount ?? 0} words`,                                           ok: (audit.firstParaWordCount ?? 0) >= 40 && (audit.firstParaWordCount ?? 0) <= 80 },
              { icon: Image,      label: 'Image alt coverage',  value: audit.imageCount ? `${audit.imageCount - (audit.imagesWithoutAlt ?? 0)}/${audit.imageCount} have alt` : 'No images', ok: (audit.imagesWithoutAlt ?? 0) === 0 },
              { icon: ExternalLink,label: 'Internal links',     value: `${audit.internalLinks ?? 0} found`,                                                ok: (audit.internalLinks ?? 0) >= 3 },
            ].map(row => (
              <div key={row.label} className="flex items-start gap-3 p-3 rounded-xl bg-muted/30">
                <row.icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${row.ok ? 'text-green-500' : 'text-red-400'}`} />
                <div className="min-w-0">
                  <div className="text-xs text-muted-foreground mb-0.5">{row.label}</div>
                  <div className="text-sm font-medium text-foreground truncate">{row.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="surface-card rounded-2xl p-8 text-center fade-up delay-400 mb-5">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-6 w-6 text-primary" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-foreground mb-2">
            Want these fixed — fast?
          </h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto leading-relaxed">
            Marrai offers hands-on AEO implementation for Indian B2B companies.
            We handle schema, content, and technical fixes so you rank in AI answers.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="https://calendly.com/marrai/aeo-consult"
              target="_blank"
              rel="noopener noreferrer"
              className="h-11 px-6 rounded-xl font-semibold text-sm bg-primary text-primary-foreground hover:opacity-90 transition-opacity inline-flex items-center gap-2 justify-center"
            >
              Book free 30-min call
              <ArrowLeft className="h-3.5 w-3.5 rotate-[135deg]" />
            </a>
            <Link
              href="/audit"
              className="h-11 px-6 rounded-xl font-medium text-sm border border-border hover:bg-muted transition-colors inline-flex items-center gap-2 justify-center text-foreground"
            >
              <Zap className="h-3.5 w-3.5" />
              Audit another page
            </Link>
          </div>
        </div>

      </main>
    </div>
  )
}