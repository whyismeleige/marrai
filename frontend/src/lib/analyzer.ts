import axios from 'axios'
import * as cheerio from 'cheerio'
import type {Element } from 'domhandler'

// ─── Types ─────────────────────────────────────────────────────────────────

export interface CategoryScores {
  schema: number     // max 25
  content: number    // max 30
  technical: number  // max 25
  structure: number  // max 20
}

export interface AuditFinding {
  text: string
  priority: 'critical' | 'warning' | 'suggestion'
  category: 'schema' | 'content' | 'technical' | 'structure'
}

export interface AnalysisResult {
  score: number
  categoryScores: CategoryScores

  // Schema
  hasSchema: boolean
  schemaTypes: string[]
  hasFaqSchema: boolean
  hasArticleSchema: boolean
  hasOrganizationSchema: boolean

  // Technical
  robotsBlocked: boolean
  metaTitle: string
  metaDescription: string
  hasMetaDescription: boolean
  hasCanonical: boolean
  hasOgTags: boolean
  pageLoadable: boolean

  // Structure
  hasH1: boolean
  h1Count: number
  h2Count: number
  h3Count: number
  questionHeadings: number
  h1Text: string

  // Content
  wordCount: number
  firstParaWordCount: number
  listCount: number
  tableCount: number
  imageCount: number
  imagesWithoutAlt: number
  internalLinks: number
  externalLinks: number

  // Findings (replaces flat issues/warnings/recommendations)
  findings: AuditFinding[]

  // Legacy (kept for email compatibility)
  issues: string[]
  warnings: string[]
  recommendations: string[]
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length
}

/** Strip nav/header/footer/script/style noise to get clean body text */
function getMainContent($: cheerio.CheerioAPI): string {
  const $clone = $.root().clone()
  $clone.find('nav, header, footer, script, style, noscript, [role="navigation"], [role="banner"], [role="contentinfo"], .nav, .navbar, .header, .footer, .sidebar, aside, iframe').remove()
  return $clone.text().replace(/\s+/g, ' ').trim()
}

/** Extract all schema @type values, handling @graph and arrays */
function extractSchemaTypes(schemas: cheerio.Cheerio<Element>, $: cheerio.CheerioAPI): string[] {
  const types: string[] = []

  schemas.each((_, el) => {
    try {
      const raw = $(el).html()
      if (!raw) return
      const data = JSON.parse(raw)

      const extractType = (obj: Record<string, unknown>) => {
        if (!obj || typeof obj !== 'object') return
        if (obj['@type']) {
          const t = obj['@type']
          if (Array.isArray(t)) t.forEach((v: string) => types.push(v))
          else types.push(t as string)
        }
        if (obj['@graph'] && Array.isArray(obj['@graph'])) {
          ;(obj['@graph'] as Record<string, unknown>[]).forEach(extractType)
        }
      }

      if (Array.isArray(data)) data.forEach(extractType)
      else extractType(data)
    } catch (_) {
      // malformed JSON, skip
    }
  })

  return [...new Set(types)]
}

/** Check if robots.txt actually blocks specific AI bots properly */
function checkRobotsBlocking(robotsTxt: string): boolean {
  const lines = robotsTxt.toLowerCase().split('\n').map(l => l.trim())
  const aiBots = ['gptbot', 'chatgpt-user', 'google-extended', 'perplexitybot', 'claudebot', 'anthropic-ai', 'cohere-ai']

  let currentAgent = ''
  let globalDisallowAll = false
  const agentRules: Record<string, string[]> = {}

  for (const line of lines) {
    if (line.startsWith('user-agent:')) {
      currentAgent = line.replace('user-agent:', '').trim()
      if (!agentRules[currentAgent]) agentRules[currentAgent] = []
    } else if (line.startsWith('disallow:') && currentAgent) {
      agentRules[currentAgent].push(line.replace('disallow:', '').trim())
    }
  }

  // Check wildcard
  if (agentRules['*']?.includes('/')) globalDisallowAll = true

  for (const bot of aiBots) {
    const rules = agentRules[bot] || []
    if (rules.includes('/') || rules.includes('/*')) return true
  }

  return globalDisallowAll
}

