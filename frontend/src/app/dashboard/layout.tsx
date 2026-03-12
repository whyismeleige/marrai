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

  // Redirect to onboarding if brand not set up
  const brand = await getBrandByUserId(userId)
  if (!brand) redirect('/onboarding')

  return (
    <div className="min-h-screen bg-background flex">
      <DashboardSidebar brand={brand} />
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  )
}