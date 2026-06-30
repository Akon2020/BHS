import type { Metadata } from "next";
import EventsListClient from "./events-list-client";

export const metadata: Metadata = {
  title: "Événements | Burning Heart",
  description:
    "Retrouvez les événements, retraites et activités spirituelles de Burning Heart – Pèlerins avec le Christ.",
  alternates: { canonical: "/events" },
  openGraph: {
    title: "Événements | Burning Heart",
    description:
      "Les événements, retraites et activités spirituelles de Burning Heart.",
    url: "/events",
    siteName: "Burning Heart",
    type: "website",
  },
};

export default function EventsPage() {
  return <EventsListClient />;
}
