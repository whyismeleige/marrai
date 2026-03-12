'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import {
  Cpu, LayoutDashboard, FileText, BarChart3, Code2,
  ExternalLink, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Brand } from '@/lib/mongodb'

const NAV = [
  { href: '/dashboard',             icon: LayoutDashboard, label: 'Overview'   },
  { href: '/dashboard/pages',       icon: FileText,        label: 'Pages'      },
  { href: '/dashboard/competitors', icon: BarChart3,       label: 'Competitors' },
  { href: '/dashboard/schema',      icon: Code2,           label: 'Schema'     },
]

export default function DashboardSidebar({ brand }: { brand: Brand }) {
  const path = usePathname()

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border/60 bg-card sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-4 h-14 flex items-center border-b border-border/60">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
              <Cpu className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-foreground">Marrai</span>
          </Link>
        </div>

        {/* Brand badge */}
        <div className="mx-3 mt-4 mb-2 px-3 py-2.5 rounded-xl bg-muted border border-border">
          <div className="flex items-center gap-2">
            <img
              src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=16`}
              alt=""
              className="w-4 h-4 rounded-sm shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{brand.brandName}</p>
              <p className="text-[11px] text-muted-foreground truncate">{brand.domain}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="px-2 flex-1 pt-1 space-y-0.5">
          {NAV.map(item => {
            const active = item.href === '/dashboard'
              ? path === '/dashboard'
              : path.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 h-9 px-3 rounded-lg text-sm transition-colors',
                  active
                    ? 'bg-primary/10 text-primary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: audit link + user */}
        <div className="px-2 pb-4 space-y-1 border-t border-border/60 pt-3">
          <Link
            href="/audit"
            target="_blank"
            className="flex items-center gap-2.5 h-9 px-3 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          >
            <ExternalLink className="h-4 w-4 shrink-0" />
            Free Audit Tool
          </Link>
          <div className="flex items-center gap-2.5 px-3 h-9">
            <UserButton
              appearance={{ elements: { avatarBox: 'h-6 w-6' } }}
            />
            <span className="text-sm text-muted-foreground">Account</span>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-background/80 backdrop-blur border-b border-border/60 flex items-center px-4 justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Cpu className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm tracking-tight">Marrai</span>
        </Link>
        {/* Mobile: simple icon nav */}
        <div className="flex items-center gap-1">
          {NAV.map(item => {
            const active = item.href === '/dashboard'
              ? path === '/dashboard'
              : path.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'w-9 h-9 rounded-lg flex items-center justify-center transition-colors',
                  active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <item.icon className="h-4 w-4" />
              </Link>
            )
          })}
          <div className="ml-1">
            <UserButton appearance={{ elements: { avatarBox: 'h-7 w-7' } }} />
          </div>
        </div>
      </div>
      {/* Mobile spacer */}
      <div className="lg:hidden h-14 shrink-0" />
    </>
  )
}