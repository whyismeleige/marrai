'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowRight, ArrowLeft, Cpu, CheckCircle, Loader2,
  Globe, Mail, User, Zap, ShieldCheck, BarChart3,
  AlertCircle, Search, Brain, Sparkles,
} from 'lucide-react'
import { AnimatedThemeToggler } from '@/components/ui/animated-theme-toggler'

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
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="max-w-5xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/35 transition-shadow">
            <Cpu className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-bold text-[15px] tracking-tight text-foreground">Marrai</span>
        </Link>
        <div className="flex items-center gap-2">
          <AnimatedThemeToggler />
          <Link
            href="/"
            className="h-8 px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 inline-flex items-center gap-1.5 transition-colors"
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

      {/* Background */}
      <div className="fixed inset-0 hero-grid opacity-30 pointer-events-none" />
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-10 blur-[80px] pointer-events-none"
        style={{ background: 'radial-gradient(ellipse, oklch(0.70 0.20 264 / 0.5) 0%, transparent 70%)' }}
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
      <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase">
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
      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
        {label}
      </label>
      <div className="relative">
        <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/70 pointer-events-none" />
        <input
          ref={inputRef as React.RefObject<HTMLInputElement> | undefined}
          type={type}
          placeholder={placeholder}
          value={value}
          autoFocus={autoFocus}
          onChange={e => onChange(e.target.value)}
          className={`
            w-full h-12 pl-10 pr-10 rounded-xl
            border text-sm text-foreground placeholder:text-muted-foreground/50
            outline-none transition-all duration-200
            bg-background/60
            ${success
              ? 'border-emerald-500/60 ring-2 ring-emerald-500/15 bg-emerald-500/5'
              : error
              ? 'border-red-500/60 ring-2 ring-red-500/15 bg-red-500/5'
              : 'border-border hover:border-border/80 focus:border-primary/60 focus:ring-2 focus:ring-primary/15 focus:bg-primary/5'
            }
          `}
        />
        {success && (
          <CheckCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
        )}
        {error && (
          <AlertCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-red-500" />
        )}
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
          {error}
        </p>
      )}
    </div>
  )
}

/* ─── URL Step ───────────────────────────────────────────── */

function UrlStep({
  onNext,
}: {
  onNext: (url: string) => void
}) {
  const [url, setUrl] = useState('')
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const domain = url ? getDomain(url) : ''
  const valid = isValidUrl(url)

  const submit = () => {
    if (!url.trim()) return setError('Please enter a URL.')
    if (!valid) return setError("That doesn't look like a valid URL.")
    setError('')
    onNext(normaliseUrl(url))
  }

  return (
    <AuditShell step="url">
      <StepLabel current={1} total={2} label="Your website" />

      <div className="mb-8 fade-up delay-50">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mb-2">
          Which page do you want to audit?
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Paste any URL — homepage, product page, or blog post. We'll analyse it for AI search visibility.
        </p>
      </div>

      <div className="fade-up delay-100">
        <FormInput
          label="Page URL"
          icon={Globe}
          placeholder="yourwebsite.com"
          value={url}
          onChange={v => { setUrl(v); setError('') }}
          error={error}
          success={valid && url.length > 0}
          autoFocus
          inputRef={inputRef as any}
        />

        {domain && valid && (
          <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground fade-in">
            <img
              src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
              alt=""
              className="w-4 h-4 rounded-sm"
              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span>Auditing <strong className="text-foreground">{domain}</strong></span>
          </div>
        )}

        <button
          onClick={submit}
          className="btn-primary w-full h-12 text-sm mt-2"
        >
          Continue
          <ArrowRight className="h-4 w-4" />
        </button>

        {/* Trust pills */}
        <div className="flex flex-wrap justify-center gap-x-5 gap-y-2 mt-6">
          {[
            { icon: Zap, text: '100% free' },
            { icon: ShieldCheck, text: 'No credit card' },
            { icon: BarChart3, text: '20+ checks' },
          ].map(t => (
            <div key={t.text} className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <t.icon className="h-3.5 w-3.5 text-primary" />
              {t.text}
            </div>
          ))}
        </div>
      </div>
    </AuditShell>
  )
}

/* ─── Contact Step ───────────────────────────────────────── */

