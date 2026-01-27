"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Eye, Edit, Trash, Send } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Exemple de données de newsletters
const newsletters = [
  {
    id: 1,
    title: "Bienvenue dans notre communauté",
    subject: "Bienvenue chez Burning Heart",
    date: "10 Mai 2025",
    status: "sent",
    recipients: 573,
    openRate: "45%",
  },
  {
    id: 2,
    title: "Événements du mois de juin",
    subject: "Ne manquez pas nos événements de juin!",
    date: "2 Mai 2025",
    status: "sent",
    recipients: 568,
    openRate: "38%",
  },
  {
    id: 3,
    title: "Préparation pour la retraite spirituelle",
    subject: "Informations importantes pour la retraite",
    date: "25 Avril 2025",
    status: "draft",
    recipients: 0,
    openRate: "-",
  },
  {
    id: 4,
    title: "Témoignages inspirants de notre communauté",
    subject: "Des histoires qui touchent le cœur",
    date: "18 Avril 2025",
    status: "scheduled",
    recipients: 570,
    openRate: "-",
    scheduledDate: "20 Mai 2025",
  },
  {
    id: 5,
    title: "Résumé de la conférence annuelle",
    subject: "Les moments forts de notre conférence",
    date: "10 Avril 2025",
    status: "sent",
    recipients: 565,
    openRate: "52%",
  },
]

export default function NewsletterAdminPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  // Filtrer les newsletters en fonction de la recherche et des filtres
  const filteredNewsletters = newsletters.filter((newsletter) => {
    const matchesSearch =
      newsletter.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      newsletter.subject.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || newsletter.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Newsletters</h1>
        <Button asChild>
          <Link href="/admin/newsletter/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouvelle newsletter
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher une newsletter..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="sent">Envoyé</SelectItem>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="scheduled">Programmé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Newsletters Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Newsletter</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Destinataires</TableHead>
              <TableHead>Taux d'ouverture</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredNewsletters.map((newsletter) => (
              <TableRow key={newsletter.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{newsletter.title}</p>
                    <p className="text-sm text-muted-foreground">{newsletter.subject}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {newsletter.status === "scheduled"
                        ? `Programmé pour: ${newsletter.scheduledDate}`
                        : `Créé le: ${newsletter.date}`}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      newsletter.status === "sent"
                        ? "default"
                        : newsletter.status === "scheduled"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {newsletter.status === "sent"
                      ? "Envoyé"
                      : newsletter.status === "scheduled"
                        ? "Programmé"
                        : "Brouillon"}
                  </Badge>
                </TableCell>
                <TableCell>{newsletter.recipients}</TableCell>
                <TableCell>{newsletter.openRate}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/newsletter/${newsletter.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Voir</span>
                      </Link>
                    </Button>
                    {newsletter.status === "draft" && (
                      <>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/newsletter/${newsletter.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Modifier</span>
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" className="text-primary">
                          <Send className="h-4 w-4" />
                          <span className="sr-only">Envoyer</span>
                        </Button>
                      </>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    >
                      <Trash className="h-4 w-4" />
                      <span className="sr-only">Supprimer</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Affichage de <strong>1</strong> à <strong>{filteredNewsletters.length}</strong> sur{" "}
          <strong>{newsletters.length}</strong> newsletters
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
    </div>
  )
}
