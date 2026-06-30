import type { Metadata } from "next";
import ContactClient from "./contact-client";

export const metadata: Metadata = {
  title: "Contact | Burning Heart",
  description:
    "Contactez Burning Heart – Pèlerins avec le Christ : adresse à Bukavu, téléphone, email et formulaire de contact.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact | Burning Heart",
    description:
      "Contactez Burning Heart – Pèlerins avec le Christ (Bukavu, RDC).",
    url: "/contact",
    siteName: "Burning Heart",
    type: "website",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
