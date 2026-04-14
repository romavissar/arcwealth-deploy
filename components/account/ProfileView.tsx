"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { SettingsCard } from "./SettingsCard";

type ProfilePayload = {
  username?: string | null;
  email?: string | null;
  avatar_url?: string | null;
};

export function ProfileView({ isStudent = false }: { isStudent?: boolean }) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfilePayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => {
        if (!r.ok) throw new Error("Could not load profile");
        return r.json();
      })
      .then((d) => setProfile(d))
      .catch((e) => setLoadError(e instanceof Error ? e.message : "Error"));
  }, []);

  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || isStudent) return;
    setUploadMessage(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.set("file", file);
      const res = await fetch("/api/upload-avatar", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error((data as { error?: string }).error || "Upload failed");
      const url = (data as { url?: string }).url;
      if (url) setProfile((p) => (p ? { ...p, avatar_url: url } : p));
      setUploadMessage({ type: "success", text: "Profile photo updated." });
      router.refresh();
    } catch (err) {
      setUploadMessage({
        type: "error",
        text: err instanceof Error ? err.message : "Upload failed",
      });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  if (loadError) {
    return (
      <SettingsCard>
        <p className="text-sm text-red-600 dark:text-red-400">{loadError}</p>
      </SettingsCard>
    );
  }

  if (!profile) {
    return (
      <SettingsCard>
        <p className="text-sm text-gray-500 dark:text-gray-400">Loading…</p>
      </SettingsCard>
    );
  }

  const avatarUrl = profile.avatar_url ?? null;
  const initial = (profile.username?.[0] ?? profile.email?.[0] ?? "?").toUpperCase();

  return (
    <SettingsCard className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">Profile</p>
          <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-gray-100">Identity</h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">Control how your name, email, and avatar appear in ArcWealth.</p>
        </div>
      </div>
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-primary/50 bg-primary/10 text-3xl font-bold text-primary dark:border-primary/60 dark:bg-primary/20">
          {avatarUrl ? (
            <Image src={avatarUrl} alt="" width={96} height={96} className="h-full w-full object-cover" />
          ) : (
            <span>{initial}</span>
          )}
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{profile.username ?? "Account"}</h3>
            <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">{profile.email ?? "—"}</p>
            {!isStudent && (
              <div className="mt-3">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={onPickFile}
                />
                <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => fileRef.current?.click()}>
                  {uploading ? "Uploading..." : "Change photo"}
                </Button>
              </div>
            )}
          </div>
        </div>
        {uploadMessage && (
          <p
            className={
              uploadMessage.type === "error"
                ? "mt-3 text-sm text-red-600 dark:text-red-400"
                : "mt-3 text-sm text-green-600 dark:text-green-400"
            }
          >
            {uploadMessage.text}
          </p>
        )}
      </div>
      <div className="rounded-xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900/70">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Name and email are stored in your profile. Students linked to a teacher may have restricted edits elsewhere in
          the app.
        </p>
      </div>
    </SettingsCard>
  );
}
