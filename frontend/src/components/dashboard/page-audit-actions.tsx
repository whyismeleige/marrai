'use client'

// src/components/dashboard/page-audit-actions.tsx
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import type { PageStatus } from '@/lib/mongodb'

export default function PageAuditActions({
  pageId,
  status,
}: {
  pageId: string
  status: PageStatus
}) {
  const [loading, setLoading] = useState(status === 'auditing')
  const router = useRouter()

  async function handleAudit() {
    setLoading(true)
    const toastId = toast.loading('Starting audit…')

    try {
      const res = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'audit', pageId }),
      })

      if (!res.ok) throw new Error()

      toast.loading('Auditing page — this takes ~30s…', { id: toastId })

      // Poll for completion and refresh the server component
      const poll = async (retries = 12) => {
        if (retries <= 0) {
          toast.dismiss(toastId)
          router.refresh()
          setLoading(false)
          return
        }
        try {
          const r = await fetch(`/api/pages/${pageId}`)
          const data = await r.json()
          const pageStatus = data.page?.status

          if (pageStatus === 'failed') {
            const errMsg = data.page?.errorMessage || 'Could not reach the website'
            toast.error(`Audit failed — ${errMsg}`, { id: toastId, duration: 6000 })
            router.refresh()
            setLoading(false)
          } else if (pageStatus !== 'auditing') {
            toast.success('Audit complete! Scores updated.', { id: toastId })
            router.refresh()
            setLoading(false)
          } else {
            setTimeout(() => poll(retries - 1), 3000)
          }
        } catch {
          setTimeout(() => poll(retries - 1), 3000)
        }
      }

      setTimeout(() => poll(), 3000)
    } catch {
      toast.error('Failed to start audit. Please try again.', { id: toastId })
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleAudit}
      disabled={loading}
      className="btn-primary h-9 px-3 sm:px-4 text-sm flex items-center gap-1.5 shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <RefreshCw className="h-3.5 w-3.5" />
      )}
      <span className="hidden sm:inline">
        {loading ? 'Auditing…' : 'Re-audit'}
      </span>
    </button>
  )
}