function ContactStep({
  url,
  onNext,
  onBack,
}: {
  url: string
  onNext: (name: string, email: string) => void
  onBack: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({})
  const domain = getDomain(url)

  const validate = () => {
    const e: typeof errors = {}
    if (!name.trim()) e.name = 'Please enter your name.'
    if (!email.trim()) e.email = 'Please enter your email.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Enter a valid email address.'
    return e
  }

  const submit = () => {
    const e = validate()
    if (Object.keys(e).length) return setErrors(e)
    setErrors({})
    onNext(name.trim(), email.trim())
  }

  return (
    <AuditShell step="contact">
      <div className="flex items-center gap-2 mb-8 fade-up">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <span className="h-px flex-1 bg-border/60" />
        <span className="text-xs text-muted-foreground">Step 2 of 2</span>
      </div>

      {/* Domain badge */}
      <div className="flex items-center gap-2 mb-6 fade-up delay-50">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/60 border border-border/60 text-xs text-muted-foreground">
          <img
            src={`https://www.google.com/s2/favicons?domain=${domain}&sz=16`}
            alt="" className="w-3.5 h-3.5 rounded-sm"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          {domain}
        </div>
      </div>

      <div className="mb-8 fade-up delay-100">
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground mb-2">
          Where should we send your report?
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Your full AEO audit will be ready instantly. We'll also send a copy to your email.
        </p>
      </div>

      <div className="fade-up delay-150">
        <FormInput
          label="Your Name"
          icon={User}
          placeholder="Alex Johnson"
          value={name}
          onChange={v => { setName(v); setErrors(p => ({ ...p, name: undefined })) }}
          error={errors.name}
          autoFocus
        />
        <FormInput
          label="Email Address"
          icon={Mail}
          type="email"
          placeholder="alex@company.com"
          value={email}
          onChange={v => { setEmail(v); setErrors(p => ({ ...p, email: undefined })) }}
          error={errors.email}
        />

        <button
          onClick={submit}
          className="btn-primary w-full h-12 text-sm mt-2"
        >
          <Sparkles className="h-4 w-4" />
          Run My Free Audit
          <ArrowRight className="h-4 w-4" />
        </button>

        <p className="text-center text-[11px] text-muted-foreground mt-4">
          No spam. Unsubscribe anytime. We only send audit reports.
        </p>
      </div>
    </AuditShell>
  )
}

/* ─── Analyzing Step ─────────────────────────────────────── */

function AnalyzingStep({ url }: { url: string }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [doneSteps, setDoneSteps] = useState<number[]>([])
  const domain = getDomain(url)

  useEffect(() => {
    let idx = 0
    const advance = () => {
      if (idx >= ANALYSIS_STEPS.length) return
      const current = idx
      setCurrentStep(current)
      setTimeout(() => {
        setDoneSteps(prev => [...prev, current])
        idx++
        if (idx < ANALYSIS_STEPS.length) {
          setTimeout(advance, 100)
        }
      }, ANALYSIS_STEPS[current].duration)
    }
    advance()
  }, [])

  return (
    <AuditShell step="analyzing">
      <div className="text-center mb-10 fade-up">
        {/* Spinner */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <svg className="w-20 h-20 -rotate-90 spin-slow" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="32" fill="none" strokeWidth="4" className="stroke-muted" />
            <circle
              cx="40" cy="40" r="32" fill="none" strokeWidth="4"
              className="stroke-primary"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 32 * 0.3} ${2 * Math.PI * 32 * 0.7}`}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <Brain className="h-7 w-7 text-primary" />
          </div>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-foreground mb-2">
          Analysing {domain}
        </h1>
        <p className="text-sm text-muted-foreground">
          Running 20+ AEO checks. This takes about 30–60 seconds.
        </p>
      </div>

      {/* Steps list */}
      <div className="space-y-3 fade-up delay-100">
        {ANALYSIS_STEPS.map((s, i) => {
          const done = doneSteps.includes(i)
          const active = i === currentStep && !done
          return (
            <div
              key={i}
              className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 ${
                done
                  ? 'border-emerald-500/25 bg-emerald-500/5'
                  : active
                  ? 'border-primary/30 bg-primary/5'
                  : 'border-border/40 bg-muted/20 opacity-40'
              }`}
            >
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                done ? 'bg-emerald-500/15' : active ? 'bg-primary/15' : 'bg-muted/60'
              }`}>
                {done ? (
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
                ) : active ? (
                  <Loader2 className="h-3.5 w-3.5 text-primary animate-spin" />
                ) : (
                  <s.icon className="h-3.5 w-3.5 text-muted-foreground" />
                )}
              </div>
              <span className={`text-sm font-medium ${
                done ? 'text-emerald-600 dark:text-emerald-400' : active ? 'text-foreground' : 'text-muted-foreground'
              }`}>
                {s.label}
              </span>
              {done && (
                <span className="ml-auto text-xs font-semibold text-emerald-600 dark:text-emerald-400">Done</span>
              )}
            </div>
          )
        })}
      </div>
    </AuditShell>
  )
}

/* ─── Page ───────────────────────────────────────────────── */

export default function AuditPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('url')
  const [url, setUrl] = useState('')

  const handleUrl = (u: string) => {
    setUrl(u)
    setStep('contact')
  }

  const handleContact = async (name: string, email: string) => {
    setStep('analyzing')

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, email, name }),
      })

      if (!res.ok) throw new Error('Request failed')
      const { id } = await res.json()

      // Poll until done
      const poll = async () => {
        const r = await fetch(`/api/audit/${id}`)
        const data = await r.json()
        if (data.status === 'completed' || data.status === 'failed') {
          router.push(`/results/${id}`)
        } else {
          setTimeout(poll, 2000)
        }
      }
      setTimeout(poll, 4000)
    } catch {
      router.push('/')
    }
  }

  if (step === 'url')       return <UrlStep onNext={handleUrl} />
  if (step === 'contact')   return <ContactStep url={url} onNext={handleContact} onBack={() => setStep('url')} />
  if (step === 'analyzing') return <AnalyzingStep url={url} />

  return null
}