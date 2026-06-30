import type { Metadata } from "next";
import IdentityClient from "./identity-client";

export const metadata: Metadata = {
  title: "Fiche d'identité du pèlerin | Burning Heart",
  description:
    "Remplissez votre fiche d'identité de pèlerin pour participer aux activités de Burning Heart – Pèlerins avec le Christ.",
  alternates: { canonical: "/identity" },
  openGraph: {
    title: "Fiche d'identité du pèlerin | Burning Heart",
    description: "Fiche d'identité de pèlerin – Burning Heart.",
    url: "/identity",
    siteName: "Burning Heart",
    type: "website",
  },
};

export default function IdentityPage() {
  return <IdentityClient />;
}
