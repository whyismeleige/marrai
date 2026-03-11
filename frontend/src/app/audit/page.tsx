'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ArrowLeft, Sparkles, Zap, Clock } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function AuditPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    url: '',
    email: '',
    name: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Something went wrong')
      }
      
      if (data.id) {
        router.push(`/results/${data.id}`)
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-12 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-3xl" />
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="max-w-2xl mx-auto">
          <Link 
            href="/"
            className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>

          <Card className="glass-card neon-border p-8">
            <CardContent className="pt-0">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 mb-4 border border-cyan-500/30">
                  <Sparkles className="h-8 w-8 text-cyan-400" />
                </div>
                <h1 className="text-3xl font-bold mb-2 text-gradient">Get Started with Marrai</h1>
                <p className="text-muted-foreground">
                  Start your AI-powered marketing journey in 2 minutes
                </p>
              </div>

              {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-foreground">
                    Website URL <span className="text-cyan-400">*</span>
                  </Label>
                  <Input
                    id="url"
                    type="url"
                    required
                    placeholder="https://example.com"
                    className="bg-background/50 border-white/10 focus:border-cyan-500 focus:ring-cyan-500/20"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your homepage or any important page
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">
                    Your Email <span className="text-cyan-400">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="you@company.com"
                    className="bg-background/50 border-white/10 focus:border-cyan-500 focus:ring-cyan-500/20"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    We&apos;ll send your detailed report here
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">
                    Your Name <span className="text-muted-foreground">(Optional)</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    className="bg-background/50 border-white/10 focus:border-cyan-500 focus:ring-cyan-500/20"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={loading}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 border-0 h-12 text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Analyzing your website...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      Get My Free Analysis →
                    </>
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  By submitting, you agree to receive the audit report and occasional 
                  emails about Marrai updates and marketing tips. Unsubscribe anytime.
                </p>
              </form>

              <div className="mt-8 pt-6 border-t border-white/10">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 rounded-lg bg-white/5">
                    <Clock className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
                    <div className="font-semibold text-foreground">2 min</div>
                    <div className="text-xs text-muted-foreground">Analysis Time</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <Zap className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                    <div className="font-semibold text-foreground">100% Free</div>
                    <div className="text-xs text-muted-foreground">No Credit Card</div>
                  </div>
                  <div className="p-3 rounded-lg bg-white/5">
                    <Sparkles className="h-5 w-5 text-cyan-400 mx-auto mb-1" />
                    <div className="font-semibold text-foreground">Instant</div>
                    <div className="text-xs text-muted-foreground">Email Delivery</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}