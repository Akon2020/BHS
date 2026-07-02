import type { Metadata } from "next";
import RdvClient from "./rdv-client";

export const metadata: Metadata = {
  title: "Prendre rendez-vous | Burning Heart",
  description:
    "Réservez un créneau de rendez-vous avec le Père Coordinateur de Burning Heart – Pèlerins avec le Christ, et suivez le statut de votre demande.",
  alternates: { canonical: "/rendez-vous" },
  openGraph: {
    title: "Prendre rendez-vous | Burning Heart",
    description:
      "Réservez un créneau de rendez-vous avec le Père Coordinateur de Burning Heart.",
    url: "/rendez-vous",
    siteName: "Burning Heart",
    type: "website",
  },
};

export default function RendezVousPage() {
  return <RdvClient />;
}
