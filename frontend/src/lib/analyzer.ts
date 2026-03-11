import axios from 'axios'
import * as cheerio from 'cheerio'

export interface AnalysisResult {
  score: number
  hasSchema: boolean
  schemaTypes: string[]
  robotsBlocked: boolean
  hasH1: boolean
  h1Count: number
  h2Count: number
  h3Count: number
  questionHeadings: number
  firstParaWordCount: number
  listCount: number
  tableCount: number
  issues: string[]
  warnings: string[]
  recommendations: string[]
}

export async function analyzeWebsite(url: string): Promise<AnalysisResult> {
  try {
    // Fetch the webpage
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'AEO-Audit-Bot/1.0 (Educational purposes)'
      }
    })
    console.log(response);
    const html = response.data
    const $ = cheerio.load(html)

    // Initialize results
    const result: AnalysisResult = {
      score: 0,
      hasSchema: false,
      schemaTypes: [],
      robotsBlocked: false,
      hasH1: false,
      h1Count: 0,
      h2Count: 0,
      h3Count: 0,
      questionHeadings: 0,
      firstParaWordCount: 0,
      listCount: 0,
      tableCount: 0,
      issues: [],
      warnings: [],
      recommendations: []
    }

    // 1. CHECK SCHEMA MARKUP (25 points)
    const schemas = $('script[type="application/ld+json"]')
    result.hasSchema = schemas.length > 0

    schemas.each((_, el) => {
      try {
        const content = $(el).html()
        if (content) {
          const data = JSON.parse(content)
          const type = data['@type']
          if (type) {
            result.schemaTypes.push(type)
          }
        }
      } catch (e) {
        // Invalid JSON, skip
      }
    })

    if (result.hasSchema) {
      if (result.schemaTypes.includes('FAQPage')) {
        result.score += 15
      } else if (result.schemaTypes.length > 0) {
        result.score += 5
        result.recommendations.push('Add FAQPage schema for better AI visibility')
      }
    } else {
      result.issues.push('No schema markup found')
      result.recommendations.push('Implement schema markup (FAQ, Article, Organization)')
    }

    // 2. CHECK ROBOTS.TXT (10 points)
    try {
      const robotsUrl = new URL(url).origin + '/robots.txt'
      const robotsResponse = await axios.get(robotsUrl, { timeout: 5000 })
      const robotsTxt = robotsResponse.data.toLowerCase()
      
      const aiBots = ['gptbot', 'chatgpt-user', 'google-extended', 'perplexitybot', 'claudebot']
      const blocked = aiBots.some(bot => 
        robotsTxt.includes(bot) && robotsTxt.includes('disallow')
      )
      
      result.robotsBlocked = blocked
      
      if (blocked) {
        result.issues.push('AI bots are blocked in robots.txt')
        result.recommendations.push('Allow AI bots (GPTBot, ClaudeBot, etc.) in robots.txt')
      } else {
        result.score += 10
      }
    } catch (e) {
      // robots.txt not found, assume allowed
      result.score += 10
    }

    // 3. CHECK HEADINGS (15 points)
    const h1s = $('h1')
    const h2s = $('h2')
    const h3s = $('h3')

    result.h1Count = h1s.length
    result.h2Count = h2s.length
    result.h3Count = h3s.length
    result.hasH1 = h1s.length > 0

    if (result.hasH1 && result.h1Count === 1) {
      result.score += 5
    } else if (!result.hasH1) {
      result.issues.push('Missing H1 tag')
      result.recommendations.push('Add one H1 tag to your page')
    } else {
      result.warnings.push(`Multiple H1 tags found (${result.h1Count}) - should be exactly 1`)
      result.recommendations.push('Use only one H1 tag per page')
    }

    if (result.h2Count >= 3) {
      result.score += 5
    } else {
      result.recommendations.push('Add more H2 headings (at least 3)')
    }

    if (result.h3Count >= 2) {
      result.score += 5
    }

    // 4. CHECK QUESTION-BASED HEADINGS (15 points)
    $('h1, h2, h3').each((_, el) => {
      if ($(el).text().includes('?')) {
        result.questionHeadings++
      }
    })

    if (result.questionHeadings >= 3) {
      result.score += 15
    } else if (result.questionHeadings > 0) {
      result.score += 5
      result.recommendations.push('Add more question-format headings (need 3+)')
    } else {
      result.recommendations.push('Use question-format headings (H2/H3) like "What is...?" or "How to...?"')
    }

    // 5. CHECK FIRST PARAGRAPH (20 points)
    const firstPara = $('p').first()
    if (firstPara.length > 0) {
      const text = firstPara.text().trim()
      result.firstParaWordCount = text.split(/\s+/).length

      if (result.firstParaWordCount >= 40 && result.firstParaWordCount <= 80) {
        result.score += 20
      } else if (result.firstParaWordCount >= 30 && result.firstParaWordCount <= 100) {
        result.score += 10
        result.warnings.push(`First paragraph is ${result.firstParaWordCount} words (ideal: 40-80)`)
      } else {
        result.warnings.push(`First paragraph is ${result.firstParaWordCount} words - should be 40-80 for optimal answer extraction`)
        result.recommendations.push('Rewrite first paragraph as a concise 40-60 word answer')
      }
    } else {
      result.issues.push('No paragraphs found on page')
    }

    // 6. CHECK STRUCTURED CONTENT (15 points)
    const lists = $('ul, ol')
    const tables = $('table')
    
    result.listCount = lists.length
    result.tableCount = tables.length
    
    const structuredCount = result.listCount + result.tableCount

    if (structuredCount >= 3) {
      result.score += 15
    } else if (structuredCount > 0) {
      result.score += 7
      result.recommendations.push('Add more structured content (bullet points, tables)')
    } else {
      result.recommendations.push('Add lists and tables to improve scannability')
    }

    // ALWAYS ADD THESE RECOMMENDATIONS
    if (!result.recommendations.includes('Test your page in ChatGPT manually')) {
      result.recommendations.push('Test your page in ChatGPT manually to see how it appears')
    }
    
    if (!result.recommendations.includes('Create dedicated FAQ section')) {
      result.recommendations.push('Create dedicated FAQ section at end of page')
    }

    // Ensure score doesn't exceed 100
    result.score = Math.min(result.score, 100)

    return result

  } catch (error: any) {
    console.error('Analysis error:', error)
    throw new Error(
      error.code === 'ENOTFOUND' 
        ? 'Website not found. Please check the URL.' 
        : 'Failed to analyze website. Please try again.'
    )
  }
}