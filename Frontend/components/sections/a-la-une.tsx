"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  FileText,
  MapPin,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getAllBlogs } from "@/actions/blog";
import { getAllEvents } from "@/actions/event";
import { formatDateCourte, mediaUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import type { Blog, Evenement } from "@/types/user";

const NB_ARTICLES = 4;
const NB_EVENEMENTS = 4;

/** À venir d'abord (le plus proche en tête), puis passés (le plus récent en tête). */
const trierEvenements = (events: Evenement[]) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const t = (e: Evenement) => new Date(e.dateEvenement).getTime();
  const aVenir = events
    .filter((e) => t(e) >= now.getTime())
    .sort((a, b) => t(a) - t(b));
  const passes = events
    .filter((e) => t(e) < now.getTime())
    .sort((a, b) => t(b) - t(a));
  return [...aVenir, ...passes];
};

const estPasse = (e: Evenement) => {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return new Date(e.dateEvenement).getTime() < now.getTime();
};

function ImageArticle({
  article,
  sizes,
  className,
}: {
  article: Blog;
  sizes: string;
  className?: string;
}) {
  const src = mediaUrl(article.imageUne);
  return (
    <div className={cn("relative overflow-hidden bg-muted", className)}>
      {src ? (
        <Image
          src={src}
          alt={article.titre}
          fill
          sizes={sizes}
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/15 to-primary/5">
          <FileText className="h-10 w-10 text-primary/40" aria-hidden />
        </div>
      )}
    </div>
  );
}

function ArticleVedette({ article }: { article: Blog }) {
  return (
    <Link
      href={`/blog/${article.slug || article.idBlog}`}
      className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-4"
    >
      <ImageArticle
        article={article}
        sizes="(max-width: 1024px) 100vw, 66vw"
        className="aspect-[16/9] rounded-2xl"
      />
      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        {article.categorie?.nomCategorie && (
          <Badge variant="secondary">{article.categorie.nomCategorie}</Badge>
        )}
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4" aria-hidden />
          {formatDateCourte(article.createdAt)}
        </span>
      </div>
      <h3 className="mt-3 text-balance font-serif text-2xl font-bold leading-tight transition-colors group-hover:text-primary sm:text-3xl">
        {article.titre}
      </h3>
      {article.extrait && (
        <p className="mt-3 line-clamp-3 max-w-2xl leading-relaxed text-muted-foreground">
          {article.extrait}
        </p>
      )}
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
        Lire l&apos;article
        <ArrowRight
          className="h-4 w-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
          aria-hidden
        />
      </span>
    </Link>
  );
}

function ArticleCompact({ article }: { article: Blog }) {
  return (
    <Link
      href={`/blog/${article.slug || article.idBlog}`}
      className="group flex gap-4 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:flex-col sm:gap-3"
    >
      <ImageArticle
        article={article}
        sizes="(max-width: 640px) 112px, 22vw"
        className="aspect-square w-28 shrink-0 rounded-xl sm:aspect-[16/10] sm:w-full"
      />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">
          {formatDateCourte(article.createdAt)}
        </p>
        <h4 className="mt-1 line-clamp-3 font-serif text-lg font-semibold leading-snug transition-colors group-hover:text-primary">
          {article.titre}
        </h4>
      </div>
    </Link>
  );
}

