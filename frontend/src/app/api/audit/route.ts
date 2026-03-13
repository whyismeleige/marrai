import { NextRequest, NextResponse } from 'next/server'
import { createAudit, updateAudit, upsertSubscriber } from '@/lib/mongodb'
import { analyzeWebsite } from '@/lib/analyzer'
import { sendAuditEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { url, email, name } = await request.json()

    if (!url || !email) {
      return NextResponse.json({ error: 'URL and email are required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    let validUrl: string
    try {
      validUrl = new URL(url).href
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
    }

    const auditId = await createAudit({ url: validUrl, email, name })
    await upsertSubscriber(email, name)

    // Kick off background analysis — don't await
    analyzeAndUpdate(auditId, validUrl, email, name || 'there').catch(err =>
      console.error('Background analysis error:', err)
    )

    return NextResponse.json({ id: auditId })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function analyzeAndUpdate(auditId: string, url: string, email: string, name: string) {
  try {
    await updateAudit(auditId, { status: 'processing' })

    const result = await analyzeWebsite(url)

    await updateAudit(auditId, {
      status: 'completed',
      score: result.score,
      categoryScores: result.categoryScores,

      // Schema
      hasSchema: result.hasSchema,
      schemaTypes: result.schemaTypes,
      hasFaqSchema: result.hasFaqSchema,
      hasArticleSchema: result.hasArticleSchema,
      hasOrganizationSchema: result.hasOrganizationSchema,

      // Technical
      robotsBlocked: result.robotsBlocked,
      metaTitle: result.metaTitle,
      metaDescription: result.metaDescription,
      hasMetaDescription: result.hasMetaDescription,
      hasCanonical: result.hasCanonical,
      hasOgTags: result.hasOgTags,

      // Structure
      hasH1: result.hasH1,
      h1Count: result.h1Count,
      h2Count: result.h2Count,
      h3Count: result.h3Count,
      h1Text: result.h1Text,
      questionHeadings: result.questionHeadings,

      // Content
      wordCount: result.wordCount,
      firstParaWordCount: result.firstParaWordCount,
      listCount: result.listCount,
      tableCount: result.tableCount,
      imageCount: result.imageCount,
      imagesWithoutAlt: result.imagesWithoutAlt,
      internalLinks: result.internalLinks,
      externalLinks: result.externalLinks,

      // Findings
      findings: result.findings,
      issues: result.issues,
      warnings: result.warnings,
      recommendations: result.recommendations,
    })

    await sendAuditEmail(email, name, auditId, result.score)
  } catch (error: any) {
    console.error('Analysis failed:', error)
    await updateAudit(auditId, {
      status: 'failed',
      issues: [error.message || 'Failed to analyze website'],
    })
  }
}