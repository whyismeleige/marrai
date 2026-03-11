import { ObjectId } from 'mongodb'
import clientPromise from './db'

export interface Audit {
  _id?: ObjectId
  url: string
  email: string
  name?: string
  score: number
  status: 'pending' | 'processing' | 'completed' | 'failed'
  
  // Technical
  hasSchema: boolean
  schemaTypes: string[]
  robotsBlocked: boolean
  
  // Content
  hasH1: boolean
  h1Count: number
  h2Count: number
  h3Count: number
  questionHeadings: number
  firstParaWordCount: number
  listCount: number
  tableCount: number
  
  // Results
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

// Create new audit
export async function createAudit(data: {
  url: string
  email: string
  name?: string
}): Promise<string> {
  const client = await clientPromise
  const db = client.db('aeo-audit')
  
  const audit: Partial<Audit> = {
    url: data.url,
    email: data.email,
    name: data.name,
    score: 0,
    status: 'pending',
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
    recommendations: [],
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  const result = await db.collection('audits').insertOne(audit)
  return result.insertedId.toString()
}

// Get audit by ID
export async function getAudit(id: string): Promise<Audit | null> {
  const client = await clientPromise
  const db = client.db('aeo-audit')
  
  try {
    const audit = await db.collection('audits').findOne({
      _id: new ObjectId(id)
    })
    return audit as Audit | null
  } catch (error) {
    return null
  }
}

// Update audit
export async function updateAudit(
  id: string,
  data: Partial<Audit>
): Promise<void> {
  const client = await clientPromise
  const db = client.db('aeo-audit')
  
  await db.collection('audits').updateOne(
    { _id: new ObjectId(id) },
    { 
      $set: { 
        ...data, 
        updatedAt: new Date() 
      } 
    }
  )
}

// Create or update subscriber
export async function upsertSubscriber(
  email: string,
  name?: string
): Promise<void> {
  const client = await clientPromise
  const db = client.db('aeo-audit')
  
  await db.collection('subscribers').updateOne(
    { email },
    {
      $set: { 
        email,
        ...(name && { name }),
        lastAuditAt: new Date()
      },
      $inc: { auditsCount: 1 },
      $setOnInsert: { createdAt: new Date() }
    },
    { upsert: true }
  )
}

// Get all subscribers (for your email list)
export async function getSubscribers(): Promise<Subscriber[]> {
  const client = await clientPromise
  const db = client.db('aeo-audit')
  
  const subscribers = await db
    .collection('subscribers')
    .find({})
    .sort({ createdAt: -1 })
    .toArray()
  
  return subscribers as Subscriber[]
}