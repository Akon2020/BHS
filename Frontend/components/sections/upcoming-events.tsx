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
        const res = await getAllEvents({ page: 1, limit: 6 });
        console.log("Evenements: ", res);

        const published = res.events
          ?.filter((e: UIEvent) => e.statut === "publie")
          ?.sort(
            (a: UIEvent, b: UIEvent) =>
              new Date(a.dateEvenement).getTime() -
              new Date(b.dateEvenement).getTime()
          )
          ?.slice(0, 3);

        setEvents(published || []);
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
              Rejoignez-nous pour ces moments spéciaux de communion, d'apprentissage
              et de célébration.
            </p>
          </div>

          <Link href="/events">
            <Button variant="outline" className="gap-2 hidden sm:flex bg-transparent">
              Tous les événements
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <div className="aspect-video bg-muted animate-pulse" />
                <CardContent className="p-6 space-y-3">
                  <div className="h-5 w-2/3 bg-muted rounded animate-pulse" />
                  <div className="h-4 w-full bg-muted rounded animate-pulse" />
                  <div className="h-4 w-1/2 bg-muted rounded animate-pulse" />
                  <div className="h-10 w-full bg-muted rounded animate-pulse mt-4" />
                </CardContent>
              </Card>
            ))}

          {!loading &&
            events.map((event) => (
              <Card
                key={event.idEvenement}
                className="overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="aspect-video bg-muted overflow-hidden">
                  {event.imageEvenement ? (
                    <Image
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${event.imageEvenement}`}
                      alt={event.titre}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="h-16 w-16 text-muted-foreground/30" />
                    </div>
                  )}
                </div>

                <CardContent className="p-6">
                  <h3 className="font-serif text-xl font-bold mb-3 line-clamp-2">
                    {event.titre}
                  </h3>

                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>
                        {new Date(event.dateEvenement).toLocaleDateString("fr-FR")}
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
            ))}

          {!loading && events.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground py-12">
              Aucun événement à venir pour le moment
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
