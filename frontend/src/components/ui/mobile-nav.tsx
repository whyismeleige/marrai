"use client"

import { useState, useEffect } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { useAuth } from "@clerk/nextjs"
import { Menu, X, ArrowRight, LayoutDashboard, Cpu } from "lucide-react"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"

const NAV_LINKS = [
  { label: "Features",     href: "#features"    },
  { label: "How it works", href: "#how-it-works" },
  { label: "FAQ",          href: "#faq"          },
]

export default function MobileNav() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { isSignedIn, isLoaded } = useAuth()

  // Wait for client mount before using portal
  useEffect(() => { setMounted(true) }, [])

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  // Close on resize to desktop
  useEffect(() => {
    const handler = () => { if (window.innerWidth >= 768) setOpen(false) }
    window.addEventListener("resize", handler)
    return () => window.removeEventListener("resize", handler)
  }, [])

  return (
    <>
      {/* Hamburger button — stays inside the header */}
      <div className="md:hidden flex items-center gap-1">
        <AnimatedThemeToggler />
        <button
          onClick={() => setOpen(v => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/70 border border-transparent hover:border-border/60 transition-all duration-150"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/*
        Portal: renders backdrop + drawer directly into document.body.
        This escapes the header's backdrop-filter stacking context entirely,
        so the drawer gets a truly solid, opaque background.
      */}
      {mounted && createPortal(
        <>
          {/* Backdrop */}
          <div
            className={`
              fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm
              transition-opacity duration-300
              ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}
            `}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Drawer */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
            className={`
              fixed top-0 right-0 h-full z-[101] w-72
              bg-white dark:bg-zinc-900
              border-l border-zinc-200 dark:border-zinc-800
              shadow-2xl
              transform transition-transform duration-300 ease-out
              ${open ? "translate-x-0" : "translate-x-full"}
            `}
          >
            {/* Header */}
            <div className="h-14 px-5 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <Cpu className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
                <span className="font-semibold text-[15px] tracking-tight text-zinc-900 dark:text-zinc-50">
                  Marrai
                </span>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="px-3 py-4 space-y-1">
              {NAV_LINKS.map(link => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className="flex items-center h-11 px-3 rounded-lg text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Divider */}
            <div className="mx-5 border-t border-zinc-200 dark:border-zinc-800" />

            {/* Auth buttons */}
            <div className="px-3 py-4 space-y-2">
              {isLoaded && isSignedIn ? (
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold w-full hover:opacity-90 transition-opacity"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Link>
              ) : (
                <>
                  {isLoaded && (
                    <Link
                      href="/sign-in"
                      onClick={() => setOpen(false)}
                      className="flex items-center justify-center h-10 rounded-xl border border-zinc-200 dark:border-zinc-700 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors w-full"
                    >
                      Sign in
                    </Link>
                  )}
                  <Link
                    href="/audit"
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold w-full hover:opacity-90 transition-opacity"
                  >
                    Free Audit
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  )
}