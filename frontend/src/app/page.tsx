import Link from 'next/link'
import {
  ArrowRight, CheckCircle, TrendingUp, Zap, Target,
  Cpu, FileText, MessageSquare, BarChart3, Globe,
  ShieldCheck, AlertTriangle, AlertCircle, ChevronRight,
  Search, Sparkles,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

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
  },
  {
    icon: MessageSquare,
    title: 'Question Headings',
    desc: 'Checks if your pages answer natural language queries the way AI tools expect.',
  },
  {
    icon: Globe,
    title: 'Content Structure',
    desc: 'Evaluates paragraph length, list usage, and overall readability for AI parsing.',
  },
  {
    icon: Search,
    title: 'Meta Clarity',
    desc: 'Reviews titles, descriptions, and canonical signals for AI content indexing.',
  },
  {
    icon: BarChart3,
    title: 'AI Visibility Score',
    desc: 'A single 0–100 score that benchmarks your AEO readiness at a glance.',
  },
  {
    icon: Target,
    title: 'Prioritised Fixes',
    desc: 'Ranked, actionable issues so you know exactly what to tackle first.',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Paste your URL',
    desc: 'Any page — homepage, product page, or blog post. No setup required.',
  },
  {
    n: '02',
    title: 'We analyse it',
    desc: 'Our engine checks 20+ AEO signals across schema, content, and structure.',
  },
  {
    n: '03',
    title: 'Get your report',
    desc: 'A full audit with your score, prioritised issues, and actionable fixes.',
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
    a: 'Traditional SEO tools are optimised for Google\'s crawler. AEO is a different signal set — we focus specifically on what makes AI engines cite, quote, and recommend your content.',
  },
]

/* ── Mock score card data ────────────────────────────────── */

const MOCK_FINDINGS = [
  { type: 'critical', icon: AlertCircle,  text: 'No schema markup detected' },
  { type: 'warning',  icon: AlertTriangle, text: 'First paragraph too short for AI extraction' },
  { type: 'warning',  icon: AlertTriangle, text: 'Missing FAQ / question-format headings' },
  { type: 'ok',       icon: CheckCircle,   text: 'Meta title & description present' },
]

const MOCK_SCORE = 34

/* ── Subcomponents ───────────────────────────────────────── */

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group shrink-0">
      <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
        <Cpu className="h-3.5 w-3.5 text-primary-foreground" />
      </div>
      <span className="font-semibold text-[15px] tracking-tight text-foreground">Marrai</span>
    </Link>
  )
}

function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between gap-8">
        <Logo />

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map(l => (
            <a
              key={l.href}
              href={l.href}
              className="px-3.5 h-8 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors inline-flex items-center"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/audit"
            className="btn-primary h-8 px-4 text-xs"
          >
            Free Audit
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </header>
  )
}

/* Score ring — static SVG at MOCK_SCORE */
function MockScoreRing({ score }: { score: number }) {
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color =
    score >= 70 ? 'oklch(0.65 0.18 142)' :
    score >= 45 ? 'oklch(0.75 0.17 75)' :
    'oklch(0.62 0.22 25)'

  return (
    <svg width="100" height="100" viewBox="0 0 100 100" fill="none">
      {/* Track */}
      <circle cx="50" cy="50" r={radius} stroke="currentColor" strokeWidth="7"
        className="text-border" fill="none" />
      {/* Progress */}
      <circle
        cx="50" cy="50" r={radius}
        stroke={color} strokeWidth="7"
        fill="none" strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
      />
      {/* Score text */}
      <text x="50" y="46" textAnchor="middle" fill="currentColor"
        className="text-foreground" fontSize="18" fontWeight="700" dy="0.35em">
        {score}
      </text>
      <text x="50" y="61" textAnchor="middle" fill="currentColor"
        className="text-muted-foreground" fontSize="8" dy="0.35em">
        / 100
      </text>
    </svg>
  )
}

