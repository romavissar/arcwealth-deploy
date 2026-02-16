import { redirect } from "next/navigation";

export default function AccountSettingsSecurityRedirect() {
  redirect("/settings/security");
}
