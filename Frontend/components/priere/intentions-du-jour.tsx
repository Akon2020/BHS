"use client";

import { useEffect, useState } from "react";
import { Lock } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { getPrieresDuJour } from "@/actions/priere";
import { cn } from "@/lib/utils";
import type { PrieresDuJourResponse } from "@/types/user";

/** Hook partagé : intentions du jour (home + page /priere). */
export function usePrieresDuJour() {
  const [data, setData] = useState<PrieresDuJourResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPrieresDuJour()
      .then(setData)
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading };
}

interface IntentionsListeProps {
  data: PrieresDuJourResponse | null;
  loading: boolean;
  max?: number;
  /** `inverse` = sur fond primaire (bandeau de la home). */
  variante?: "defaut" | "inverse";
}

export function IntentionsListe({
  data,
  loading,
  max,
  variante = "defaut",
}: IntentionsListeProps) {
  const inverse = variante === "inverse";

  if (loading) {
    return (
      <div className="space-y-3" aria-busy="true">
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton
            key={i}
            className={cn("h-20 w-full rounded-xl", inverse && "bg-white/15")}
          />
        ))}
      </div>
    );
  }

  const intentions = data?.intentions ?? [];
  const visibles = max ? intentions.slice(0, max) : intentions;
  const restantes = intentions.length - visibles.length;
  const confidentielles = data?.confidentielles ?? 0;

  if (intentions.length === 0 && confidentielles === 0) {
    return (
      <p
        className={cn(
          "font-serif text-xl italic leading-relaxed",
          inverse ? "text-primary-foreground/90" : "text-muted-foreground",
        )}
      >
        Aujourd&apos;hui, nous portons dans notre prière toutes les intentions
        qui nous ont été confiées, et chacun de ceux qui visitent ce site.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-3">
        {visibles.map((i) => (
          <li
            key={i.idDemandePriere}
            className={cn(
              "rounded-xl p-4 sm:p-5",
              inverse
                ? "bg-white/10 ring-1 ring-white/15"
                : "border bg-card shadow-sm",
            )}
          >
            <p
              className={cn(
                "break-words font-serif text-lg leading-relaxed",
                inverse && "text-primary-foreground",
              )}
            >
              « {i.texte} »
            </p>
            <p
              className={cn(
                "mt-2 text-sm",
                inverse
                  ? "text-primary-foreground/90"
                  : "text-muted-foreground",
              )}
            >
              {i.source === "equipe"
                ? "Intention de la communauté"
                : `— ${i.prenom || "Anonyme"}`}
            </p>
          </li>
        ))}
      </ul>
      {(restantes > 0 || confidentielles > 0) && (
        <p
          className={cn(
            "flex items-center gap-2 text-sm",
            inverse ? "text-primary-foreground/90" : "text-muted-foreground",
          )}
        >
          <Lock className="h-4 w-4 shrink-0" aria-hidden />
          {[
            restantes > 0 &&
              `${restantes} autre${restantes > 1 ? "s" : ""} intention${restantes > 1 ? "s" : ""}`,
            confidentielles > 0 &&
              `${confidentielles} intention${confidentielles > 1 ? "s" : ""} confidentielle${confidentielles > 1 ? "s" : ""}`,
          ]
            .filter(Boolean)
            .join(" et ")}{" "}
          {restantes + confidentielles > 1 ? "sont aussi portées" : "est aussi portée"}{" "}
          aujourd&apos;hui.
        </p>
      )}
    </div>
  );
}
