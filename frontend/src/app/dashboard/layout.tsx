import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import { getBrandByUserId } from '@/lib/mongodb'
import DashboardSidebar from '@/components/dashboard/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const brand = await getBrandByUserId(userId)
  if (!brand) redirect('/onboarding')

  // Serialize: ObjectId → string, Date → ISO string
  // Next.js cannot pass objects with toJSON methods from Server → Client Components
  const serializedBrand = {
    _id: brand._id?.toString() ?? '',
    userId: brand.userId,
    brandName: brand.brandName,
    domain: brand.domain,
    industry: brand.industry,
    keywords: brand.keywords,
    competitorDomains: brand.competitorDomains,
    createdAt: brand.createdAt.toISOString(),
    updatedAt: brand.updatedAt.toISOString(),
  }

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar brand={serializedBrand} />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  )
}