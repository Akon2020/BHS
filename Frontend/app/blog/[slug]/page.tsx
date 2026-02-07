"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { User, Calendar, Clock, ArrowLeft } from "lucide-react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";

import { getBlogBySlug } from "@/actions/blog";
import { Blog } from "@/types/user";

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;

  console.log("Slug from params:", slug);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchBlog = async () => {
    try {
      setLoading(true);

      if (!slug) {
        throw new Error("Slug invalide");
      }

      const res = await getBlogBySlug(slug);
      const data = res.blog;

      if (!data) {
        throw new Error("Article introuvable");
      }

      setBlog(data);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description:
          error?.message || "Impossible de charger l'article.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    if (slug) {
      fetchBlog();
    }
  }, [slug]);


  if (loading) {
    return (
      <div className="flex flex-col">
        <Header />
        <div className="mx-auto max-w-4xl px-4 py-12 space-y-6">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Footer />
      </div>
    );
  }

  // Dans BlogPostPage, modifiez la fin du composant :
if (!blog && !loading) {
  return (
    <div className="flex flex-col">
      <Header />
      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 lg:px-8 text-center">
          <h1 className="font-serif text-4xl font-bold">404</h1>
          <h2 className="mt-4 text-2xl">Page Introuvable</h2>
          <p className="mt-4 text-muted-foreground">
            L'article que vous recherchez n'existe pas ou a été déplacé.
          </p>
          <div className="mt-8">
            <Link href="/blog">
              <Button>Retour au blog</Button>
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}

  return (
    <div className="flex flex-col">
      <Header />

      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <Link href="/blog">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour au blog
            </Button>
          </Link>

          {/* Header */}
          <div className="mt-8">
            {blog.categorie && (
              <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {blog.categorie.nomCategorie}
              </div>
            )}

            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-5xl">
              {blog.titre}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{blog.auteur?.nomComplet}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(blog.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{blog.estimationLecture ?? 1} min</span>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="mt-12 aspect-video overflow-hidden rounded-xl bg-muted">
            <img
              src={
                blog.imageUne?.startsWith("http")
                  ? blog.imageUne
                  : `${process.env.NEXT_PUBLIC_API_URL}/${blog.imageUne}`
              }
              alt={blog.titre}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="prose prose-lg mt-12 max-w-none dark:prose-invert">
            {blog.extrait && (
              <p className="lead text-xl text-muted-foreground leading-relaxed">
                {blog.extrait}
              </p>
            )}

            <div
              className="mt-8"
              dangerouslySetInnerHTML={{ __html: blog.contenu }}
            />
          </div>

          {/* CTA */}
          <div className="mt-12 rounded-xl bg-muted/50 p-8">
            <h3 className="font-serif text-2xl font-bold">
              Partagez votre expérience
            </h3>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              Cet article vous a inspiré ? N’hésitez pas à le partager.
            </p>
            <div className="mt-6">
              <Link href="/contact">
                <Button>Nous contacter</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
