"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";

interface ProfilePictureUploadProps {
  onUploaded?: (url: string) => void;
  onClose?: () => void;
}

export function ProfilePictureUpload({ onUploaded, onClose }: ProfilePictureUploadProps) {
  const { isSignedIn } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !isSignedIn) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024) {
      setError("Please choose a JPG, PNG, or WEBP image under 5MB.");
      return;
    }
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/upload-avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Upload failed");
      onUploaded?.(data.url);
      onClose?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">Upload a profile picture (JPG, PNG, WEBP — max 5MB).</p>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFile}
        disabled={uploading}
        className="block w-full text-sm text-gray-500 file:mr-4 file:rounded file:border file:px-4 file:py-2 file:text-sm file:font-medium"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {onClose && (
        <Button type="button" variant="ghost" onClick={onClose}>
          Cancel
        </Button>
      )}
    </div>
  );
}
