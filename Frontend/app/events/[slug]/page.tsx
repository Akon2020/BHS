import type { Metadata } from "next";
import EventDetailsClient from "./event-detail-client";
import type { Evenement } from "@/types/user";

interface EventPageProps {
  params: Promise<{ slug: string }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://burningheartihs.org"
).replace(/\/$/, "");

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function truncate(text: string, max = 180): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}...`;
}

function resolveImageUrl(image?: string): string | undefined {
  if (!image) return undefined;
  if (image.startsWith("http")) return image;
  if (!API_BASE_URL) return undefined;
  return `${API_BASE_URL}/${image.replace(/^\/+/, "")}`;
}

async function getEventBySlugServer(slug: string): Promise<Evenement | null> {
  if (!slug || !API_BASE_URL) return null;
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/evenements/slug/${encodeURIComponent(slug)}`,
      { next: { revalidate: 120 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.event ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlugServer(slug);

  if (!event) {
    return {
      title: "Événement introuvable | Burning Heart",
      description: "L'événement demandé est introuvable.",
      robots: { index: false, follow: false },
    };
  }

  const description = truncate(stripHtml(event.description) || event.titre, 180);
  const imageUrl = resolveImageUrl(event.imageEvenement);

  return {
    title: `${event.titre} | Burning Heart`,
    description,
    alternates: { canonical: `/events/${event.slug}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/events/${event.slug}`,
      title: event.titre,
      description,
      siteName: "Burning Heart",
      images: imageUrl ? [{ url: imageUrl, alt: event.titre }] : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: event.titre,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlugServer(slug);

  const jsonLd = event
    ? {
        "@context": "https://schema.org",
        "@type": "Event",
        name: event.titre,
        startDate: `${event.dateEvenement}T${event.heureDebut}`,
        endDate: event.heureFin
          ? `${event.dateEvenement}T${event.heureFin}`
          : undefined,
        eventStatus:
          event.statut === "annule"
            ? "https://schema.org/EventCancelled"
            : "https://schema.org/EventScheduled",
        location: {
          "@type": "Place",
          name: event.lieu,
        },
        description: truncate(stripHtml(event.description), 300),
        image: resolveImageUrl(event.imageEvenement),
        url: `${SITE_URL}/events/${event.slug}`,
        organizer: {
          "@type": "Organization",
          name: "Burning Heart",
          url: SITE_URL,
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <EventDetailsClient slug={slug} />
    </>
  );
}
