import { LegalScreen } from "@/components/features/legal/legal-screen";
import { confidentialite } from "@/i18n/legal";

export default function Confidentialite() {
  return (
    <LegalScreen
      title={confidentialite.title}
      updated={confidentialite.updated}
      intro={confidentialite.intro}
      sections={confidentialite.sections}
    />
  );
}
