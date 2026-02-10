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
import { Textarea } from "@/components/ui/textarea";
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
  Check,
  X,
  Reply,
} from "lucide-react";
import { getSingleBlog } from "@/actions/blog";
import { deleteBlog } from "@/actions/blog";
import {
  getCommentairesParBlog,
  modererCommentaire,
  deleteCommentaire,
  createCommentaire,
} from "@/actions/comment";
import { Blog, Commentaire } from "@/types/user";

export default function BlogViewAdminPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchComments, setSearchComments] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [comments, setComments] = useState<Commentaire[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [replyingToId, setReplyingToId] = useState<number | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isModerating, setIsModerating] = useState<number | null>(null);

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

  const fetchComments = async () => {
    try {
      setCommentsLoading(true);
      const response = await getCommentairesParBlog(id, true); // true pour includeAll
      setComments(response.commentaires);
    } catch (error: any) {
      console.error("Erreur lors du chargement des commentaires:", error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les commentaires",
        variant: "destructive",
      });
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleApproveComment = async (commentId: number) => {
    try {
      setIsModerating(commentId);
      await modererCommentaire(commentId, { statut: "approuve", modereBy: 1 });
      toast({
        title: "Succès",
        description: "Commentaire approuvé",
      });
      await fetchComments();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de l'approbation",
        variant: "destructive",
      });
    } finally {
      setIsModerating(null);
    }
  };

  const handleRefuseComment = async (commentId: number) => {
    try {
      setIsModerating(commentId);
      await modererCommentaire(commentId, { statut: "refuse", modereBy: 1 });
      toast({
        title: "Succès",
        description: "Commentaire refusé",
      });
      await fetchComments();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors du refus",
        variant: "destructive",
      });
    } finally {
      setIsModerating(null);
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    try {
      setIsModerating(commentId);
      await deleteCommentaire(commentId);
      toast({
        title: "Succès",
        description: "Commentaire supprimé",
      });
      await fetchComments();
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Erreur lors de la suppression",
        variant: "destructive",
      });
    } finally {
      setIsModerating(null);
    }
  };

  useEffect(() => {
    if (!isNaN(id)) {
      fetchBlog();
      fetchComments();
    }
  }, [id]);

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

      {/* Modération des Commentaires */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Modération des Commentaires ({comments.length})
          </CardTitle>
          <CardDescription>
            Gérez l'approbation et les réponses aux commentaires
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {commentsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 border rounded-md space-y-2">
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-6">
              {/* En attente d'approbation */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">En Attente</Badge>
                  <span className="text-sm text-muted-foreground">
                    {comments.filter((c) => c.statut === "attente").length}
                  </span>
                </div>
                {comments
                  .filter((c) => c.statut === "attente")
                  .map((comment) => (
                    <div
                      key={comment.idCommentaire}
                      className="p-4 border rounded-md space-y-3 bg-amber-50 dark:bg-amber-950/20"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          {comment.utilisateur?.avatar ? (
                            <img
                              src={
                                comment.utilisateur.avatar.startsWith("http")
                                  ? comment.utilisateur.avatar
                                  : `${process.env.NEXT_PUBLIC_API_URL}/${comment.utilisateur.avatar}`
                              }
                              alt={comment.utilisateur.nomComplet}
                              className="h-10 w-10 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium">
                                {comment.nomComplet?.charAt(0) || "?"}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">
                              {comment.nomComplet}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(
                                comment.dateCommentaire,
                              ).toLocaleDateString("fr-FR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                            <p className="text-sm mt-2 text-foreground">
                              {comment.contenu}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() =>
                            handleApproveComment(comment.idCommentaire)
                          }
                          disabled={isModerating === comment.idCommentaire}
                        >
                          <Check className="h-4 w-4" />
                          Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-2"
                          onClick={() =>
                            handleRefuseComment(comment.idCommentaire)
                          }
                          disabled={isModerating === comment.idCommentaire}
                        >
                          <X className="h-4 w-4" />
                          Refuser
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-2"
                          onClick={() =>
                            setReplyingToId(
                              replyingToId === comment.idCommentaire
                                ? null
                                : comment.idCommentaire,
                            )
                          }
                        >
                          <Reply className="h-4 w-4" />
                          Répondre
                        </Button>
                      </div>

                      {/* Reply form */}
                      {replyingToId === comment.idCommentaire && (
                        <div className="mt-4 p-4 bg-white dark:bg-slate-900 rounded border space-y-3">
                          <Textarea
                            placeholder="Écrivez votre réponse..."
                            value={replyContent}
                            onChange={(
                              e: React.ChangeEvent<HTMLTextAreaElement>,
                            ) => setReplyContent(e.target.value)}
                            rows={3}
                          />
                          <div className="flex gap-2 justify-end">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setReplyingToId(null);
                                setReplyContent("");
                              }}
                            >
                              Annuler
                            </Button>
                            <Button
                              size="sm"
                              onClick={async () => {
                                if (!replyContent.trim()) return;
                                try {
                                  setIsModerating(comment.idCommentaire);
                                  await createCommentaire({
                                    idBlog: id,
                                    nomComplet: "Admin",
                                    email: "admin@burningheart.org",
                                    contenu: replyContent,
                                    idCommentaireParent: comment.idCommentaire,
                                  });
                                  toast({
                                    title: "Succès",
                                    description: "Réponse envoyée",
                                  });
                                  setReplyingToId(null);
                                  setReplyContent("");
                                  await fetchComments();
                                } catch (error: any) {
                                  toast({
                                    title: "Erreur",
                                    description: error.message,
                                    variant: "destructive",
                                  });
                                } finally {
                                  setIsModerating(null);
                                }
                              }}
                              disabled={
                                !replyContent.trim() ||
                                isModerating === comment.idCommentaire
                              }
                            >
                              Envoyer la réponse
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                {comments.filter((c) => c.statut === "attente").length ===
                  0 && (
                  <p className="text-sm text-muted-foreground py-4">
                    Aucun commentaire en attente d'approbation
                  </p>
                )}
              </div>

              {/* Commentaires approuvés */}
              {comments.filter((c) => c.statut === "approuve").length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Approuvés</Badge>
                    <span className="text-sm text-muted-foreground">
                      {comments.filter((c) => c.statut === "approuve").length}
                    </span>
                  </div>
                  {comments
                    .filter((c) => c.statut === "approuve")
                    .map((comment) => (
                      <div
                        key={comment.idCommentaire}
                        className="p-4 border rounded-md space-y-2"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1">
                            {comment.utilisateur?.avatar ? (
                              <img
                                src={
                                  comment.utilisateur.avatar.startsWith("http")
                                    ? comment.utilisateur.avatar
                                    : `${process.env.NEXT_PUBLIC_API_URL}/${comment.utilisateur.avatar}`
                                }
                                alt={comment.utilisateur.nomComplet}
                                className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium">
                                  {comment.nomComplet?.charAt(0) || "?"}
                                </span>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">
                                {comment.nomComplet}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(
                                  comment.dateCommentaire,
                                ).toLocaleDateString("fr-FR", {
                                  year: "numeric",
                                  month: "long",
                                  day: "numeric",
                                })}
                              </p>
                              <p className="text-sm mt-1 text-muted-foreground">
                                {comment.contenu}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              handleDeleteComment(comment.idCommentaire)
                            }
                            disabled={isModerating === comment.idCommentaire}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Afficher les réponses */}
                        {comment.reponses && comment.reponses.length > 0 && (
                          <div className="ml-8 space-y-2 border-l-2 pl-4 pt-2">
                            {comment.reponses.map((reply) => (
                              <div
                                key={reply.idCommentaire}
                                className="text-sm space-y-1"
                              >
                                <p className="font-medium">
                                  {reply.utilisateur?.nomComplet ||
                                    reply.nomComplet}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(
                                    reply.dateCommentaire,
                                  ).toLocaleDateString("fr-FR")}
                                </p>
                                <p className="text-muted-foreground">
                                  {reply.contenu}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <MessageCircle className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>Aucun commentaire pour cet article</p>
            </div>
          )}
        </CardContent>
      </Card>
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
