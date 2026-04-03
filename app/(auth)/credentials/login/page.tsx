import { Suspense } from "react";
import { OAuthProviderButtons } from "@/app/(auth)/credentials/oauth-buttons";
import { LoginFooter, LoginForm, LoginMessages } from "./login-client";

export default function CredentialsLoginPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Sign in</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Email & password (custom auth).</p>
      </div>

      <OAuthProviderButtons />

      <Suspense fallback={null}>
        <LoginMessages />
      </Suspense>

      <LoginForm />

      <LoginFooter />
    </div>
  );
}
