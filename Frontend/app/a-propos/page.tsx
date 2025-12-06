import { Heart, Target, Users, Book } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

export const metadata = {
  title: "À propos - Burning Heart",
  description: "Découvrez notre histoire, notre mission et nos valeurs",
}

export default function AboutPage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl">À propos de Burning Heart</h1>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
              Pèlerins avec le Christ - Une communauté dédiée à raviver la flamme de l'espérance dans vos cœurs
            </p>
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="font-serif text-3xl font-bold">Notre Histoire</h2>
            <div className="mt-6 space-y-4 text-pretty leading-relaxed text-muted-foreground">
              <p>
                Burning Heart est née d'une vision : créer un espace où chaque personne peut grandir spirituellement,
                trouver du soutien et discerner la volonté de Dieu dans sa vie.
              </p>
              <p>
                Basée à Bukavu en République Démocratique du Congo, notre communauté rassemble des croyants de tous
                horizons unis par leur désir de vivre pleinement leur foi et d'approfondir leur relation avec le Christ.
              </p>
              <p>
                À travers nos services, nos événements et nos ressources bibliques, nous accompagnons chacun dans son
                cheminement spirituel, créant un environnement propice à la croissance personnelle et collective.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-muted/30 py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center">
            <h2 className="font-serif text-3xl font-bold">Nos Valeurs</h2>
            <p className="mt-4 text-pretty text-muted-foreground">Les principes qui guident notre communauté</p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="border-none bg-card">
              <CardContent className="p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">Foi</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Une confiance profonde en Dieu et en sa parole
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-card">
              <CardContent className="p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">Communauté</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Un esprit de fraternité et d'entraide
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-card">
              <CardContent className="p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Book className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">Enseignement</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  L'importance de la connaissance biblique
                </p>
              </CardContent>
            </Card>

            <Card className="border-none bg-card">
              <CardContent className="p-6 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Target className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-4 font-semibold">Mission</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                  Partager l'amour du Christ avec tous
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-bold">Notre Mission</h2>
            <p className="mt-6 text-pretty text-lg leading-relaxed text-muted-foreground">
              Raviver la flamme de l'espérance dans les cœurs, accompagner chaque personne dans son cheminement
              spirituel et créer une communauté fraternelle où la foi s'épanouit et se partage.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
