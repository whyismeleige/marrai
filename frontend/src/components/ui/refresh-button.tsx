'use client'

import { RefreshCw } from 'lucide-react'

export function RefreshButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="h-9 px-4 rounded-lg text-sm font-medium border border-border hover:bg-muted inline-flex items-center gap-1.5 transition-colors text-foreground"
    >
      <RefreshCw className="h-3.5 w-3.5" />
      Refresh
    </button>
  )
}