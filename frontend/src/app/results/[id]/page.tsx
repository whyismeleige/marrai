import { getAudit } from '@/lib/mongodb'
import { notFound } from 'next/navigation'
import {
  CheckCircle, XCircle, ArrowLeft,
  Loader2, Cpu, FileText, List, ArrowRight, RotateCcw
} from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'

/* ── Helpers ────────────────────────────────────────── */
function getGrade(score: number) {
  if (score >= 80) return { grade: 'A', label: 'Excellent', cls: 'status-good' }
  if (score >= 60) return { grade: 'B', label: 'Good',      cls: 'text-primary' }
  if (score >= 40) return { grade: 'C', label: 'Fair',      cls: 'status-warn'  }
  return              { grade: 'D', label: 'Needs work', cls: 'status-bad'   }
}

function ScoreRing({ score }: { score: number }) {
  const r = 40
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference
  const color =
    score >= 80 ? '#22c55e' :
    score >= 60 ? '#6366f1' :
    score >= 40 ? '#f59e0b' : '#ef4444'

  return (
    <svg width="110" height="110" viewBox="0 0 110 110" className="-rotate-90">
      <circle cx="55" cy="55" r={r} fill="none" strokeWidth="8" className="stroke-border" />
      <circle
        cx="55" cy="55" r={r}
        fill="none"
        strokeWidth="8"
        stroke={color}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
    </svg>
  )
}

/* ── Shared nav ─────────────────────────────────────── */
function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-[7px] bg-primary flex items-center justify-center">
            <Cpu className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-foreground">Marrai</span>
        </Link>
        <ThemeToggle />
      </div>
    </header>
  )
}

