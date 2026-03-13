"use client"
import { useCallback, useEffect, useRef, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"
import { cn } from "@/lib/utils"

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number
}

export const AnimatedThemeToggler = ({
  className,
  duration = 1100,
  ...props
}: AnimatedThemeTogglerProps) => {
  const [isDark, setIsDark] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains("dark"))
    update()
    const obs = new MutationObserver(update)
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })
    return () => obs.disconnect()
  }, [])

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return
    const newDark = !isDark

    if (!document.startViewTransition) {
      setIsDark(newDark)
      document.documentElement.classList.toggle("dark")
      localStorage.setItem("marrai-theme", newDark ? "dark" : "light")
      return
    }

    await document.startViewTransition(() => {
      flushSync(() => {
        setIsDark(newDark)
        document.documentElement.classList.toggle("dark")
        localStorage.setItem("marrai-theme", newDark ? "dark" : "light")
      })
    }).ready

    const { top, left, width, height } = buttonRef.current.getBoundingClientRect()
    const x = left + width / 2
    const y = top + height / 2
    const maxR = Math.hypot(Math.max(left, innerWidth - left), Math.max(top, innerHeight - top))

    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxR}px at ${x}px ${y}px)`] },
      { duration, easing: "ease-in-out", pseudoElement: "::view-transition-new(root)" }
    )
  }, [isDark, duration])

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "w-8 h-8 rounded-lg flex items-center justify-center",
        "text-muted-foreground hover:text-foreground",
        "hover:bg-muted/70 border border-transparent hover:border-border/60",
        "transition-all duration-150",
        className
      )}
      {...props}
    >
      {isDark ? <Sun className="h-[15px] w-[15px]" /> : <Moon className="h-[15px] w-[15px]" />}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}