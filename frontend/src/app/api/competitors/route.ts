import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import {
  getBrandByUserId,
  getCompetitors,
  createCompetitor,
  updateCompetitor,
  deleteCompetitor,
} from '@/lib/mongodb'
import { analyzeWebsite } from '@/lib/analyzer'

export async function GET() {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const brand = await getBrandByUserId(userId)
    if (!brand?._id) return NextResponse.json({ competitors: [] })

    const competitors = await getCompetitors(brand._id.toString())
    return NextResponse.json({ competitors })
  } catch (error) {
    console.error('GET /api/competitors error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { action } = body

    const brand = await getBrandByUserId(userId)
    if (!brand?._id) return NextResponse.json({ error: 'Complete onboarding first' }, { status: 400 })
    const brandId = brand._id.toString()

    // ── Add competitor ───────────────────────────────────────
    if (action === 'add') {
      const { domain } = body
      if (!domain) return NextResponse.json({ error: 'domain is required' }, { status: 400 })

      const existing = await getCompetitors(brandId)
      if (existing.length >= 3) {
        return NextResponse.json({ error: 'Maximum 3 competitors per brand' }, { status: 400 })
      }

      let clean = domain.trim().toLowerCase()
      clean = clean.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')

      const id = await createCompetitor({ brandId, userId, domain: clean })
      return NextResponse.json({ id }, { status: 201 })
    }

    // ── Audit one competitor ──────────────────────────────────
    if (action === 'audit') {
      const { competitorId } = body
      if (!competitorId) return NextResponse.json({ error: 'competitorId is required' }, { status: 400 })

      await updateCompetitor(competitorId, { status: 'auditing' })
      auditCompetitorInBackground(competitorId).catch(console.error)

      return NextResponse.json({ status: 'auditing' })
    }

    // ── Audit all competitors ─────────────────────────────────
    if (action === 'audit_all') {
      const competitors = await getCompetitors(brandId)
      await Promise.all(
        competitors.map(c => updateCompetitor(c._id!.toString(), { status: 'auditing' }))
      )
      competitors.forEach(c => auditCompetitorInBackground(c._id!.toString()).catch(console.error))
      return NextResponse.json({ started: competitors.length })
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 })
  } catch (error) {
    console.error('POST /api/competitors error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const id = request.nextUrl.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    await deleteCompetitor(id)
    return NextResponse.json({ deleted: true })
  } catch (error) {
    console.error('DELETE /api/competitors error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function auditCompetitorInBackground(competitorId: string) {
  const { ObjectId } = await import('mongodb')
  const clientPromise = (await import('@/lib/db')).default
  const client = await clientPromise
  const doc = await client.db('aeo-audit').collection('competitors').findOne({ _id: new ObjectId(competitorId) })
  if (!doc) return

  try {
    const result = await analyzeWebsite(`https://${doc.domain}`)
    await updateCompetitor(competitorId, {
      score: result.score,
      categoryScores: result.categoryScores,
      status: 'done',
      lastAuditedAt: new Date(),
      errorMessage: undefined, // clear any previous error
    })
  } catch (err: any) {
    const errorMessage = err?.message || 'Could not reach website'
    await updateCompetitor(competitorId, { status: 'failed', errorMessage })
    console.error(`Competitor audit failed for ${doc.domain}:`, errorMessage)
  }
}