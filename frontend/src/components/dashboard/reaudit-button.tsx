'use client'

// src/components/dashboard/reaudit-button.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ReauditButton({ pageCount }: { pageCount: number }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleReaudit() {
    if (pageCount === 0) {
      toast('Add some pages first before auditing.', { icon: '💡' })
      router.push('/dashboard/pages')
      return
    }

    setLoading(true)
    const toastId = toast.loading(`Auditing ${pageCount} page${pageCount !== 1 ? 's' : ''}…`)

    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'audit_all' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success(
        `Audit started for ${data.started} page${data.started !== 1 ? 's' : ''} — results in ~30s`,
        { id: toastId }
      )
      // Refresh server component data after a delay
      setTimeout(() => router.refresh(), 5000)
    } catch {
      toast.error('Failed to start audit. Try again.', { id: toastId })
    }

    setLoading(false)
  }

  return (
    <button
      onClick={handleReaudit}
      disabled={loading}
      className="mt-4 h-9 w-full rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading
        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
        : <RefreshCw className="h-3.5 w-3.5" />}
      {loading ? 'Auditing…' : 'Re-audit all pages'}
    </button>
  )
}