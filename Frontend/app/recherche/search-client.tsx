"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search,
  Loader2,
  FileText,
  Calendar,
  Folder,
  MapPin,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { rechercheGlobale } from "@/actions/recherche";
import type { RechercheResponse } from "@/types/user";

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQ = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQ);
  const [results, setResults] = useState<RechercheResponse | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q")?.trim() || "";
    setQuery(q);
    if (q.length < 2) {
      setResults(null);
      return;
    }
    let active = true;
    setLoading(true);
    rechercheGlobale(q)
      .then((res) => {
        if (active) setResults(res);
      })
      .catch(() => {
        if (active) setResults(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [searchParams]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q.length < 2) return;
    router.push(`/recherche?q=${encodeURIComponent(q)}`);
  };

  const hasResults =
    results &&
    (results.blogs.length > 0 ||
      results.evenements.length > 0 ||
      results.fichiers.length > 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl">
          Recherche
        </h1>
        <p className="mt-2 text-muted-foreground">
          Trouvez des articles, événements et ressources.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher (min. 2 caractères)..."
            className="pl-9"
          />
        </div>
        <Button type="submit">Rechercher</Button>
      </form>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !initialQ ? (
        <p className="py-10 text-center text-muted-foreground">
          Saisissez un terme pour lancer la recherche.
        </p>
      ) : !hasResults ? (
        <p className="py-10 text-center text-muted-foreground">
          Aucun résultat pour «&nbsp;{results?.query}&nbsp;».
        </p>
      ) : (
        <div className="space-y-8">
          {results!.blogs.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <FileText className="h-5 w-5 text-primary" />
                Articles
                <Badge variant="secondary">{results!.blogs.length}</Badge>
              </h2>
              <ul className="divide-y rounded-lg border">
                {results!.blogs.map((b) => (
                  <li key={b.idBlog}>
                    <Link
                      href={`/blog/${b.slug}`}
                      className="block px-4 py-3 transition-colors hover:bg-accent"
                    >
                      <p className="font-medium">{b.titre}</p>
                      {b.extrait && (
                        <p className="line-clamp-1 text-sm text-muted-foreground">
                          {b.extrait}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {results!.evenements.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <Calendar className="h-5 w-5 text-primary" />
                Événements
                <Badge variant="secondary">{results!.evenements.length}</Badge>
              </h2>
              <ul className="divide-y rounded-lg border">
                {results!.evenements.map((e) => (
                  <li key={e.idEvenement}>
                    <Link
                      href={`/events/${e.slug}`}
                      className="block px-4 py-3 transition-colors hover:bg-accent"
                    >
                      <p className="font-medium">{e.titre}</p>
                      <p className="flex flex-wrap items-center gap-x-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {e.lieu}
                        </span>
                        <span>
                          {new Date(e.dateEvenement).toLocaleDateString(
                            "fr-FR",
                          )}
                        </span>
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {results!.fichiers.length > 0 && (
            <section>
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold">
                <Folder className="h-5 w-5 text-primary" />
                Ressources
                <Badge variant="secondary">{results!.fichiers.length}</Badge>
              </h2>
              <ul className="divide-y rounded-lg border">
                {results!.fichiers.map((f) => (
                  <li key={f.idFichier}>
                    <Link
                      href={`/files/${f.slug}`}
                      className="block px-4 py-3 transition-colors hover:bg-accent"
                    >
                      <p className="font-medium">{f.nomReference}</p>
                      {f.categorie?.nomCategorie && (
                        <p className="text-sm text-muted-foreground">
                          {f.categorie.nomCategorie}
                        </p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