/* ── Page ───────────────────────────────────────────── */
export default async function ResultsPage({
  params,
}: {
  params: Promise<{ id: string }> // ✅ Next.js 15: params is a Promise
}) {
  const { id } = await params // ✅ must be awaited

  const audit = await getAudit(id)
  if (!audit) notFound()

  /* ── Pending / processing ── */
  if (audit.status === 'pending' || audit.status === 'processing') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center px-5 py-20">
          <div className="text-center max-w-sm">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping" />
              <div className="w-16 h-16 rounded-full border-2 border-border border-t-primary animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Cpu className="h-6 w-6 text-primary" />
              </div>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Analysing your site…</h2>
            <p className="text-sm text-muted-foreground mb-6">This takes 30–60 seconds</p>
            <div className="space-y-2 text-sm text-left bg-muted/50 rounded-lg p-4 mb-6">
              {[
                'Fetching your webpage',
                'Checking schema markup',
                'Analysing content structure',
                'Calculating your score',
              ].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  {i < 3 ? (
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  ) : (
                    <Loader2 className="h-3.5 w-3.5 text-primary animate-spin shrink-0" />
                  )}
                  <span className={i < 3 ? 'text-muted-foreground' : 'text-foreground'}>{s}</span>
                </div>
              ))}
            </div>
            {/* Client refresh — extracted to avoid 'use client' on server page */}
            <RefreshButton />
          </div>
        </div>
      </div>
    )
  }

  /* ── Failed ── */
  if (audit.status === 'failed') {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <div className="flex-1 flex items-center justify-center px-5 py-20">
          <div className="surface-card rounded-xl p-8 max-w-sm w-full text-center">
            <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <XCircle className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-lg font-bold text-foreground mb-2">Analysis failed</h2>
            <p className="text-sm text-muted-foreground mb-6">
              {audit.issues?.[0] || 'Something went wrong. Please try again.'}
            </p>
            <Link
              href="/audit"
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Try again
            </Link>
          </div>
        </div>
      </div>
    )
  }

  /* ── Completed ── */
  const { grade, label, cls } = getGrade(audit.score)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-3xl mx-auto w-full px-5 py-12">

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>

        {/* ── Score card ── */}
        <div className="surface-card rounded-xl p-8 mb-4 fade-up">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="relative shrink-0">
              <ScoreRing score={audit.score} />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-foreground leading-none">{audit.score}</span>
                <span className="text-xs text-muted-foreground">/100</span>
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-3xl font-black ${cls}`}>Grade {grade}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                  audit.score >= 80 ? 'bg-green-500/10 border-green-500/25 text-green-600 dark:text-green-400'
                  : audit.score >= 60 ? 'bg-primary/10 border-primary/25 text-primary'
                  : audit.score >= 40 ? 'bg-yellow-500/10 border-yellow-500/25 text-yellow-700 dark:text-yellow-400'
                  : 'bg-red-500/10 border-red-500/25 text-red-700 dark:text-red-400'
                }`}>{label}</span>
              </div>
              <p className="text-sm text-muted-foreground mb-3 break-all">{audit.url}</p>
              <p className="text-sm text-foreground">
                {audit.score >= 80
                  ? 'Your page is well-optimised for AI search. Keep it up.'
                  : audit.score >= 60
                  ? 'Good start — a few targeted improvements will significantly boost your score.'
                  : audit.score >= 40
                  ? 'Moderate optimisation needed. Address the issues below to improve your visibility.'
                  : 'Significant AEO work needed. Start with the critical issues below.'}
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 border-t border-border">
            {[
              { label: 'Schema Markup', value: audit.hasSchema ? '✓ Present' : '✗ Missing', ok: audit.hasSchema },
              { label: 'H1 Tags',       value: String(audit.h1Count),          ok: audit.h1Count === 1 },
              { label: 'Q Headings',    value: String(audit.questionHeadings), ok: audit.questionHeadings > 0 },
              { label: 'Structured',    value: `${audit.listCount + audit.tableCount} elements`, ok: (audit.listCount + audit.tableCount) > 0 },
            ].map((item) => (
              <div key={item.label} className="bg-muted/40 rounded-lg p-3">
                <div className={`text-base font-bold mb-0.5 ${item.ok ? 'status-good' : 'status-bad'}`}>
                  {item.value}
                </div>
                <div className="text-xs text-muted-foreground">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Critical issues ── */}
        {audit.issues?.length > 0 && (
          <div className="surface-card rounded-xl p-6 mb-4 fade-up delay-100">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-md bg-destructive/10 flex items-center justify-center">
                <XCircle className="h-4 w-4 text-destructive" />
              </div>
              <h2 className="font-semibold text-foreground">
                Critical Issues
                <span className="ml-2 text-xs font-medium text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full">
                  {audit.issues.length}
                </span>
              </h2>
            </div>
            <div className="space-y-2">
              {audit.issues.map((issue: string, i: number) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg border border-destructive/15 bg-destructive/5"
                >
                  <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground">{issue}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Recommendations ── */}
        {audit.recommendations?.length > 0 && (
          <div className="surface-card rounded-xl p-6 mb-4 fade-up delay-200">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center">
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
              <h2 className="font-semibold text-foreground">
                Recommendations
                <span className="ml-2 text-xs font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                  {audit.recommendations.length}
                </span>
              </h2>
            </div>
            <div className="space-y-2">
              {audit.recommendations.map((rec: string, i: number) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-lg border border-primary/15 bg-primary/5"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-primary">{i + 1}</span>
                  </div>
                  <span className="text-sm text-foreground">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Content details ── */}
        <div className="surface-card rounded-xl p-6 mb-4 fade-up delay-300">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-7 h-7 rounded-md bg-muted flex items-center justify-center">
              <FileText className="h-4 w-4 text-muted-foreground" />
            </div>
            <h2 className="font-semibold text-foreground">Content Details</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              {
                icon: List,
                label: 'Word count',
                value: `${audit.listCount ?? '—'} words`, // ✅ fixed: was audit.listCount
                note: (audit.listCount ?? 0) < 300 ? '(300+ recommended)' : null,
              },
              {
                icon: FileText,
                label: 'First paragraph',
                value: `${audit.firstParaWordCount} words`,
                note: (audit.firstParaWordCount < 40 || audit.firstParaWordCount > 80) ? '(40–80 recommended)' : null,
              },
              {
                icon: List,
                label: 'Structured content',
                value: `${audit.listCount} lists, ${audit.tableCount} tables`,
                note: null,
              },
              {
                icon: FileText,
                label: 'Heading structure',
                value: `${audit.h1Count} H1, ${audit.questionHeadings} question headings`,
                note: null,
              },
            ].map((item) => (
              <div key={item.label} className="p-3 rounded-lg bg-muted/40">
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1.5">
                  <item.icon className="h-3 w-3" />
                  {item.label}
                </div>
                <div className="text-sm font-medium text-foreground">
                  {item.value}
                  {item.note && <span className="ml-1.5 text-xs status-warn">{item.note}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="surface-card rounded-xl p-8 text-center fade-up delay-400">
          <h2 className="text-xl font-bold text-foreground mb-2">Want help fixing these issues?</h2>
          <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
            Marrai offers hands-on AEO implementation for Indian B2B companies.
            Book a free 30-minute consultation.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:hello@marrai.in?subject=AEO Consultation Request"
              className="inline-flex items-center justify-center gap-2 h-9 px-5 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Book free consultation
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
            <Link
              href="/audit"
              className="inline-flex items-center justify-center gap-2 h-9 px-5 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-muted transition-colors"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Audit another site
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Audit completed{' '}
          {new Date(audit.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          })}
        </p>
      </main>
    </div>
  )
}

/* ── Client component for refresh button ── */
// Kept separate so the server page doesn't need 'use client'
function RefreshButton() {
  // This renders in a server component context, so we use a simple form action
  // to avoid adding 'use client' to the whole page
  return (
    <form action="">
      <button
        type="submit"
        className="h-9 px-4 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
      >
        Refresh
      </button>
    </form>
  )
}