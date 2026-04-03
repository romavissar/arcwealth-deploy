import Link from "next/link";
import { OAuthProviderButtons } from "@/app/(auth)/credentials/oauth-buttons";
import { RegisterForm } from "./register-form";

export default function CredentialsRegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create account</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Email & password registration (custom auth). You can still use Clerk on{" "}
          <Link href="/sign-up" className="text-primary underline">
            Sign up
          </Link>{" "}
          until migration completes.
        </p>
      </div>

      <OAuthProviderButtons />

      <RegisterForm />
    </div>
  );
}
