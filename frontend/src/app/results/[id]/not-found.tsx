import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="h-12 w-12 text-red-600" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Audit Not Found</h1>
        <p className="text-gray-600 mb-6">
          This audit doesn't exist or may have been deleted.
        </p>
        <Link 
          href="/audit"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Create New Audit
        </Link>
      </div>
    </div>
  )
}