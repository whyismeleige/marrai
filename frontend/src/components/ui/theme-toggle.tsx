'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const next = !isDark
    setIsDark(next)
    if (next) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('marrai-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('marrai-theme', 'light')
    }
  }

  if (!mounted) return <div className="w-8 h-8" />

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className="
        w-8 h-8 rounded-lg flex items-center justify-center
        text-muted-foreground hover:text-foreground
        hover:bg-muted/70 border border-transparent
        hover:border-border/60
        transition-all duration-150
      "
    >
      {isDark ? (
        <Sun className="h-[15px] w-[15px]" />
      ) : (
        <Moon className="h-[15px] w-[15px]" />
      )}
    </button>
  )
}