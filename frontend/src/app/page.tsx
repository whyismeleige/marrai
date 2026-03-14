import Link from 'next/link'
import {
  ArrowRight, CheckCircle, Zap, Target,
  Cpu, FileText, MessageSquare, BarChart3, Globe,
  ShieldCheck, ChevronRight, Search, Sparkles, Brain,
  TrendingUp, AlertCircle, AlertTriangle,
} from 'lucide-react'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'
import NavAuthButtons from '@/components/ui/nav-auth-buttons'
import MobileNav from '@/components/ui/mobile-nav'

/* ── Data ─────────────────────────────────────────────────── */

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how-it-works' },
  { label: 'FAQ', href: '#faq' },
]

const FEATURES = [
  {
    icon: FileText,
    title: 'Schema Markup',
    desc: 'Detects structured data AI engines rely on to understand and cite your content.',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
  },
  {
    icon: MessageSquare,
    title: 'Question Headings',
    desc: 'Checks if your pages answer natural language queries the way AI tools expect.',
    color: 'text-blue-500',
    bg: 'bg-blue-500/10',
  },
  {
    icon: Globe,
    title: 'Content Structure',
    desc: 'Evaluates paragraph length, list usage, and overall readability for AI parsing.',
    color: 'text-cyan-500',
    bg: 'bg-cyan-500/10',
  },
  {
    icon: Search,
    title: 'Meta Clarity',
    desc: 'Reviews titles, descriptions, and canonical signals for AI content indexing.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
  {
    icon: BarChart3,
    title: 'AI Visibility Score',
    desc: 'A single 0–100 score that benchmarks your AEO readiness at a glance.',
    color: 'text-amber-500',
    bg: 'bg-amber-500/10',
  },
  {
    icon: Target,
    title: 'Prioritised Fixes',
    desc: 'Ranked, actionable issues so you know exactly what to tackle first.',
    color: 'text-rose-500',
    bg: 'bg-rose-500/10',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Paste your URL',
    desc: 'Any page — homepage, product page, or blog post. No setup required.',
    icon: Globe,
  },
  {
    n: '02',
    title: 'We analyse it',
    desc: 'Our engine checks 20+ AEO signals across schema, content, and structure.',
    icon: Brain,
  },
  {
    n: '03',
    title: 'Get your report',
    desc: 'A full audit with your score, prioritised issues, and actionable fixes.',
    icon: Sparkles,
  },
]

const FAQS = [
  {
    q: 'What is Answer Engine Optimization (AEO)?',
    a: 'AEO is the practice of optimising your content so AI search engines like ChatGPT, Perplexity, and Gemini surface and cite your website when users ask relevant questions.',
  },
  {
    q: 'Is the audit really free?',
    a: 'Yes, completely. No credit card, no hidden fees. We generate leads for our agency services through the free tool — you get genuine value at zero cost.',
  },
  {
    q: 'How long does the audit take?',
    a: 'Under 60 seconds. We fetch your page, run 20+ checks, and generate a prioritised report with a score, issues, and fixes.',
  },
  {
    q: 'What do you check exactly?',
    a: 'Schema markup, FAQ and question headings, content length and structure, meta tags, canonical signals, heading hierarchy, image alt text, internal linking, and more.',
  },
  {
    q: 'How is Marrai different from traditional SEO tools?',
    a: "Traditional SEO tools optimise for Google's crawler. Marrai is purpose-built for AI engines — checking the exact signals that ChatGPT, Perplexity, and Gemini use to decide what to cite.",
  },
]

const STATS = [
  { value: '73%', label: 'of B2B buyers use AI tools before searching Google' },
  { value: '20+', label: 'AEO signals checked per audit' },
  { value: '<60s', label: 'to receive your full prioritised report' },
]

/* ── Logo ────────────────────────────────────────────────── */

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group">
      <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
        <Cpu className="h-3.5 w-3.5 text-primary-foreground" />
      </div>
      <span className="font-bold text-[15px] tracking-tight text-foreground">Marrai</span>
    </Link>
  )
}

/* ── Nav ─────────────────────────────────────────────────── */

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-6">
        <Logo />

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="h-8 px-3.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 inline-flex items-center transition-colors"
            >
              {l.label}
            </a>
          ))}
        </nav>

        {/* Desktop auth */}
        <div className="hidden md:flex items-center gap-2">
          <AnimatedThemeToggler />
          <NavAuthButtons />
        </div>

        {/* Mobile nav (hamburger) */}
        <MobileNav />
      </div>
    </header>
  )
}

