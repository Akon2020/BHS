"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Clock, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAllEvents } from "@/actions/event";

interface UIEvent {
  idEvenement: number;
  slug?: string;
  titre: string;
  dateEvenement: string;
  heureDebut: string;
  heureFin?: string;
  lieu: string;
  imageEvenement?: string;
  statut: "publie" | "brouillon";
}

export function UpcomingEventsSection() {
  const [events, setEvents] = useState<UIEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await getAllEvents({ page: 1, limit: 12 });

        const publishedSorted =
          res.events
            ?.filter((e: UIEvent) => e.statut === "publie")
            ?.sort(
              (a: UIEvent, b: UIEvent) =>
                new Date(a.dateEvenement).getTime() -
                new Date(b.dateEvenement).getTime(),
            ) || [];

        const nextThree = publishedSorted.slice(0, 3);

        setEvents(nextThree);
      } catch (e) {
        console.error("Erreur chargement événements:", e);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  return (
    <section className="py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="font-serif text-4xl font-bold tracking-tight">
              Événements à Venir
            </h2>
            <p className="mt-3 text-muted-foreground leading-relaxed">
              Rejoignez-nous pour ces moments spéciaux de communion,
              d&apos;apprentissage et de célébration.
            </p>
          </div>

          <Link href="/events">
            <Button
              variant="outline"
              className="gap-2 hidden sm:flex bg-transparent"
            >
              Tous les événements
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Skeleton */}
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="relative aspect-video bg-muted animate-pulse" />
                <CardContent className="p-6 space-y-3">
                  <div className="h-5 w-2/3 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                  <div className="h-10 w-full bg-muted rounded animate-pulse mt-4" />
                </CardContent>
              </Card>
            ))}

          {!loading &&
            events.map((event) => {
              const isPast =
                new Date(event.dateEvenement).getTime() < Date.now();

              return (
                <Card
                  key={event.idEvenement}
                  className={`group overflow-hidden hover:shadow-lg transition-shadow ${
                    isPast ? "opacity-80" : ""
                  }`}
                >
                  {/* Image */}
                  <div className="relative aspect-video bg-muted overflow-hidden">
                    <span
                      className={`absolute top-3 right-3 z-10 rounded-full px-3 py-1 text-xs font-medium text-white shadow ${
                        isPast ? "bg-destructive" : "bg-primary"
                      }`}
                    >
                      {isPast ? "Passé" : "À venir"}
                    </span>

                    {event.imageEvenement ? (
                      <Image
                        src={
                          event.imageEvenement.startsWith("http")
                            ? event.imageEvenement
                            : `${process.env.NEXT_PUBLIC_API_URL}/${event.imageEvenement}`
                        }
                        alt={event.titre}
                        fill
                        sizes="(max-width: 1024px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                        <Calendar className="h-16 w-16 text-primary/30" />
                      </div>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <h3 className="font-serif text-xl font-bold mb-3 line-clamp-2 group-hover:text-primary">
                      {event.titre}
                    </h3>

                    <div className="space-y-2 text-sm text-muted-foreground mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(event.dateEvenement).toLocaleDateString(
                            "fr-FR",
                          )}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>
                          {event.heureDebut}
                          {event.heureFin ? ` - ${event.heureFin}` : ""}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="line-clamp-1">{event.lieu}</span>
                      </div>
                    </div>

                    <Link href={`/events/${event.slug || event.idEvenement}`}>
                      <Button className="w-full">En savoir plus</Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}

          {!loading && events.length === 0 && (
            <div className="col-span-full">
              <div className="mx-auto max-w-xl">
                <Card className="border-dashed bg-muted/30">
                  <CardContent className="p-10 text-center space-y-4">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-7 w-7 text-primary" />
                    </div>

                    <h3 className="font-serif text-xl font-bold">
                      Aucun événement programmé pour l’instant
                    </h3>

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      De nouveaux moments de communion et de partage arrivent
                      très bientôt. Revenez nous voir ou consultez la liste
                      complète des événements.
                    </p>

                    <div className="pt-2">
                      <Link href="/events">
                        <Button
                          variant="outline"
                          className="gap-2 bg-transparent"
                        >
                          Voir tous les événements
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 sm:hidden">
          <Link href="/events">
            <Button variant="outline" className="w-full gap-2 bg-transparent">
              Tous les événements
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
