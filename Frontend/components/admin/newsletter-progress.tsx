"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { getNewsletterProgress } from "@/actions/newsletter";
import type { NewsletterProgress } from "@/types/user";

export function NewsletterProgressBar({ id }: { id: number }) {
  const [p, setP] = useState<NewsletterProgress | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let active = true;

    const poll = async () => {
      try {
        const res = await getNewsletterProgress(id);
        if (!active) return;
        setP(res);
        if (res.statut === "en_cours") {
          timer.current = setTimeout(poll, 2500);
        }
      } catch {
        /* arrêt silencieux */
      }
    };

    poll();
    return () => {
      active = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [id]);

  if (!p || p.total === 0) return null;

  const done = p.statut === "termine";

  return (
    <div className="space-y-3 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          {done ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          )}
          {done ? "Envoi terminé" : "Envoi en cours…"}
        </div>
        <span className="text-sm text-muted-foreground">
          {p.traite}/{p.total} ({p.pourcentage}%)
        </span>
      </div>

      <Progress value={p.pourcentage} />

      <div className="flex flex-wrap gap-2 text-xs">
        <Badge variant="default">Envoyés : {p.envoye}</Badge>
        {p.echec > 0 && <Badge variant="destructive">Échecs : {p.echec}</Badge>}
        <Badge variant="secondary">En attente : {p.attente}</Badge>
      </div>

      {!done && (
        <p className="text-xs text-muted-foreground">
          Vous pouvez quitter cette page : l'envoi se poursuit en arrière-plan.
        </p>
      )}
    </div>
  );
}
