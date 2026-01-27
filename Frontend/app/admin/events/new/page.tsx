"use client"

import { Badge } from "@/components/ui/badge"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Save, ImageIcon, Upload, Calendar, Clock, MapPin } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { Switch } from "@/components/ui/switch"

export default function NewEventPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [date, setDate] = useState<Date>()
  const [eventData, setEventData] = useState({
    title: "",
    description: "",
    time: "",
    endTime: "",
    location: "",
    maxAttendees: "",
    requiresRegistration: false,
    image: null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEventData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setEventData((prev) => ({ ...prev, requiresRegistration: checked }))
  }

  const handleSubmit = async (status: "draft" | "published") => {
    if (!eventData.title || !eventData.description || !date || !eventData.time || !eventData.location) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simuler un appel API
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Simuler l'envoi d'emails si l'événement est publié
      if (status === "published") {
        // Ceci serait un appel à l'API dans un environnement réel
        // await sendEventPublishedEmail(subscribers, eventData)
      }

      toast({
        title: status === "published" ? "Événement publié!" : "Brouillon enregistré!",
        description:
          status === "published"
            ? "Votre événement a été publié avec succès."
            : "Votre brouillon a été enregistré avec succès.",
      })

      router.push("/admin/events")
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/events">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Nouvel Événement</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSubmit("draft")} disabled={isLoading}>
            Enregistrer comme brouillon
          </Button>
          <Button onClick={() => handleSubmit("published")} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Publier
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Titre <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Titre de l'événement"
                    value={eventData.title}
                    onChange={handleChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Description détaillée de l'événement"
                    rows={5}
                    value={eventData.description}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Date et Heure</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>
                    Date <span className="text-red-500">*</span>
                  </Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <Calendar className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: fr }) : "Sélectionner une date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <CalendarComponent mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="time">
                      Heure de début <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input id="time" name="time" type="time" value={eventData.time} onChange={handleChange} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime">Heure de fin</Label>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                      <Input
                        id="endTime"
                        name="endTime"
                        type="time"
                        value={eventData.endTime}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Lieu</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="location">
                    Adresse ou nom du lieu <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                    <Input
                      id="location"
                      name="location"
                      placeholder="Ex: Salle principale, 123 Avenue Maison"
                      value={eventData.location}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Paramètres</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="maxAttendees">Nombre maximum de participants</Label>
                  <Input
                    id="maxAttendees"
                    name="maxAttendees"
                    type="number"
                    placeholder="Laisser vide si pas de limite"
                    value={eventData.maxAttendees}
                    onChange={handleChange}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="requiresRegistration">Inscription requise</Label>
                  <Switch
                    id="requiresRegistration"
                    checked={eventData.requiresRegistration}
                    onCheckedChange={handleSwitchChange}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Image de l'événement</h3>

              <div className="border-2 border-dashed rounded-md p-6 text-center">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Glissez-déposez une image ou cliquez pour parcourir
                </p>
                <p className="text-xs text-muted-foreground mb-4">PNG, JPG ou GIF. Taille recommandée 1200x600px.</p>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Parcourir
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-4">Notification</h3>

              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Lorsque vous publiez un événement, une notification est automatiquement envoyée à tous les abonnés de
                  la newsletter.
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Nombre d'abonnés</span>
                  <Badge>573</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
