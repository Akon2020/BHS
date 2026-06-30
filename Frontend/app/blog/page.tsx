import type { Metadata } from "next";
import BlogListClient from "./blog-list-client";

export const metadata: Metadata = {
  title: "Blog | Burning Heart",
  description:
    "Articles, enseignements et réflexions de spiritualité ignatienne par Burning Heart – Pèlerins avec le Christ.",
  alternates: { canonical: "/blog" },
  openGraph: {
    title: "Blog | Burning Heart",
    description:
      "Articles, enseignements et réflexions de spiritualité ignatienne.",
    url: "/blog",
    siteName: "Burning Heart",
    type: "website",
  },
};

export default function BlogPage() {
  return <BlogListClient />;
}
