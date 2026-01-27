"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, Users, BarChart, Clock, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

// Exemple de données de newsletter
const newsletters = [
  {
    id: 1,
    title: "Bienvenue dans notre communauté",
    subject: "Bienvenue chez Burning Heart",
    content: `
      <h1>Bienvenue dans notre communauté!</h1>
      <p>Cher(e) membre,</p>
      <p>Nous sommes ravis de vous accueillir dans la famille Burning Heart. Notre communauté est un lieu où chacun peut se sentir chez soi, grandir spirituellement et développer des relations authentiques.</p>
      <p>N'hésitez pas à nous contacter si vous avez des questions ou si vous souhaitez vous impliquer dans l'un de nos ministères.</p>
      <p>Que Dieu vous bénisse!</p>
      <p>L'équipe de Burning Heart</p>
    `,
    date: "10 Mai 2025",
    sentDate: "10 Mai 2025 à 14:30",
    status: "sent",
    recipients: 573,
    openRate: "45%",
    clickRate: "12%",
    stats: {
      opened: 258,
      clicked: 69,
      bounced: 5,
      unsubscribed: 2,
    },
  },
  {
    id: 2,
    title: "Événements du mois de juin",
    subject: "Ne manquez pas nos événements de juin!",
    content: `
      <h1>Événements à venir en juin</h1>
      <p>Cher(e) membre,</p>
      <p>Le mois de juin s'annonce riche en événements à Burning Heart! Voici les temps forts à ne pas manquer:</p>
      <ul>
        <li>15 juin: Conférence annuelle</li>
        <li>22 juin: Journée des familles</li>
        <li>29 juin: Concert de louange</li>
      </ul>
      <p>Nous espérons vous y voir nombreux!</p>
      <p>L'équipe de Burning Heart</p>
    `,
    date: "2 Mai 2025",
    sentDate: "2 Mai 2025 à 10:15",
    status: "sent",
    recipients: 568,
    openRate: "38%",
    clickRate: "9%",
    stats: {
      opened: 216,
      clicked: 51,
      bounced: 3,
      unsubscribed: 1,
    },
  },
]

export default function ViewNewsletterPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [newsletter, setNewsletter] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simuler un chargement de données
    const fetchNewsletter = async () => {
      setIsLoading(true)
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        const found = newsletters.find((n) => n.id === Number.parseInt(params.id))

        if (found) {
          setNewsletter(found)
        } else {
          router.push("/admin/newsletter")
        }
      } catch (error) {
        console.error("Error fetching newsletter:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchNewsletter()
  }, [params.id, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!newsletter) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold">Newsletter non trouvée</h2>
        <p className="text-muted-foreground mt-2">La newsletter demandée n'existe pas ou a été supprimée.</p>
        <Button asChild className="mt-4">
          <Link href="/admin/newsletter">Retour à la liste</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/newsletter">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{newsletter.title}</h1>
        </div>
        <Badge
          variant={
            newsletter.status === "sent" ? "default" : newsletter.status === "scheduled" ? "secondary" : "outline"
          }
        >
          {newsletter.status === "sent" ? "Envoyé" : newsletter.status === "scheduled" ? "Programmé" : "Brouillon"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Users className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Destinataires</p>
              <p className="text-3xl font-bold">{newsletter.recipients}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Mail className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Taux d'ouverture</p>
              <p className="text-3xl font-bold">{newsletter.openRate}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <BarChart className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Taux de clic</p>
              <p className="text-3xl font-bold">{newsletter.clickRate}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Calendar className="h-8 w-8 text-primary mb-2" />
              <p className="text-sm text-muted-foreground">Date d'envoi</p>
              <p className="text-lg font-medium">{newsletter.sentDate}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Newsletter Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Contenu de la newsletter</CardTitle>
              <CardDescription>Objet: {newsletter.subject}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md p-6 bg-card">
                <div
                  className="prose prose-sm max-w-none dark:prose-invert"
                  dangerouslySetInnerHTML={{ __html: newsletter.content }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Stats Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Statistiques détaillées</CardTitle>
              <CardDescription>Performances de cette newsletter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Ouverts</span>
                  <span className="font-medium">
                    {newsletter.stats.opened} / {newsletter.recipients}
                  </span>
                </div>
                <Progress value={(newsletter.stats.opened / newsletter.recipients) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Clics</span>
                  <span className="font-medium">
                    {newsletter.stats.clicked} / {newsletter.recipients}
                  </span>
                </div>
                <Progress value={(newsletter.stats.clicked / newsletter.recipients) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Rebonds</span>
                  <span className="font-medium">
                    {newsletter.stats.bounced} / {newsletter.recipients}
                  </span>
                </div>
                <Progress value={(newsletter.stats.bounced / newsletter.recipients) * 100} className="h-2" />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Désabonnements</span>
                  <span className="font-medium">
                    {newsletter.stats.unsubscribed} / {newsletter.recipients}
                  </span>
                </div>
                <Progress value={(newsletter.stats.unsubscribed / newsletter.recipients) * 100} className="h-2" />
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-2">Activité</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Premier ouvert: 2 minutes après l'envoi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Pic d'ouvertures: 30 minutes après l'envoi</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>Utilisateurs les plus actifs: 15</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
