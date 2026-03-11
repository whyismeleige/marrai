'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, ArrowRight, Cpu, CheckCircle, Clock, Zap } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/theme-toggle'

const TRUST_ITEMS = [
  { icon: Clock,        label: '< 60s',    sub: 'Analysis time' },
  { icon: Zap,          label: '100% Free', sub: 'No credit card' },
  { icon: CheckCircle,  label: '12+',       sub: 'AEO signals' },
]

export default function AuditPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ url: '', email: '', name: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Something went wrong')
      if (data.id) router.push(`/results/${data.id}`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* Nav */}
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

      <main className="flex-1 flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">

          {/* Back */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>

          {/* Card */}
          <div className="surface-card rounded-xl p-8">

            {/* Header */}
            <div className="mb-8">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-5">
                <Cpu className="h-5 w-5 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground mb-2">
                Run your free AEO audit
              </h1>
              <p className="text-sm text-muted-foreground">
                Enter a URL and we'll analyse it for AI search visibility in under 60 seconds.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Website URL
                  <span className="text-destructive ml-1">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://yourwebsite.com"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="
                    w-full h-10 px-3 rounded-lg text-sm
                    bg-input border border-border
                    text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                    transition-shadow
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Your name
                  <span className="text-destructive ml-1">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="
                    w-full h-10 px-3 rounded-lg text-sm
                    bg-input border border-border
                    text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                    transition-shadow
                  "
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">
                  Email
                  <span className="text-destructive ml-1">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="you@company.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="
                    w-full h-10 px-3 rounded-lg text-sm
                    bg-input border border-border
                    text-foreground placeholder:text-muted-foreground
                    focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent
                    transition-shadow
                  "
                />
                <p className="text-xs text-muted-foreground mt-1.5">
                  We'll email your full report. No spam.
                </p>
              </div>

              {error && (
                <div className="px-3 py-2.5 rounded-lg bg-destructive/10 border border-destructive/25 text-destructive text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="
                  w-full h-10 rounded-lg text-sm font-semibold
                  bg-primary text-primary-foreground
                  hover:opacity-90 active:scale-[0.99]
                  disabled:opacity-60 disabled:cursor-not-allowed
                  transition-all inline-flex items-center justify-center gap-2
                  mt-2
                "
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analysing…
                  </>
                ) : (
                  <>
                    Analyse my site
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Trust bar */}
          <div className="mt-4 grid grid-cols-3 gap-3">
            {TRUST_ITEMS.map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-muted/50 text-center"
              >
                <item.icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold text-foreground">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.sub}</span>
              </div>
            ))}
          </div>

          <p className="text-xs text-center text-muted-foreground mt-4 px-4">
            By submitting you agree to receive your audit report and occasional updates.
            Unsubscribe anytime.
          </p>
        </div>
      </main>
    </div>
  )
}