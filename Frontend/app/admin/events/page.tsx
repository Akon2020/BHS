"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Eye, Edit, Trash } from "lucide-react"
import Link from "next/link"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DeleteConfirmationModal from "@/components/modals/delete-confirmation-modal"
import { toast } from "@/components/ui/use-toast"

// Exemple de données d'événements
const events = [
  {
    id: 1,
    title: "Conférence Annuelle",
    description: "Notre conférence annuelle avec des intervenants de renom.",
    date: "15 Juin 2025",
    time: "18:00 - 21:00",
    location: "Salle Principale",
    status: "upcoming",
    attendees: 120,
  },
  {
    id: 2,
    title: "Retraite Spirituelle",
    description: "Un weekend de ressourcement spirituel et de communion fraternelle.",
    date: "10-12 Juillet 2025",
    time: "Tout le weekend",
    location: "Centre de retraite",
    status: "upcoming",
    attendees: 45,
  },
  {
    id: 3,
    title: "Concert de Louange",
    description: "Une soirée de louange avec notre équipe de musiciens.",
    date: "5 Août 2025",
    time: "19:30 - 22:00",
    location: "Auditorium",
    status: "upcoming",
    attendees: 200,
  },
  {
    id: 4,
    title: "Journée des Familles",
    description: "Une journée spéciale dédiée aux familles avec des activités pour tous les âges.",
    date: "20 Mai 2025",
    time: "10:00 - 17:00",
    location: "Parc municipal",
    status: "draft",
    attendees: 0,
  },
  {
    id: 5,
    title: "Étude Biblique Spéciale",
    description: "Une étude approfondie sur le livre des Actes.",
    date: "12 Avril 2025",
    time: "19:00 - 21:00",
    location: "Salle d'étude",
    status: "past",
    attendees: 35,
  },
]

export default function EventsAdminPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [eventsList, setEventsList] = useState(events)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  // Filtrer les événements en fonction de la recherche et des filtres
  const filteredEvents = eventsList.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || event.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleDeleteEvent = (event: any) => {
    setSelectedEvent(event)
    setIsDeleteModalOpen(true)
  }

  const confirmDeleteEvent = async () => {
    // Simuler un appel API
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Supprimer l'événement de la liste
    setEventsList(eventsList.filter((event) => event.id !== selectedEvent.id))

    toast({
      title: "Événement supprimé",
      description: `L'événement "${selectedEvent.title}" a été supprimé avec succès.`,
    })
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
              <SelectItem value="upcoming">À venir</SelectItem>
              <SelectItem value="past">Passé</SelectItem>
              <SelectItem value="draft">Brouillon</SelectItem>
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
            {filteredEvents.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground line-clamp-1">{event.description}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p>{event.date}</p>
                    <p className="text-sm text-muted-foreground">{event.time}</p>
                  </div>
                </TableCell>
                <TableCell>{event.location}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      event.status === "upcoming" ? "default" : event.status === "past" ? "secondary" : "outline"
                    }
                  >
                    {event.status === "upcoming" ? "À venir" : event.status === "past" ? "Passé" : "Brouillon"}
                  </Badge>
                </TableCell>
                <TableCell>{event.attendees}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/events/${event.id}`}>
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Voir</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/events/${event.id}/edit`}>
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
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
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
        description={`Êtes-vous sûr de vouloir supprimer l'événement "${selectedEvent?.title}" ? Cette action est irréversible.`}
      />
    </div>
  )
}
