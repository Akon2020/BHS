"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Eye,
  MessageCircle,
  Calendar,
  User,
  Folder,
  Edit,
  Trash2,
  Search,
} from "lucide-react";
import { getSingleBlog } from "@/actions/blog";
import { deleteBlog } from "@/actions/blog";
import { Blog, BlogCommentaire } from "@/types/user";

export default function BlogViewAdminPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchComments, setSearchComments] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await getSingleBlog(id);
      setBlog(response.blog);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger le blog.",
        variant: "destructive",
      });
      router.push("/admin/blog");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(id)) {
      fetchBlog();
    }
  }, [id]);

  const filteredComments = useMemo(() => {
    if (!blog?.commentaires) return [];
    const q = searchComments.toLowerCase();
    return blog.commentaires.filter(
      (comment) =>
        (comment.contenu?.toLowerCase() || "").includes(q) ||
        (comment.utilisateur?.nomComplet?.toLowerCase() || "").includes(q),
    );
  }, [blog?.commentaires, searchComments]);

  const confirmDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteBlog(id);
      toast({
        title: "Succès",
        description: "Article supprimé avec succès",
      });
      setConfirmOpen(false);
      router.push("/admin/blog");
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer le blog",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!blog) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">{blog.titre}</h1>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={blog.statut === "publie" ? "default" : "secondary"}>
            {blog.statut === "publie" ? "Publié" : "Brouillon"}
          </Badge>

          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/blog/edit/${blog.idBlog}`}>
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Link>
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={() => setConfirmOpen(true)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isDeleting ? "Suppression..." : "Supprimer"}
          </Button>
        </div>
      </div>

      {/* Contenu + Image */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardContent className="p-6 space-y-4">
            {/* Métadonnées du blog */}
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{blog.auteur?.nomComplet || "Auteur inconnu"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Folder className="h-4 w-4" />
                <span>{blog.categorie?.nomCategorie || "Non catégorisé"}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(blog.createdAt).toLocaleDateString("fr-FR")}
                </span>
              </div>
            </div>

            {/* Contenu */}
            <div className="prose prose-sm max-w-none">
              <div
                dangerouslySetInnerHTML={{ __html: blog.contenu }}
                className="text-muted-foreground"
              />
            </div>

            {/* Extrait */}
            {blog.extrait && (
              <div className="bg-muted p-4 rounded-md">
                <p className="text-sm font-medium mb-1">Extrait</p>
                <p className="text-sm text-muted-foreground">{blog.extrait}</p>
              </div>
            )}

            {/* Tags */}
            {blog.tags && (
              <div className="flex flex-wrap gap-2">
                {blog.tags.split(",").map((tag, i) => (
                  <Badge key={i} variant="outline">
                    {tag.trim()}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Image */}
        <Card>
          <CardContent className="p-4">
            {blog.imageUne ? (
              <div className="relative aspect-video rounded-md overflow-hidden border">
                <Image
                  src={
                    blog.imageUne.startsWith("http")
                      ? blog.imageUne
                      : `${process.env.NEXT_PUBLIC_API_URL}/${blog.imageUne}`
                  }
                  alt={blog.titre}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video flex items-center justify-center border rounded-md text-muted-foreground">
                <span className="text-6xl opacity-10">📄</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={Eye} label="Vues" value={blog.nombreVues || 0} />
        <StatCard
          icon={MessageCircle}
          label="Commentaires"
          value={blog.commentaires?.length || 0}
        />
        <StatCard
          icon={Calendar}
          label="Temps de lecture"
          value={`${blog.estimationLecture || 1} min`}
        />
      </div>

      {/* Commentaires Section */}
      {blog.commentaires && blog.commentaires.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Commentaires ({blog.commentaires.length})
            </CardTitle>
            <CardDescription>
              Les commentaires approuvés sur cet article
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un commentaire..."
                value={searchComments}
                onChange={(e) => setSearchComments(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              {filteredComments.map((comment) => (
                <div
                  key={comment.idCommentaire}
                  className="p-4 border rounded-md space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {comment.utilisateur?.avatar ? (
                        <img
                          src={`${process.env.NEXT_PUBLIC_API_URL}/${comment.utilisateur.avatar}`}
                          alt={comment.utilisateur.nomComplet}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {comment.utilisateur?.nomComplet?.charAt(0) || "?"}
                          </span>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-sm">
                          {comment.utilisateur?.nomComplet ||
                            "Utilisateur inconnu"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {comment.dateCommentaire
                        ? new Date(comment.dateCommentaire).toLocaleString(
                            "fr-FR",
                          )
                        : "Date inconnue"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {comment.contenu}
                  </p>
                </div>
              ))}
              {filteredComments.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun commentaire trouvé
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {(!blog.commentaires || blog.commentaires.length === 0) && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
            <p>Aucun commentaire pour cet article</p>
          </CardContent>
        </Card>
      )}
      {/* Confirm Deletion Modal */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr(e) de vouloir supprimer cet article ? Cette action
              est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: any;
}) {
  return (
    <Card>
      <CardContent className="p-4 flex items-center gap-3">
        <Icon className="h-6 w-6 text-primary" />
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
