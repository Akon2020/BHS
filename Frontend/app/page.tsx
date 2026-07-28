import type { Metadata } from "next";
import HomePage from "./home-client";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://burningheartihs.org"
).replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Burning Heart – Pèlerins avec le Christ",
  description:
    "Apostolat spirituel et médiatique ignatien. Ravivez la flamme de votre foi : blog, événements, Exercices Spirituels et accompagnement spirituel.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Burning Heart – Pèlerins avec le Christ",
    description:
      "Apostolat spirituel et médiatique ignatien. Ravivez la flamme de votre foi.",
    url: "/",
    siteName: "Burning Heart",
    type: "website",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "NGO",
  name: "Burning Heart – Pèlerins avec le Christ",
  alternateName: "Burning Heart IHS",
  url: SITE_URL,
  logo: `${SITE_URL}/images/logon.png`,
  description:
    "Apostolat spirituel et médiatique à but non lucratif, de spiritualité ignatienne.",
  address: {
    "@type": "PostalAddress",
    streetAddress: "259 Avenue Patrice Emery Lumumba, Q. Nyalukemba",
    addressLocality: "Bukavu",
    addressCountry: "CD",
  },
  email: "contact@burningheartihs.org",
  telephone: "+243898961612",
  sameAs: [
    "https://facebook.com/burningheart87",
    "https://instagram.com/burningheart87",
    "https://youtube.com/@burningheart-bhis",
  ],
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationJsonLd),
        }}
      />
      <HomePage />
    </>
  );
}
