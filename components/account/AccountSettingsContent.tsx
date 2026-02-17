"use client";

import { usePathname } from "next/navigation";
import { ProfileView } from "./ProfileView";
import { SecurityView } from "./SecurityView";
import { AppearanceView } from "./AppearanceView";

export function AccountSettingsContent({ isStudent = false }: { isStudent?: boolean }) {
  const pathname = usePathname();
  const isSecurity = pathname.startsWith("/settings/security");
  const isAppearance = pathname.startsWith("/settings/appearance");

  if (isAppearance) return <AppearanceView />;
  if (isSecurity) return <SecurityView isStudent={isStudent} />;
  return <ProfileView isStudent={isStudent} />;
}
