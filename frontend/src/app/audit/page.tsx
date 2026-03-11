'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight, ArrowLeft, Cpu, CheckCircle, Loader2,
  Globe, Mail, User, Zap, ShieldCheck, BarChart3,
  AlertCircle, Search, Brain,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

// ─── Types & constants ──────────────────────────────────────────────────────

type Step = 'url' | 'contact' | 'analyzing'

const ANALYSIS_STEPS = [
  { icon: Globe,      label: 'Fetching page content…',        duration: 2200 },
  { icon: Brain,      label: 'Parsing schema markup…',         duration: 1800 },
  { icon: Search,     label: 'Checking heading structure…',    duration: 1400 },
  { icon: BarChart3,  label: 'Scoring content quality…',       duration: 1600 },
  { icon: ShieldCheck,label: 'Analysing technical signals…',   duration: 1200 },
  { icon: Zap,        label: 'Generating recommendations…',    duration: 1000 },
]

const TRUST_PILLS = [
  { icon: Zap,         text: '100% free' },
  { icon: ShieldCheck, text: 'No credit card' },
  { icon: BarChart3,   text: '20+ AEO checks' },
]

// ─── Helpers ────────────────────────────────────────────────────────────────

function isValidUrl(raw: string): boolean {
  try {
    const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
    return u.hostname.includes('.')
  } catch {
    return false
  }
}

function normaliseUrl(raw: string): string {
  if (!raw.startsWith('http')) return `https://${raw}`
  return raw
}

function getDomain(raw: string): string {
  try {
    return new URL(normaliseUrl(raw)).hostname.replace(/^www\./, '')
  } catch {
    return raw
  }
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-[7px] bg-primary flex items-center justify-center">
            <Cpu className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-foreground">Marrai</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/"
            className="h-8 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        </div>
      </div>
    </header>
  )
}

