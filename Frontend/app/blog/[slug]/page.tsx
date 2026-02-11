import type { Metadata } from "next";
import { headers } from "next/headers";
import BlogPostClient from "./blog-post-client";
import type { Blog } from "@/types/user";

interface BlogPageProps {
  params: Promise<{ slug: string }>;
}

interface BlogBySlugResponse {
  blog?: Blog;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

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

function resolveImageUrl(imageUne?: string): string | undefined {
  if (!imageUne) return undefined;
  if (imageUne.startsWith("http://") || imageUne.startsWith("https://")) {
    return imageUne;
  }
  if (!API_BASE_URL) return undefined;
  return `${API_BASE_URL}/${imageUne.replace(/^\/+/, "")}`;
}

async function getBlogBySlugServer(slug: string): Promise<Blog | null> {
  if (!slug || !API_BASE_URL) return null;

  try {
    const res = await fetch(
      `${API_BASE_URL}/api/blogs/slug/${encodeURIComponent(slug)}`,
      {
        next: { revalidate: 120 },
      },
    );

    if (!res.ok) return null;

    const data = (await res.json()) as BlogBySlugResponse;
    return data.blog ?? null;
  } catch {
    return null;
  }
}

function getOriginFromHeaders(allHeaders: Headers): string | undefined {
  const forwardedHost = allHeaders.get("x-forwarded-host");
  const host = forwardedHost || allHeaders.get("host");
  if (!host) return undefined;

  const forwardedProto = allHeaders.get("x-forwarded-proto");
  const proto = forwardedProto || "https";
  return `${proto}://${host}`;
}

export async function generateMetadata({
  params,
}: BlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlogBySlugServer(slug);

  if (!blog) {
    return {
      title: "Article introuvable | Burning Heart",
      description: "L'article demandé est introuvable.",
      robots: { index: false, follow: false },
    };
  }

  const description = truncate(
    blog.extrait || stripHtml(blog.contenu) || blog.titre,
    180,
  );
  const imageUrl = resolveImageUrl(blog.imageUne);
  const origin = getOriginFromHeaders(await headers());
  const pageUrl = origin ? `${origin}/blog/${blog.slug}` : `/blog/${blog.slug}`;

  return {
    title: `${blog.titre} | Burning Heart`,
    description,
    alternates: {
      canonical: `/blog/${blog.slug}`,
    },
    openGraph: {
      type: "article",
      url: pageUrl,
      title: blog.titre,
      description,
      siteName: "Burning Heart",
      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: blog.titre,
            },
          ]
        : undefined,
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: blog.titre,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPageProps) {
  const { slug } = await params;
  return <BlogPostClient slug={slug} />;
}
