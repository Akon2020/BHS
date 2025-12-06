import { Calendar, MapPin, Clock } from "lucide-react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Événements - Burning Heart",
  description: "Découvrez nos événements et activités à venir",
}

const events = [
  {
    title: "Retraite Spirituelle d'Été",
    date: "15-17 Juin 2025",
    time: "Toute la journée",
    location: "Centre de retraite Kahuzi",
    description:
      "Trois jours de prière, de méditation et de communion fraternelle dans un cadre paisible pour renouveler votre foi.",
    category: "Retraite",
  },
  {
    title: "Conférence: La Puissance de la Prière",
    date: "22 Juin 2025",
    time: "14h00 - 17h00",
    location: "Église Burning Heart",
    description:
      "Conférence inspirante sur l'importance de la prière dans la vie quotidienne avec des témoignages puissants.",
    category: "Conférence",
  },
  {
    title: "Soirée de Louange",
    date: "29 Juin 2025",
    time: "18h00 - 21h00",
    location: "Église Burning Heart",
    description: "Une soirée dédiée à la louange et à l'adoration avec la participation de plusieurs groupes musicaux.",
    category: "Louange",
  },
  {
    title: "Camp de Jeunes",
    date: "5-10 Juillet 2025",
    time: "Semaine complète",
    location: "Campement Lac Kivu",
    description: "Une semaine d'activités spirituelles et récréatives pour les jeunes de 12 à 25 ans.",
    category: "Jeunesse",
  },
  {
    title: "Journée de Jeûne et Prière",
    date: "15 Juillet 2025",
    time: "06h00 - 18h00",
    location: "Église Burning Heart",
    description: "Consacrez une journée entière au jeûne et à la prière pour rechercher la face de Dieu.",
    category: "Prière",
  },
  {
    title: "Séminaire sur la Famille",
    date: "20 Juillet 2025",
    time: "09h00 - 16h00",
    location: "Église Burning Heart",
    description: "Enseignements pratiques sur la vie de famille selon les principes bibliques.",
    category: "Séminaire",
  },
]

export default function EventsPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">Événements</h1>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
              Participez à nos événements spirituels et renforcez votre foi en communauté
            </p>
          </div>
        </div>
      </section>

      {/* Events List */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-2">
            {events.map((event) => (
              <Card key={event.title} className="border-none bg-card shadow-sm">
                <CardHeader>
                  <div className="inline-flex self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    {event.category}
                  </div>
                  <h3 className="mt-4 font-serif text-xl font-bold">{event.title}</h3>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground leading-relaxed">{event.description}</p>
                  <div className="space-y-2 border-t pt-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>{event.date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-primary" />
                      <span>{event.time}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                  <Button className="w-full">S'inscrire</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
