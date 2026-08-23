import { SignIn } from "@clerk/nextjs";
import { AuthLayout } from "@/components/marketing/AuthLayout";

export default function SignInPage() {
  return (
    <AuthLayout>
      <SignIn routing="hash" />
    </AuthLayout>
  );
}