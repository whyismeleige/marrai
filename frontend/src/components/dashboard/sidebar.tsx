'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import {
  Cpu, LayoutDashboard, FileText, BarChart3, Code2,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { AnimatedThemeToggler } from '../ui/animated-theme-toggler'

export interface SerializedBrand {
  _id: string
  userId: string
  brandName: string
  domain: string
  industry: string
  keywords: string[]
  competitorDomains: string[]
  createdAt: string
  updatedAt: string
}

const NAV = [
  { href: '/dashboard',             icon: LayoutDashboard, label: 'Overview'    },
  { href: '/dashboard/pages',       icon: FileText,        label: 'Pages'       },
  { href: '/dashboard/competitors', icon: BarChart3,       label: 'Competitors' },
  { href: '/dashboard/schema',      icon: Code2,           label: 'Schema'      },
]

export default function DashboardSidebar({ brand }: { brand: SerializedBrand }) {
  const path = usePathname()

  return (
    <>
      {/* ── Desktop sidebar ───────────────────────────────────────── */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border/60 bg-card sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-4 h-14 flex justify-between items-center border-b border-border/60">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
              <Cpu className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-[15px] tracking-tight text-foreground">Marrai</span>
          </Link>
          <AnimatedThemeToggler/>
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
            <UserButton appearance={{ elements: { avatarBox: 'h-6 w-6' } }} />
            <span className="text-sm text-muted-foreground">Account</span>
          </div>
        </div>
      </aside>

      {/* ── Mobile top bar ─────────────────────────────────────────── */}
      {/*
        Slim header: logo left, brand badge right, user avatar far right.
        Navigation lives in the bottom tab bar below.
      */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-background/95 backdrop-blur-md border-b border-border/60 flex items-center px-4 justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-sm shadow-primary/20">
            <Cpu className="h-3.5 w-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm tracking-tight">Marrai</span>
        </Link>

        {/* Brand + user */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-muted border border-border rounded-lg px-2.5 py-1.5">
            <img
              src={`https://www.google.com/s2/favicons?domain=${brand.domain}&sz=14`}
              alt=""
              className="w-3.5 h-3.5 rounded-sm shrink-0"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
            <span className="text-xs font-medium text-foreground truncate max-w-[100px]">
              {brand.brandName}
            </span>
          </div>
          <AnimatedThemeToggler/>
          <UserButton appearance={{ elements: { avatarBox: 'h-7 w-7' } }} />
        </div>
      </div>

      {/* ── Mobile bottom tab bar ──────────────────────────────────── */}
      {/*
        Modern app-style bottom navigation. Far better UX than top icon bar:
        - Thumb-reachable
        - Labels visible
        - Clear active state
      */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 h-16 bg-background/95 backdrop-blur-md border-t border-border/60 flex items-center justify-around px-2 safe-area-pb">
        {NAV.map(item => {
          const active = item.href === '/dashboard'
            ? path === '/dashboard'
            : path.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-col items-center gap-1 flex-1 py-2 rounded-xl transition-colors',
                active
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div className={cn(
                'w-8 h-6 rounded-full flex items-center justify-center transition-all duration-200',
                active ? 'bg-primary/15' : ''
              )}>
                <item.icon className={cn('h-4 w-4', active ? 'h-[18px] w-[18px]' : '')} />
              </div>
              <span className={cn(
                'text-[10px] font-medium leading-none transition-all',
                active ? 'font-semibold' : ''
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}

        {/* Audit link in bottom nav */}
        <Link
          href="/audit"
          target="_blank"
          className="flex flex-col items-center gap-1 flex-1 py-2 rounded-xl text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="w-8 h-6 rounded-full flex items-center justify-center">
            <ExternalLink className="h-4 w-4" />
          </div>
          <span className="text-[10px] font-medium leading-none">Audit</span>
        </Link>
      </nav>
    </>
  )
}