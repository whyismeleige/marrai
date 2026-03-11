import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: 'Marrai - The Future of Marketing',
  description: 'Marrai: The future of marketing. AI-powered marketing insights for modern businesses.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={cn("font-sans", geist.variable, "min-h-screen")}>{children}</body>
    </html>
  )
}