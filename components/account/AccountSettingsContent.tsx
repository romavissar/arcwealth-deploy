"use client";

import { usePathname } from "next/navigation";
import { ProfileView } from "./ProfileView";
import { SecurityView } from "./SecurityView";
import { AppearanceView } from "./AppearanceView";

export function AccountSettingsContent({
  isStudent = false,
  twoFactorState = null,
}: {
  isStudent?: boolean;
  twoFactorState?: { enabled: boolean; recoveryRemaining: number } | null;
}) {
  const pathname = usePathname();
  const isSecurity = pathname.startsWith("/settings/security");
  const isAppearance = pathname.startsWith("/settings/appearance");

  if (isAppearance) return <AppearanceView />;
  if (isSecurity) return <SecurityView isStudent={isStudent} twoFactorState={twoFactorState} />;
  return <ProfileView isStudent={isStudent} />;
}
