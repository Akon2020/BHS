"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Eye, Edit, Trash } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DeleteConfirmationModal from "@/components/modals/delete-confirmation-modal"
import { toast } from "@/components/ui/use-toast"

import { getAllEventsAdmin, deleteEvent } from "@/actions/event"
import type { Evenement } from "@/types/user"

export default function EventsAdminPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [eventsList, setEventsList] = useState<Evenement[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Evenement | null>(null)


  const fetchEvents = async () => {
    try {
      setIsLoading(true)
      const res = await getAllEventsAdmin({ statut: statusFilter !== "all" ? statusFilter : undefined })
      setEventsList(res.events)
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de charger les événements",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [statusFilter])

  const filteredEvents = eventsList.filter((event) => {
    const q = searchQuery.toLowerCase()

    const matchesSearch =
      event.titre.toLowerCase().includes(q) ||
      event.description.toLowerCase().includes(q) ||
      event.lieu.toLowerCase().includes(q)

    return matchesSearch
  })

  const handleDeleteEvent = (event: Evenement) => {
    setSelectedEvent(event)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteEvent = async () => {
    if (!selectedEvent) return

    try {
      await deleteEvent(selectedEvent.idEvenement)

      setEventsList((prev) =>
        prev.filter((event) => event.idEvenement !== selectedEvent.idEvenement)
      )

      toast({
        title: "Événement supprimé",
        description: `L'événement "${selectedEvent.titre}" a été supprimé avec succès.`,
      })
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de supprimer l'événement",
        variant: "destructive",
      })
    } finally {
      setIsDeleteModalOpen(false)
      setSelectedEvent(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gestion des Événements</h1>
        <Button asChild>
          <Link href="/admin/events/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouvel événement
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Rechercher un événement..."
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
              <SelectItem value="publie">Publié</SelectItem>
              <SelectItem value="brouillon">Brouillon</SelectItem>
              <SelectItem value="annule">Annulé</SelectItem>
              <SelectItem value="termine">Terminé</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Events Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Événement</TableHead>
              <TableHead>Date & Heure</TableHead>
              <TableHead>Lieu</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Participants</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : filteredEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  Aucun événement trouvé
                </TableCell>
              </TableRow>
            ) : (
              filteredEvents.map((event) => (
                <TableRow key={event.idEvenement}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{event.titre}</p>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {event.description}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{new Date(event.dateEvenement).toLocaleDateString()}</p>
                      <p className="text-sm text-muted-foreground">
                        {event.heureDebut} - {event.heureFin}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>{event.lieu}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        event.statut === "publie"
                          ? "default"
                          : event.statut === "termine"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {event.statut === "publie"
                        ? "Publié"
                        : event.statut === "brouillon"
                        ? "Brouillon"
                        : event.statut === "annule"
                        ? "Annulé"
                        : "Terminé"}
                    </Badge>
                  </TableCell>
                  <TableCell>{event.nombreInscrits}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/events/view/${event.idEvenement}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir</span>
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/events/edit/${event.idEvenement}`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Modifier</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={() => handleDeleteEvent(event)}
                      >
                        <Trash className="h-4 w-4" />
                        <span className="sr-only">Supprimer</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination (UI inchangé pour l’instant) */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Affichage de <strong>1</strong> à <strong>{filteredEvents.length}</strong> sur{" "}
          <strong>{eventsList.length}</strong> événements
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

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDeleteEvent}
        title="Supprimer l'événement"
        description={`Êtes-vous sûr de vouloir supprimer l'événement "${selectedEvent?.titre}" ? Cette action est irréversible.`}
      />
    </div>
  )
}
