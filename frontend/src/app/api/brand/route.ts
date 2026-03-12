import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createBrand, getBrandByUserId, updateBrand } from '@/lib/mongodb'

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
      return NextResponse.json({ error: 'brandName, domain, and industry are required' }, { status: 400 })
    }

    // Normalise domain
    let cleanDomain = domain.trim().toLowerCase()
    cleanDomain = cleanDomain.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')

    // Check if brand already exists for this user
    const existing = await getBrandByUserId(userId)

    if (existing && existing._id) {
      await updateBrand(existing._id.toString(), {
        brandName: brandName.trim(),
        domain: cleanDomain,
        industry,
        keywords: (keywords || []).slice(0, 5).map((k: string) => k.trim()).filter(Boolean),
        competitorDomains: (competitorDomains || []).slice(0, 5).map((d: string) => d.trim()).filter(Boolean),
      })
      const updated = await getBrandByUserId(userId)
      return NextResponse.json({ brand: updated })
    }

    const id = await createBrand({
      userId,
      brandName: brandName.trim(),
      domain: cleanDomain,
      industry,
      keywords: (keywords || []).slice(0, 5).map((k: string) => k.trim()).filter(Boolean),
      competitorDomains: (competitorDomains || []).slice(0, 5).map((d: string) => d.trim()).filter(Boolean),
    })

    return NextResponse.json({ id }, { status: 201 })
  } catch (error) {
    console.error('POST /api/brand error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}