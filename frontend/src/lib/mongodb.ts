import { ObjectId } from 'mongodb'
import clientPromise from './db'

// ─── Re-export DB name constant ──────────────────────────────────────────────
const DB = 'aeo-audit'

// ─── Shared Types ─────────────────────────────────────────────────────────────

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

// ─── Audit ───────────────────────────────────────────────────────────────────

export interface Audit {
  _id?: ObjectId
  url: string
  email: string
  name?: string
  score: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  categoryScores: CategoryScores
  hasSchema: boolean
  schemaTypes: string[]
  hasFaqSchema: boolean
  hasArticleSchema: boolean
  hasOrganizationSchema: boolean
  robotsBlocked: boolean
  metaTitle: string
  metaDescription: string
  hasMetaDescription: boolean
  hasCanonical: boolean
  hasOgTags: boolean
  hasH1: boolean
  h1Count: number
  h2Count: number
  h3Count: number
  h1Text: string
  questionHeadings: number
  wordCount: number
  firstParaWordCount: number
  listCount: number
  tableCount: number
  imageCount: number
  imagesWithoutAlt: number
  internalLinks: number
  externalLinks: number
  findings: AuditFinding[]
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

// ─── Brand ────────────────────────────────────────────────────────────────────

export interface Brand {
  _id?: ObjectId
  userId: string
  brandName: string
  domain: string
  industry: string
  keywords: string[]
  competitorDomains: string[]
  createdAt: Date
  updatedAt: Date
}

// ─── BrandPage ────────────────────────────────────────────────────────────────

export type PageStatus = 'unaudited' | 'auditing' | 'good' | 'needs_work' | 'critical' | 'failed'

export interface ScoreSnapshot {
  score: number
  auditedAt: Date
}

export interface BrandPage {
  _id?: ObjectId
  brandId: string
  userId: string
  url: string
  label?: string           // friendly name e.g. "Homepage"
  score?: number
  status: PageStatus
  categoryScores?: CategoryScores
  findings?: AuditFinding[]
  errorMessage?: string
  lastAuditedAt?: Date
  auditHistory: ScoreSnapshot[] // last 10 scores for sparkline
  createdAt: Date
  updatedAt: Date
}

// ─── Competitor ───────────────────────────────────────────────────────────────

export interface Competitor {
  _id?: ObjectId
  brandId: string
  userId: string
  domain: string
  score?: number
  categoryScores?: CategoryScores
  status: 'unaudited' | 'auditing' | 'done' | 'failed'
  lastAuditedAt?: Date
  errorMessage?: string
  createdAt: Date
  updatedAt: Date
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DEFAULT_CATEGORY_SCORES: CategoryScores = { schema: 0, content: 0, technical: 0, structure: 0 }

function pageStatusFromScore(score: number): PageStatus {
  if (score >= 70) return 'good'
  if (score >= 45) return 'needs_work'
  return 'critical'
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT CRUD (existing — preserved)
// ─────────────────────────────────────────────────────────────────────────────

export async function createAudit(data: { url: string; email: string; name?: string }): Promise<string> {
  const client = await clientPromise
  const db = client.db(DB)

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
  const db = client.db(DB)
  try {
    const audit = await db.collection('audits').findOne({ _id: new ObjectId(id) })
    return audit as Audit | null
  } catch {
    return null
  }
}

export async function updateAudit(id: string, data: Partial<Audit>): Promise<void> {
  const client = await clientPromise
  const db = client.db(DB)
  await db.collection('audits').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } }
  )
}

export async function upsertSubscriber(email: string, name?: string): Promise<void> {
  const client = await clientPromise
  const db = client.db(DB)
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
  const db = client.db(DB)
  return (await db.collection('subscribers').find({}).sort({ createdAt: -1 }).toArray()) as Subscriber[]
}

// ─────────────────────────────────────────────────────────────────────────────
// BRAND CRUD
// ─────────────────────────────────────────────────────────────────────────────

