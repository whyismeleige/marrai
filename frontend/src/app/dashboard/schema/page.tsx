'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Code2, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Schema generators ────────────────────────────────────────────────────────

function makeOrganization(brandName: string, domain: string, description: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: brandName,
    url: `https://${domain}`,
    description,
    sameAs: [],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: `hello@${domain}`,
    },
  }
}

function makeFaqPage(brandName: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `What does ${brandName} do?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${brandName} helps businesses... (fill in your answer)`,
        },
      },
      {
        '@type': 'Question',
        name: `How does ${brandName} work?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: "Here's how it works: (describe your process)",
        },
      },
      {
        '@type': 'Question',
        name: `How much does ${brandName} cost?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our pricing starts at... (add your pricing)',
        },
      },
    ],
  }
}

function makeArticle(brandName: string, domain: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: 'Your Article Headline Here',
    description: 'A brief summary of what this article is about.',
    author: {
      '@type': 'Organization',
      name: brandName,
      url: `https://${domain}`,
    },
    publisher: {
      '@type': 'Organization',
      name: brandName,
      url: `https://${domain}`,
    },
    datePublished: new Date().toISOString().split('T')[0],
    dateModified: new Date().toISOString().split('T')[0],
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://${domain}/your-article-url`,
    },
  }
}

function makeProduct(brandName: string, domain: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: `${brandName} (Product Name)`,
    description: 'Describe your product here.',
    brand: {
      '@type': 'Brand',
      name: brandName,
    },
    offers: {
      '@type': 'Offer',
      url: `https://${domain}/pricing`,
      priceCurrency: 'INR',
      price: '0',
      priceValidUntil: '2025-12-31',
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '24',
    },
  }
}

function makeBreadcrumb(domain: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `https://${domain}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Section',
        item: `https://${domain}/section`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Current Page',
        item: `https://${domain}/section/page`,
      },
    ],
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface SchemaSnippet {
  id: string
  title: string
  description: string
  badge: string
  badgeColor: string
  generate: (brandName: string, domain: string) => object
}

const SNIPPETS: SchemaSnippet[] = [
  {
    id: 'organization',
    title: 'Organization',
    description: 'Tells AI your brand identity — name, URL, contact info. Required on every homepage.',
    badge: 'Essential',
    badgeColor: 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20',
    generate: (b, d) => makeOrganization(b, d, `${b} helps businesses with...`),
  },
  {
    id: 'faqpage',
    title: 'FAQPage',
    description: 'Enables your Q&A content to appear directly in AI answers. High-impact for AEO.',
    badge: 'High impact',
    badgeColor: 'bg-primary/10 text-primary border-primary/20',
    generate: makeFaqPage,
  },
  {
    id: 'article',
    title: 'Article',
    description: 'Marks up blog posts and guides. Helps AI attribute content to your brand.',
    badge: 'For blogs',
    badgeColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    generate: makeArticle,
  },
  {
    id: 'product',
    title: 'Product',
    description: 'Structured data for your product pages including pricing and ratings.',
    badge: 'E-commerce',
    badgeColor: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
    generate: makeProduct,
  },
  {
    id: 'breadcrumb',
    title: 'BreadcrumbList',
    description: 'Helps AI understand your site structure and navigate between sections.',
    badge: 'Structure',
    badgeColor: 'bg-muted text-muted-foreground border-border',
    generate: (_, d) => makeBreadcrumb(d),
  },
]

// ─── Snippet card ─────────────────────────────────────────────────────────────

function SnippetCard({
  snippet,
  brandName,
  domain,
}: {
  snippet: SchemaSnippet
  brandName: string
  domain: string
}) {
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const json = JSON.stringify(snippet.generate(brandName, domain), null, 2)
  const scriptTag = `<script type="application/ld+json">\n${json}\n</script>`

  async function copy() {
    await navigator.clipboard.writeText(scriptTag)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="surface-card rounded-2xl overflow-hidden">
      {/* Card header — stacks on mobile, side-by-side on sm+ */}
      <div className="p-4 sm:p-5">
        {/* Top row: title + badge */}
        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
          <h3 className="text-sm font-bold text-foreground">{snippet.title}</h3>
          <span
            className={cn(
              'text-[10px] font-semibold px-2 py-0.5 rounded-full border whitespace-nowrap',
              snippet.badgeColor
            )}
          >
            {snippet.badge}
          </span>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground leading-relaxed mb-4">
          {snippet.description}
        </p>

        {/* Buttons — always full-width row, never crowd the badge */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setExpanded(p => !p)}
            className="flex-1 sm:flex-none h-9 px-3 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-1.5"
          >
            <Code2 className="h-3.5 w-3.5 shrink-0" />
            {expanded ? 'Hide code' : 'Preview'}
          </button>
          <button
            onClick={copy}
            className={cn(
              'flex-1 sm:flex-none h-9 px-3 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition-all',
              copied
                ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20'
                : 'btn-primary'
            )}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5 shrink-0" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 shrink-0" />
                Copy snippet
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code preview */}
      {expanded && (
        <div className="border-t border-border/60">
          <div className="flex items-center justify-between px-4 py-2 bg-muted/40">
            <span className="text-[10px] font-mono text-muted-foreground">
              application/ld+json
            </span>
            <button
              onClick={copy}
              className="text-[10px] text-primary hover:underline"
            >
              {copied ? 'Copied!' : 'Copy snippet'}
            </button>
          </div>
          <pre className="px-4 py-4 text-[11px] font-mono text-muted-foreground overflow-x-auto leading-relaxed bg-muted/20 max-h-80 overflow-y-auto">
            {scriptTag}
          </pre>
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function SchemaPage() {
  const [brandName, setBrandName] = useState('')
  const [domain, setDomain] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/brand')
      .then(r => r.json())
      .then(data => {
        if (data.brand) {
          setBrandName(data.brand.brandName)
          setDomain(data.brand.domain)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
          Schema Library
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Pre-built JSON-LD snippets for your brand. Copy and paste directly into your{' '}
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">{'<head>'}</code>.
        </p>
      </div>

      {/* Brand override fields */}
      <div className="surface-card rounded-2xl p-4 sm:p-5 mb-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
          Pre-fill settings
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Brand name
            </label>
            <input
              type="text"
              value={brandName}
              onChange={e => setBrandName(e.target.value)}
              placeholder="Your brand name"
              className="w-full h-9 px-3 rounded-lg border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5">
              Domain
            </label>
            <input
              type="text"
              value={domain}
              onChange={e => setDomain(e.target.value)}
              placeholder="yourdomain.com"
              className="w-full h-9 px-3 rounded-lg border border-border bg-input text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition"
            />
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Edit these fields to instantly update all snippets below.
        </p>
      </div>

      {/* How to use */}
      <div className="rounded-xl bg-primary/5 border border-primary/20 px-4 sm:px-5 py-4 mb-6">
        <p className="text-xs font-semibold text-primary mb-1">How to use</p>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Copy a snippet and paste it inside the{' '}
          <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-foreground">
            {'<head>'}
          </code>{' '}
          tag of the relevant page. Each page type gets its own relevant schema. Add{' '}
          <strong>Organization</strong> to every page, then add the page-specific one.
        </p>
      </div>

      {/* Snippets */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 text-primary animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {SNIPPETS.map(snippet => (
            <SnippetCard
              key={snippet.id}
              snippet={snippet}
              brandName={brandName || 'Your Brand'}
              domain={domain || 'yourdomain.com'}
            />
          ))}
        </div>
      )}
    </div>
  )
}