"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CalendarDays, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAllBlogs } from "@/actions/blog";

interface UIBlog {
  idBlog: number;
  slug?: string;
  titre: string;
  extrait?: string;
  imageUne?: string;
  statut: string;
  createdAt: string;
  categorie?: {
    nomCategorie: string;
  };
}

export function ActusSection() {
  const [posts, setPosts] = useState<UIBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActus = async () => {
      try {
        setLoading(true);
        const res = await getAllBlogs({ page: 1, limit: 12, statut: "publie" });

        const latestPublished =
          res.blogs
            ?.filter((post) => post.statut === "publie")
            ?.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            ) || [];

        setPosts(latestPublished.slice(0, 3));
      } catch (error) {
        console.error("Erreur chargement actualites:", error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActus();
  }, []);

  return (
    <section className="bg-muted/20 py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h2 className="font-serif text-4xl font-bold tracking-tight">
              Actualites Recentes
            </h2>
            <p className="mt-3 leading-relaxed text-muted-foreground">
              Retrouvez les trois dernieres nouvelles, enseignements et
              publications de Burning Heart.
            </p>
          </div>

          <Link href="/blog">
            <Button
              variant="outline"
              className="hidden gap-2 bg-transparent sm:flex"
            >
              Toutes les actualites
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="relative aspect-video animate-pulse bg-muted" />
                <CardContent className="space-y-3 p-6">
                  <div className="h-5 w-1/2 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-full animate-pulse rounded bg-muted" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  <div className="mt-4 h-10 w-full animate-pulse rounded bg-muted" />
                </CardContent>
              </Card>
            ))}

          {!loading &&
            posts.map((post) => (
              <Card
                key={post.idBlog}
                className="group overflow-hidden transition-shadow hover:shadow-lg"
              >
                <div className="relative aspect-video overflow-hidden bg-muted">
                  {post.imageUne ? (
                    <Image
                      src={
                        post.imageUne.startsWith("http")
                          ? post.imageUne
                          : `${process.env.NEXT_PUBLIC_API_URL}/${post.imageUne}`
                      }
                      alt={post.titre}
                      fill
                      sizes="(max-width: 1024px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 to-primary/5">
                      <FileText className="h-14 w-14 text-primary/35" />
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {new Date(post.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                    {post.categorie?.nomCategorie && (
                      <Badge variant="secondary">
                        {post.categorie.nomCategorie}
                      </Badge>
                    )}
                  </div>

                  <h3 className="mb-3 line-clamp-2 font-serif text-xl font-bold group-hover:text-primary">
                    {post.titre}
                  </h3>

                  <p className="mb-5 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {post.extrait ||
                      "Decouvrez cette actualite recente sur la vie et la mission de la communaute."}
                  </p>

                  <Link href={`/blog/${post.slug || post.idBlog}`}>
                    <Button className="w-full">Lire l'actualite</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}

          {!loading && posts.length === 0 && (
            <div className="col-span-full">
              <div className="mx-auto max-w-xl">
                <Card className="border-dashed bg-background/80">
                  <CardContent className="space-y-4 p-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <FileText className="h-7 w-7 text-primary" />
                    </div>

                    <h3 className="font-serif text-xl font-bold">
                      Aucune actualite recente pour l'instant
                    </h3>

                    <p className="text-sm leading-relaxed text-muted-foreground">
                      Les prochaines publications seront disponibles bientot.
                      Revenez consulter le blog.
                    </p>

                    <div className="pt-2">
                      <Link href="/blog">
                        <Button
                          variant="outline"
                          className="gap-2 bg-transparent"
                        >
                          Voir toutes les actualites
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 sm:hidden">
          <Link href="/blog">
            <Button variant="outline" className="w-full gap-2 bg-transparent">
              Toutes les actualites
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
