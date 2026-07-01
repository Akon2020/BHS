import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import type { Metadata } from "next";
import { DonationClient } from "./donation-client";

export const metadata: Metadata = {
  title: "Faire un don | Burning Heart",
  description:
    "Soutenez la mission de Burning Heart – Pèlerins avec le Christ. Faites un don par virement bancaire ou Mobile Money.",
  alternates: { canonical: "/don" },
  openGraph: {
    title: "Faire un don | Burning Heart",
    description:
      "Soutenez la mission spirituelle de Burning Heart – Pèlerins avec le Christ.",
    url: "/don",
    siteName: "Burning Heart",
    type: "website",
  },
};

export default function DonationPage() {
  return (
    <div className="flex flex-col">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-10 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
              <Heart className="h-10 w-10 text-primary" />
            </div>
          </div>
          <h1 className="mb-4 font-serif text-4xl font-bold tracking-tight">
            Faire un Don
          </h1>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Votre générosité nous aide à poursuivre notre mission spirituelle et
            à accompagner plus de personnes dans leur cheminement avec le Christ.
          </p>
        </div>

        <DonationClient />

        <Card className="mt-12 border-primary/20 bg-primary/5">
          <CardContent className="p-6 text-center">
            <p className="text-sm leading-relaxed">
              Merci pour votre soutien ! Chaque contribution, quelle que soit sa
              taille, fait une différence dans la vie de notre communauté.
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
