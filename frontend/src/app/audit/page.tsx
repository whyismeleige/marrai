'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight, ArrowLeft, Cpu, CheckCircle, Loader2,
  Globe, Mail, User, Zap, ShieldCheck, BarChart3,
  AlertCircle, Search, Brain, Sparkles,
} from 'lucide-react'
import { ThemeToggle } from '@/components/ui/theme-toggle'

/* ─── Types & constants ──────────────────────────────────── */

type Step = 'url' | 'contact' | 'analyzing'

const ANALYSIS_STEPS = [
  { icon: Globe,       label: 'Fetching page content…',       duration: 2200 },
  { icon: Brain,       label: 'Parsing schema markup…',        duration: 1800 },
  { icon: Search,      label: 'Checking heading structure…',   duration: 1400 },
  { icon: BarChart3,   label: 'Scoring content quality…',      duration: 1600 },
  { icon: ShieldCheck, label: 'Analysing technical signals…',  duration: 1200 },
  { icon: Zap,         label: 'Generating recommendations…',   duration: 1000 },
]

const TRUST_PILLS = [
  { icon: Zap,         text: '100% free' },
  { icon: ShieldCheck, text: 'No credit card' },
  { icon: BarChart3,   text: '20+ AEO checks' },
]

/* ─── Helpers ────────────────────────────────────────────── */

function isValidUrl(raw: string): boolean {
  try {
    const u = new URL(raw.startsWith('http') ? raw : `https://${raw}`)
    return u.hostname.includes('.')
  } catch {
    return false
  }
}

function normaliseUrl(raw: string): string {
  return raw.startsWith('http') ? raw : `https://${raw}`
}

function getDomain(raw: string): string {
  try {
    return new URL(normaliseUrl(raw)).hostname.replace(/^www\./, '')
  } catch {
    return raw
  }
}

/* ─── Header ─────────────────────────────────────────────── */

function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Cpu className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-[15px] tracking-tight text-foreground">Marrai</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/"
            className="h-8 px-3 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 inline-flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
        </div>
      </div>
    </header>
  )
}

/* ─── Progress bar ───────────────────────────────────────── */

