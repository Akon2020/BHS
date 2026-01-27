"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MoreHorizontal,
  Plus,
  Filter,
  Pencil,
  Trash,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import AddUserModal from "@/components/modals/add-user-modal";
import EditUserModal from "@/components/modals/edit-user-modal";
import DeleteConfirmationModal from "@/components/modals/delete-confirmation-modal";
import { toast } from "@/components/ui/use-toast";


export default function UsersPage() {
  const [usersList, setUsersList] = useState<any[]>([]);
  const [nombreUsers, setNombreUsers] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get("/api/users");
      const { usersInfo, nombre } = response.data;
      setUsersList(
        usersInfo.map((u: any) => {
          const lastLogin = u.derniereConnexion
            ? new Date(u.derniereConnexion).toLocaleString()
            : "Jamais";

          const createdAt = new Date(u.createdAt).toLocaleString()

          const status = lastLogin === "Jamais" ? "pending" : "active";

          return {
            id: u.idUtilisateur,
            name: u.nomComplet,
            email: u.email,
            role: u.role,
            avatar: `${process.env.NEXT_PUBLIC_API_URL}/${u.avatar}`,
            lastLogin,
            createdAt,
            status,
          };
        })
      );

      setNombreUsers(nombre);
    } catch (err) {
      console.error("Erreur lors du chargement des utilisateurs :", err);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  
  const filteredUsers = usersList.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => setIsAddModalOpen(true);
  const handleEditUser = (user: any) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };
  const handleDeleteUser = (user: any) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };
  const confirmDeleteUser = async () => {
    try {
      await api.delete(`/api/users/delete/${selectedUser.id}`);
      setUsersList(usersList.filter((u) => u.id !== selectedUser.id));
      toast({
        title: "Utilisateur supprimé",
        description: `L'utilisateur ${selectedUser.name} a été supprimé.`,
      });
    } catch {
      toast({
        title: "Erreur",
        description: "La suppression a échoué.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Utilisateurs</h1>
        <Button onClick={handleAddUser}>
          <Plus className="h-4 w-4 mr-2" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un utilisateur..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtres
        </Button>
      </div>

      {/* Users Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Utilisateur</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Dernière connexion</TableHead>
              <TableHead>Enregistré(e) le</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-6">
                  <Loader2 className="animate-spin h-8 w-8 mx-auto text-red-700" />
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage
                          src={user.avatar || "/placeholder.svg"}
                          alt={user.name}
                        />
                        <AvatarFallback>
                          {user.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {user.role === "admin"
                        ? "Administrateur"
                        : user.role === "editeur"
                        ? "Éditeur"
                        : "Membre"}
                    </Badge>
                  </TableCell>
                  <TableCell>
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
                  </TableCell>
                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell>{user.createdAt}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Actions</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin/users/${user.id}`}>
                            Voir le profil
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditUser(user)}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() => handleDeleteUser(user)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Affichage de <strong>1</strong> à{" "}
          <strong>{filteredUsers.length}</strong> sur{" "}
          <strong>{nombreUsers}</strong> utilisateurs
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Précédent
          </Button>
          <Button variant="outline" size="sm">
            1
          </Button>
          <Button variant="outline" size="sm">
            Suivant
          </Button>
        </div>
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchUsers}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={selectedUser}
        onSuccess={fetchUsers}
      />

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteUser}
        title="Supprimer l'utilisateur"
        description={`Êtes-vous sûr de vouloir supprimer l'utilisateur ${selectedUser?.name} ? Cette action est irréversible.`}
      />
    </div>
  );
}
