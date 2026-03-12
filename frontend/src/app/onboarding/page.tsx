'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { Cpu, ArrowRight, ArrowLeft, Check, Plus, X, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type OnboardingData = {
  brandName: string
  domain: string
  industry: string
  keywords: string[]
  competitorDomains: string[]
}

const INDUSTRIES = [
  'B2B SaaS',
  'E-commerce',
  'Agency / Consultancy',
  'Professional Services',
  'Healthcare',
  'Education / EdTech',
  'FinTech',
  'Real Estate',
  'Media / Publishing',
  'Other',
]

const TOTAL_STEPS = 5

// ─── Progress indicator ───────────────────────────────────────────────────────

function ProgressDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'h-1.5 rounded-full transition-all duration-300',
            i < current
              ? 'w-6 bg-primary'
              : i === current - 1
              ? 'w-8 bg-primary'
              : 'w-4 bg-muted'
          )}
        />
      ))}
    </div>
  )
}

// ─── Shell ────────────────────────────────────────────────────────────────────

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-12">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-12">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
          <Cpu className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-[15px] tracking-tight text-foreground">Marrai</span>
      </div>

      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}

// ─── Step 1: Brand Name ───────────────────────────────────────────────────────

function Step1({
  value,
  onChange,
  onNext,
}: {
  value: string
  onChange: (v: string) => void
  onNext: () => void
}) {
  const { user } = useUser()
  const firstName = user?.firstName || 'there'

  return (
    <Shell>
      <ProgressDots current={1} />
      <h1 className="text-2xl font-black tracking-tight text-foreground mb-2">
        Hey {firstName}! 👋
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        Let's set up your brand. What's the name of your company or product?
      </p>

      <label className="block mb-1.5 text-sm font-medium text-foreground">Brand name</label>
      <input
        autoFocus
        type="text"
        placeholder="e.g. Acme Corp"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && value.trim() && onNext()}
        className="w-full h-11 px-4 rounded-xl border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition mb-6"
      />

      <button
        disabled={!value.trim()}
        onClick={onNext}
        className="btn-primary w-full h-11 text-sm disabled:opacity-40"
      >
        Continue
        <ArrowRight className="h-4 w-4" />
      </button>
    </Shell>
  )
}

// ─── Step 2: Domain ───────────────────────────────────────────────────────────

