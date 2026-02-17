"use client";

import { useUser, useReverification } from "@clerk/nextjs";
import type { CreateExternalAccountParams } from "@clerk/types";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SettingsCard } from "./SettingsCard";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function AppleLogoIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

const CONNECT_OPTIONS = [
  { strategy: "oauth_google" as const, label: "Google", Icon: GoogleIcon },
  { strategy: "oauth_apple" as const, label: "Apple", Icon: AppleLogoIcon },
];

function normalizeProvider(strategy: string) {
  return strategy.split("_")[1] ?? strategy;
}

export function ProfileView() {
  const { user } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [addingEmail, setAddingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null);
  const [removingAccountId, setRemovingAccountId] = useState<string | null>(null);

  const createExternalAccount = useReverification((params: CreateExternalAccountParams) =>
    user?.createExternalAccount(params)
  );
  const destroyExternalAccount = useReverification((account: { destroy: () => Promise<unknown> }) =>
    account.destroy()
  );

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName ?? "");
    }
  }, [user]);

  if (!user) return null;

  const primaryEmail = user.primaryEmailAddress?.emailAddress ?? "";
  const emailAddresses = user.emailAddresses ?? [];
  type ExternalAccountShape = {
  id: string;
  provider: string;
  providerUserId?: string;
  verification?: { status?: string };
  emailAddress?: string | null;
  imageUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  destroy: () => Promise<unknown>;
};
  const allExternalAccounts = (user as { externalAccounts?: ExternalAccountShape[] }).externalAccounts ?? [];
  const externalAccounts = allExternalAccounts.filter(
    (a) => (a.verification?.status ?? "verified") === "verified"
  );
  const connectedProviders = new Set(externalAccounts.map((a) => a.provider));
  const unconnectedOptions = CONNECT_OPTIONS.filter(
    (opt) => !connectedProviders.has(normalizeProvider(opt.strategy))
  );

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      await user.update({ firstName: firstName.trim() || undefined, lastName: lastName.trim() || undefined });
    } finally {
      setSaving(false);
    }
  }

  async function handleAddEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!newEmail.trim() || !user) return;
    setEmailError(null);
    setAddingEmail(true);
    try {
      await (user as { createEmailAddress: (p: { email: string }) => Promise<unknown> }).createEmailAddress({ email: newEmail.trim() });
      setNewEmail("");
      await user.reload();
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Could not add email");
    } finally {
      setAddingEmail(false);
    }
  }

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  async function handleProfileImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/") || !user) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Please choose an image under 5MB.");
      return;
    }
    e.target.value = "";
    setUploadingImage(true);
    try {
      const setProfileImage = (user as { setProfileImage: (opts: { file: File }) => Promise<unknown> }).setProfileImage;
      if (setProfileImage) await setProfileImage({ file });
      else await (user as { update: (p: { imageUrl?: string }) => Promise<unknown> }).update({ imageUrl: await uploadAndGetUrl(file) });
      await user.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to update photo");
    } finally {
      setUploadingImage(false);
    }
  }

  async function uploadAndGetUrl(file: File): Promise<string> {
    const formData = new FormData();
    formData.set("file", file);
    const res = await fetch("/api/upload-avatar", { method: "POST", body: formData });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error ?? "Upload failed");
    return data.url as string;
  }

  async function handleConnectProvider(strategy: CreateExternalAccountParams["strategy"]) {
    setConnectingProvider(strategy);
    try {
      const res = await createExternalAccount({
        strategy,
        redirectUrl: `${typeof window !== "undefined" ? window.location.origin : ""}/settings`,
      });
      const verification = (res as { verification?: { externalVerificationRedirectURL?: { href?: string }; externalVerificationRedirectUrl?: { href?: string } } })?.verification;
      const url = verification?.externalVerificationRedirectURL?.href ?? verification?.externalVerificationRedirectUrl?.href;
      if (url) router.push(url);
      else await user?.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not connect account");
    } finally {
      setConnectingProvider(null);
    }
  }

  async function handleRemoveConnectedAccount(acc: ExternalAccountShape) {
    if (!confirm(`Remove ${acc.provider} (${acc.emailAddress ?? acc.provider}) from your account? You can reconnect later.`) || !user) return;
    setRemovingAccountId(acc.id);
    setExpandedAccountId(null);
    try {
      await destroyExternalAccount(acc);
      await user.reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not remove account");
    } finally {
      setRemovingAccountId(null);
    }
  }

  function getProviderIcon(provider: string) {
    const p = provider.toLowerCase();
    if (p === "google") return GoogleIcon;
    if (p === "apple") return AppleLogoIcon;
    return null;
  }

  function getProviderLabel(provider: string) {
    return provider.charAt(0).toUpperCase() + provider.slice(1).toLowerCase();
  }

  return (
    <SettingsCard className="space-y-8">
      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Profile details</h2>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleProfileImageChange}
              className="sr-only"
              aria-label="Change profile photo"
            />
            <button
              type="button"
              onClick={handleAvatarClick}
              disabled={uploadingImage}
              title="Change profile photo"
              className="relative h-20 w-20 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center text-2xl font-semibold text-gray-600 dark:text-gray-300 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 ring-offset-white dark:ring-offset-gray-800 hover:opacity-90 transition-opacity"
            >
              {uploadingImage ? (
                <span className="text-sm">…</span>
              ) : user.imageUrl ? (
                <Image src={user.imageUrl} alt="" width={80} height={80} className="object-cover" />
              ) : (
                <span>{(user.firstName?.[0] ?? user.lastName?.[0] ?? primaryEmail?.[0] ?? "?").toUpperCase()}</span>
              )}
            </button>
          </>
          <div className="min-w-0 flex-1 space-y-4">
            <form onSubmit={handleUpdateProfile} className="space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <div>
                  <label htmlFor="firstName" className="text-sm font-medium text-gray-700 dark:text-gray-300">First name</label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="mt-1" />
                </div>
                <div>
                  <label htmlFor="lastName" className="text-sm font-medium text-gray-700 dark:text-gray-300">Last name</label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} className="mt-1" />
                </div>
              </div>
              <Button type="submit" disabled={saving}>Update profile</Button>
            </form>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Email addresses</h2>
        <ul className="space-y-2 mb-4">
          {emailAddresses.map((ea) => (
            <li key={ea.id} className="flex items-center justify-between gap-2 py-2 text-gray-900 dark:text-gray-100">
              <span>{ea.emailAddress}</span>
              {ea.id === user.primaryEmailAddressId && (
                <span className="rounded-full bg-gray-200 dark:bg-gray-600 px-2 py-0.5 text-xs font-medium text-gray-700 dark:text-gray-300">Primary</span>
              )}
            </li>
          ))}
        </ul>
        <form onSubmit={handleAddEmail} className="flex flex-wrap items-end gap-2">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="newEmail" className="sr-only">Add email address</label>
            <Input
              id="newEmail"
              type="email"
              placeholder="Add email address"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              className="w-full"
            />
          </div>
          <Button type="submit" variant="outline" disabled={addingEmail}>+ Add email address</Button>
          {emailError && <p className="w-full text-sm text-red-600 dark:text-red-400">{emailError}</p>}
        </form>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Connected accounts</h2>
        {externalAccounts.length > 0 ? (
          <ul className="space-y-2 text-gray-900 dark:text-gray-100">
            {externalAccounts.map((acc) => {
              const ProviderIcon = getProviderIcon(acc.provider);
              const label = getProviderLabel(acc.provider);
              const email = acc.emailAddress ?? null;
              const displayText = email ? `${label} (${email})` : label;
              const isExpanded = expandedAccountId === acc.id;
              const isRemoving = removingAccountId === acc.id;
              return (
                <li key={acc.id} className="rounded-lg border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpandedAccountId(isExpanded ? null : acc.id)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span className="flex items-center gap-3 text-base font-medium">
                      {ProviderIcon && <ProviderIcon className="h-6 w-6 shrink-0" />}
                      <span>{displayText}</span>
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 shrink-0 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 shrink-0 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="border-t border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-4">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="relative h-14 w-14 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden flex items-center justify-center">
                          {acc.imageUrl ? (
                            <Image src={acc.imageUrl} alt="" width={56} height={56} className="object-cover" />
                          ) : (
                            ProviderIcon && <ProviderIcon className="h-7 w-7 text-gray-500 dark:text-gray-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-base font-medium text-gray-900 dark:text-gray-100">
                            {[acc.firstName, acc.lastName].filter(Boolean).join(" ") || "Connected account"}
                          </p>
                          {email && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{email}</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">Remove</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                          Remove this connected account from your account.
                        </p>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRemoveConnectedAccount(acc)}
                          disabled={isRemoving}
                        >
                          {isRemoving ? "Removing…" : "Remove connected account"}
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">No connected accounts.</p>
        )}
        {unconnectedOptions.length > 0 && (
          <div className="mt-3 flex flex-col gap-2">
            {unconnectedOptions.map(({ strategy, label, Icon }) => (
              <Button
                key={strategy}
                type="button"
                variant="outline"
                onClick={() => handleConnectProvider(strategy)}
                disabled={connectingProvider !== null}
                className="w-full sm:w-auto justify-center gap-2"
              >
                <Icon className="h-5 w-5 shrink-0" />
                {connectingProvider === strategy ? "Connecting…" : `Connect ${label}`}
              </Button>
            ))}
          </div>
        )}
      </section>
    </SettingsCard>
  );
}
