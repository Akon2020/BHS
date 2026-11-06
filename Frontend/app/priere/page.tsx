import type { Metadata } from "next";
import { Flame, HeartHandshake, Lock } from "lucide-react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PriereForm } from "@/components/priere/priere-form";
import { IntentionsAujourdhui } from "./intentions-aujourdhui";

export const metadata: Metadata = {
  title: "Table de prière | Burning Heart",
  description:
    "Découvrez pour qui la communauté Burning Heart prie aujourd'hui et confiez-nous votre intention de prière, en toute confidentialité.",
  alternates: { canonical: "/priere" },
  openGraph: {
    title: "Table de prière | Burning Heart",
    description:
      "Pour qui prions-nous aujourd'hui ? Confiez votre intention à la communauté Burning Heart.",
    url: "/priere",
    siteName: "Burning Heart",
    type: "website",
  },
};

const engagements = [
  {
    icon: HeartHandshake,
    titre: "Portée chaque jour",
    texte:
      "Chaque intention reçue est confiée à notre équipe de prière et planifiée pour un jour précis.",
  },
  {
    icon: Lock,
    titre: "Confidentielle par défaut",
    texte:
      "Rien n'est publié sans votre accord. Votre email n'est jamais affiché.",
  },
];

export default function PrierePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <section className="bg-gradient-to-b from-muted/40 to-background py-16 md:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <Flame className="h-7 w-7 text-primary" aria-hidden />
          </div>
          <h1 className="mt-6 font-serif text-4xl font-bold tracking-tight sm:text-5xl">
            Table de prière
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            « Là où deux ou trois sont réunis en mon nom, je suis au milieu
            d&apos;eux. » Chaque jour, la communauté porte dans la prière les
            intentions qui lui sont confiées.
          </p>
        </div>
      </section>

      <div className="mx-auto grid grid-cols-1 w-full max-w-7xl gap-12 px-4 pb-20 lg:grid-cols-2 lg:gap-16 lg:px-8">
        <section aria-labelledby="aujourdhui-titre">
          <IntentionsAujourdhui />

          <ul className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {engagements.map(({ icon: Icon, titre, texte }) => (
              <li key={titre} className="rounded-xl bg-muted/40 p-5">
                <Icon className="h-5 w-5 text-primary" aria-hidden />
                <p className="mt-3 font-semibold">{titre}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {texte}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section
          id="deposer"
          aria-labelledby="deposer-titre"
          className="scroll-mt-24"
        >
          <h2
            id="deposer-titre"
            className="font-serif text-3xl font-bold tracking-tight"
          >
            Confier une intention
          </h2>
          <p className="mb-6 mt-2 text-muted-foreground">
            Pour un proche, une épreuve, une action de grâce, un
            discernement…
          </p>
          <PriereForm />
        </section>
      </div>

      <Footer />
    </div>
  );
}
