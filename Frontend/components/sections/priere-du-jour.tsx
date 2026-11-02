"use client";

import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  IntentionsListe,
  usePrieresDuJour,
} from "@/components/priere/intentions-du-jour";
import { formatDateLongue } from "@/lib/media";

export function PriereDuJourSection() {
  const { data, loading } = usePrieresDuJour();

  return (
    <section
      aria-labelledby="priere-titre"
      className="relative overflow-hidden bg-primary py-16 text-primary-foreground sm:py-20"
    >
      {/* Halo décoratif discret */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl"
      />

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 lg:grid-cols-5 lg:gap-16 lg:px-8">
        <div className="lg:col-span-2">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
            <Flame className="h-6 w-6" aria-hidden />
          </div>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.18em] text-primary-foreground/90">
            Table de prière
          </p>
          <h2
            id="priere-titre"
            className="mt-2 text-balance font-serif text-3xl font-bold tracking-tight sm:text-4xl"
          >
            Aujourd&apos;hui, nous prions pour…
          </h2>
          <p className="mt-3 capitalize text-primary-foreground/90">
            {formatDateLongue(data?.date) || " "}
          </p>
          <p className="mt-6 max-w-md leading-relaxed text-primary-foreground">
            Confiez-nous une intention : notre équipe la portera dans sa prière.
            Elle reste confidentielle si vous le souhaitez.
          </p>
          <Button
            asChild
            size="lg"
            className="mt-8 gap-2 bg-primary-foreground text-primary hover:bg-primary-foreground/90"
          >
            <Link href="/priere#deposer">
              Confier une intention
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </Button>
        </div>

        <div className="lg:col-span-3 lg:pt-16">
          <IntentionsListe
            data={data}
            loading={loading}
            max={3}
            variante="inverse"
          />
          {data && data.intentions.length > 3 && (
            <Link
              href="/priere"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Voir toutes les intentions du jour
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