/* ── Score Mockup Card ───────────────────────────────────── */

function ScoreMockup() {
  const mockFindings = [
    { type: 'critical', text: 'Missing FAQPage schema markup' },
    { type: 'warning',  text: 'No question-style H2 headings' },
    { type: 'good',     text: 'Organization schema detected' },
    { type: 'warning',  text: 'Meta description too short' },
  ]

  const catBars = [
    { label: 'Schema',    score: 14, max: 25, color: 'bg-violet-500' },
    { label: 'Content',   score: 22, max: 30, color: 'bg-blue-500'   },
    { label: 'Technical', score: 19, max: 25, color: 'bg-emerald-500' },
    { label: 'Structure', score: 12, max: 20, color: 'bg-amber-500'  },
  ]

  return (
    <div className="relative flex items-center justify-center lg:justify-end fade-in delay-200">
      {/* Glow behind card */}
      <div
        className="absolute inset-0 glow-pulse"
        style={{
          background: 'radial-gradient(ellipse at center, oklch(0.70 0.20 264 / 0.15) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Floating card */}
      <div className="relative float-card w-full max-w-sm lg:max-w-md">
        <div className="surface-card rounded-2xl overflow-hidden shadow-2xl shadow-black/20">

          {/* Card header */}
          <div className="px-5 py-4 border-b border-border/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-md bg-muted flex items-center justify-center">
                <Globe className="h-3 w-3 text-muted-foreground" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">example.com</span>
            </div>
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 pulse-dot" />
              Live
            </span>
          </div>

          {/* Score section */}
          <div className="px-5 py-5 flex items-center gap-5 border-b border-border/60">
            {/* Ring */}
            <div className="relative shrink-0">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="32" fill="none" strokeWidth="7" className="stroke-muted" />
                <circle
                  cx="40" cy="40" r="32" fill="none" strokeWidth="7"
                  className="stroke-primary"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 32}`}
                  strokeDashoffset={`${2 * Math.PI * 32 * (1 - 0.67)}`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-black text-foreground">67</span>
              </div>
            </div>
            {/* Labels */}
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest mb-0.5">AEO Score</p>
              <p className="text-xl font-black text-foreground leading-none">67 / 100</p>
              <span className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                Good
              </span>
            </div>
          </div>

          {/* Category bars */}
          <div className="px-5 py-4 border-b border-border/60 space-y-3">
            {catBars.map((bar, idx) => (
              <div key={bar.label} style={{ animationDelay: `${idx * 60}ms` }} className="fade-up">
                <div className="flex justify-between text-[11px] mb-1.5">
                  <span className="text-muted-foreground font-medium">{bar.label}</span>
                  <span className="text-foreground font-bold tabular-nums">{bar.score}/{bar.max}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full ${bar.color} transition-all duration-1000`}
                    style={{ 
                      width: `${(bar.score / bar.max) * 100}%`,
                      animation: `progress-fill 1.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards`,
                      animationDelay: `${idx * 100}ms`
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Findings */}
          <div className="px-5 py-4 space-y-2">
            {mockFindings.map((f, i) => (
              <div key={i} className="flex items-start gap-2 fade-up" style={{ animationDelay: `${200 + i * 60}ms` }}>
                {f.type === 'critical' ? (
                  <AlertCircle className="h-3.5 w-3.5 text-red-500 shrink-0 mt-0.5 animate-bounce" />
                ) : f.type === 'warning' ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                )}
                <span className="text-[11px] text-muted-foreground leading-relaxed">{f.text}</span>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="px-5 pb-5">
            <div className="h-9 rounded-xl bg-primary flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 transition-all duration-300 hover:shadow-lg hover:shadow-primary/30 hover:scale-105 active:scale-95">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground animate-pulse" />
              <span className="text-[12px] font-bold text-primary-foreground tracking-tight">View full report</span>
              <ArrowRight className="h-3 w-3 text-primary-foreground transition-transform group-hover:translate-x-1" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── FAQ Item ─────────────────────────────────────────── */

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="group border-b border-border/60 last:border-0">
      <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none text-sm font-semibold text-foreground hover:text-primary transition-colors select-none hover:bg-muted/30 px-3 -mx-3 rounded-md">
        {q}
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300 group-open:rotate-90" />
      </summary>
      <p className="pb-5 text-sm text-muted-foreground leading-relaxed -mt-1 animate-accordion-open px-3">{a}</p>
    </details>
  )
}

/* ── Page ─────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1">

        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Grid */}
          <div className="absolute inset-0 hero-grid" />
          {/* Gradient fade at edges */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-background/0 hidden lg:block" />

          {/* Ambient glow */}
          <div
            className="absolute -top-32 left-1/3 w-[600px] h-[400px] rounded-full opacity-25 blur-[120px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, oklch(0.70 0.20 264 / 0.5) 0%, transparent 70%)' }}
          />
          <div
            className="absolute top-48 right-0 w-[400px] h-[400px] rounded-full opacity-15 blur-[100px] pointer-events-none"
            style={{ background: 'radial-gradient(circle, oklch(0.72 0.16 190 / 0.4) 0%, transparent 70%)' }}
          />

          <div className="max-w-6xl mx-auto px-5 pt-16 pb-20 lg:pt-24 lg:pb-28">
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">

              {/* Left: copy */}
              <div>
                {/* Eyebrow */}
                <div className="badge mb-7 fade-up">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
                  Answer Engine Optimization · Free Tool
                </div>

                {/* Headline */}
                <h1 className="text-[2.8rem] sm:text-5xl md:text-6xl lg:text-[3.75rem] font-black tracking-[-0.04em] leading-[0.90] text-foreground mb-5 fade-up delay-100">
                  Your business<br />
                  is{' '}
                  <span className="gradient-text">invisible</span>
                  <br />
                  to AI search.
                </h1>

                <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-8 max-w-md fade-up delay-150">
                  ChatGPT, Perplexity, and Gemini are your new homepage. Find out if they&apos;re recommending you — and exactly how to fix it. Free in 60 seconds.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-9 fade-up delay-200">
                  <Link href="/audit" className="btn-primary text-sm h-11 px-6">
                    Run Free Audit
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href="#how-it-works" className="btn-outline text-sm h-11 px-6">
                    See how it works
                  </a>
                </div>

                {/* Trust pills */}
                <div className="flex flex-wrap gap-x-5 gap-y-2 fade-up delay-300">
                  {[
                    { icon: Zap,         text: '100% free, always' },
                    { icon: ShieldCheck, text: 'No credit card' },
                    { icon: BarChart3,   text: '20+ AEO checks' },
                  ].map(t => (
                    <div key={t.text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <t.icon className="h-3.5 w-3.5 text-primary" />
                      {t.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: mockup */}
              <ScoreMockup />
            </div>
          </div>
        </section>

        {/* ── Stats strip ───────────────────────────────────── */}
        <div className="border-y border-border/60 bg-muted/20">
          <div className="max-w-4xl mx-auto px-5 py-10">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-4 text-center sm:divide-x sm:divide-border/60">
              {STATS.map((s, i) => (
                <div key={s.value} className="px-4 fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-1.5">
                    {s.value}
                  </div>
                  <div className="text-sm text-muted-foreground leading-snug max-w-[200px] mx-auto">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Problem ───────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-5 py-20 sm:py-24">
          <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="fade-up">
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-primary mb-4">The Problem</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-[-0.03em] text-foreground mb-5 leading-tight">
                The AI search revolution<br />is already here
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Traditional SEO won&apos;t save you. When someone asks ChatGPT &ldquo;what&apos;s the best project management tool for startups?&rdquo; — you either appear in the answer, or you don&apos;t exist.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                AEO is the new frontier. Businesses that optimise for AI search today will own their category tomorrow. The window is open — but it&apos;s closing fast.
              </p>
              <div className="space-y-3">
                {[
                  'AI tools now handle millions of buying decisions daily',
                  'Traditional SEO does nothing for AI visibility',
                  'First-movers in AEO will dominate their category',
                ].map((item, i) => (
                  <div key={item} className="flex items-start gap-2.5 fade-up" style={{ animationDelay: `${i * 80}ms` }}>
                    <CheckCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual: AI platform pills */}
            <div className="flex flex-col gap-4 fade-up delay-100">
              {[
                { name: 'ChatGPT',    icon: '✦', color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', cites: '400M+ weekly users' },
                { name: 'Perplexity', icon: '◈', color: 'text-blue-500',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    cites: '15M+ active users' },
                { name: 'Gemini',     icon: '◆', color: 'text-violet-500',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  cites: 'Built into Google' },
                { name: 'Claude',     icon: '◇', color: 'text-amber-500',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   cites: 'Enterprise favourite' },
              ].map((ai, i) => (
                <div
                  key={ai.name}
                  className="surface-card-hover rounded-xl p-4 flex items-center gap-4 fade-up transition-all duration-300 hover:translate-x-2 hover:shadow-md group"
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${ai.bg} border ${ai.border} shrink-0 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`}>
                    <span className={ai.color}>{ai.icon}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground">{ai.name}</p>
                    <p className="text-xs text-muted-foreground">{ai.cites}</p>
                  </div>
                  <div className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ai.bg} ${ai.color} border ${ai.border} transition-all duration-300 group-hover:scale-110`}>
                    Citing sources
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────── */}
        <section id="features" className="border-t border-border/60 bg-muted/20">
          <div className="max-w-6xl mx-auto px-5 py-20 sm:py-24">
            <div className="max-w-xl mb-14 fade-up">
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-primary mb-4">What we check</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-[-0.03em] text-foreground">
                20+ signals that determine<br />your AI visibility
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className="surface-card-hover rounded-xl p-5 fade-up transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/10 group"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-4 ${f.bg} transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110`}>
                    <f.icon className={`h-4.5 w-4.5 ${f.color}`} style={{ height: '1.1rem', width: '1.1rem' }} />
                  </div>
                  <h3 className="font-bold text-foreground text-sm mb-2">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────── */}
        <section id="how-it-works" className="border-t border-border/60">
          <div className="max-w-6xl mx-auto px-5 py-20 sm:py-24">
            <div className="max-w-xl mb-14 fade-up">
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-primary mb-4">Process</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-[-0.03em] text-foreground">
                Three steps to clarity
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-6 relative">
              {STEPS.map((step, i) => (
                <div key={step.n} className="relative fade-up" style={{ animationDelay: `${i * 100}ms` }}>
                  {/* Connector */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-7 left-[calc(100%-1.5rem)] right-0 h-px border-t border-dashed border-border z-10 connector-line" />
                  )}
                  <div className="surface-card rounded-xl p-6 h-full transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-1">
                    {/* Step number + icon */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-12 h-12 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                        <step.icon className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-xs font-black text-primary tracking-widest">{step.n}</span>
                    </div>
                    <h3 className="font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA under steps */}
            <div className="mt-10 text-center fade-up delay-300">
              <Link href="/audit" className="btn-primary h-11 px-7 text-sm">
                Start your free audit
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ── FAQ ───────────────────────────────────────────── */}
        <section id="faq" className="border-t border-border/60 bg-muted/20">
          <div className="max-w-3xl mx-auto px-5 py-20 sm:py-24">
            <div className="mb-12 text-center fade-up">
              <p className="text-xs font-bold tracking-[0.18em] uppercase text-primary mb-4">FAQ</p>
              <h2 className="text-3xl sm:text-4xl font-black tracking-[-0.03em] text-foreground">
                Common questions
              </h2>
            </div>
            <div className="surface-card px-5 sm:px-7 divide-y divide-border/60 rounded-2xl fade-up">
              {FAQS.map((faq, i) => (
                <FaqItem key={i} q={faq.q} a={faq.a} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ─────────────────────────────────────── */}
        <section className="border-t border-border/60">
          <div className="relative overflow-hidden">
            <div className="absolute inset-0 hero-grid opacity-40" />
            <div
              className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full opacity-20 blur-[90px] pointer-events-none"
              style={{ background: 'radial-gradient(ellipse, oklch(0.70 0.20 264) 0%, transparent 70%)' }}
            />

            <div className="relative max-w-2xl mx-auto px-5 py-24 sm:py-32 text-center">
              <div className="badge mx-auto mb-8 fade-up">
                <Sparkles className="h-3 w-3 text-primary" />
                Free forever · No signup required
              </div>
              <h2 className="text-4xl sm:text-5xl font-black tracking-[-0.04em] text-foreground mb-5 leading-[0.95] fade-up delay-100">
                Find out where you<br />stand in AI search.
              </h2>
              <p className="text-muted-foreground mb-10 text-base leading-relaxed fade-up delay-150">
                Get a full AEO audit with your score, prioritised issues, and exact fixes.
                Takes 60 seconds. Costs nothing.
              </p>
              <div className="fade-up delay-200">
                <Link href="/audit" className="btn-primary h-12 px-8 text-base">
                  Run Free Audit
                  <ArrowRight className="h-[1.1rem] w-[1.1rem]" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ────────────────────────────────────────── */}
      <footer className="border-t border-border/60 bg-muted/10">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-xs text-muted-foreground text-center order-last sm:order-none">
            © {new Date().getFullYear()} Marrai · Built in Hyderabad 🇮🇳
          </p>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#faq" className="text-xs text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            <Link href="/audit" className="text-xs text-primary hover:opacity-80 transition-opacity font-semibold">Free Audit</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}