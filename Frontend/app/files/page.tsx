import type { Metadata } from "next";
import FilesListClient from "./files-list-client";

export const metadata: Metadata = {
  title: "Ressources | Burning Heart",
  description:
    "Téléchargez les ressources, documents et supports spirituels partagés par Burning Heart – Pèlerins avec le Christ.",
  alternates: { canonical: "/files" },
  openGraph: {
    title: "Ressources | Burning Heart",
    description:
      "Ressources, documents et supports spirituels de Burning Heart.",
    url: "/files",
    siteName: "Burning Heart",
    type: "website",
  },
};

export default function FilesPage() {
  return <FilesListClient />;
}