// Progress bar at very top
function StepProgress({ step }: { step: Step }) {
  const pct = step === 'url' ? 33 : step === 'contact' ? 66 : 100
  return (
    <div className="h-0.5 w-full bg-muted">
      <div
        className="h-full bg-primary transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

// ─── Step 1: URL ─────────────────────────────────────────────────────────────

function UrlStep({ onNext }: { onNext: (url: string) => void }) {
  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const valid = isValidUrl(value)
  const showError = touched && value.length > 0 && !valid
  const domain = valid ? getDomain(value) : ''

  useEffect(() => { inputRef.current?.focus() }, [])

  return (
    <div className="fade-up">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full border border-border bg-muted text-muted-foreground text-xs font-medium mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Step 1 of 2
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-[-0.03em] text-foreground mb-3">
          Which page should we audit?
        </h1>
        <p className="text-muted-foreground text-base max-w-md mx-auto">
          Paste your homepage, a product page, or any public URL — we'll analyse 20+ AI visibility signals.
        </p>
      </div>

      <div className="max-w-xl mx-auto">
        {/* URL Input */}
        <div className="relative mb-3">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Globe className={`h-4 w-4 transition-colors ${valid ? 'text-green-500' : 'text-muted-foreground'}`} />
          </div>
          <input
            ref={inputRef}
            type="url"
            value={value}
            onChange={e => { setValue(e.target.value); setTouched(false) }}
            onBlur={() => setTouched(true)}
            onKeyDown={e => e.key === 'Enter' && valid && onNext(normaliseUrl(value))}
            placeholder="https://yourwebsite.com"
            autoComplete="url"
            className={`
              w-full h-14 pl-11 pr-4 rounded-xl border text-base bg-background text-foreground
              placeholder:text-muted-foreground/60 outline-none transition-all duration-200
              ${valid
                ? 'border-green-500/60 ring-2 ring-green-500/15'
                : showError
                ? 'border-destructive/60 ring-2 ring-destructive/15'
                : 'border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/15'
              }
            `}
          />
          {valid && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          )}
        </div>

        {/* Live domain preview */}
        {valid && domain && (
          <div className="flex items-center gap-2 mb-5 px-1 fade-up">
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
              alt=""
              className="w-4 h-4 rounded-sm"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span className="text-sm text-muted-foreground">
              We'll audit <span className="font-medium text-foreground">{domain}</span>
            </span>
          </div>
        )}

        {showError && (
          <div className="flex items-center gap-2 mb-4 px-1 text-destructive text-sm fade-up">
            <AlertCircle className="h-3.5 w-3.5" />
            Please enter a valid URL (e.g. https://yoursite.com)
          </div>
        )}

        <button
          onClick={() => { setTouched(true); if (valid) onNext(normaliseUrl(value)) }}
          disabled={!valid}
          className="
            w-full h-13 rounded-xl font-semibold text-base
            bg-primary text-primary-foreground
            hover:opacity-90 active:scale-[0.99]
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150
            inline-flex items-center justify-center gap-2
          "
          style={{ height: '52px' }}
        >
          Analyse this page
          <ArrowRight className="h-4 w-4" />
        </button>

        {/* Trust pills */}
        <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
          {TRUST_PILLS.map(p => (
            <div key={p.text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <p.icon className="h-3.5 w-3.5 text-primary" />
              {p.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Step 2: Contact ──────────────────────────────────────────────────────────

function ContactStep({
  url,
  onBack,
  onSubmit,
  loading,
  error,
}: {
  url: string
  onBack: () => void
  onSubmit: (email: string, name: string) => void
  loading: boolean
  error: string
}) {
  const [email, setEmail] = useState('')
  const [name, setName]   = useState('')
  const emailInputRef = useRef<HTMLInputElement>(null)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const canSubmit = emailValid && !loading

  useEffect(() => { emailInputRef.current?.focus() }, [])

  const domain = getDomain(url)

  return (
    <div className="fade-up">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full border border-border bg-muted text-muted-foreground text-xs font-medium mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          Step 2 of 2
        </div>
        <h1 className="text-3xl md:text-4xl font-black tracking-[-0.03em] text-foreground mb-3">
          Where should we send the report?
        </h1>
        <p className="text-muted-foreground text-base max-w-md mx-auto">
          Your full AEO report for <span className="font-medium text-foreground">{domain}</span> will be emailed to you and shown instantly.
        </p>
      </div>

      <div className="max-w-xl mx-auto space-y-3">

        {/* Name */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <User className="h-4 w-4 text-muted-foreground" />
          </div>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && emailInputRef.current?.focus()}
            placeholder="Your name (optional)"
            autoComplete="name"
            className="
              w-full h-[52px] pl-11 pr-4 rounded-xl border border-border
              bg-background text-foreground placeholder:text-muted-foreground/60
              outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/15
              transition-all duration-200 text-base
            "
          />
        </div>

        {/* Email */}
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <Mail className={`h-4 w-4 transition-colors ${emailValid ? 'text-green-500' : 'text-muted-foreground'}`} />
          </div>
          <input
            ref={emailInputRef}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && canSubmit && onSubmit(email, name)}
            placeholder="you@company.com"
            autoComplete="email"
            className={`
              w-full h-[52px] pl-11 pr-4 rounded-xl border text-base
              bg-background text-foreground placeholder:text-muted-foreground/60
              outline-none transition-all duration-200
              ${emailValid
                ? 'border-green-500/60 ring-2 ring-green-500/15'
                : 'border-border focus:border-primary/50 focus:ring-2 focus:ring-primary/15'
              }
            `}
          />
          {emailValid && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          )}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={() => canSubmit && onSubmit(email, name)}
          disabled={!canSubmit}
          className="
            w-full rounded-xl font-semibold text-base
            bg-primary text-primary-foreground
            hover:opacity-90 active:scale-[0.99]
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150
            inline-flex items-center justify-center gap-2
          "
          style={{ height: '52px' }}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting analysis…
            </>
          ) : (
            <>
              Run free AEO audit
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>

        <button
          onClick={onBack}
          disabled={loading}
          className="w-full h-10 text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Change URL
        </button>

        <p className="text-center text-xs text-muted-foreground pt-1">
          We'll email your report. No spam, no sales calls. Unsubscribe any time.
        </p>
      </div>
    </div>
  )
}

// ─── Step 3: Analyzing ────────────────────────────────────────────────────────

function AnalyzingStep({ url }: { url: string }) {
  const [completedIdx, setCompletedIdx] = useState(-1)
  const [activeIdx, setActiveIdx] = useState(0)

  useEffect(() => {
    let elapsed = 0
    const timers: ReturnType<typeof setTimeout>[] = []

    ANALYSIS_STEPS.forEach((step, i) => {
      const t = setTimeout(() => {
        setActiveIdx(i)
        const t2 = setTimeout(() => {
          setCompletedIdx(i)
          if (i < ANALYSIS_STEPS.length - 1) setActiveIdx(i + 1)
        }, step.duration * 0.7)
        timers.push(t2)
      }, elapsed)
      timers.push(t)
      elapsed += step.duration
    })

    return () => timers.forEach(clearTimeout)
  }, [])

  const domain = getDomain(url)

  return (
    <div className="fade-up max-w-lg mx-auto text-center">
      {/* Pulsing orb */}
      <div className="relative w-20 h-20 mx-auto mb-8">
        <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <div className="absolute inset-2 rounded-full bg-primary/30 animate-pulse" />
        <div className="relative w-full h-full rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <Cpu className="h-8 w-8 text-primary-foreground" />
        </div>
      </div>

      <h2 className="text-2xl font-black tracking-tight text-foreground mb-2">
        Analysing {domain}
      </h2>
      <p className="text-muted-foreground text-sm mb-10">
        Running 20+ AEO checks — this takes about 30 seconds
      </p>

      {/* Steps list */}
      <div className="space-y-3 text-left">
        {ANALYSIS_STEPS.map((step, i) => {
          const done    = i <= completedIdx
          const active  = i === activeIdx && !done
          const waiting = i > activeIdx

          return (
            <div
              key={step.label}
              className={`
                flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-500
                ${done    ? 'border-green-500/20 bg-green-500/5'          : ''}
                ${active  ? 'border-primary/30 bg-primary/5 shadow-sm'    : ''}
                ${waiting ? 'border-border/40 bg-muted/20 opacity-40'     : ''}
              `}
            >
              <div className={`
                w-7 h-7 rounded-lg flex items-center justify-center shrink-0
                ${done   ? 'bg-green-500/15' : active ? 'bg-primary/15' : 'bg-muted'}
              `}>
                {done ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : active ? (
                  <Loader2 className="h-4 w-4 text-primary animate-spin" />
                ) : (
                  <step.icon className="h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <span className={`text-sm ${done ? 'text-green-600 dark:text-green-400 font-medium' : active ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                {done ? step.label.replace('…', ' ✓') : step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AuditPage() {
  const router = useRouter()
  const [step, setStep]   = useState<Step>('url')
  const [url, setUrl]     = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const goToContact = (submittedUrl: string) => {
    setUrl(submittedUrl)
    setStep('contact')
  }

  const handleSubmit = async (email: string, name: string) => {
    setLoading(true)
    setError('')
    setStep('analyzing')

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, email, name }),
      })
      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      if (data.id) router.push(`/results/${data.id}`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setStep('contact')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <StepProgress step={step} />

      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-2xl">
          {step === 'url' && (
            <UrlStep onNext={goToContact} />
          )}
          {(step === 'contact') && (
            <ContactStep
              url={url}
              onBack={() => setStep('url')}
              onSubmit={handleSubmit}
              loading={loading}
              error={error}
            />
          )}
          {step === 'analyzing' && (
            <AnalyzingStep url={url} />
          )}
        </div>
      </main>
    </div>
  )
}