export async function createBrand(data: Omit<Brand, '_id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const client = await clientPromise
  const db = client.db(DB)
  const doc = { ...data, createdAt: new Date(), updatedAt: new Date() }
  const result = await db.collection('brands').insertOne(doc)
  return result.insertedId.toString()
}

export async function getBrandByUserId(userId: string): Promise<Brand | null> {
  const client = await clientPromise
  const db = client.db(DB)
  const brand = await db.collection('brands').findOne({ userId })
  return brand as Brand | null
}

export async function updateBrand(id: string, data: Partial<Brand>): Promise<void> {
  const client = await clientPromise
  const db = client.db(DB)
  await db.collection('brands').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } }
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// BRAND PAGE CRUD
// ─────────────────────────────────────────────────────────────────────────────

export async function createBrandPage(data: {
  brandId: string
  userId: string
  url: string
  label?: string
}): Promise<string> {
  const client = await clientPromise
  const db = client.db(DB)
  const doc: Omit<BrandPage, '_id'> = {
    ...data,
    label: data.label || '',
    status: 'unaudited',
    auditHistory: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const result = await db.collection('brand_pages').insertOne(doc)
  return result.insertedId.toString()
}

export async function getBrandPages(brandId: string): Promise<BrandPage[]> {
  const client = await clientPromise
  const db = client.db(DB)
  return (await db.collection('brand_pages').find({ brandId }).sort({ createdAt: -1 }).toArray()) as BrandPage[]
}

export async function getBrandPage(id: string): Promise<BrandPage | null> {
  const client = await clientPromise
  const db = client.db(DB)
  try {
    const page = await db.collection('brand_pages').findOne({ _id: new ObjectId(id) })
    return page as BrandPage | null
  } catch {
    return null
  }
}

export async function updateBrandPage(id: string, data: Partial<BrandPage>): Promise<void> {
  const client = await clientPromise
  const db = client.db(DB)
  await db.collection('brand_pages').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } }
  )
}

export async function updateBrandPageWithAuditResult(
  id: string,
  score: number,
  categoryScores: CategoryScores,
  findings: AuditFinding[]
): Promise<void> {
  const client = await clientPromise
  const db = client.db(DB)
  const snapshot: ScoreSnapshot = { score, auditedAt: new Date() }
  await db.collection('brand_pages').updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        score,
        categoryScores,
        findings,
        status: pageStatusFromScore(score),
        lastAuditedAt: new Date(),
        updatedAt: new Date(),
      },
      // Keep only the last 10 snapshots
      $push: {
        auditHistory: {
          $each: [snapshot],
          $slice: -10,
        },
      } as any,
    }
  )
}

export async function deleteBrandPage(id: string): Promise<void> {
  const client = await clientPromise
  const db = client.db(DB)
  await db.collection('brand_pages').deleteOne({ _id: new ObjectId(id) })
}

// ─────────────────────────────────────────────────────────────────────────────
// COMPETITOR CRUD
// ─────────────────────────────────────────────────────────────────────────────

export async function createCompetitor(data: {
  brandId: string
  userId: string
  domain: string
}): Promise<string> {
  const client = await clientPromise
  const db = client.db(DB)
  const doc: Omit<Competitor, '_id'> = {
    ...data,
    status: 'unaudited',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  const result = await db.collection('competitors').insertOne(doc)
  return result.insertedId.toString()
}

export async function getCompetitors(brandId: string): Promise<Competitor[]> {
  const client = await clientPromise
  const db = client.db(DB)
  return (await db.collection('competitors').find({ brandId }).sort({ createdAt: 1 }).toArray()) as Competitor[]
}

export async function updateCompetitor(id: string, data: Partial<Competitor>): Promise<void> {
  const client = await clientPromise
  const db = client.db(DB)
  await db.collection('competitors').updateOne(
    { _id: new ObjectId(id) },
    { $set: { ...data, updatedAt: new Date() } }
  )
}

export async function deleteCompetitor(id: string): Promise<void> {
  const client = await clientPromise
  const db = client.db(DB)
  await db.collection('competitors').deleteOne({ _id: new ObjectId(id) })
}