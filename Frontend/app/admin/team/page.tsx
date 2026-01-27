"use client"

import { useEffect, useState } from "react";
import api from "@/lib/axios"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Plus, Edit, Trash, Loader2, } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function TeamAdminPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [nombreUsers, setNombreUsers] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get("/api/equipes");
        const { equipes, total } = response.data;
        setTeamMembers(
          equipes.map((u: any) => {
            const createdAt = new Date(u.createdAt).toLocaleString()

            return {
              id: u.idEquipe,
              name: u.nomComplet,
              role: u.fonction,
              bio: u.biographie,
              image: `${process.env.NEXT_PUBLIC_API_URL}/${u.photoProfil}`,
              order: u.ordre,
            };
          })
        );
        setNombreUsers(total);
      } catch (err) {
        console.error("Erreur lors du chargement des membres :", err);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredMembers = teamMembers
    .filter(
      (member) =>
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        member.role.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => a.order - b.order)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion de l'Équipe</h1>
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

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="text-center py-6">
              <Loader2 className="animate-spin h-10 w-10 mx-auto text-red-700" />
            </div>
          </div>
        ): (filteredMembers.map((member) => (
          <Card key={member.id} className="overflow-hidden">
            <div className="relative h-64 w-full">
              <Image src={member.image || "/placeholder.svg"} alt={member.name} fill className="object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-4 text-white">
                <h3 className="text-xl font-bold">{member.name}</h3>
                <p>{member.role}</p>
              </div>
            </div>
            <CardContent className="p-4">
              <p className="text-muted-foreground line-clamp-2 mb-4">{member.bio}</p>
              <div className="flex justify-between">
                <div className="text-sm text-muted-foreground">Ordre d'affichage: {member.order}</div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/team/${member.id}/edit`}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Modifier</span>
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                  >
                    <Trash className="h-4 w-4" />
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
  )
}
