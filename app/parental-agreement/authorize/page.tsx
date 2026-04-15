import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import { hashToken } from "@/lib/auth/tokens";
import { AuthorizeForm } from "./authorize-form";

type AuthorizePageProps = {
  searchParams: {
    token?: string;
  };
};

export default async function ParentalAgreementAuthorizePage({ searchParams }: AuthorizePageProps) {
  const rawToken = typeof searchParams.token === "string" ? searchParams.token.trim() : "";
  if (!rawToken) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <article className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Parental authorization link missing</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
            This page requires a valid parental authorization link from the registration email.
          </p>
        </article>
      </main>
    );
  }

  const supabase = createServiceClient();
  const { data: tokenRow } = await supabase
    .from("auth_token")
    .select("id, expires_at, used_at")
    .eq("token_hash", hashToken(rawToken))
    .eq("purpose", "parental_approval")
    .maybeSingle();

  const tokenInvalid = !tokenRow || !!tokenRow.used_at || new Date(tokenRow.expires_at) < new Date();

  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <article className="space-y-5 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Parent/Guardian Authorization</h1>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          ArcWealth requires parent or legal guardian authorization before this child account can sign in.
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Please review the{" "}
          <Link href="/parental-agreement" target="_blank" className="text-primary underline underline-offset-2">
            full Parental Agreement
          </Link>{" "}
          and submit the confirmation form below.
        </p>

        {tokenInvalid ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-200">
            This authorization link is invalid, expired, or already used. Please ask the student to request a new parental
            authorization email.
          </div>
        ) : (
          <AuthorizeForm token={rawToken} />
        )}
      </article>
    </main>
  );
}
