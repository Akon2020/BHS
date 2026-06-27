"use client";

import { useEffect, useMemo, useState } from "react";
import { getAllEquipes, deleteEquipe } from "@/actions/equipe";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Plus, Eye, Edit, Trash, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "@/components/ui/use-toast";

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  image?: string;
  order: number;
}

export default function TeamAdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [totalMembers, setTotalMembers] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [deletingMemberId, setDeletingMemberId] = useState<number | null>(null);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await getAllEquipes();
      const mappedMembers: TeamMember[] = response.equipes.map((member) => ({
        id: member.idEquipe,
        name: member.nomComplet,
        role: member.fonction,
        bio: member.biographie || "",
        image: member.photoProfil
          ? `${process.env.NEXT_PUBLIC_API_URL}/${member.photoProfil}`
          : undefined,
        order: member.ordre ?? 0,
      }));

      setTeamMembers(mappedMembers);
      setTotalMembers(response.total);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description:
          error.message || "Impossible de charger les membres de l'équipe.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const handleDeleteMember = async (member: TeamMember) => {
    try {
      setDeletingMemberId(member.id);
      const result = await deleteEquipe(member.id);
      setTeamMembers((prev) => prev.filter((item) => item.id !== member.id));
      setTotalMembers((prev) => Math.max(0, prev - 1));
      toast({
        title: "Membre supprimé",
        description: result.message,
      });
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer ce membre.",
        variant: "destructive",
      });
    } finally {
      setDeletingMemberId(null);
    }
  };

  const filteredMembers = useMemo(
    () =>
      [...teamMembers]
        .filter(
          (member) =>
            member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            member.role.toLowerCase().includes(searchQuery.toLowerCase()),
        )
        .sort((a, b) => a.order - b.order),
    [teamMembers, searchQuery],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold sm:text-3xl">Gestion de l'Équipe</h1>
        <Button asChild>
          <Link href="/admin/team/new">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un membre
          </Link>
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Rechercher un membre..."
          className="pl-8"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <p className="text-sm text-muted-foreground">
        {filteredMembers.length} sur {totalMembers} membres
      </p>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center">
            <div className="text-center py-6">
              <Loader2 className="animate-spin h-10 w-10 mx-auto text-red-700" />
            </div>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="col-span-full rounded-lg border border-dashed p-10 text-center text-muted-foreground">
            Aucun membre trouvé.
          </div>
        ) : (
          filteredMembers.map((member) => (
            <Card key={member.id} className="overflow-hidden">
              <div className="relative h-64 w-full">
                <Image
                  src={member.image || "/placeholder.svg"}
                  alt={member.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent flex flex-col justify-end p-4 text-white">
                  <h3 className="text-xl font-bold">{member.name}</h3>
                  <p>{member.role}</p>
                </div>
              </div>
              <CardContent className="p-4">
                <p className="text-muted-foreground line-clamp-2 mb-4">
                  {member.bio}
                </p>
                <div className="flex justify-between">
                  <div className="text-sm text-muted-foreground">
                    Ordre d'affichage: {member.order}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/team/${member.id}/view`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Voir</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/team/${member.id}/edit`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Modifier</span>
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={deletingMemberId === member.id}
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                      onClick={() => handleDeleteMember(member)}
                    >
                      {deletingMemberId === member.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="h-4 w-4" />
                      )}
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
