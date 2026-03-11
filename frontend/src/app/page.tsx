import Link from 'next/link'
import {
  ArrowRight, CheckCircle, Search, TrendingUp,
  Zap, Target, Cpu, FileText, MessageSquare,
  BarChart3, Globe, ChevronRight
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const FEATURES = [
  {
    icon: FileText,
    title: 'Schema Markup',
    desc: 'Detects structured data AI engines use to understand your content context.',
  },
  {
    icon: MessageSquare,
    title: 'Question Headings',
    desc: 'Checks if your content answers natural language queries the way AI tools expect.',
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
  { n: '01', title: 'Enter your URL', desc: 'Paste any page — homepage, product page, or blog post.' },
  { n: '02', title: 'We analyse it', desc: 'Our engine checks 12+ AEO signals in under 60 seconds.' },
  { n: '03', title: 'Get your report', desc: 'Receive a full audit with a score, issues, and fix priority.' },
]

const STATS = [
  { value: '73%', label: 'of B2B buyers use AI tools before Google' },
  { value: '12+', label: 'AEO signals checked per audit' },
  { value: '<60s', label: 'to get your full report' },
]

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">

      {/* ── Nav ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded-[7px] bg-primary flex items-center justify-center shrink-0">
              <Cpu className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-foreground">
              Marrai
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/audit"
              className="
                h-8 px-3.5 rounded-md text-sm font-medium
                bg-primary text-primary-foreground
                hover:opacity-90 transition-opacity
                inline-flex items-center gap-1.5
              "
            >
              Free Audit
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-5 pt-24 pb-20 text-center">

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full border border-border bg-muted text-muted-foreground text-xs font-medium mb-8 fade-up">
            <span className="w-1.5 h-1.5 rounded-full bg-primary" />
            Answer Engine Optimization
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black tracking-[-0.04em] leading-[0.95] text-foreground mb-6 fade-up delay-100">
            Your business is<br />
            <span>invisible to AI.</span>
          </h1>

          {/* Sub */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed fade-up delay-200">
            AI tools like ChatGPT, Perplexity, and Gemini now shape buying decisions.
            Find out if you're being recommended — or ignored.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 fade-up delay-300">
            <Link
              href="/audit"
              className="
                h-11 px-6 rounded-lg text-sm font-semibold
                bg-primary text-primary-foreground
                hover:opacity-90 active:scale-[0.98]
                transition-all inline-flex items-center gap-2
              "
            >
              Run Free Audit
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#how-it-works"
              className="
                h-11 px-6 rounded-lg text-sm font-medium
                border border-border text-foreground
                hover:bg-muted transition-colors
                inline-flex items-center gap-2
              "
            >
              How it works
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </a>
          </div>
        </section>

        {/* ── Stats strip ────────────────────────────────────── */}
        <div className="border-y border-border bg-muted/30">
          <div className="max-w-3xl mx-auto px-5 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {STATS.map((s) => (
              <div key={s.value}>
                <div className="text-3xl font-black tracking-tight text-foreground mb-1">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Problem ────────────────────────────────────────── */}
        <section className="max-w-6xl mx-auto px-5 py-20">
          <div className="max-w-2xl mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">The Problem</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              The AI search revolution<br className="hidden md:block" /> is already here
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              Traditional SEO won't save you. AI engines use different signals — and most
              businesses have zero visibility into how they score.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {[
              {
                icon: TrendingUp,
                stat: '73%',
                title: 'B2B buyers use AI first',
                desc: 'Decision-makers are asking ChatGPT and Perplexity before they ever hit Google.',
              },
              {
                icon: Zap,
                stat: '2–4 yrs',
                title: 'AI search surpasses Google',
                desc: 'Analysts project AI-driven discovery will overtake traditional search within this decade.',
              },
              {
                icon: CheckCircle,
                stat: 'Day 1',
                title: 'Fixable right now',
                desc: 'AEO improvements are structural and technical — you can act on them immediately.',
              },
            ].map((card) => (
              <div
                key={card.title}
                className="surface-card-hover p-6 rounded-xl"
              >
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <card.icon className="h-4.5 w-4.5 text-primary" />
                </div>
                <div className="text-2xl font-black tracking-tight text-foreground mb-1">{card.stat}</div>
                <h3 className="font-semibold text-foreground text-sm mb-2">{card.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────── */}
        <section className="border-t border-border bg-muted/20">
          <div className="max-w-6xl mx-auto px-5 py-20">
            <div className="max-w-xl mb-14">
              <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">What We Analyse</p>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
                12+ signals, one clear score
              </h2>
              <p className="text-muted-foreground text-base leading-relaxed">
                Every audit checks the exact factors that determine whether AI engines cite your content.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {FEATURES.map((f) => (
                <div key={f.title} className="surface-card-hover p-5 rounded-xl flex gap-4">
                  <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <f.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground text-sm mb-1">{f.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ───────────────────────────────────── */}
        <section id="how-it-works" className="max-w-6xl mx-auto px-5 py-20">
          <div className="max-w-xl mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-3">Process</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              Three steps to clarity
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden border border-border">
            {STEPS.map((step, i) => (
              <div
                key={step.n}
                className="bg-background p-8 relative"
              >
                {/* Connector arrow for md+ */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10">
                    <div className="w-5 h-5 rounded-full border border-border bg-background flex items-center justify-center">
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                )}
                <div className="text-xs font-black tracking-widest text-primary mb-4">{step.n}</div>
                <h3 className="font-semibold text-foreground mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA ────────────────────────────────────────────── */}
        <section className="border-t border-border">
          <div className="max-w-3xl mx-auto px-5 py-24 text-center">
            <h2 className="text-4xl md:text-5xl font-black tracking-[-0.03em] text-foreground mb-4">
              See how you score
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto">
              Free. No credit card. Results in under 60 seconds.
            </p>
            <Link
              href="/audit"
              className="
                inline-flex items-center gap-2
                h-12 px-8 rounded-lg text-base font-semibold
                bg-primary text-primary-foreground
                hover:opacity-90 active:scale-[0.98]
                transition-all
              "
            >
              Get Free AEO Audit
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-[6px] bg-primary flex items-center justify-center">
              <Cpu className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">Marrai</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Built in Hyderabad — helping Indian businesses win AI search
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/audit" className="hover:text-foreground transition-colors">
              Free Audit
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}