function LigneAgenda({ event }: { event: Evenement }) {
  const date = new Date(event.dateEvenement);
  const passe = estPasse(event);
  return (
    <li>
      <Link
        href={`/events/${event.slug || event.idEvenement}`}
        className="group flex gap-4 rounded-xl p-3 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div
          className={cn(
            "flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-lg",
            passe ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary",
          )}
          aria-hidden
        >
          <span className="font-serif text-2xl font-bold leading-none">
            {date.getDate()}
          </span>
          <span className="mt-1 text-[11px] font-semibold uppercase tracking-wide">
            {date.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="line-clamp-2 font-medium leading-snug transition-colors group-hover:text-primary">
              {event.titre}
            </p>
            {passe && (
              <Badge variant="outline" className="shrink-0 text-[11px]">
                Passé
              </Badge>
            )}
          </div>
          <p className="sr-only">{formatDateCourte(event.dateEvenement)}</p>
          <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
            {event.heureDebut && (
              <span className="inline-flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" aria-hidden />
                {event.heureDebut.slice(0, 5)}
              </span>
            )}
            {event.lieu && (
              <span className="inline-flex min-w-0 items-center gap-1">
                <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
                <span className="truncate">{event.lieu}</span>
              </span>
            )}
          </div>
        </div>
      </Link>
    </li>
  );
}

export function ALaUneSection() {
  const [articles, setArticles] = useState<Blog[]>([]);
  const [events, setEvents] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const charger = async () => {
      const [resBlogs, resEvents] = await Promise.allSettled([
        getAllBlogs({ page: 1, limit: NB_ARTICLES, statut: "publie" }),
        getAllEvents({ page: 1, limit: 12 }),
      ]);
      if (resBlogs.status === "fulfilled") {
        setArticles(
          (resBlogs.value.blogs || [])
            .filter((b) => b.statut === "publie")
            .sort(
              (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
            )
            .slice(0, NB_ARTICLES),
        );
      }
      if (resEvents.status === "fulfilled") {
        setEvents(
          trierEvenements(
            (resEvents.value.events || []).filter((e) => e.statut === "publie"),
          ).slice(0, NB_EVENEMENTS),
        );
      }
      setLoading(false);
    };
    charger();
  }, []);

  const [vedette, ...autres] = articles;

  return (
    <section
      aria-labelledby="a-la-une-titre"
      className="bg-background py-16 sm:py-20"
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-10 flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
            Quoi de neuf
          </p>
          <h2
            id="a-la-une-titre"
            className="font-serif text-3xl font-bold tracking-tight sm:text-4xl"
          >
            À la une
          </h2>
          <p className="max-w-2xl text-muted-foreground">
            Les dernières nouvelles de Burning Heart et les prochains rendez-vous
            de la communauté.
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-3 lg:gap-12">
          {/* Articles */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="space-y-5" aria-busy="true">
                <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ) : vedette ? (
              <>
                <ArticleVedette article={vedette} />
                {autres.length > 0 && (
                  <div className="mt-10 grid gap-6 border-t pt-8 sm:grid-cols-3">
                    {autres.map((a) => (
                      <ArticleCompact key={a.idBlog} article={a} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed px-6 py-16 text-center">
                <FileText className="h-10 w-10 text-primary/50" aria-hidden />
                <p className="mt-4 font-serif text-xl font-semibold">
                  Aucune publication pour l&apos;instant
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Les prochaines actualités apparaîtront ici.
                </p>
              </div>
            )}
            <Button asChild variant="outline" className="mt-8 gap-2">
              <Link href="/blog">
                Toutes les actualités
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>

          {/* Agenda */}
          <aside
            aria-labelledby="agenda-titre"
            className="h-fit rounded-2xl border bg-card p-4 shadow-sm sm:p-5 lg:sticky lg:top-24"
          >
            <div className="flex items-center justify-between px-3 pb-3 pt-1">
              <h3
                id="agenda-titre"
                className="flex items-center gap-2 font-serif text-xl font-bold"
              >
                <CalendarDays className="h-5 w-5 text-primary" aria-hidden />
                Agenda
              </h3>
            </div>
            {loading ? (
              <div className="space-y-3 p-3" aria-busy="true">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <Skeleton className="h-16 w-14 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length > 0 ? (
              <ul className="space-y-1">
                {events.map((e) => (
                  <LigneAgenda key={e.idEvenement} event={e} />
                ))}
              </ul>
            ) : (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                Aucun événement programmé pour le moment.
              </p>
            )}
            <Button asChild variant="ghost" className="mt-2 w-full gap-2">
              <Link href="/events">
                Tout l&apos;agenda
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </aside>
        </div>
      </div>
    </section>
  );
}
