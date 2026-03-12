// Drop-in replacement for the Nav function in src/app/page.tsx
// Wrap this client component around the auth buttons

'use client'

import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { ArrowRight, LayoutDashboard } from 'lucide-react'

export default function NavAuthButtons() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) {
    return (
      <Link href="/audit" className="btn-primary h-8 px-4 text-xs">
        Free Audit <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    )
  }

  if (isSignedIn) {
    return (
      <Link href="/dashboard" className="btn-primary h-8 px-4 text-xs">
        <LayoutDashboard className="h-3.5 w-3.5" />
        Dashboard
      </Link>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/sign-in"
        className="h-8 px-3.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors inline-flex items-center"
      >
        Sign in
      </Link>
      <Link href="/audit" className="btn-primary h-8 px-4 text-xs">
        Free Audit <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  )
}