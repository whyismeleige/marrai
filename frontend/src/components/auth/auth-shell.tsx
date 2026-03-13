'use client'

import Link from 'next/link'
import { Cpu, ArrowLeft, CheckCircle2, Zap, BarChart3, Code2 } from 'lucide-react'

const PROOF = [
  { label: 'AEO signals', value: '20+' },
  { label: 'Audit time',  value: '45s' },
  { label: 'Free',        value: '100%' },
]

const FEATURES = [
  { icon: Zap,       text: 'AI visibility score in 60s' },
  { icon: BarChart3, text: 'Competitor benchmarking' },
  { icon: Code2,     text: 'Ready-to-paste schema snippets' },
]

interface AuthShellProps {
  mode: 'sign-in' | 'sign-up'
  children: React.ReactNode
}

export default function AuthShell({ mode, children }: AuthShellProps) {
  const isSignUp = mode === 'sign-up'

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">

      {/* ══════════════════════════════════════════════════
          LEFT PANEL — desktop only
      ══════════════════════════════════════════════════ */}
      <aside className="
        hidden lg:flex flex-col
        relative lg:w-[48%] xl:w-[50%]
        min-h-screen overflow-hidden
        px-12 xl:px-16 py-12
      ">
        {/* Dot-grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, oklch(0.08 0.006 265 / 0.07) 1px, transparent 1px)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* Radial glow */}
        <div
          className="absolute -top-32 -right-32 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, oklch(0.55 0.23 264 / 0.08) 0%, transparent 65%)',
            filter: 'blur(60px)',
          }}
        />

        <div className="relative flex flex-col h-full">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 w-fit group fade-up">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/35 transition-shadow">
              <Cpu className="h-[18px] w-[18px] text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">Marrai</span>
          </Link>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center max-w-sm">

            <div className="badge w-fit mb-5 fade-up delay-100">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Answer Engine Optimization
            </div>

            <h1 className="text-[2.75rem] xl:text-5xl font-black tracking-tight leading-[1.04] mb-4 fade-up delay-150">
              <span className="gradient-text">Get cited</span>
              {' '}by<br />AI search.
            </h1>

            <p className="text-[0.9375rem] text-muted-foreground leading-relaxed mb-10 fade-up delay-200">
              Marrai audits your site for AI visibility so ChatGPT,
              Perplexity, and Gemini actually recommend your brand.
            </p>

            {/* Feature list */}
            <ul className="space-y-3 mb-10 fade-up delay-250">
              {FEATURES.map(f => (
                <li key={f.text} className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon className="h-3.5 w-3.5 text-primary" />
                  </div>
                  <span className="text-sm">{f.text}</span>
                </li>
              ))}
            </ul>

            {/* Proof bar */}
            <div className="flex items-stretch border border-border rounded-2xl overflow-hidden fade-up delay-300">
              {PROOF.map((p, i) => (
                <div
                  key={p.label}
                  className={`flex-1 flex flex-col items-center justify-center py-4 bg-card ${i < PROOF.length - 1 ? 'border-r border-border' : ''}`}
                >
                  <span className="text-xl font-black text-primary">{p.value}</span>
                  <span className="text-[10px] text-muted-foreground mt-0.5">{p.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Back link */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mt-auto fade-up delay-400"
          >
            <ArrowLeft className="h-3 w-3" />
            Back to home
          </Link>
        </div>
      </aside>

      {/* Vertical divider — desktop */}
      <div className="hidden lg:block w-px bg-border self-stretch" />

      {/* ══════════════════════════════════════════════════
          RIGHT PANEL — form (also the full mobile layout)
      ══════════════════════════════════════════════════ */}
      <main className="flex-1 flex flex-col">

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center justify-between px-5 py-5 border-b border-border fade-up">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
              <Cpu className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-base tracking-tight">Marrai</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3 w-3" />
            Home
          </Link>
        </div>

        {/* Centered form area */}
        <div className="flex-1 flex items-start lg:items-center justify-center px-5 py-10 lg:py-12">
          <div className="w-full max-w-[380px]">

            {/* Heading */}
            <div className="mb-7 fade-up">
              <h2 className="text-[1.625rem] font-black tracking-tight">
                {isSignUp ? 'Create your account' : 'Welcome back'}
              </h2>
              <p className="text-sm text-muted-foreground mt-1.5">
                {isSignUp
                  ? 'Start auditing your AI search visibility — free.'
                  : 'Sign in to your Marrai dashboard.'}
              </p>
            </div>

            {/* Clerk slot */}
            <div className="fade-up delay-100">
              {children}
            </div>

            {/* Toggle */}
            <p className="mt-6 text-sm text-center text-muted-foreground fade-up delay-200">
              {isSignUp ? (
                <>Already have an account?{' '}
                  <Link href="/sign-in" className="text-primary font-semibold hover:underline underline-offset-2">
                    Sign in
                  </Link>
                </>
              ) : (
                <>Don&apos;t have an account?{' '}
                  <Link href="/sign-up" className="text-primary font-semibold hover:underline underline-offset-2">
                    Sign up free
                  </Link>
                </>
              )}
            </p>

            {/* Trust note */}
            <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground fade-up delay-300">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
              No credit card required · Free forever
            </div>

            {/* Mobile proof strip */}
            <div className="lg:hidden mt-8 pt-6 border-t border-border flex items-center justify-center gap-6 fade-up delay-400">
              {PROOF.map((p, i) => (
                <div key={p.label} className="flex items-center gap-6">
                  {i > 0 && <div className="w-px h-7 bg-border" />}
                  <div className="text-center">
                    <p className="text-sm font-black text-primary leading-none">{p.value}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{p.label}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}