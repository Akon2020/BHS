"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import api from "@/lib/axios"
import { toast } from "@/components/ui/use-toast"
import { Pencil } from "lucide-react"
import EditUserModal from "@/components/modals/edit-user-modal"
import { getSingleUser } from "@/actions/users";


export default function UserDetailsPage() {
  const id = useParams()?.id?.toString()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const fetchUser = async () => {
    try {
      const response = await api.get(`/api/users/${id}`)
      const data = response.data
      const lastLogin = data.derniereConnexion
        ? new Date(data.derniereConnexion).toLocaleString()
        : "Jamais"
      const status = lastLogin === "Jamais" ? "pending" : "active"

      setUser({
        id: data.idUtilisateur,
        name: data.nomComplet,
        email: data.email,
        role: data.role,
        avatar: `${process.env.NEXT_PUBLIC_API_URL}/${data.avatar}`,
        lastLogin,
        status,
        createdAt: new Date(data.createdAt).toLocaleDateString(),
      })
    } catch (err) {
      console.error(err)
      toast({
        title: "Erreur",
        description: "Impossible de charger l'utilisateur.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchUser()
  }, [id])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full rounded-md" />
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Profil de {user.name}</h1>
        <Button onClick={() => setIsEditModalOpen(true)}>
          <Pencil className="h-4 w-4 mr-2" />
          Modifier
        </Button>
      </div>

      <div className="flex gap-6 items-center">
        <Avatar className="h-20 w-20">
          <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
          <AvatarFallback>{user?.name?.charAt(0) || "?"}</AvatarFallback>
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
              variant={
                user.status === "active"
                  ? "default"
                  : user.status === "pending"
                  ? "outline"
                  : "secondary"
              }
            >
              {user.status === "active"
                ? "Actif"
                : user.status === "pending"
                ? "En attente"
                : "Inactif"}
            </Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <h2 className="font-medium text-muted-foreground mb-1">Email</h2>
          <p>{user.email}</p>
        </div>
        <div>
          <h2 className="font-medium text-muted-foreground mb-1">Rôle</h2>
          <p>{user.role}</p>
        </div>
        <div>
          <h2 className="font-medium text-muted-foreground mb-1">Dernière connexion</h2>
          <p>{user.lastLogin}</p>
        </div>
        <div>
          <h2 className="font-medium text-muted-foreground mb-1">Date de création</h2>
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
  )
}
