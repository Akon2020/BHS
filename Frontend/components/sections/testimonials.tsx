"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { getTemoignagesPublic } from "@/actions/temoignage";
import type { Temoignage } from "@/types/user";

const photoUrl = (photo?: string | null) =>
  photo ? `${process.env.NEXT_PUBLIC_API_URL}/${photo}` : undefined;

const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || "")
    .join("");

export function TestimonialsSection() {
  const [items, setItems] = useState<Temoignage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTemoignagesPublic()
      .then((res) => setItems(res.temoignages || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  // On masque la section tant qu'il n'y a aucun témoignage publié.
  if (!loading && items.length === 0) return null;

  return (
    <section className="bg-muted/30 py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-16 text-center">
          <h2 className="font-serif text-4xl font-bold tracking-tight">
            Témoignages
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
            Découvrez comment Burning Heart a impacté la vie de nos membres.
          </p>
        </div>

        <div className="mx-auto max-w-4xl">
          {loading ? (
            <Card className="border-none shadow-lg">
              <CardContent className="p-8 sm:p-12">
                <div className="mx-auto h-40 w-full animate-pulse rounded-lg bg-muted" />
              </CardContent>
            </Card>
          ) : (
            <Carousel className="w-full" opts={{ loop: items.length > 1 }}>
              <CarouselContent>
                {items.map((t) => (
                  <CarouselItem key={t.idTemoignage}>
                    <Card className="border-none shadow-lg">
                      <CardContent className="p-8 sm:p-12">
                        <div className="mb-6 flex justify-center">
                          <Avatar className="h-20 w-20 border">
                            <AvatarImage
                              src={photoUrl(t.photo)}
                              alt={t.auteur}
                              className="object-cover"
                            />
                            <AvatarFallback className="font-serif text-2xl text-muted-foreground">
                              {initials(t.auteur)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="mb-6 text-center">
                          <svg
                            className="mx-auto mb-4 h-12 w-12 text-primary/20"
                            fill="currentColor"
                            viewBox="0 0 32 32"
                            aria-hidden="true"
                          >
                            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                          </svg>
                          <p className="whitespace-pre-line text-lg italic leading-relaxed text-foreground">
                            {t.contenu}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-semibold">{t.auteur}</p>
                          {t.fonction && (
                            <p className="text-sm text-muted-foreground">
                              {t.fonction}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {items.length > 1 && (
                <div className="mt-8 flex items-center justify-center gap-4">
                  <CarouselPrevious className="static translate-y-0" />
                  <CarouselNext className="static translate-y-0" />
                </div>
              )}
            </Carousel>
          )}
        </div>
      </div>
    </section>
  );
}
