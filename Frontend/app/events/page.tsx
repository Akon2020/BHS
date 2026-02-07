"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Loader2,
  Search,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { getAllEvents } from "@/actions/event";

interface EventItem {
  idEvenement: number;
  titre: string;
  slug?: string;
  description: string;
  dateEvenement: string;
  heureDebut: string;
  heureFin?: string;
  lieu: string;
  imageEvenement?: string;
  statut: string;
}

export default function EventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const limit = 9;

  const loadEvents = async (pageNum = 1, reset = false) => {
    if (pageNum === 1) setIsLoading(true);
    else setIsLoadingMore(true);

    try {
      const res = await getAllEvents({ page: pageNum, limit });

      const publishedAll =
        res.events?.filter((e: any) => e.statut === "publie") || [];

      if (reset) setEvents(publishedAll);
      else setEvents((prev) => [...prev, ...publishedAll]);

      setPage(pageNum);
      setTotalPages(res.totalPages || 1);
      setTotalEvents(res.total || publishedAll.length);
    } catch (e) {
      console.error("Erreur chargement événements:", e);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    loadEvents(1, true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop <
          document.documentElement.offsetHeight - 120 ||
        isLoadingMore
      )
        return;

      if (page < totalPages) loadEvents(page + 1);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [page, totalPages, isLoadingMore]);

  const filteredEvents = searchTerm
    ? events.filter(
        (ev) =>
          ev.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ev.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ev.lieu.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    : events;

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-b from-muted/30 to-background py-20 md:py-24">
        <div className="container px-4 mx-auto text-center max-w-3xl">
          <h1 className="font-serif text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Nos Événements
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
            Découvrez et rejoignez nos moments de prière, de partage et de
            croissance spirituelle.
          </p>

          <div className="mt-8 max-w-2xl mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un événement..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Liste */}
      <section className="py-16 md:py-20 flex-1">
        <div className="container px-4 mx-auto">
          {isLoading && page === 1 ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="mx-auto max-w-xl">
              <Card className="border-dashed bg-muted/30">
                <CardContent className="p-10 text-center space-y-4">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Calendar className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-bold">
                    Aucun événement trouvé
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Revenez bientôt, de nouveaux événements arrivent.
                  </p>
                  {searchTerm && (
                    <Button variant="outline" onClick={() => setSearchTerm("")}>
                      Effacer la recherche
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <>
              <div className="mb-8 flex flex-wrap justify-between items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {totalEvents} événement{totalEvents > 1 ? "s" : ""}
                </span>
                {searchTerm && (
                  <span>
                    {filteredEvents.length} résultat
                    {filteredEvents.length > 1 ? "s" : ""} pour "{searchTerm}"
                  </span>
                )}
              </div>

              <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                {filteredEvents.map((event) => {
                  const isPast =
                    new Date(event.dateEvenement).getTime() < Date.now();

                  return (
                    <Link
                      key={event.idEvenement}
                      href={`/events/${event.slug || event.idEvenement}`}
                    >
                      <Card
                        className={`group h-full overflow-hidden border-none bg-card shadow-sm transition-all hover:shadow-lg hover:-translate-y-1 ${
                          isPast ? "opacity-80" : ""
                        }`}
                      >
                        <div className="aspect-video overflow-hidden bg-muted relative">
                          <span
                            className={`absolute top-3 right-3 z-10 rounded-full px-3 py-1 text-xs font-medium text-white shadow ${
                              isPast ? "bg-destructive" : "bg-primary"
                            }`}
                          >
                            {isPast ? "Passé" : "À venir"}
                          </span>

                          {event.imageEvenement ? (
                            <img
                              src={
                                event.imageEvenement.startsWith("http")
                                  ? event.imageEvenement
                                  : `${process.env.NEXT_PUBLIC_API_URL}/${event.imageEvenement}`
                              }
                              alt={event.titre}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                              <Calendar className="h-16 w-16 text-primary/30" />
                            </div>
                          )}
                        </div>

                        <CardContent className="p-6">
                          <h3 className="font-serif text-xl font-bold mb-3 group-hover:text-primary line-clamp-2">
                            {event.titre}
                          </h3>

                          <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                            {event.description}
                          </p>

                          <div className="space-y-2 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              {formatDate(event.dateEvenement)}
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {event.heureDebut}
                              {event.heureFin ? ` - ${event.heureFin}` : ""}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              {event.lieu}
                            </div>
                          </div>

                          <Button className="w-full mt-5 gap-2">
                            En savoir plus
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>

              {!isLoading && page < totalPages && !searchTerm && (
                <div className="mt-12 text-center">
                  <Button
                    variant="outline"
                    onClick={() => loadEvents(page + 1)}
                    disabled={isLoadingMore}
                    className="min-w-[220px]"
                  >
                    {isLoadingMore ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Chargement...
                      </>
                    ) : (
                      "Charger plus d’événements"
                    )}
                  </Button>
                </div>
              )}

              {isLoadingMore && (
                <div className="mt-8 text-center">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
