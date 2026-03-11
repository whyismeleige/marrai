import { NextRequest, NextResponse } from 'next/server'
import { createAudit, updateAudit, upsertSubscriber } from '@/lib/mongodb'
import { analyzeWebsite } from '@/lib/analyzer'
import { sendAuditEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { url, email, name } = await request.json()

    // Validate inputs
    if (!url || !email) {
      return NextResponse.json(
        { error: 'URL and email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Validate URL format
    let validUrl: string
    try {
      validUrl = new URL(url).href
    } catch (e) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Create audit record
    const auditId = await createAudit({
      url: validUrl,
      email,
      name
    })

    // Update subscriber
    await upsertSubscriber(email, name)

    // Run analysis asynchronously
    analyzeAndUpdate(auditId, validUrl, email, name || 'there')
      .catch(error => console.error('Background analysis error:', error))

    return NextResponse.json({ id: auditId })

  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function analyzeAndUpdate(
  auditId: string,
  url: string,
  email: string,
  name: string
) {
  try {
    // Update status to processing
    await updateAudit(auditId, { status: 'processing' })

    // Run the analysis
    const result = await analyzeWebsite(url)

    // Update audit with results
    await updateAudit(auditId, {
      status: 'completed',
      score: result.score,
      hasSchema: result.hasSchema,
      schemaTypes: result.schemaTypes,
      robotsBlocked: result.robotsBlocked,
      hasH1: result.hasH1,
      h1Count: result.h1Count,
      h2Count: result.h2Count,
      h3Count: result.h3Count,
      questionHeadings: result.questionHeadings,
      firstParaWordCount: result.firstParaWordCount,
      listCount: result.listCount,
      tableCount: result.tableCount,
      issues: result.issues,
      warnings: result.warnings,
      recommendations: result.recommendations
    })

    // Send email with results
    await sendAuditEmail(email, name, auditId, result.score)

  } catch (error: any) {
    console.error('Analysis failed:', error)
    
    await updateAudit(auditId, {
      status: 'failed',
      issues: [error.message || 'Failed to analyze website']
    })
  }
}