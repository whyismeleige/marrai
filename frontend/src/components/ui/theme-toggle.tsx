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

  if (!mounted) {
    return <div className="w-8 h-8" />
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      className="
        w-8 h-8 rounded-md flex items-center justify-center
        text-muted-foreground hover:text-foreground
        hover:bg-muted
        transition-all duration-150
        border border-transparent hover:border-border
      "
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </button>
  )
}