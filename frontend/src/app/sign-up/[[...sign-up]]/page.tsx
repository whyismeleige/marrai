import { SignUp } from '@clerk/nextjs'
import AuthShell from '@/components/auth/auth-shell'
import { clerkAppearance } from '@/components/auth/clerk-appearance'

export default function SignUpPage() {
  return (
    <AuthShell mode="sign-up">
      <SignUp
        appearance={clerkAppearance}
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
      />
    </AuthShell>
  )
}