import { LegalDocumentPage } from "@/components/legal/legal-document-page";

export const dynamic = "force-static";

export default async function UserAgreementPage() {
  return (
    <LegalDocumentPage
      title="User Agreement"
      subtitle="These terms describe your rights and responsibilities when using ArcWealth."
      sourceFile="user_agreement.md"
    />
  );
}
