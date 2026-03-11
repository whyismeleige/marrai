import { ObjectId } from 'mongodb'
import clientPromise from './db'

// ─── Types ──────────────────────────────────────────────────────────────────

export interface CategoryScores {
  schema: number
  content: number
  technical: number
  structure: number
}

export interface AuditFinding {
  text: string
  priority: 'critical' | 'warning' | 'suggestion'
  category: 'schema' | 'content' | 'technical' | 'structure'
}

export interface Audit {
  _id?: ObjectId
  url: string
  email: string
  name?: string
  score: number
  status: 'pending' | 'processing' | 'completed' | 'failed'

  // Category breakdown
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

  // Structure
  hasH1: boolean
  h1Count: number
  h2Count: number
  h3Count: number
  h1Text: string
  questionHeadings: number

  // Content
  wordCount: number
  firstParaWordCount: number
  listCount: number
  tableCount: number
  imageCount: number
  imagesWithoutAlt: number
  internalLinks: number
  externalLinks: number

  // Findings
  findings: AuditFinding[]

  // Legacy string arrays (for email and backwards compat)
  issues: string[]
  warnings: string[]
  recommendations: string[]

  createdAt: Date
  updatedAt: Date
}

export interface Subscriber {
  _id?: ObjectId
  email: string
  name?: string
  auditsCount: number
  createdAt: Date
  lastAuditAt: Date
}

// ─── Helpers ────────────────────────────────────────────────────────────────

const DEFAULT_CATEGORY_SCORES: CategoryScores = { schema: 0, content: 0, technical: 0, structure: 0 }

// ─── Audit CRUD ─────────────────────────────────────────────────────────────

export async function createAudit(data: { url: string; email: string; name?: string }): Promise<string> {
  const client = await clientPromise
  const db = client.db('aeo-audit')

  const audit: Partial<Audit> = {
    url: data.url,
    email: data.email,
    name: data.name,
    score: 0,
    status: 'pending',
    categoryScores: DEFAULT_CATEGORY_SCORES,
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
    hasH1: false,
    h1Count: 0,
    h2Count: 0,
    h3Count: 0,
    h1Text: '',
    questionHeadings: 0,
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
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await db.collection('audits').insertOne(audit)
  return result.insertedId.toString()
}

export async function getAudit(id: string): Promise<Audit | null> {
  const client = await clientPromise
  const db = client.db('aeo-audit')

  try {
    const audit = await db.collection('audits').findOne({ _id: new ObjectId(id) })
    return audit as Audit | null
  } catch (_) {
    return null
  }
}

export async function updateAudit(id: string, data: Partial<Audit>): Promise<void> {
  const client = await clientPromise
  const db = client.db('aeo-audit')

  await db.collection('audits').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } }
  )
}

// ─── Subscriber ─────────────────────────────────────────────────────────────

export async function upsertSubscriber(email: string, name?: string): Promise<void> {
  const client = await clientPromise
  const db = client.db('aeo-audit')

  await db.collection('subscribers').updateOne(
    { email },
    {
      $set: { email, ...(name && { name }), lastAuditAt: new Date() },
      $inc: { auditsCount: 1 },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true }
  )
}

export async function getSubscribers(): Promise<Subscriber[]> {
  const client = await clientPromise
  const db = client.db('aeo-audit')

  return (await db.collection('subscribers').find({}).sort({ createdAt: -1 }).toArray()) as Subscriber[]
}