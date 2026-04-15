import { LegalDocumentPage } from "@/components/legal/legal-document-page";

export const dynamic = "force-static";

export default async function PrivacyPolicyPage() {
  return (
    <LegalDocumentPage
      title="Privacy Policy"
      subtitle="This policy explains what data ArcWealth collects, why we collect it, and how we safeguard it."
      sourceFile="privacy_policy.md"
    />
  );
}
