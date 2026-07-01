import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import SearchClient from "./search-client";

export const metadata: Metadata = {
  title: "Recherche | Burning Heart",
  description:
    "Recherchez dans les articles, événements et ressources de Burning Heart – Pèlerins avec le Christ.",
  alternates: { canonical: "/recherche" },
  robots: { index: false, follow: true },
};

export default function RecherchePage() {
  return (
    <div className="flex min-h-[100svh] flex-col">
      <Header />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 lg:px-8">
        <Suspense fallback={null}>
          <SearchClient />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
