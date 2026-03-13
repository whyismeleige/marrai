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
      {/*
        pt-14: clears the fixed mobile top bar (h-14)
        pb-16: clears the fixed mobile bottom tab bar (h-16)
        lg:pt-0 lg:pb-0: desktop sidebar handles layout, no offset needed
      */}
      <main className="flex-1 min-w-0 overflow-auto pt-14 pb-16 lg:pt-0 lg:pb-0">
        {children}
      </main>
    </div>
  )
}