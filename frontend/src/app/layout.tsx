import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
import { cn } from '@/lib/utils'

const geist = Geist({ subsets: ['latin'], variable: '--font-sans' })

export const metadata: Metadata = {
  title: 'Marrai — Answer Engine Optimization',
  description:
    'Find out if AI tools like ChatGPT, Perplexity, and Gemini recommend your business. Free AEO audit in under 2 minutes.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Prevent flash of wrong theme */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  try {
                    var stored = localStorage.getItem('marrai-theme');
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    var theme = stored || (prefersDark ? 'dark' : 'light');
                    if (theme === 'dark') document.documentElement.classList.add('dark');
                  } catch(e) {
                    document.documentElement.classList.add('dark');
                  }
                })();
              `,
            }}
          />
        </head>
        <body
          className={cn(
            'font-sans antialiased min-h-screen bg-background text-foreground',
            geist.variable
          )}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}