function Step2({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: string
  onChange: (v: string) => void
  onNext: () => void
  onBack: () => void
}) {
  const [error, setError] = useState('')

  function validate() {
    const raw = value.trim()
    if (!raw) { setError('Please enter your domain'); return }
    // Basic domain check
    const clean = raw.replace(/^https?:\/\//, '').replace(/^www\./, '').split('/')[0]
    if (!clean.includes('.')) { setError('Enter a valid domain e.g. example.com'); return }
    setError('')
    onNext()
  }

  return (
    <Shell>
      <ProgressDots current={2} />
      <h1 className="text-2xl font-black tracking-tight text-foreground mb-2">
        Your primary domain
      </h1>
      <p className="text-sm text-muted-foreground mb-8">
        The main website you want to optimise for AI search visibility.
      </p>

      <label className="block mb-1.5 text-sm font-medium text-foreground">Domain</label>
      <input
        autoFocus
        type="text"
        placeholder="e.g. example.com"
        value={value}
        onChange={e => { onChange(e.target.value); setError('') }}
        onKeyDown={e => e.key === 'Enter' && validate()}
        className={cn(
          'w-full h-11 px-4 rounded-xl border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition mb-1.5',
          error ? 'border-destructive' : 'border-border'
        )}
      />
      {error && <p className="text-xs text-destructive mb-4">{error}</p>}
      {!error && <div className="mb-6" />}

      <div className="flex gap-2">
        <button onClick={onBack} className="h-11 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button onClick={validate} className="btn-primary flex-1 h-11 text-sm">
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Shell>
  )
}

// ─── Step 3: Industry ─────────────────────────────────────────────────────────

function Step3({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: string
  onChange: (v: string) => void
  onNext: () => void
  onBack: () => void
}) {
  return (
    <Shell>
      <ProgressDots current={3} />
      <h1 className="text-2xl font-black tracking-tight text-foreground mb-2">
        Your industry
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        We'll tailor your AEO recommendations to your sector.
      </p>

      <div className="grid grid-cols-2 gap-2 mb-6">
        {INDUSTRIES.map(ind => (
          <button
            key={ind}
            onClick={() => onChange(ind)}
            className={cn(
              'h-11 px-4 rounded-xl border text-sm font-medium text-left transition-all',
              value === ind
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:border-primary/50 hover:text-foreground'
            )}
          >
            {value === ind && <Check className="h-3.5 w-3.5 inline mr-1.5" />}
            {ind}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button onClick={onBack} className="h-11 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          disabled={!value}
          onClick={onNext}
          className="btn-primary flex-1 h-11 text-sm disabled:opacity-40"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Shell>
  )
}

// ─── Step 4: Keywords ─────────────────────────────────────────────────────────

function Step4({
  value,
  onChange,
  onNext,
  onBack,
}: {
  value: string[]
  onChange: (v: string[]) => void
  onNext: () => void
  onBack: () => void
}) {
  const [input, setInput] = useState('')

  function addKeyword() {
    const kw = input.trim()
    if (!kw || value.includes(kw) || value.length >= 5) return
    onChange([...value, kw])
    setInput('')
  }

  function removeKeyword(kw: string) {
    onChange(value.filter(k => k !== kw))
  }

  return (
    <Shell>
      <ProgressDots current={4} />
      <h1 className="text-2xl font-black tracking-tight text-foreground mb-2">
        Your target keywords
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        What topics do you want AI to associate you with? Add 3–5 keywords.
      </p>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="e.g. CRM software India"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addKeyword()}
          maxLength={60}
          className="flex-1 h-10 px-4 rounded-xl border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
        />
        <button
          onClick={addKeyword}
          disabled={!input.trim() || value.length >= 5}
          className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[44px] mb-6">
        {value.map(kw => (
          <span
            key={kw}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
          >
            {kw}
            <button onClick={() => removeKeyword(kw)} className="hover:opacity-70 transition">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {value.length === 0 && (
          <span className="text-xs text-muted-foreground">Keywords will appear here…</span>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={onBack} className="h-11 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          disabled={value.length < 1}
          onClick={onNext}
          className="btn-primary flex-1 h-11 text-sm disabled:opacity-40"
        >
          Continue <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </Shell>
  )
}

// ─── Step 5: Competitors ──────────────────────────────────────────────────────

function Step5({
  value,
  onChange,
  onSubmit,
  onBack,
  loading,
}: {
  value: string[]
  onChange: (v: string[]) => void
  onSubmit: () => void
  onBack: () => void
  loading: boolean
}) {
  const [input, setInput] = useState('')

  function addCompetitor() {
    let raw = input.trim().toLowerCase()
    raw = raw.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')
    if (!raw || value.includes(raw) || value.length >= 3) return
    onChange([...value, raw])
    setInput('')
  }

  function removeCompetitor(d: string) {
    onChange(value.filter(c => c !== d))
  }

  return (
    <Shell>
      <ProgressDots current={5} />
      <h1 className="text-2xl font-black tracking-tight text-foreground mb-2">
        Competitor domains
        <span className="ml-2 text-base font-normal text-muted-foreground">(optional)</span>
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        We'll benchmark your AEO score against up to 3 competitors.
      </p>

      <div className="flex gap-2 mb-3">
        <input
          type="text"
          placeholder="e.g. competitor.com"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addCompetitor()}
          className="flex-1 h-10 px-4 rounded-xl border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
        />
        <button
          onClick={addCompetitor}
          disabled={!input.trim() || value.length >= 3}
          className="h-10 w-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:opacity-90 disabled:opacity-40 transition"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[44px] mb-6">
        {value.map(d => (
          <span
            key={d}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-muted text-foreground text-sm border border-border"
          >
            {d}
            <button onClick={() => removeCompetitor(d)} className="hover:opacity-70 transition">
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}
        {value.length === 0 && (
          <span className="text-xs text-muted-foreground">No competitors added yet — you can skip this.</span>
        )}
      </div>

      <div className="flex gap-2">
        <button onClick={onBack} className="h-11 px-4 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <button
          onClick={onSubmit}
          disabled={loading}
          className="btn-primary flex-1 h-11 text-sm disabled:opacity-60"
        >
          {loading ? (
            <span className="flex items-center gap-2 justify-center">
              <span className="h-4 w-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
              Setting up…
            </span>
          ) : (
            <>
              Launch my dashboard <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>
    </Shell>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [data, setData] = useState<OnboardingData>({
    brandName: '',
    domain: '',
    industry: '',
    keywords: [],
    competitorDomains: [],
  })

  function update<K extends keyof OnboardingData>(key: K, val: OnboardingData[K]) {
    setData(prev => ({ ...prev, [key]: val }))
  }

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/brand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to save brand')
      router.push('/dashboard')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setLoading(false)
    }
  }

  return (
    <>
      {error && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
          {error}
        </div>
      )}

      {step === 1 && (
        <Step1
          value={data.brandName}
          onChange={v => update('brandName', v)}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <Step2
          value={data.domain}
          onChange={v => update('domain', v)}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <Step3
          value={data.industry}
          onChange={v => update('industry', v)}
          onNext={() => setStep(4)}
          onBack={() => setStep(2)}
        />
      )}
      {step === 4 && (
        <Step4
          value={data.keywords}
          onChange={v => update('keywords', v)}
          onNext={() => setStep(5)}
          onBack={() => setStep(3)}
        />
      )}
      {step === 5 && (
        <Step5
          value={data.competitorDomains}
          onChange={v => update('competitorDomains', v)}
          onSubmit={handleSubmit}
          onBack={() => setStep(4)}
          loading={loading}
        />
      )}
    </>
  )
}