function StepProgress({ step }: { step: Step }) {
  const pct = step === 'url' ? 33 : step === 'contact' ? 66 : 100
  return (
    <div className="h-0.5 w-full bg-border/40">
      <div
        className="h-full bg-primary transition-all duration-500 ease-out"
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/* ─── Layout wrapper ─────────────────────────────────────── */

function AuditShell({ children, step }: { children: React.ReactNode; step: Step }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <StepProgress step={step} />
      <Header />

      {/* Subtle grid bg */}
      <div className="fixed inset-0 hero-grid opacity-30 pointer-events-none" />

      {/* Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[500px] h-[250px] rounded-full opacity-10 blur-[80px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, oklch(0.70 0.20 264) 0%, transparent 70%)' }}
      />

      <main className="relative flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  )
}

/* ─── Step label ─────────────────────────────────────────── */

function StepLabel({ current, total, label }: { current: number; total: number; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-8 fade-up">
      <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase">
        Step {current} of {total}
      </span>
      <span className="h-px flex-1 bg-border/60" />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

/* ─── Input field ────────────────────────────────────────── */

function FormInput({
  label, icon: Icon, type = 'text', placeholder, value, onChange, error, success, autoFocus, inputRef,
}: {
  label: string
  icon: React.ElementType
  type?: string
  placeholder: string
  value: string
  onChange: (v: string) => void
  error?: string
  success?: boolean
  autoFocus?: boolean
  inputRef?: React.RefObject<HTMLInputElement>
}) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <input
          ref={inputRef as React.RefObject<HTMLInputElement> | undefined}
          type={type}
          placeholder={placeholder}
          value={value}
          autoFocus={autoFocus}
          onChange={e => onChange(e.target.value)}
          className={`
            w-full h-12 pl-10 pr-10 rounded-xl bg-muted/50
            border text-sm text-foreground placeholder:text-muted-foreground/60
            outline-none transition-all duration-150
            ${success
              ? 'border-green-500/50 ring-1 ring-green-500/20'
              : error
              ? 'border-destructive/50 ring-1 ring-destructive/20'
              : 'border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/20'
            }
          `}
        />
        {success && (
          <CheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
        )}
        {error && !success && (
          <AlertCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-destructive flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          {error}
        </p>
      )}
    </div>
  )
}

/* ─── Step 1: URL ────────────────────────────────────────── */

function UrlStep({ onNext }: { onNext: (url: string) => void }) {
  const [value, setValue] = useState('')
  const [touched, setTouched] = useState(false)

  const valid = isValidUrl(value)
  const domain = valid ? getDomain(value) : null
  const showError = touched && value.length > 0 && !valid

  return (
    <AuditShell step="url">
      <StepLabel current={1} total={2} label="Enter URL" />

      <div className="fade-up delay-100">
        <h1 className="text-2xl font-black tracking-tight text-foreground mb-2">
          Which page should we audit?
        </h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          Paste any public URL — homepage, product page, or blog post.
        </p>

        <FormInput
          label="Website URL"
          icon={Globe}
          placeholder="https://yourwebsite.com"
          value={value}
          onChange={v => { setValue(v); setTouched(false) }}
          success={valid}
          error={showError ? 'Please enter a valid URL (e.g. https://yoursite.com)' : undefined}
          autoFocus
        />

        {/* Domain preview */}
        {valid && domain && (
          <div className="flex items-center gap-2 mb-6 px-1 fade-up">
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
              alt=""
              className="w-4 h-4 rounded-sm"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span className="text-sm text-muted-foreground">
              Auditing <span className="font-medium text-foreground">{domain}</span>
            </span>
          </div>
        )}

        <button
          onClick={() => { setTouched(true); if (valid) onNext(normaliseUrl(value)) }}
          disabled={!valid}
          className="
            w-full h-12 rounded-xl font-semibold text-sm
            bg-primary text-primary-foreground
            hover:opacity-90 active:scale-[0.99]
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150
            flex items-center justify-center gap-2
            shadow-lg shadow-primary/20
          "
        >
          Analyse this page
          <ArrowRight className="h-4 w-4" />
        </button>

        {/* Trust pills */}
        <div className="flex items-center justify-center gap-5 mt-6 flex-wrap">
          {TRUST_PILLS.map(p => (
            <div key={p.text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <p.icon className="h-3.5 w-3.5 text-primary" />
              {p.text}
            </div>
          ))}
        </div>
      </div>
    </AuditShell>
  )
}

/* ─── Step 2: Contact ────────────────────────────────────── */

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
  const emailRef = useRef<HTMLInputElement>(null)

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const canSubmit  = emailValid && name.trim().length >= 2

  useEffect(() => {
    emailRef.current?.focus()
  }, [])

  const domain = getDomain(url)

  return (
    <AuditShell step="contact">
      <StepLabel current={2} total={2} label="Your details" />

      <div className="fade-up delay-100">
        {/* Domain pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
            alt=""
            className="w-4 h-4 rounded-sm"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <span className="text-xs font-medium text-primary">{domain}</span>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-foreground mb-2">
          Where should we send your report?
        </h1>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          We'll email your full AEO audit. We don't share your data or spam you.
        </p>

        <FormInput
          label="Your name"
          icon={User}
          placeholder="Alex Sharma"
          value={name}
          onChange={setName}
          success={name.trim().length >= 2}
        />

        <FormInput
          label="Email address"
          icon={Mail}
          type="email"
          placeholder="alex@company.com"
          value={email}
          onChange={setEmail}
          success={emailValid}
          inputRef={emailRef as React.RefObject<HTMLInputElement>}
        />

        {error && (
          <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        <button
          onClick={() => { if (canSubmit) onSubmit(email, name) }}
          disabled={!canSubmit || loading}
          className="
            w-full h-12 rounded-xl font-semibold text-sm
            bg-primary text-primary-foreground
            hover:opacity-90 active:scale-[0.99]
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-150
            flex items-center justify-center gap-2
            shadow-lg shadow-primary/20
            mb-3
          "
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Starting analysis…
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Get my free report
            </>
          )}
        </button>

        <button
          onClick={onBack}
          className="w-full h-9 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors flex items-center justify-center gap-1.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Change URL
        </button>
      </div>
    </AuditShell>
  )
}

/* ─── Step 3: Analyzing ──────────────────────────────────── */

function AnalyzingStep({ url }: { url: string }) {
  const [activeIdx, setActiveIdx] = useState(0)
  const [done, setDone]           = useState<number[]>([])

  useEffect(() => {
    let idx = 0
    function next() {
      if (idx >= ANALYSIS_STEPS.length) return
      const step = ANALYSIS_STEPS[idx]
      setActiveIdx(idx)
      setTimeout(() => {
        setDone(prev => [...prev, idx])
        idx++
        next()
      }, step.duration)
    }
    next()
  }, [])

  const domain = getDomain(url)
  const progress = Math.round(((done.length) / ANALYSIS_STEPS.length) * 100)

  return (
    <AuditShell step="analyzing">
      <div className="fade-up">
        {/* Domain pill */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border mb-8">
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
            alt=""
            className="w-4 h-4 rounded-sm"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <span className="text-xs font-medium text-muted-foreground">{domain}</span>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-foreground mb-2">
          Analysing your page…
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Running 20+ AEO checks. This takes about 30 seconds.
        </p>

        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-muted-foreground mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2">
          {ANALYSIS_STEPS.map((s, i) => {
            const isDone   = done.includes(i)
            const isActive = activeIdx === i && !isDone

            return (
              <div
                key={i}
                className={`
                  flex items-center gap-3 p-3 rounded-lg transition-all duration-300
                  ${isDone   ? 'opacity-50' : ''}
                  ${isActive ? 'bg-primary/8 border border-primary/15' : ''}
                `}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all duration-300
                  ${isDone ? 'bg-primary/20' : isActive ? 'bg-primary/20' : 'bg-muted'}
                `}>
                  {isDone ? (
                    <CheckCircle className="h-3.5 w-3.5 text-primary" />
                  ) : isActive ? (
                    <Loader2 className="h-3 w-3 text-primary animate-spin" />
                  ) : (
                    <s.icon className="h-3 w-3 text-muted-foreground" />
                  )}
                </div>
                <span className={`text-sm transition-colors duration-300 ${
                  isDone   ? 'text-muted-foreground line-through' :
                  isActive ? 'text-foreground font-medium' : 'text-muted-foreground'
                }`}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </AuditShell>
  )
}

/* ─── Main page ──────────────────────────────────────────── */

export default function AuditPage() {
  const router  = useRouter()
  const [step, setStep]       = useState<Step>('url')
  const [url, setUrl]         = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  function handleUrl(u: string) {
    setUrl(u)
    setStep('contact')
  }

  async function handleContact(email: string, name: string) {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, email, name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Something went wrong')
      setStep('analyzing')
      // Wait for analysis animation then redirect
      setTimeout(() => {
        router.push(`/results/${data.id}`)
      }, ANALYSIS_STEPS.reduce((acc, s) => acc + s.duration, 0) + 500)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  if (step === 'url') {
    return <UrlStep onNext={handleUrl} />
  }

  if (step === 'contact') {
    return (
      <ContactStep
        url={url}
        onBack={() => setStep('url')}
        onSubmit={handleContact}
        loading={loading}
        error={error}
      />
    )
  }

  return <AnalyzingStep url={url} />
}