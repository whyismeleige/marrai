// src/app/api/brand/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  createBrand, getBrandByUserId, updateBrand,
  createBrandPage, getBrandPages,
  createCompetitor, getCompetitors,
  updateBrandPage, updateBrandPageWithAuditResult,
  updateCompetitor,
} from '@/lib/mongodb'
import { analyzeWebsite } from '@/lib/analyzer'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const brand = await getBrandByUserId(userId)
    return NextResponse.json({ brand })
  } catch (error) {
    console.error('GET /api/brand error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { brandName, domain, industry, keywords, competitorDomains } = body

    if (!brandName || !domain || !industry) {
      return NextResponse.json(
        { error: 'brandName, domain, and industry are required' },
        { status: 400 }
      )
    }

    // Normalise domain
    let cleanDomain = domain.trim().toLowerCase()
    cleanDomain = cleanDomain
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/\/$/, '')

    const cleanCompetitors: string[] = (competitorDomains || [])
      .slice(0, 3)
      .map((d: string) =>
        d.trim().toLowerCase()
          .replace(/^https?:\/\//, '')
          .replace(/^www\./, '')
          .replace(/\/$/, '')
      )
      .filter(Boolean)

    const existing = await getBrandByUserId(userId)

    let brandId: string

    if (existing && existing._id) {
      brandId = existing._id.toString()
      await updateBrand(brandId, {
        brandName: brandName.trim(),
        domain: cleanDomain,
        industry,
        keywords: (keywords || []).slice(0, 5).map((k: string) => k.trim()).filter(Boolean),
        competitorDomains: cleanCompetitors,
      })
    } else {
      brandId = await createBrand({
        userId,
        brandName: brandName.trim(),
        domain: cleanDomain,
        industry,
        keywords: (keywords || []).slice(0, 5).map((k: string) => k.trim()).filter(Boolean),
        competitorDomains: cleanCompetitors,
      })
    }

    // ── Auto-seed homepage page if none exist ────────────────
    const existingPages = await getBrandPages(brandId)
    if (existingPages.length === 0) {
      const homepageUrl = `https://${cleanDomain}`
      const pageId = await createBrandPage({
        brandId,
        userId,
        url: homepageUrl,
        label: 'Homepage',
      })

      // Fire audit in background — don't await
      auditPageInBackground(pageId).catch(console.error)
    }

    // ── Auto-seed competitors if provided ────────────────────
    if (cleanCompetitors.length > 0) {
      const existingComps = await getCompetitors(brandId)
      const existingDomains = existingComps.map(c => c.domain)

      for (const compDomain of cleanCompetitors) {
        if (existingDomains.includes(compDomain)) continue // already exists

        const compId = await createCompetitor({ brandId, userId, domain: compDomain })

        // Fire competitor audit in background — don't await
        auditCompetitorInBackground(compId, compDomain).catch(console.error)
      }
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('POST /api/brand error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── Background: audit a brand page ─────────────────────────────────────────

async function auditPageInBackground(pageId: string) {
  const { getBrandPage } = await import('@/lib/mongodb')
  const page = await getBrandPage(pageId)
  if (!page) return

  try {
    await updateBrandPage(pageId, { status: 'auditing' })
    const result = await analyzeWebsite(page.url)
    await updateBrandPageWithAuditResult(pageId, result.score, result.categoryScores, result.findings)
  } catch (err: any) {
    const errorMessage = err?.message || 'Could not reach website'
    await updateBrandPage(pageId, { status: 'failed', errorMessage })
    console.error(`Onboarding homepage audit failed:`, errorMessage)
  }
}

// ─── Background: audit a competitor ──────────────────────────────────────────
// Accepts domain directly — no need for a getCompetitor() helper

async function auditCompetitorInBackground(competitorId: string, domain: string) {
  try {
    await updateCompetitor(competitorId, { status: 'auditing' })
    const result = await analyzeWebsite(`https://${domain}`)
    await updateCompetitor(competitorId, {
      score: result.score,
      categoryScores: result.categoryScores,
      status: 'done',
      lastAuditedAt: new Date(),
      errorMessage: undefined,
    })
  } catch (err: any) {
    const errorMessage = err?.message || 'Could not reach website'
    await updateCompetitor(competitorId, { status: 'failed', errorMessage })
    console.error(`Onboarding competitor audit failed for ${domain}:`, errorMessage)
  }
}