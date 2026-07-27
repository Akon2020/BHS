import { LegalScreen } from "@/components/features/legal/legal-screen";
import { conditions } from "@/i18n/legal";

export default function Conditions() {
  return (
    <LegalScreen
      title={conditions.title}
      updated={conditions.updated}
      intro={conditions.intro}
      sections={conditions.sections}
    />
  );
}
