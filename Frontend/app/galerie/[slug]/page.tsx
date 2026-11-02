import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import AlbumClient from "./album-client";
import type { Galerie } from "@/types/user";

interface AlbumPageProps {
  params: Promise<{ slug: string }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://burningheartihs.org"
).replace(/\/$/, "");

function resolveImageUrl(image?: string | null): string | undefined {
  if (!image) return undefined;
  if (image.startsWith("http")) return image;
  if (!API_BASE_URL) return undefined;
  return `${API_BASE_URL}/${image.replace(/^\/+/, "")}`;
}

function truncate(text: string, max = 180): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}...`;
}

async function getAlbumServer(slug: string): Promise<Galerie | null> {
  if (!slug || !API_BASE_URL) return null;
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/galeries/public/${encodeURIComponent(slug)}`,
      { next: { revalidate: 120 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.galerie ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: AlbumPageProps): Promise<Metadata> {
  const { slug } = await params;
  const album = await getAlbumServer(slug);

  if (!album) {
    return {
      title: "Album introuvable | Burning Heart",
      robots: { index: false, follow: false },
    };
  }

  const description = truncate(
    album.description ||
      `Les photos de « ${album.titre} », une activité de Burning Heart.`,
  );
  const image = resolveImageUrl(album.imageCouverture);

  return {
    title: `${album.titre} | Galerie Burning Heart`,
    description,
    alternates: { canonical: `/galerie/${album.slug}` },
    openGraph: {
      title: album.titre,
      description,
      url: `/galerie/${album.slug}`,
      siteName: "Burning Heart",
      type: "article",
      images: image ? [{ url: image, alt: album.titre }] : undefined,
    },
    twitter: {
      card: image ? "summary_large_image" : "summary",
      title: album.titre,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function AlbumPage({ params }: AlbumPageProps) {
  const { slug } = await params;
  const album = await getAlbumServer(slug);
  if (!album) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: album.titre,
    description: album.description || undefined,
    url: `${SITE_URL}/galerie/${album.slug}`,
    datePublished: album.dateActivite || album.createdAt,
    image: (album.photos || [])
      .map((p) => resolveImageUrl(p.chemin))
      .filter(Boolean),
  };

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Header />
      <AlbumClient album={album} />
      <Footer />
    </div>
  );
}
