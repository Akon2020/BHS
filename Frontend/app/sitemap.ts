import type { MetadataRoute } from "next";

const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL || "https://burningheartihs.org"
).replace(/\/$/, "");
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

interface SlugItem {
  slug?: string;
  updatedAt?: string;
  statut?: string;
}

async function fetchList(
  path: string,
  key: string,
): Promise<SlugItem[]> {
  if (!API_BASE_URL) return [];
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.[key]) ? data[key] : [];
  } catch {
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/a-propos",
    "/services",
    "/blog",
    "/events",
    "/files",
    "/contact",
    "/don",
    "/identity",
  ].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === "" ? "daily" : "weekly",
    priority: route === "" ? 1 : 0.7,
  }));

  const [blogs, events, files] = await Promise.all([
    fetchList("/api/blogs?statut=publie&limit=1000", "blogs"),
    fetchList("/api/evenements?limit=1000", "events"),
    fetchList("/api/fichiers/public?limit=1000", "fichiers"),
  ]);

  const blogRoutes: MetadataRoute.Sitemap = blogs
    .filter((b) => b.slug)
    .map((b) => ({
      url: `${SITE_URL}/blog/${b.slug}`,
      lastModified: b.updatedAt ? new Date(b.updatedAt) : new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const eventRoutes: MetadataRoute.Sitemap = events
    .filter((e) => e.slug && e.statut === "publie")
    .map((e) => ({
      url: `${SITE_URL}/events/${e.slug}`,
      lastModified: e.updatedAt ? new Date(e.updatedAt) : new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    }));

  const fileRoutes: MetadataRoute.Sitemap = files
    .filter((f) => f.slug)
    .map((f) => ({
      url: `${SITE_URL}/files/${f.slug}`,
      lastModified: f.updatedAt ? new Date(f.updatedAt) : new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    }));

  return [...staticRoutes, ...blogRoutes, ...eventRoutes, ...fileRoutes];
}
