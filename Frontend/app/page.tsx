import Link from "next/link"
import { ArrowRight, Calendar, Clock, MapPin, Mail, Phone, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <Header />
      {/* Hero Section with Background Image */}
      <section className="relative h-[100vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Image src="/images/bg.jpg" alt="Burning Heart Hero" fill className="object-cover brightness-50" priority />
          <div className="absolute inset-0 from-black/60 via-black/40 to-background" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-24 text-center lg:px-8">
          <h1 className="text-balance font-serif text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Ravivez la flamme de votre foi
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-gray-200">
            Rejoignez une communauté spirituelle dédiée à grandir dans la foi, trouver du soutien et discerner la
            volonté de Dieu dans votre vie quotidienne.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/a-propos">
              <Button size="lg" className="gap-2">
                Découvrir notre mission
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
              >
                Nous rejoindre
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* À Propos de Nous Section */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            {/* Logo Image */}
            <div className="flex justify-center lg:justify-start">
              <Image
                src="/images/logon.png"
                alt="Burning Heart Logo"
                width={400}
                height={400}
                className="w-full max-w-md"
              />
            </div>

            {/* Content */}
            <div className="space-y-6">
              <h2 className="font-serif text-4xl font-bold tracking-tight text-primary">À Propos de Nous</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  <span className="font-semibold text-foreground">Burning Heart - Pèlerins avec le Christ</span> est un
                  apostolat spirituel et médiatique à but non lucratif désirant soutenir les préférences apostoliques
                  universelles de la Compagnie de Jésus concernant l'aide à porter aux âmes, à trouver Jésus-Christ et à
                  le suivre.
                </p>
                <p>
                  Il se veut un outil pour la{" "}
                  <span className="font-semibold text-foreground">
                    promotion du discernement et des Exercices Spirituels
                  </span>{" "}
                  et devra{" "}
                  <span className="font-semibold text-foreground">
                    cheminer avec les jeunes, les accompagner dans la création d'un avenir plein d'espoir.
                  </span>
                </p>
              </div>

              {/* Mission & Vision */}
              <div className="grid gap-6 sm:grid-cols-2 mt-8">
                <Card className="bg-muted/30 border-none">
                  <CardContent className="p-6">
                    <h3 className="font-serif text-xl font-bold mb-3">Notre Mission</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Ouvrir l'accès aux exercices spirituels à tous les hommes assoiffés de Dieu pour qu'ils en
                      jouissent et s'attachent au créateur de toute chose.
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-muted/30 border-none">
                  <CardContent className="p-6">
                    <h3 className="font-serif text-xl font-bold mb-3">Notre Vision</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Devenir un outil de rayonnement spirituel et une référence pour l'expansion évangélique à travers
                      les Exercices Spirituels.
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="pt-4">
                <Link href="/a-propos">
                  <Button className="gap-2 w-full" size="lg">
                    En savoir plus
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nos Départements Section */}
      <section className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold tracking-tight">Nos Départements</h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
              Découvrez les différentes façons dont nous nous impliquons dans la communauté et la faisons grandir.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Coordination */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Coordination</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Pilote central de l'organisation, le coordinateur supervise les départements, définit les
                  responsabilités, veille à la mission spirituelle et forme les accompagnateurs.
                </p>
              </CardContent>
            </Card>

            {/* Spiritual Supervisor */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Spiritual Supervisor</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Responsable de la qualité des enseignements spirituels, il accompagne les membres dans leur foi et
                  veille à l'unité avec la tradition ignatienne.
                </p>
              </CardContent>
            </Card>

            {/* Supervision */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Supervision</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Composée des accompagnateurs, cette équipe suit les âmes, forme les membres et transmet la tradition
                  spirituelle et ignatienne.
                </p>
              </CardContent>
            </Card>

            {/* Assistant */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Assistant</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Appuie le coordination, supervise les départements, gère les ressources humaines et les relations
                  extérieures, et modère les rencontres.
                </p>
              </CardContent>
            </Card>

            {/* HR Manager */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">HR Manager</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Responsable des ressources humaines et du bon fonctionnement des équipes, il assure le lien entre la
                  gestion humaine et opérationnelle.
                </p>
              </CardContent>
            </Card>

            {/* Administrator Manager */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Administrator Manager</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Gère la logistique, contrôle le matériel, prépare les espaces de réunion, assure l'inventaire, les
                  déplacements, la sonorisation et les installations techniques.
                </p>
              </CardContent>
            </Card>

            {/* Accountant & Treasury */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Accountant & Treasury</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Gère les finances : budgets, entrées et sorties, rapports financiers, et inventaire économique.
                </p>
              </CardContent>
            </Card>

            {/* Secrétariat */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Secrétariat</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Planifie les activités, gère les convocations, rédige les PV, s'occupe des archives, de la propreté
                  des lieux, des fournitures et des supports pour les rencontres.
                </p>
              </CardContent>
            </Card>

            {/* Médias & Communication Office */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Médias & Communication Office</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  S'occupe de la communication interne et externe, crée les supports visuels, gère les réseaux sociaux,
                  assure la visibilité et la diffusion du message via la presse et les plateformes numériques.
                </p>
              </CardContent>
            </Card>

            {/* Vocation Promotor */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Vocation Promotor</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Accompagne les membres à discerner et vivre leur appel personnel, en accord avec la mission de Burning
                  Heart.
                </p>
              </CardContent>
            </Card>

            {/* Spiritual Officer */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Spiritual Officer</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Organise les activités liturgiques et spirituelles : retraites, veillées, prières communautaires, et
                  animation pastorale.
                </p>
              </CardContent>
            </Card>

            {/* Social & Well-being */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                    />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Social & Well-being</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Responsable de l'accueil, de la convivialité, des sorties, fêtes, approvisionnement alimentaire et du
                  protocole.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Événements à Venir Section */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="font-serif text-4xl font-bold tracking-tight">Événements à Venir</h2>
              <p className="mt-3 text-muted-foreground leading-relaxed">
                Rejoignez-nous pour ces moments spéciaux de communion, d'apprentissage et de célébration.
              </p>
            </div>
            <Link href="/evenements">
              <Button variant="outline" className="gap-2 hidden sm:flex bg-transparent">
                Tous les événements
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Event 1 */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <Calendar className="h-16 w-16 text-muted-foreground/30" />
              </div>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl font-bold mb-3">Messe Chrismale</h3>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>15 Juin 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>18:00 - 21:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Cathédrale Notre Dame de la Paix</span>
                  </div>
                </div>
                <Button className="w-full">En savoir plus</Button>
              </CardContent>
            </Card>

            {/* Event 2 */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <Calendar className="h-16 w-16 text-muted-foreground/30" />
              </div>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl font-bold mb-3">Retraite de Carême</h3>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>10-12 Juillet 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Toute la journée</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Centre Spirituel Saint-Ignace</span>
                  </div>
                </div>
                <Button className="w-full">En savoir plus</Button>
              </CardContent>
            </Card>

            {/* Event 3 */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted flex items-center justify-center">
                <Calendar className="h-16 w-16 text-muted-foreground/30" />
              </div>
              <CardContent className="p-6">
                <h3 className="font-serif text-xl font-bold mb-3">Veillée de Prière pour la Paix</h3>
                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>5 Août 2025</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>19:30 - 22:00</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>Paroisse Saint-Pierre Claver</span>
                  </div>
                </div>
                <Button className="w-full">En savoir plus</Button>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 sm:hidden">
            <Link href="/evenements">
              <Button variant="outline" className="w-full gap-2 bg-transparent">
                Tous les événements
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Témoignages Section */}
      <section className="py-24 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold tracking-tight">Témoignages</h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
              Découvrez comment Burning Heart a impacté la vie de nos membres.
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <Card className="border-none shadow-lg">
              <CardContent className="p-8 sm:p-12">
                <div className="flex justify-center mb-6">
                  <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-3xl font-serif text-muted-foreground">SD</span>
                  </div>
                </div>
                <div className="text-center mb-6">
                  <svg
                    className="mx-auto h-12 w-12 text-primary/20 mb-4"
                    fill="currentColor"
                    viewBox="0 0 32 32"
                    aria-hidden="true"
                  >
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                  <p className="text-lg leading-relaxed text-foreground italic">
                    Burning Heart a complètement transformé ma vie spirituelle. J'ai trouvé ici une famille qui me
                    soutient dans tous les aspects de ma vie.
                  </p>
                </div>
                <div className="text-center">
                  <p className="font-semibold text-lg">Samuel Diambu</p>
                  <p className="text-sm text-muted-foreground">Membre depuis 2018</p>
                </div>
                <div className="flex items-center justify-center gap-4 mt-8">
                  <Button variant="outline" size="icon" className="rounded-full bg-transparent">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-full bg-transparent">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Newsletter - Restez Informé Section */}
      <section className="py-24 bg-primary">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-white/10 flex items-center justify-center">
                <Mail className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-white mb-4">Restez Informé</h2>
            <p className="text-lg text-white/90 leading-relaxed mb-8">
              Inscrivez-vous à notre newsletter pour recevoir les dernières nouvelles, événements et enseignements
              directement dans votre boîte mail.
            </p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Votre adresse email"
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white"
              />
              <Button type="submit" variant="secondary" className="bg-white text-primary hover:bg-white/90 shrink-0">
                Inscription
              </Button>
            </form>
            <p className="text-sm text-white/70 mt-4">
              Nous respectons votre vie privée. Vous pouvez vous désabonner à tout moment.
            </p>
          </div>
        </div>
      </section>

      {/* Contactez-Nous Section */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="font-serif text-4xl font-bold tracking-tight">Contactez-Nous</h2>
            <p className="mx-auto mt-4 max-w-2xl text-pretty text-muted-foreground leading-relaxed">
              Nous sommes là pour répondre à vos questions et vous accueillir dans notre communauté.
            </p>
          </div>

          <div className="grid gap-12 lg:grid-cols-5 lg:gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <h3 className="font-semibold text-lg mb-4">Plusieurs façons de nous contacter</h3>

                <div className="space-y-6">
                  {/* Address */}
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <MapPin className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Adresse</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        259 Avenue Patrice Emery Lumumba, Q. Nyalukemba, Bukavu, République Democratique du Congo
                      </p>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Téléphone</h4>
                      <a href="tel:+243849005240" className="text-sm text-primary hover:underline">
                        +243 849 005 240
                      </a>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Email</h4>
                      <a href="mailto:burningheartihs@gmail.com" className="text-sm text-primary hover:underline">
                        burningheartihs@gmail.com
                      </a>
                    </div>
                  </div>

                  {/* Hours */}
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Horaire d'ouverture</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Lundi - Vendredi: 16h00 - 17h00 (Sur rendez-vous)</p>
                        <p>Samedi: 15h00 - 17h00</p>
                        <p>Dimanche: 8h00 - 12h00</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="aspect-video rounded-lg overflow-hidden border bg-muted">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3986.0225212120026!2d28.87330107577174!3d-2.4994653381572034!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x19c2974c3bce9397%3A0x1519f32559211e7d!2sColl%C3%A8ge%20Alfajiri!5e0!3m2!1sfr!2scd!4v1764982349518!5m2!1sfr!2scd"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Burning Heart Location"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-3">
              <Card className="border-none shadow-lg">
                <CardContent className="p-8">
                  <h3 className="font-serif text-2xl font-bold mb-2">Envoyez-nous un message</h3>
                  <p className="text-sm text-muted-foreground mb-6">
                    Remplissez le formulaire ci-dessous et nous vous répondrons rapidement
                  </p>
                  <form className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <label htmlFor="name" className="text-sm font-medium">
                          Nom complet <span className="text-destructive">*</span>
                        </label>
                        <Input id="name" placeholder="Votre nom" required />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="email" className="text-sm font-medium">
                          Email <span className="text-destructive">*</span>
                        </label>
                        <Input id="email" type="email" placeholder="votre@email.com" required />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="subject" className="text-sm font-medium">
                        Sujet
                      </label>
                      <Input id="subject" placeholder="Sujet de votre message" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="message" className="text-sm font-medium">
                        Message <span className="text-destructive">*</span>
                      </label>
                      <Textarea id="message" name="message" placeholder="Écrivez votre message ici..." rows={15} required />
                    </div>
                    <Button type="submit" className="w-full" size="lg">
                      Envoyer le message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
}
