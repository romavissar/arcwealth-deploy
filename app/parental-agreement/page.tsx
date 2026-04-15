import { LegalDocumentPage } from "@/components/legal/legal-document-page";

export const dynamic = "force-static";

export default async function ParentalAgreementPage() {
  return (
    <LegalDocumentPage
      title="Parental Agreement"
      subtitle="This agreement explains guardian consent, child data protections, and parent rights when a minor uses ArcWealth."
      sourceFile="parental_agreement.md"
    />
  );
}
