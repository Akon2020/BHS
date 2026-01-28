"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { Pencil } from "lucide-react";
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
  const id = Number(params?.id);

  const [user, setUser] = useState<UIUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchUser = async () => {
    try {
      setLoading(true);

      const response = await getSingleUser(id);

      const data: User = (response as any).user ?? response;

      if (!data) {
        throw new Error("Utilisateur introuvable");
      }

      const lastLogin = data.derniereConnexion
        ? new Date(data.derniereConnexion).toLocaleString()
        : "Jamais";

      const createdAt = data.createdAt
        ? new Date(data.createdAt).toLocaleDateString()
        : "-";

      setUser({
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
        description:
          error?.message || "Impossible de charger l'utilisateur.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(id)) {
      fetchUser();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-56" />
        <Skeleton className="h-64 w-full rounded-md" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Profil de {user.name}
        </h1>
        <Button onClick={() => setIsEditModalOpen(true)}>
          <Pencil className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>

      {/* Identity */}
      <div className="flex gap-6 items-center">
        <Avatar className="h-20 w-20">
          <AvatarImage
            src={user.avatar || "/placeholder.svg"}
            alt={user.name}
            className="object-cover"
          />
          <AvatarFallback>
            {user.name?.charAt(0) ?? "?"}
          </AvatarFallback>
        </Avatar>

        <div>
          <p className="text-xl font-semibold">{user.name}</p>
          <p className="text-sm text-muted-foreground">{user.email}</p>

          <div className="flex gap-2 mt-2">
            <Badge variant="outline">
              {user.role === "admin"
                ? "Administrateur"
                : user.role === "editeur"
                ? "Éditeur"
                : "Membre"}
            </Badge>

            <Badge
              variant={user.status === "active" ? "default" : "outline"}
            >
              {user.status === "active" ? "Actif" : "En attente"}
            </Badge>
          </div>
        </div>
      </div>

      {/* Infos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h2 className="text-sm text-muted-foreground">Email</h2>
          <p>{user.email}</p>
        </div>

        <div>
          <h2 className="text-sm text-muted-foreground">Rôle</h2>
          <p>{user.role}</p>
        </div>

        <div>
          <h2 className="text-sm text-muted-foreground">
            Dernière connexion
          </h2>
          <p>{user.lastLogin}</p>
        </div>

        <div>
          <h2 className="text-sm text-muted-foreground">
            Date de création
          </h2>
          <p>{user.createdAt}</p>
        </div>
      </div>

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSuccess={fetchUser}
      />
    </div>
  );
}
