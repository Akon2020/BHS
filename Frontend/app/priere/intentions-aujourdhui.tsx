"use client";

import {
  IntentionsListe,
  usePrieresDuJour,
} from "@/components/priere/intentions-du-jour";
import { formatDateLongue } from "@/lib/media";

export function IntentionsAujourdhui() {
  const { data, loading } = usePrieresDuJour();

  return (
    <>
      <h2
        id="aujourdhui-titre"
        className="font-serif text-3xl font-bold tracking-tight"
      >
        Aujourd&apos;hui, nous prions pour…
      </h2>
      <p className="mb-6 mt-2 capitalize text-muted-foreground">
        {formatDateLongue(data?.date) || " "}
      </p>
      <IntentionsListe data={data} loading={loading} />
    </>
  );
}
