"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { User, Calendar, Clock, Loader2, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAllBlogs } from "@/actions/blog";
import { getAllCategories } from "@/actions/categorie";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

interface BlogPost {
  idBlog: number;
  titre: string;
  slug: string;
  extrait: string;
  imageUne: string;
  statut: string;
  createdAt: string;
  estimationLecture: number;
  auteur?: {
    nomComplet: string;
  };
  categorie?: {
    nomCategorie: string;
  };
}

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("Tous");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<
    { idCategorie: number; nomCategorie: string }[]
  >([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const limit = 9;

  // Charger les catégories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await getAllCategories();
        setCategories(res.categories || []);
      } catch (error) {
        console.error("Erreur chargement catégories:", error);
      }
    };
    loadCategories();
  }, []);

  // Charger les articles
  const loadPosts = async (pageNum = 1, reset = false) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const params: any = {
        page: pageNum,
        limit,
        statut: "publie", // SEULEMENT les articles publiés
      };

      if (activeCategory !== "Tous") {
        const selectedCat = categories.find(
          (cat) => cat.nomCategorie === activeCategory,
        );
        if (selectedCat) {
          params.categorie = selectedCat.idCategorie;
        }
      }

      if (searchTerm) {
        // Note: L'API backend devra supporter la recherche
        // Pour l'instant, on filtre côté client
      }

      const response = await getAllBlogs(params);

      if (reset) {
        setPosts(response.blogs || []);
      } else {
        setPosts((prev) => [...prev, ...(response.blogs || [])]);
      }

      setPage(pageNum);
      setTotalPages(response.totalPages || 1);
      setTotalPosts(response.nombre || 0);
    } catch (error) {
      console.error("Erreur chargement articles:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  // Charger initial
  useEffect(() => {
    loadPosts(1, true);
  }, [activeCategory, searchTerm]);

  // Gérer le scroll infini (optionnel)
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop <
          document.documentElement.offsetHeight - 100 ||
        isLoadingMore
      )
        return;
      if (page < totalPages) {
        loadPosts(page + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, totalPages, isLoadingMore]);

  // Filtrer par recherche
  const filteredPosts = searchTerm
    ? posts.filter(
        (post) =>
          post.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.extrait.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.categorie?.nomCategorie
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      )
    : posts;

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Toutes les catégories disponibles
  const allCategories = ["Tous", ...categories.map((cat) => cat.nomCategorie)];

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-muted/30 to-background py-20 md:py-24">
        <div className="container px-4 mx-auto">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              Notre Blog
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
              Découvrez des articles inspirants, des enseignements profonds et
              des témoignages qui nourriront votre foi et votre vie spirituelle.
            </p>

            {/* Barre de recherche */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="search"
                  placeholder="Rechercher un article..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catégories */}
      <section className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4">
        <div className="container px-4 mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {allCategories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setActiveCategory(category);
                  setPage(1);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activeCategory === category
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Articles */}
      <section className="py-16 md:py-20 flex-1">
        <div className="container px-4 mx-auto">
          {isLoading && page === 1 ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-muted-foreground mb-4">
                Aucun article publié trouvé
              </div>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Effacer la recherche
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-8 flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  {totalPosts} article{totalPosts > 1 ? "s" : ""} publié
                  {totalPosts > 1 ? "s" : ""}
                </div>
                {searchTerm && (
                  <div className="text-sm">
                    {filteredPosts.length} résultat
                    {filteredPosts.length > 1 ? "s" : ""} pour "{searchTerm}"
                  </div>
                )}
              </div>

              <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post) => (
                  <Link
                    key={post.idBlog}
                    href={`/blog/${post.slug || post.idBlog}`}
                  >
                    <Card className="group h-full overflow-hidden border-none bg-card shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                      {/* Image */}
                      <div className="aspect-video overflow-hidden bg-muted relative">
                        {post.imageUne ? (
                          <img
                            src={
                              post.imageUne?.startsWith("http")
                                ? post.imageUne
                                : `${process.env.NEXT_PUBLIC_API_URL}/${post.imageUne}`
                            }
                            alt={post.titre}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                            <span className="text-6xl opacity-10">✝</span>
                          </div>
                        )}
                      </div>

                      <CardContent className="p-6">
                        {/* Catégorie */}
                        <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary mb-3">
                          {post.categorie?.nomCategorie || "Non catégorisé"}
                        </div>

                        {/* Titre */}
                        <h3 className="font-serif text-xl font-bold leading-snug mb-3 group-hover:text-primary line-clamp-2">
                          {post.titre}
                        </h3>

                        {/* Extrait */}
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 mb-4">
                          {post.extrait || "Aucun extrait disponible"}
                        </p>

                        {/* Métadonnées */}
                        <div className="flex flex-wrap items-center gap-4 border-t pt-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>
                              {post.auteur?.nomComplet || "Auteur inconnu"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formatDate(post.createdAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{post.estimationLecture ?? 1} min</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Bouton "Charger plus" */}
              {!isLoading && page < totalPages && !searchTerm && (
                <div className="mt-12 text-center">
                  <Button
                    variant="outline"
                    onClick={() => loadPosts(page + 1)}
                    disabled={isLoadingMore}
                    className="min-w-[200px]"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Chargement...
                      </>
                    ) : (
                      "Charger plus d'articles"
                    )}
                  </Button>
                </div>
              )}

              {isLoadingMore && (
                <div className="mt-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
