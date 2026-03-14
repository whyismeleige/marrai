'use client'

// src/components/providers/toast-provider.tsx
import { Toaster } from 'react-hot-toast'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ToastProvider() {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <Toaster
      position="top-right"
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: isDark ? '#1c1c1e' : '#ffffff',
          color: isDark ? '#e5e5e7' : '#1a1a1a',
          border: `1px solid ${isDark ? '#2a2a2e' : '#e4e4e7'}`,
          borderRadius: '12px',
          fontSize: '13px',
          fontWeight: '500',
          padding: '10px 14px',
          boxShadow: isDark
            ? '0 4px 24px rgba(0,0,0,0.4)'
            : '0 4px 24px rgba(0,0,0,0.08)',
          maxWidth: '360px',
        },
        success: {
          iconTheme: { primary: '#22c55e', secondary: '#ffffff' },
          style: {
            background: isDark ? '#1c1c1e' : '#ffffff',
            color: isDark ? '#e5e5e7' : '#1a1a1a',
            border: `1px solid ${isDark ? '#166534' : '#bbf7d0'}`,
          },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#ffffff' },
          style: {
            background: isDark ? '#1c1c1e' : '#ffffff',
            color: isDark ? '#e5e5e7' : '#1a1a1a',
            border: `1px solid ${isDark ? '#991b1b' : '#fecaca'}`,
          },
        },
        loading: {
          iconTheme: { primary: '#7c3aed', secondary: '#ffffff' },
        },
      }}
    />
  )
}