/* Hero right-side product mockup */
function ScoreMockup() {
  return (
    <div className="relative w-full max-w-sm mx-auto lg:mx-0 fade-up delay-400">
      {/* Glow behind card */}
      <div className="absolute -inset-12 radial-glow opacity-60" style={{ background: 'radial-gradient(circle, oklch(0.70 0.20 264 / 0.18) 0%, transparent 70%)' }} />

      {/* Card */}
      <div className="relative glow-card p-5 shadow-2xl shadow-black/30">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-border">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
          </div>
          <div className="flex-1 h-5 rounded-md bg-muted/60 flex items-center px-2.5 gap-1.5">
            <Globe className="h-2.5 w-2.5 text-muted-foreground" />
            <span className="text-[10px] text-muted-foreground">yourwebsite.com</span>
          </div>
        </div>

        {/* Score section */}
        <div className="flex items-center gap-5 mb-5">
          <MockScoreRing score={MOCK_SCORE} />
          <div>
            <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mb-1">AEO Score</div>
            <div className="text-sm font-bold text-foreground mb-2">Poor Visibility</div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-status-bad">
              <AlertCircle className="h-2.5 w-2.5" />
              4 issues found
            </div>
          </div>
        </div>

        {/* Category bars */}
        <div className="grid grid-cols-4 gap-1.5 mb-5">
          {[
            { label: 'Schema', pct: 10 },
            { label: 'Content', pct: 55 },
            { label: 'Technical', pct: 60 },
            { label: 'Structure', pct: 40 },
          ].map(c => (
            <div key={c.label}>
              <div className="h-1 rounded-full bg-muted mb-1 overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${c.pct}%`,
                    background: c.pct >= 60 ? 'oklch(0.65 0.18 142)' : c.pct >= 40 ? 'oklch(0.75 0.17 75)' : 'oklch(0.62 0.22 25)',
                  }}
                />
              </div>
              <div className="text-[9px] text-muted-foreground text-center">{c.label}</div>
            </div>
          ))}
        </div>

        {/* Findings */}
        <div className="space-y-2">
          {MOCK_FINDINGS.map((f, i) => (
            <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg bg-muted/40 border border-border/50">
              <f.icon className={`h-3 w-3 mt-0.5 shrink-0 ${
                f.type === 'critical' ? 'text-red-400' :
                f.type === 'warning'  ? 'text-yellow-400' : 'text-green-400'
              }`} />
              <span className="text-[11px] text-muted-foreground leading-tight">{f.text}</span>
            </div>
          ))}
        </div>

        {/* CTA inside mockup */}
        <div className="mt-4 h-8 rounded-md bg-primary/90 flex items-center justify-center gap-1.5">
          <Sparkles className="h-3 w-3 text-primary-foreground" />
          <span className="text-[11px] font-semibold text-primary-foreground">View full report</span>
        </div>
      </div>
    </div>
  )
}

/* FAQ item */
function FaqItem({ q, a, i }: { q: string; a: string; i: number }) {
  return (
    <details
      className="group border-b border-border last:border-0"
    >
      <summary className="flex items-center justify-between gap-4 py-5 cursor-pointer list-none text-sm font-medium text-foreground hover:text-primary transition-colors select-none">
        {q}
        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 group-open:rotate-90" />
      </summary>
      <p className="pb-5 text-sm text-muted-foreground leading-relaxed -mt-1">{a}</p>
    </details>
  )
}

