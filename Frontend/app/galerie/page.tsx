import type { Metadata } from "next";
import GalerieListeClient from "./galerie-liste-client";

export const metadata: Metadata = {
  title: "Galerie | Burning Heart",
  description:
    "Retraites, rencontres et célébrations : les albums photo des activités de Burning Heart – Pèlerins avec le Christ.",
  alternates: { canonical: "/galerie" },
  openGraph: {
    title: "Galerie | Burning Heart",
    description: "Les albums photo des activités de Burning Heart.",
    url: "/galerie",
    siteName: "Burning Heart",
    type: "website",
  },
};

export default function GaleriePage() {
  return <GalerieListeClient />;
}
