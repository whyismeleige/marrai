import { MongoClient, MongoClientOptions } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Please add MONGODB_URI to .env.local')
}

const uri = process.env.MONGODB_URI

const options: MongoClientOptions = {
  // Fail fast on cold start instead of waiting 30s
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  // Connection pool — keeps connections alive across warm invocations
  maxPoolSize: 10,
  minPoolSize: 1,
  // Retry once on transient failures
  retryWrites: true,
  retryReads: true,
}

// Global singleton — works for BOTH dev and prod on Vercel
// This is the key fix: Vercel reuses the Node.js runtime across warm invocations
// so a global var persists the connection instead of reconnecting every request
declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let clientPromise: Promise<MongoClient>

if (!global._mongoClientPromise) {
  const client = new MongoClient(uri, options)
  global._mongoClientPromise = client.connect()
}

clientPromise = global._mongoClientPromise

export default clientPromise