/* ── Page ────────────────────────────────────────────────── */

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1">

        {/* ── Hero ─────────────────────────────────────────── */}
        <section className="relative overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 hero-grid" />

          {/* Radial fade over grid */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/0 via-background/0 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/50 to-background/10 hidden lg:block" />

          {/* Top glow */}
          <div className="absolute -top-48 left-1/4 w-[500px] h-[500px] rounded-full opacity-30 blur-[100px]"
            style={{ background: 'radial-gradient(circle, oklch(0.70 0.20 264 / 0.4) 0%, transparent 70%)' }}
          />

          <div className="max-w-6xl mx-auto px-5 pt-20 pb-24 lg:pt-28 lg:pb-32">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">

              {/* Left: copy */}
              <div>
                {/* Eyebrow badge */}
                <div className="badge mb-8 fade-up">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
                  Answer Engine Optimization · Free Tool
                </div>

                {/* Headline */}
                <h1 className="text-5xl md:text-6xl lg:text-[4.25rem] font-black tracking-[-0.04em] leading-[0.92] text-foreground mb-6 fade-up delay-100">
                  Your business<br />
                  is{' '}
                  <span className="gradient-text">invisible</span>
                  <br />to AI search.
                </h1>

                {/* Sub */}
                <p className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed mb-10 fade-up delay-200">
                  ChatGPT, Perplexity, and Gemini now shape buying decisions — but most
                  websites score under 40. Find out where you stand in 60 seconds.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-10 fade-up delay-300">
                  <Link href="/audit" className="btn-primary">
                    Run Free Audit
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <a href="#how-it-works" className="btn-outline">
                    See how it works
                  </a>
                </div>

                {/* Trust row */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 fade-up delay-400">
                  {[
                    { icon: Zap, text: '100% free, always' },
                    { icon: ShieldCheck, text: 'No credit card' },
                    { icon: BarChart3, text: '20+ AEO checks' },
                  ].map(t => (
                    <div key={t.text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <t.icon className="h-3.5 w-3.5 text-primary" />
                      {t.text}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: score card mockup */}
              <ScoreMockup />
            </div>
          </div>
        </section>

        {/* ── Stats strip ──────────────────────────────────── */}
        <div className="border-y border-border/60 bg-muted/20">
          <div className="max-w-4xl mx-auto px-5 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-4 text-center sm:divide-x sm:divide-border/60">
              {[
                { value: '73%', label: 'of B2B buyers use AI tools before Google' },
                { value: '20+', label: 'AEO signals checked per audit' },
                { value: '<60s', label: 'to receive your full report' },
              ].map(s => (
                <div key={s.value} className="px-4">
                  <div className="text-4xl font-black tracking-tight text-foreground mb-1.5">
                    {s.value}
                  </div>
                  <div className="text-sm text-muted-foreground leading-snug">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Problem ──────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-5 py-24">
          <div className="grid md:grid-cols-2 gap-16 items-center">

            {/* Copy */}
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-4">The Problem</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-[-0.03em] text-foreground mb-5 leading-tight">
                The AI search revolution<br />is already here
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Traditional SEO won't save you. AI engines use fundamentally different signals —
                and most businesses have zero visibility into how they score, or why they're
                being ignored.
              </p>
              <Link href="/audit" className="btn-primary">
                Check my score
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Problem cards */}
            <div className="space-y-3">
              {[
                {
                  icon: TrendingUp,
                  stat: '73%',
                  title: 'B2B buyers use AI first',
                  desc: 'Decision-makers ask ChatGPT and Perplexity before they ever hit Google.',
                },
                {
                  icon: Zap,
                  stat: '2–4 yrs',
                  title: 'AI search surpasses Google',
                  desc: 'Analysts project AI-driven discovery overtakes traditional search this decade.',
                },
                {
                  icon: AlertTriangle,
                  stat: '<10%',
                  title: 'Websites are AEO-ready',
                  desc: 'Fewer than 1 in 10 websites meet the baseline signals AI engines use to cite content.',
                },
              ].map(c => (
                <div key={c.title} className="surface-card-hover p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <c.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-xl font-black tracking-tight text-foreground">{c.stat}</span>
                      <span className="text-sm font-semibold text-foreground">{c.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{c.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ─────────────────────────────────────── */}
        <section id="features" className="border-t border-border/60">
          <div className="max-w-6xl mx-auto px-5 py-24">
            <div className="max-w-xl mb-14">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-4">What we check</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-[-0.03em] text-foreground">
                20+ signals, one clear score
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className="surface-card-hover p-5 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-primary/10 group-hover:bg-primary/15 flex items-center justify-center mb-4 transition-colors">
                    <f.icon className="h-4.5 w-4.5 text-primary" style={{ height: '1.1rem', width: '1.1rem' }} />
                  </div>
                  <h3 className="font-semibold text-foreground text-sm mb-1.5">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ─────────────────────────────────── */}
        <section id="how-it-works" className="border-t border-border/60 bg-muted/20">
          <div className="max-w-6xl mx-auto px-5 py-24">
            <div className="max-w-xl mb-14">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-4">Process</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-[-0.03em] text-foreground">
                Three steps to clarity
              </h2>
            </div>

            <div className="grid md:grid-cols-3 gap-5">
              {STEPS.map((step, i) => (
                <div key={step.n} className="relative">
                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-6 left-full w-5 border-t border-dashed border-border z-10" />
                  )}
                  <div className="surface-card p-6 h-full">
                    <div className="w-10 h-10 rounded-full border border-primary/30 bg-primary/10 flex items-center justify-center mb-5">
                      <span className="text-xs font-black text-primary tracking-widest">{step.n}</span>
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FAQ ──────────────────────────────────────────── */}
        <section id="faq" className="border-t border-border/60">
          <div className="max-w-3xl mx-auto px-5 py-24">
            <div className="mb-12 text-center">
              <p className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-4">FAQ</p>
              <h2 className="text-3xl md:text-4xl font-black tracking-[-0.03em] text-foreground">
                Common questions
              </h2>
            </div>
            <div className="surface-card px-6 divide-y divide-border/60">
              {FAQS.map((faq, i) => (
                <FaqItem key={i} q={faq.q} a={faq.a} i={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Final CTA ────────────────────────────────────── */}
        <section className="border-t border-border/60">
          <div className="relative overflow-hidden">
            {/* Glow */}
            <div className="absolute inset-0 hero-grid opacity-50" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-20 blur-[80px]"
              style={{ background: 'radial-gradient(ellipse, oklch(0.70 0.20 264) 0%, transparent 70%)' }}
            />

            <div className="relative max-w-2xl mx-auto px-5 py-28 text-center">
              <div className="badge mx-auto mb-8">
                <Sparkles className="h-3 w-3 text-primary" />
                Free forever · No signup required
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-[-0.04em] text-foreground mb-5 leading-tight">
                Find out where you<br />stand in AI search.
              </h2>
              <p className="text-muted-foreground mb-10 text-base">
                Get a full AEO audit with your score, prioritised issues, and exact fixes.
                Takes 60 seconds. Costs nothing.
              </p>
              <Link href="/audit" className="btn-primary h-12 px-8 text-base">
                Run Free Audit
                <ArrowRight className="h-4.5 w-4.5" style={{ height: '1.1rem', width: '1.1rem' }} />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ───────────────────────────────────────── */}
      <footer className="border-t border-border/60">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} Marrai. Built in Hyderabad 🇮🇳
          </p>
          <div className="flex items-center gap-4">
            <a href="#features" className="text-xs text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#faq" className="text-xs text-muted-foreground hover:text-foreground transition-colors">FAQ</a>
            <Link href="/audit" className="text-xs text-primary hover:opacity-80 transition-opacity font-medium">Free Audit</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}