import Link from "next/link";
import { OAuthProviderButtons } from "@/app/(auth)/credentials/oauth-buttons";
import { RegisterForm } from "@/app/(auth)/credentials/register/register-form";

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create account</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Register with email and password or continue with Google. Already have an account?{" "}
          <Link href="/sign-in" className="text-primary font-medium underline">
            Sign in
          </Link>
          .
        </p>
      </div>

      <OAuthProviderButtons />

      <RegisterForm signInHref="/sign-in" />
    </div>
  );
}
