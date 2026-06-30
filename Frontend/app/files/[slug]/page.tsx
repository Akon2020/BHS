import type { Metadata } from "next";
import FileDetailClient from "./file-detail-client";
import type { FichierRessource } from "@/types/user";

interface FilePageProps {
  params: Promise<{ slug: string }>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://burningheartihs.org"
).replace(/\/$/, "");

function truncate(text: string, max = 180): string {
  const clean = (text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1).trim()}...`;
}

async function getFileBySlugServer(
  slug: string,
): Promise<FichierRessource | null> {
  if (!slug || !API_BASE_URL) return null;
  try {
    const res = await fetch(
      `${API_BASE_URL}/api/fichiers/slug/${encodeURIComponent(slug)}`,
      { next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.fichier ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: FilePageProps): Promise<Metadata> {
  const { slug } = await params;
  const fichier = await getFileBySlugServer(slug);

  if (!fichier) {
    return {
      title: "Ressource introuvable | Burning Heart",
      description: "La ressource demandée est introuvable.",
      robots: { index: false, follow: false },
    };
  }

  const description = truncate(
    fichier.description || fichier.nomReference,
    180,
  );

  return {
    title: `${fichier.nomReference} | Burning Heart`,
    description,
    alternates: { canonical: `/files/${fichier.slug}` },
    openGraph: {
      type: "article",
      url: `${SITE_URL}/files/${fichier.slug}`,
      title: fichier.nomReference,
      description,
      siteName: "Burning Heart",
    },
  };
}

export default async function FilePage({ params }: FilePageProps) {
  const { slug } = await params;
  return <FileDetailClient slug={slug} />;
}
