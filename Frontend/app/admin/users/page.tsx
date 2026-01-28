"use client";

import { useEffect, useState } from "react";
import { getAllUsers, deleteUser } from "@/actions/users";
import { User } from "@/types/user";
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

export default function UsersPage() {
  const [users, setUsers] = useState<UIUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UIUser | null>(null);
  const [modals, setModals] = useState({
    add: false,
    edit: false,
    delete: false,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { usersInfo, nombre } = await getAllUsers();

      const mapped: UIUser[] = usersInfo.map((u: User) => ({
        id: u.idUtilisateur,
        name: u.nomComplet,
        email: u.email,
        role: u.role,
        avatar: u.avatar
          ? `${process.env.NEXT_PUBLIC_API_URL}/${u.avatar}`
          : undefined,
        lastLogin: u.derniereConnexion
          ? new Date(u.derniereConnexion).toLocaleString()
          : "Jamais",
        createdAt: new Date(u.createdAt).toLocaleString(),
        status: u.derniereConnexion ? "active" : "pending",
      }));

      setUsers(mapped);
      setTotal(nombre);
    } catch {
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

  const confirmDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
      toast({
        title: "Utilisateur supprimé",
        description: `${selectedUser.name} a été supprimé.`,
      });
    } catch {
      toast({
        title: "Erreur",
        description: "La suppression a échoué.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Utilisateurs</h1>
        <Button onClick={() => setModals({ ...modals, add: true })}>
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  <Loader2 className="animate-spin h-8 w-8 mx-auto text-red-700" />
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} className="object-cover" />
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
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>

                  <TableCell>
                    <Badge
                      variant={
                        user.status === "active" ? "default" : "outline"
                      }
                    >
                      {user.status === "active" ? "Actif" : "En attente"}
                    </Badge>
                  </TableCell>

                  <TableCell>{user.lastLogin}</TableCell>
                  <TableCell>{user.createdAt}</TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
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
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user);
                            setModals({ ...modals, edit: true });
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-500 focus:text-red-500"
                          onClick={() => {
                            setSelectedUser(user);
                            setModals({ ...modals, delete: true });
                          }}
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
          <strong>{total}</strong> utilisateurs
        </p>
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={modals.add}
        onClose={() => setModals({ ...modals, add: false })}
        onSuccess={fetchUsers}
      />

      <EditUserModal
        isOpen={modals.edit}
        onClose={() => setModals({ ...modals, edit: false })}
        user={selectedUser}
        onSuccess={fetchUsers}
      />

      <DeleteConfirmationModal
        isOpen={modals.delete}
        onClose={() => setModals({ ...modals, delete: false })}
        onConfirm={confirmDelete}
        title="Supprimer l'utilisateur"
        description={`Êtes-vous sûr de vouloir supprimer ${selectedUser?.name} ? Cette action est irréversible.`}
      />
    </div>
  );
}
