// src/app/api/pages/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getBrandPage } from '@/lib/mongodb'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const page = await getBrandPage(id)
    if (!page) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (page.userId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    return NextResponse.json({ page })
  } catch (error) {
    console.error('GET /api/pages/[id] error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}