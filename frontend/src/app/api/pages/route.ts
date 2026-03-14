import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  getBrandByUserId,
  getBrandPages,
  createBrandPage,
  updateBrandPage,
  updateBrandPageWithAuditResult,
  deleteBrandPage,
} from '@/lib/mongodb'
import { analyzeWebsite } from '@/lib/analyzer'

// GET /api/pages → list all pages for this user's brand
export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const brand = await getBrandByUserId(userId)
    if (!brand?._id) return NextResponse.json({ pages: [] })

    const pages = await getBrandPages(brand._id.toString())
    return NextResponse.json({ pages })
  } catch (error) {
    console.error('GET /api/pages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/pages → add a page OR audit a page
// Body: { action: 'add', url, label? } | { action: 'audit', pageId } | { action: 'audit_all' }
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { action } = body

    const brand = await getBrandByUserId(userId)
    if (!brand?._id) {
      return NextResponse.json({ error: 'Complete onboarding first' }, { status: 400 })
    }
    const brandId = brand._id.toString()

    // ── Add page ────────────────────────────────────────────
    if (action === 'add') {
      const { url, label } = body
      if (!url) return NextResponse.json({ error: 'URL is required' }, { status: 400 })

      let validUrl: string
      try {
        validUrl = new URL(url.startsWith('http') ? url : `https://${url}`).href
      } catch {
        return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
      }

      const pages = await getBrandPages(brandId)
      if (pages.length >= 20) {
        return NextResponse.json({ error: 'Maximum 20 pages per brand' }, { status: 400 })
      }

      const id = await createBrandPage({ brandId, userId, url: validUrl, label })
      return NextResponse.json({ id }, { status: 201 })
    }

    // ── Audit single page ────────────────────────────────────
    if (action === 'audit') {
      const { pageId } = body
      if (!pageId) return NextResponse.json({ error: 'pageId is required' }, { status: 400 })

      await updateBrandPage(pageId, { status: 'auditing' })

      // Fire and forget – client will poll or re-fetch
      auditPageInBackground(pageId).catch(console.error)

      return NextResponse.json({ status: 'auditing' })
    }

    // ── Audit all pages ──────────────────────────────────────
    if (action === 'audit_all') {
      const pages = await getBrandPages(brandId)
      const unaudited = pages.filter(p => p.status !== 'auditing')

      await Promise.all(
        unaudited.map(p => updateBrandPage(p._id!.toString(), { status: 'auditing' }))
      )

      // Fire all in parallel (background)
      unaudited.forEach(p => auditPageInBackground(p._id!.toString()).catch(console.error))

      return NextResponse.json({ started: unaudited.length })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('POST /api/pages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/pages?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    await deleteBrandPage(id)
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('DELETE /api/pages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// ─── Background audit ────────────────────────────────────────────────────────

async function auditPageInBackground(pageId: string) {
  const { getBrandPage } = await import('@/lib/mongodb')
  const page = await getBrandPage(pageId)
  if (!page) return

  try {
    const result = await analyzeWebsite(page.url)
    await updateBrandPageWithAuditResult(
      pageId,
      result.score,
      result.categoryScores,
      result.findings
    )
  } catch (err: any) {
    const errorMessage = err?.message || 'Could not reach website'
    await updateBrandPage(pageId, { status: 'failed', errorMessage })
    console.error(`Audit failed for page ${pageId}:`, errorMessage)
  }
}