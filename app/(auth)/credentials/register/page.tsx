import Link from "next/link";
import { OAuthProviderButtons } from "@/app/(auth)/credentials/oauth-buttons";
import { RegisterForm } from "./register-form";

export default function CredentialsRegisterPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Create account</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Email & password or Google. Main entry:{" "}
          <Link href="/sign-up" className="text-primary font-medium underline">
            Sign up
          </Link>
          .
        </p>
      </div>

      <OAuthProviderButtons />

      <RegisterForm />
    </div>
  );
}
