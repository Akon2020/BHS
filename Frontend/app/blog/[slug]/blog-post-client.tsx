"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  User,
  Calendar,
  Clock,
  ArrowLeft,
  Share2,
  MessageCircle,
  Send,
  Loader2,
} from "lucide-react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { getBlogBySlug } from "@/actions/blog";
import { getCommentairesParBlog, createCommentaire } from "@/actions/comment";
import { Blog, Commentaire } from "@/types/user";

interface BlogPostClientProps {
  slug: string;
}

export default function BlogPostClient({ slug }: BlogPostClientProps) {
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState<Commentaire[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Form states
  const [nomComplet, setNomComplet] = useState("");
  const [email, setEmail] = useState("");
  const [contenu, setContenu] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

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
        description: error?.message || "Impossible de charger l'article.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (idBlog: number) => {
    try {
      setCommentsLoading(true);
      const res = await getCommentairesParBlog(idBlog);
      setComments(res.commentaires);
    } catch (error: any) {
      console.error("Erreur lors du chargement des commentaires:", error);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nomComplet.trim() || !email.trim() || !contenu.trim()) {
      toast({
        title: "Erreur",
        description: "Tous les champs sont obligatoires",
        variant: "destructive",
      });
      return;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une adresse email valide",
        variant: "destructive",
      });
      return;
    }

    if (!blog) return;

    try {
      setIsSubmittingComment(true);
      await createCommentaire({
        idBlog: blog.idBlog,
        nomComplet,
        email,
        contenu,
      });

      toast({
        title: "Succès",
        description: "Commentaire envoyé et en attente de modération",
      });

      setNomComplet("");
      setEmail("");
      setContenu("");

      // Refresh comments
      await fetchComments(blog.idBlog);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'envoi du commentaire",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const shareArticle = (platform: string) => {
    if (!blog) return;

    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = blog.titre;
    const description = blog.extrait || blog.titre;

    const shareUrls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      gmail: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + "\n\n" + url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      copy: "",
    };

    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      toast({
        title: "Succès",
        description: "Lien copié dans le presse-papiers",
      });
      return;
    }

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], "_blank", "width=600,height=400");
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  useEffect(() => {
    if (blog?.idBlog) {
      fetchComments(blog.idBlog);
    }
  }, [blog?.idBlog]);

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
            {blog!.categorie && (
              <div className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                {blog!.categorie.nomCategorie}
              </div>
            )}

            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-5xl">
              {blog!.titre}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                {/* <User className="h-4 w-4" /> */}
                <Avatar>
                  <AvatarImage
                    src={`${process.env.NEXT_PUBLIC_API_URL}/${blog!.auteur?.avatar}`}
                    className="object-cover"
                  />
                  <AvatarFallback>
                    {blog!.auteur?.nomComplet.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span>{blog!.auteur?.nomComplet}</span>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(blog!.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{blog!.estimationLecture ?? 1} min</span>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="mt-12 aspect-video overflow-hidden rounded-xl bg-muted">
            <img
              src={
                blog!.imageUne?.startsWith("http")
                  ? blog!.imageUne
                  : `${process.env.NEXT_PUBLIC_API_URL}/${blog!.imageUne}`
              }
              alt={blog!.titre}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Content */}
          <div className="prose prose-lg mt-12 max-w-none dark:prose-invert">
            <div
              className="mt-8"
              dangerouslySetInnerHTML={{ __html: blog!.contenu }}
            />
          </div>

          {/* Partage */}
          <div className="mt-12 rounded-xl bg-muted/50 p-8">
            <h3 className="font-serif text-2xl font-bold mb-4">
              Partager cet article
            </h3>
            <div className="flex flex-wrap gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Share2 className="h-4 w-4" />
                    Partager
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => shareArticle("whatsapp")}>
                    WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => shareArticle("facebook")}>
                    Facebook
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => shareArticle("linkedin")}>
                    LinkedIn
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => shareArticle("gmail")}>
                    Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => shareArticle("copy")}>
                    Copier le lien
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Commentaires */}
          <div className="mt-16">
            <h2 className="font-serif text-3xl font-bold mb-8">Commentaires</h2>

            {/* Formulaire d'ajout de commentaire */}
            <div className="mb-12 rounded-lg border p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Laisser un commentaire
              </h3>
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom</label>
                    <Input
                      placeholder="Votre nom"
                      value={nomComplet}
                      onChange={(e) => setNomComplet(e.target.value)}
                      disabled={isSubmittingComment}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      placeholder="Votre email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={isSubmittingComment}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Commentaire</label>
                  <Textarea
                    placeholder="Écrivez votre commentaire..."
                    value={contenu}
                    onChange={(e) => setContenu(e.target.value)}
                    disabled={isSubmittingComment}
                    rows={5}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmittingComment}
                  className="w-full md:w-auto"
                >
                  {isSubmittingComment ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Envoi en cours...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      Envoyer
                    </>
                  )}
                </Button>
                <p className="text-xs text-muted-foreground">
                  Les commentaires sont modérés et approuvés avant affichage.
                </p>
              </form>
            </div>

            {/* Liste des commentaires */}
            <div className="space-y-6">
              {commentsLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-lg" />
                  ))}
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div
                    key={comment.idCommentaire}
                    className="rounded-lg border p-4 space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarImage
                          src={
                            comment.utilisateur?.avatar
                              ? comment.utilisateur.avatar.startsWith("http")
                                ? comment.utilisateur.avatar
                                : `${process.env.NEXT_PUBLIC_API_URL}/${comment.utilisateur.avatar}`
                              : undefined
                          }
                          alt={comment.nomComplet}
                        />
                        <AvatarFallback>
                          {getInitials(comment.nomComplet)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold text-sm">
                            {comment.nomComplet}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {new Date(
                              comment.dateCommentaire,
                            ).toLocaleDateString("fr-FR", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {comment.contenu}
                        </p>
                      </div>
                    </div>

                    {/* Réponses */}
                    {comment.reponses && comment.reponses.length > 0 && (
                      <div className="ml-12 space-y-3 border-l-2 pl-4 py-2">
                        {comment.reponses.map((reply) => (
                          <div key={reply.idCommentaire} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={
                                    reply.utilisateur?.avatar
                                      ? reply.utilisateur.avatar.startsWith(
                                          "http",
                                        )
                                        ? reply.utilisateur.avatar
                                        : `${process.env.NEXT_PUBLIC_API_URL}/${reply.utilisateur.avatar}`
                                      : undefined
                                  }
                                  alt={reply.nomComplet}
                                />
                                <AvatarFallback>
                                  {getInitials(reply.nomComplet)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="text-xs font-semibold">
                                  {reply.nomComplet}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(
                                    reply.dateCommentaire,
                                  ).toLocaleDateString("fr-FR", {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                  })}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {reply.contenu}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="rounded-lg border p-8 text-center text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>
                    Aucun commentaire pour le moment. Soyez le premier à
                    commenter!
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