// ─── Main Analyzer ───────────────────────────────────────────────────────────

export async function analyzeWebsite(url: string): Promise<AnalysisResult> {
  const result: AnalysisResult = {
    score: 0,
    categoryScores: { schema: 0, content: 0, technical: 0, structure: 0 },
    hasSchema: false,
    schemaTypes: [],
    hasFaqSchema: false,
    hasArticleSchema: false,
    hasOrganizationSchema: false,
    robotsBlocked: false,
    metaTitle: '',
    metaDescription: '',
    hasMetaDescription: false,
    hasCanonical: false,
    hasOgTags: false,
    pageLoadable: false,
    hasH1: false,
    h1Count: 0,
    h2Count: 0,
    h3Count: 0,
    questionHeadings: 0,
    h1Text: '',
    wordCount: 0,
    firstParaWordCount: 0,
    listCount: 0,
    tableCount: 0,
    imageCount: 0,
    imagesWithoutAlt: 0,
    internalLinks: 0,
    externalLinks: 0,
    findings: [],
    issues: [],
    warnings: [],
    recommendations: [],
  }

  const add = (finding: AuditFinding) => {
    result.findings.push(finding)
    if (finding.priority === 'critical') result.issues.push(finding.text)
    else if (finding.priority === 'warning') result.warnings.push(finding.text)
    else result.recommendations.push(finding.text)
  }

  // ── Fetch page ────────────────────────────────────────────────────────────
  let html = ''
  try {
    const response = await axios.get(url, {
      timeout: 12000,
      maxRedirects: 5,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MarraiAEOBot/1.0; +https://marrai.in/bot)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'Cache-Control': 'no-cache',
      },
    })
    html = response.data
    result.pageLoadable = true
  } catch (err: any) {
    const msg = err?.code === 'ENOTFOUND' || err?.code === 'EAI_AGAIN'
      ? 'Website not found — please double-check the URL.'
      : err?.code === 'ETIMEDOUT' || err?.code === 'ECONNABORTED'
      ? 'Website took too long to respond (timeout after 12s).'
      : err?.response?.status
      ? `Website returned HTTP ${err.response.status}.`
      : 'Could not reach website. Make sure it is publicly accessible.'
    throw new Error(msg)
  }

  const $ = cheerio.load(html)
  const origin = new URL(url).origin

  // ══════════════════════════════════════════════════════════════════════════
  // CATEGORY 1 — SCHEMA & AI SIGNALS (max 25 pts)
  // ══════════════════════════════════════════════════════════════════════════

  const schemaScripts = $('script[type="application/ld+json"]')
  result.schemaTypes = extractSchemaTypes(schemaScripts, $)
  result.hasSchema = result.schemaTypes.length > 0
  result.hasFaqSchema = result.schemaTypes.some(t => t === 'FAQPage')
  result.hasArticleSchema = result.schemaTypes.some(t => ['Article', 'BlogPosting', 'NewsArticle', 'TechArticle'].includes(t))
  result.hasOrganizationSchema = result.schemaTypes.some(t => ['Organization', 'LocalBusiness', 'Corporation'].includes(t))

  let schemaScore = 0
  if (result.hasSchema) {
    schemaScore += 5  // base: has any schema

    if (result.hasFaqSchema) {
      schemaScore += 10
    } else {
      add({ text: 'Add FAQPage schema — AI tools directly extract FAQ schema for featured answers', priority: 'critical', category: 'schema' })
    }

    if (result.hasArticleSchema) schemaScore += 5
    else {
      add({ text: 'Add Article or BlogPosting schema to help AI identify your content type', priority: 'warning', category: 'schema' })
    }

    if (result.hasOrganizationSchema) schemaScore += 5
    else {
      add({ text: 'Add Organization schema so AI tools can accurately reference your brand', priority: 'suggestion', category: 'schema' })
    }

    if (result.schemaTypes.length >= 3) schemaScore = Math.min(schemaScore + 3, 25) // bonus for richness
  } else {
    add({ text: 'No schema markup found — this is the #1 way AI tools understand your content', priority: 'critical', category: 'schema' })
    add({ text: 'Start with FAQPage and Organization schema for immediate AI visibility gains', priority: 'suggestion', category: 'schema' })
  }

  // OG Tags contribute to schema category (AI social signal)
  result.hasOgTags = !!($('meta[property="og:title"]').attr('content') && $('meta[property="og:description"]').attr('content'))
  if (result.hasOgTags) {
    schemaScore = Math.min(schemaScore + 3, 25)
  } else {
    add({ text: 'Add Open Graph meta tags (og:title, og:description) for better AI social context', priority: 'warning', category: 'schema' })
  }

  result.categoryScores.schema = Math.min(schemaScore, 25)

  // ══════════════════════════════════════════════════════════════════════════
  // CATEGORY 2 — CONTENT QUALITY (max 30 pts)
  // ══════════════════════════════════════════════════════════════════════════

  let contentScore = 0

  // Word count (10 pts) — use clean main content
  const mainText = getMainContent($)
  result.wordCount = countWords(mainText)

  if (result.wordCount >= 600) {
    contentScore += 10
  } else if (result.wordCount >= 300) {
    contentScore += 6
    add({ text: `Page has ${result.wordCount} words — AI tools prefer 600+ words for comprehensive answers`, priority: 'warning', category: 'content' })
  } else if (result.wordCount >= 150) {
    contentScore += 3
    add({ text: `Very thin content: only ${result.wordCount} words — AI tools rarely cite pages under 300 words`, priority: 'critical', category: 'content' })
  } else {
    add({ text: `Extremely thin content: ${result.wordCount} words — add substantial written content`, priority: 'critical', category: 'content' })
  }

  // First paragraph (8 pts)
  // Skip short tag-like elements; find the first real paragraph
  $('p').each((_, el) => {
    if (result.firstParaWordCount > 0) return
    const text = $(el).text().trim()
    const wc = countWords(text)
    if (wc < 10) return // skip tiny snippets
    result.firstParaWordCount = wc
  })

  if (result.firstParaWordCount >= 40 && result.firstParaWordCount <= 80) {
    contentScore += 8
  } else if (result.firstParaWordCount >= 25 && result.firstParaWordCount <= 120) {
    contentScore += 4
    add({ text: `First paragraph is ${result.firstParaWordCount} words (ideal: 40–80) — AI uses this as the primary answer extract`, priority: 'warning', category: 'content' })
  } else if (result.firstParaWordCount > 0) {
    contentScore += 1
    add({ text: `First paragraph is ${result.firstParaWordCount} words — rewrite it as a concise 40–60 word direct answer to your main keyword`, priority: 'critical', category: 'content' })
  } else {
    add({ text: 'No readable paragraph found on this page — add substantial body content', priority: 'critical', category: 'content' })
  }

  // Question headings (7 pts)
  $('h1, h2, h3, h4').each((_, el) => {
    const text = $(el).text().trim()
    const hasQuestion = /\?$/.test(text) || /^(what|how|why|when|where|who|which|can|does|is|are|should|do)\s/i.test(text)
    if (hasQuestion) result.questionHeadings++
  })

  if (result.questionHeadings >= 4) {
    contentScore += 7
  } else if (result.questionHeadings >= 2) {
    contentScore += 4
    add({ text: `Only ${result.questionHeadings} question-format headings — add at least 4 "What/How/Why" headings to match AI query patterns`, priority: 'warning', category: 'content' })
  } else if (result.questionHeadings === 1) {
    contentScore += 1
    add({ text: 'Only 1 question heading found — use question-format H2s like "What is X?" and "How does Y work?"', priority: 'warning', category: 'content' })
  } else {
    add({ text: 'No question-based headings — AI tools look for these to extract Q&A answers', priority: 'critical', category: 'content' })
  }

  // Lists & tables (5 pts)
  result.listCount = $('ul, ol').length
  result.tableCount = $('table').length
  const structuredItems = result.listCount + result.tableCount

  if (structuredItems >= 4) {
    contentScore += 5
  } else if (structuredItems >= 2) {
    contentScore += 3
    add({ text: 'Add more bullet lists and tables — AI tools love structured, scannable content', priority: 'suggestion', category: 'content' })
  } else if (structuredItems === 1) {
    contentScore += 1
    add({ text: 'Almost no structured content — add bullet lists to break down key points', priority: 'warning', category: 'content' })
  } else {
    add({ text: 'No lists or tables found — structured content dramatically improves AI answer extraction', priority: 'warning', category: 'content' })
  }

  result.categoryScores.content = Math.min(contentScore, 30)

  // ══════════════════════════════════════════════════════════════════════════
  // CATEGORY 3 — TECHNICAL SIGNALS (max 25 pts)
  // ══════════════════════════════════════════════════════════════════════════

  let technicalScore = 0

  // Robots.txt (8 pts)
  try {
    const robotsUrl = `${origin}/robots.txt`
    const robotsRes = await axios.get(robotsUrl, { timeout: 5000 })
    result.robotsBlocked = checkRobotsBlocking(robotsRes.data)

    if (result.robotsBlocked) {
      add({ text: 'AI crawlers are blocked in robots.txt — ChatGPT, Perplexity, and Claude cannot index this page', priority: 'critical', category: 'technical' })
    } else {
      technicalScore += 8
    }
  } catch (_) {
    technicalScore += 8 // no robots.txt = allow all
  }

  // Meta title (6 pts)
  result.metaTitle = $('title').first().text().trim()
  if (result.metaTitle) {
    const titleLen = result.metaTitle.length
    technicalScore += 6
    if (titleLen < 30 || titleLen > 65) {
      add({ text: `Meta title is ${titleLen} chars (ideal: 30–65) — "Google" gets ~65 chars before truncation`, priority: 'warning', category: 'technical' })
    }
  } else {
    add({ text: 'Missing <title> tag — AI tools use the page title as the source label in citations', priority: 'critical', category: 'technical' })
  }

  // Meta description (6 pts)
  const metaDescEl = $('meta[name="description"]').attr('content') || $('meta[property="og:description"]').attr('content')
  result.metaDescription = metaDescEl?.trim() || ''
  result.hasMetaDescription = result.metaDescription.length > 0

  if (result.hasMetaDescription) {
    const descLen = result.metaDescription.length
    technicalScore += 6
    if (descLen < 100 || descLen > 165) {
      add({ text: `Meta description is ${descLen} chars (ideal: 100–165) — AI tools use this as a content summary`, priority: 'suggestion', category: 'technical' })
    }
  } else {
    add({ text: 'No meta description — AI tools use this to understand page context before crawling', priority: 'critical', category: 'technical' })
  }

  // Canonical tag (5 pts)
  const canonical = $('link[rel="canonical"]').attr('href')
  result.hasCanonical = !!canonical
  if (result.hasCanonical) {
    technicalScore += 5
  } else {
    add({ text: 'No canonical tag — without it, AI tools may index duplicate versions of your page', priority: 'warning', category: 'technical' })
  }

  result.categoryScores.technical = Math.min(technicalScore, 25)

  // ══════════════════════════════════════════════════════════════════════════
  // CATEGORY 4 — PAGE STRUCTURE (max 20 pts)
  // ══════════════════════════════════════════════════════════════════════════

  let structureScore = 0

  // H1 (6 pts)
  const h1s = $('h1')
  result.h1Count = h1s.length
  result.hasH1 = result.h1Count > 0
  result.h1Text = h1s.first().text().trim()

  if (result.h1Count === 1) {
    structureScore += 6
  } else if (result.h1Count === 0) {
    add({ text: 'Missing H1 tag — AI tools use H1 as the primary topic signal for your page', priority: 'critical', category: 'structure' })
  } else {
    structureScore += 2
    add({ text: `Multiple H1 tags found (${result.h1Count}) — use exactly one H1; demote others to H2`, priority: 'warning', category: 'structure' })
  }

  // H2s (5 pts)
  result.h2Count = $('h2').length
  if (result.h2Count >= 4) {
    structureScore += 5
  } else if (result.h2Count >= 2) {
    structureScore += 3
    add({ text: `Only ${result.h2Count} H2 headings — aim for 4+ to signal comprehensive topic coverage`, priority: 'suggestion', category: 'structure' })
  } else if (result.h2Count === 1) {
    structureScore += 1
    add({ text: 'Only 1 H2 heading — AI tools use heading hierarchy to map your content structure', priority: 'warning', category: 'structure' })
  } else {
    add({ text: 'No H2 headings — add subheadings to improve content structure for AI parsing', priority: 'warning', category: 'structure' })
  }

  // H3s (3 pts)
  result.h3Count = $('h3').length
  if (result.h3Count >= 3) {
    structureScore += 3
  } else if (result.h3Count >= 1) {
    structureScore += 1
  } else {
    add({ text: 'No H3 subheadings — use H3s to break sections into AI-readable subsections', priority: 'suggestion', category: 'structure' })
  }

  // Image alt text (6 pts)
  result.imageCount = $('img').length
  let imgsWithoutAlt = 0
  $('img').each((_, el) => {
    const alt = $(el).attr('alt')
    if (!alt || alt.trim() === '') imgsWithoutAlt++
  })
  result.imagesWithoutAlt = imgsWithoutAlt

  if (result.imageCount === 0) {
    structureScore += 3 // no images is neutral
    add({ text: 'No images found — adding relevant images with descriptive alt text improves AI understanding', priority: 'suggestion', category: 'structure' })
  } else if (imgsWithoutAlt === 0) {
    structureScore += 6
  } else if (imgsWithoutAlt <= 2) {
    structureScore += 3
    add({ text: `${imgsWithoutAlt} image(s) missing alt text — AI uses alt text to understand visual context`, priority: 'warning', category: 'structure' })
  } else {
    add({ text: `${imgsWithoutAlt} of ${result.imageCount} images lack alt text — this hurts AI comprehension of your content`, priority: 'warning', category: 'structure' })
  }

  // Internal / external links (bonus)
  const linkOrigin = origin.replace(/\/$/, '')
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || ''
    if (href.startsWith('/') || href.startsWith(linkOrigin)) {
      result.internalLinks++
    } else if (href.startsWith('http')) {
      result.externalLinks++
    }
  })

  if (result.internalLinks < 3) {
    add({ text: 'Low internal link count — add links to related pages to help AI map your site structure', priority: 'suggestion', category: 'structure' })
  }

  result.categoryScores.structure = Math.min(structureScore, 20)

  // ── Final Score ──────────────────────────────────────────────────────────
  result.score = Math.min(
    result.categoryScores.schema +
    result.categoryScores.content +
    result.categoryScores.technical +
    result.categoryScores.structure,
    100
  )

  // ── Universal suggestions (only if not already added) ───────────────────
  const allTexts = result.findings.map(f => f.text)
  const addSuggestion = (text: string, category: AuditFinding['category']) => {
    if (!allTexts.some(t => t.includes(text.slice(0, 30)))) {
      add({ text, priority: 'suggestion', category })
    }
  }

  addSuggestion('Test your page by asking ChatGPT and Perplexity about your topic — see if you are cited', 'content')
  addSuggestion('Create a dedicated /faq page and link to it from your main pages', 'content')

  return result
}