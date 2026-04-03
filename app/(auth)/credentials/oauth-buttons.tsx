import Link from "next/link";
import { getAppleOAuth, getGoogleOAuth } from "@/lib/auth/oauth-config";
import { Button } from "@/components/ui/button";

export function OAuthProviderButtons() {
  const google = getGoogleOAuth();
  const apple = getAppleOAuth();
  if (!google && !apple) return null;

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-white dark:bg-gray-950 px-2 text-gray-500 dark:text-gray-400">Or continue with</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {google && (
          <Button variant="outline" className="w-full" asChild>
            <Link href="/api/auth/google">Continue with Google</Link>
          </Button>
        )}
        {apple && (
          <Button variant="outline" className="w-full" asChild>
            <Link href="/api/auth/apple">Continue with Apple</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
