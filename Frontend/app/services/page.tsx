import { Book, Users, Heart, Music, Baby, HandHeart } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata = {
  title: "Services - Burning Heart",
  description: "Découvrez nos services et activités spirituelles",
}

const services = [
  {
    icon: Heart,
    title: "Cultes Dominicaux",
    description:
      "Rejoignez-nous chaque dimanche pour des moments de louange, de prière et d'enseignement biblique enrichissant.",
    schedule: "Dimanche 9h00 - 12h00",
  },
  {
    icon: Book,
    title: "Études Bibliques",
    description:
      "Approfondissez votre connaissance des Écritures à travers des sessions d'étude interactives et enrichissantes.",
    schedule: "Mercredi 18h00 - 20h00",
  },
  {
    icon: Users,
    title: "Groupes de Prière",
    description: "Participez à des moments de prière collective pour fortifier votre foi et celle de la communauté.",
    schedule: "Vendredi 17h00 - 19h00",
  },
  {
    icon: Music,
    title: "Louange et Adoration",
    description: "Exprimez votre amour pour Dieu à travers la musique et le chant dans une atmosphère de célébration.",
    schedule: "Dimanche 16h00 - 18h00",
  },
  {
    icon: Baby,
    title: "École du Dimanche",
    description:
      "Programme d'enseignement biblique adapté aux enfants pour les aider à grandir dans la foi dès leur plus jeune âge.",
    schedule: "Dimanche 9h00 - 11h00",
  },
  {
    icon: HandHeart,
    title: "Conseil Spirituel",
    description: "Bénéficiez d'un accompagnement personnalisé pour vos questions spirituelles et vos défis personnels.",
    schedule: "Sur rendez-vous",
  },
]

export default function ServicesPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">Nos Services</h1>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
              Découvrez les différentes activités et services que nous proposons pour vous accompagner dans votre
              cheminement spirituel
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Card key={service.title} className="border-none bg-card shadow-sm">
                <CardHeader>
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <service.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">{service.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground leading-relaxed">{service.description}</p>
                  <div className="mt-4 rounded-md bg-muted/50 px-3 py-2">
                    <p className="text-xs font-medium text-muted-foreground">{service.schedule}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-serif text-3xl font-bold">Vous souhaitez en savoir plus?</h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              N'hésitez pas à nous contacter pour toute question sur nos services ou pour organiser une visite
            </p>
            <div className="mt-8">
              <a
                href="/contact"
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Nous contacter
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
