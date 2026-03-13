import { SignIn } from '@clerk/nextjs'
import AuthShell from '@/components/auth/auth-shell'
import { clerkAppearance } from '@/components/auth/clerk-appearance'

export default function SignInPage() {
  return (
    <AuthShell mode="sign-in">
      <SignIn
        appearance={clerkAppearance}
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
      />
    </AuthShell>
  )
}