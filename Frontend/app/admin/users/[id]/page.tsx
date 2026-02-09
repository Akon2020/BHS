"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import {
  Pencil,
  ArrowLeft,
  BookOpen,
  Calendar,
  MessageSquare,
  Search,
} from "lucide-react";
import EditUserModal from "@/components/modals/edit-user-modal";
import { getSingleUser } from "@/actions/users";
import { User } from "@/types/user";

interface UIUser {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar?: string;
  lastLogin: string;
  createdAt: string;
  status: "active" | "pending";
}

export default function UserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = Number(params?.id);

  const [user, setUser] = useState<User | null>(null);
  const [uiUser, setUiUser] = useState<UIUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchBlogs, setSearchBlogs] = useState("");
  const [searchInscriptions, setSearchInscriptions] = useState("");
  const [searchComments, setSearchComments] = useState("");

  const fetchUser = async () => {
    try {
      setLoading(true);

      const response = await getSingleUser(id);

      const data: User = (response as any).user ?? response;

      if (!data) {
        throw new Error("Utilisateur introuvable");
      }

      setUser(data);

      const lastLogin = data.derniereConnexion
        ? new Date(data.derniereConnexion).toLocaleString()
        : "Jamais";

      const createdAt = data.createdAt
        ? new Date(data.createdAt).toLocaleDateString()
        : "-";

      setUiUser({
        id: data.idUtilisateur,
        name: data.nomComplet ?? "Utilisateur",
        email: data.email ?? "-",
        role: data.role,
        avatar: data.avatar
          ? `${process.env.NEXT_PUBLIC_API_URL}/${data.avatar}`
          : undefined,
        lastLogin,
        createdAt,
        status: data.derniereConnexion ? "active" : "pending",
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error?.message || "Impossible de charger l'utilisateur.",
        variant: "destructive",
      });
      router.push("/admin/users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(id)) {
      fetchUser();
    }
  }, [id]);

  const filteredBlogs = useMemo(() => {
    if (!user?.blogs) return [];
    const q = searchBlogs.toLowerCase();
    return user.blogs.filter((blog) => blog.titre.toLowerCase().includes(q));
  }, [user?.blogs, searchBlogs]);

  const filteredInscriptions = useMemo(() => {
    if (!user?.inscriptions) return [];
    const q = searchInscriptions.toLowerCase();
    return user.inscriptions.filter(
      (ins) =>
        (ins.nomComplet?.toLowerCase() || "").includes(q) ||
        (ins.email?.toLowerCase() || "").includes(q),
    );
  }, [user?.inscriptions, searchInscriptions]);

  const filteredComments = useMemo(() => {
    if (!user?.commentaires) return [];
    const q = searchComments.toLowerCase();
    return user.commentaires.filter((comment) =>
      (comment.contenu?.toLowerCase() || "").includes(q),
    );
  }, [user?.commentaires, searchComments]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-64 w-full rounded-md" />
      </div>
    );
  }

  if (!uiUser || !user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Profil de {uiUser.name}</h1>
        </div>
        <Button onClick={() => setIsEditModalOpen(true)}>
          <Pencil className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>

      {/* Identity Card */}
      <div className="flex gap-6 items-center">
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={uiUser.avatar || "/placeholder.svg"}
            alt={uiUser.name}
            className="object-cover"
          />
          <AvatarFallback>{uiUser.name?.charAt(0) ?? "?"}</AvatarFallback>
        </Avatar>

        <div>
          <p className="text-xl font-semibold">{uiUser.name}</p>
          <p className="text-sm text-muted-foreground">{uiUser.email}</p>

          <div className="flex gap-2 mt-2">
            <Badge variant="outline">
              {uiUser.role === "admin"
                ? "Administrateur"
                : uiUser.role === "editeur"
                  ? "Éditeur"
                  : "Membre"}
            </Badge>

            <Badge variant={uiUser.status === "active" ? "default" : "outline"}>
              {uiUser.status === "active" ? "Actif" : "En attente"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          label="Articles écrits"
          value={user.stats?.blogsEcrits ?? 0}
        />
        <StatCard
          icon={Calendar}
          label="Événements inscrits"
          value={user.stats?.evenementsInscrits ?? 0}
        />
        <StatCard
          icon={MessageSquare}
          label="Commentaires"
          value={user.stats?.commentairesEcrits ?? 0}
        />
        <StatCard
          icon={Pencil}
          label="Rôle"
          value={
            uiUser.role === "admin"
              ? "Administrateur"
              : uiUser.role === "editeur"
                ? "Éditeur"
                : "Membre"
          }
        />
      </div>

      {/* User Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm text-muted-foreground">Email</h2>
          <p>{uiUser.email}</p>
        </div>

        <div>
          <h2 className="text-sm text-muted-foreground">Rôle</h2>
          <p>
            {uiUser.role === "admin"
              ? "Administrateur"
              : uiUser.role === "editeur"
                ? "Éditeur"
                : "Membre"}
          </p>
        </div>

        <div>
          <h2 className="text-sm text-muted-foreground">Dernière connexion</h2>
          <p>{uiUser.lastLogin}</p>
        </div>

        <div>
          <h2 className="text-sm text-muted-foreground">Date de création</h2>
          <p>{uiUser.createdAt}</p>
        </div>
      </div>

      {/* Blogs Section */}
      {user.blogs && user.blogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Articles écrits ({user.stats?.blogsEcrits ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un article..."
                value={searchBlogs}
                onChange={(e) => setSearchBlogs(e.target.value)}
              />
            </div>

            <div className="space-y-3">
              {filteredBlogs.map((blog) => (
                <div
                  key={blog.idBlog}
                  className="flex items-center justify-between p-3 border rounded-md"
                >
                  <div className="flex-1">
                    <p className="font-medium">{blog.titre}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(blog.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge
                    variant={blog.statut === "publie" ? "default" : "outline"}
                  >
                    {blog.statut === "publie" ? "Publié" : "Brouillon"}
                  </Badge>
                </div>
              ))}
              {filteredBlogs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Aucun article trouvé
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Inscriptions Section */}
      {user.inscriptions && user.inscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Événements inscrits ({user.stats?.evenementsInscrits ?? 0})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un événement..."
                value={searchInscriptions}
                onChange={(e) => setSearchInscriptions(e.target.value)}
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="p-3 text-left">Événement</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Téléphone</th>
                    <th className="p-3 text-left">Statut</th>
                    <th className="p-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredInscriptions.map((ins) => (
                    <tr key={ins.idInscription} className="border-b">
                      <td className="p-3">{ins.nomComplet}</td>
                      <td className="p-3">{ins.email}</td>
                      <td className="p-3">{ins.telephone || "-"}</td>
                      <td className="p-3">
                        <Badge
                          variant={
                            ins.statut === "confirme"
                              ? "default"
                              : ins.statut === "en_attente"
                                ? "outline"
                                : "secondary"
                          }
                        >
                          {ins.statut === "confirme"
                            ? "Confirmée"
                            : ins.statut === "en_attente"
                              ? "En attente"
                              : "Annulée"}
                        </Badge>
                      </td>
                      <td className="p-3">
                        {new Date(ins.dateInscription).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {filteredInscriptions.length === 0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-3 text-center text-muted-foreground"
                      >
                        Aucune inscription trouvée
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Comments Section */}
      {user.commentaires && user.commentaires.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Commentaires ({user.stats?.commentairesEcrits ?? 0})
            </CardTitle>
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

            <div className="space-y-3">
              {filteredComments.map((comment) => (
                <div
                  key={comment.idCommentaire}
                  className="p-3 border rounded-md"
                >
                  <p className="text-sm">{comment.contenu}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {comment.dateCommentaire
                      ? new Date(comment.dateCommentaire).toLocaleString()
                      : "Date inconnue"}
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

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={uiUser}
        onSuccess={fetchUser}
      />
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
