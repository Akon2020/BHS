"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  Users,
  CheckCircle,
} from "lucide-react";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";

import { getEventBySlug } from "@/actions/event";
import { RegisterEventModal } from "@/components/modals/register-event-modal";

interface EventDetails {
  idEvenement: number;
  titre: string;
  slug?: string;
  description: string;
  dateEvenement: string;
  heureDebut: string;
  heureFin?: string;
  lieu: string;
  imageEvenement?: string;
  statut: "publie" | "brouillon";
  nombrePlaces?: number;
  nombreInscrits?: number;
  inscriptions?: any[];
}

export default function EventDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [openRegister, setOpenRegister] = useState(false);

  const fetchEvent = async () => {
    try {
      setLoading(true);

      if (!slug) throw new Error("Slug invalide");

      const res = await getEventBySlug(slug);
      const data = res.event;

      if (!data) throw new Error("Événement introuvable");

      setEvent(data);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description:
          error?.message || "Impossible de charger l'événement.",
        variant: "destructive",
      });
      setEvent(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) fetchEvent();
  }, [slug]);

  if (loading) {
    return (
      <div className="flex flex-col">
        <Header />
        <div className="mx-auto max-w-4xl px-4 py-12 space-y-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-12 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-32 w-full" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!event && !loading) {
    return (
      <div className="flex flex-col">
        <Header />
        <section className="py-12">
          <div className="mx-auto max-w-4xl px-4 lg:px-8 text-center">
            <h1 className="font-serif text-4xl font-bold">404</h1>
            <h2 className="mt-4 text-2xl">Événement introuvable</h2>
            <p className="mt-4 text-muted-foreground">
              Cet événement n’existe pas ou a été supprimé.
            </p>
            <div className="mt-8">
              <Link href="/events">
                <Button>Retour aux événements</Button>
              </Link>
            </div>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  const isPast =
    new Date(event!.dateEvenement).getTime() < Date.now();
  const totalPlaces = event?.nombrePlaces ?? null;
  const totalInscrits = event?.nombreInscrits ?? 0;
  const placesRestantes =
    typeof totalPlaces === "number"
      ? Math.max(totalPlaces - totalInscrits, 0)
      : null;

  return (
    <div className="flex flex-col">
      <Header />

      <section className="py-12">
        <div className="mx-auto max-w-4xl px-4 lg:px-8">
          <Link href="/events">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Retour aux événements
            </Button>
          </Link>

          {/* Header */}
          <div className="mt-8">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant={
                  placesRestantes === 0
                    ? "destructive"
                    : isPast
                    ? "secondary"
                    : "default"
                }
              >
                {placesRestantes === 0
                  ? "Complet"
                  : isPast
                  ? "Passé"
                  : "À venir"}
              </Badge>
            </div>

            <h1 className="mt-4 font-serif text-4xl font-bold leading-tight sm:text-5xl">
              {event!.titre}
            </h1>

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(event!.dateEvenement).toLocaleDateString("fr-FR")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>
                  {event!.heureDebut}
                  {event!.heureFin ? ` - ${event!.heureFin}` : ""}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{event!.lieu}</span>
              </div>

              {typeof totalPlaces === "number" && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {totalInscrits}/{totalPlaces} inscrits
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Image */}
          <div className="mt-12 aspect-video overflow-hidden rounded-xl bg-muted">
            {event!.imageEvenement ? (
              <img
                src={
                  event!.imageEvenement.startsWith("http")
                    ? event!.imageEvenement
                    : `${process.env.NEXT_PUBLIC_API_URL}/${event!.imageEvenement}`
                }
                alt={event!.titre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Calendar className="h-20 w-20 text-muted-foreground/30" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="prose prose-lg mt-12 max-w-none dark:prose-invert">
            <p className="lead text-xl text-muted-foreground leading-relaxed">
              {event!.description}
            </p>
          </div>

          {/* CTA */}
          {!isPast && placesRestantes !== 0 && (
            <div className="mt-12 rounded-xl bg-muted/50 p-8">
              <h3 className="font-serif text-2xl font-bold">
                Participez à cet événement
              </h3>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                Inscrivez-vous pour réserver votre place.
              </p>

              <div className="mt-6">
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={() => setOpenRegister(true)}
                >
                  <CheckCircle className="h-5 w-5" />
                  S’inscrire à l’événement
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <RegisterEventModal
        open={openRegister}
        onOpenChange={setOpenRegister}
        slug={event!.slug}
        onSuccess={fetchEvent}
      />

      <Footer />
    </div>
  );
}
