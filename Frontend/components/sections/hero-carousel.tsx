"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Ordre précis demandé pour le carrousel de la hero.
const SLIDES = [
  { src: "/images/bg.jpg", alt: "Burning Heart" },
  { src: "/images/photodugroupe.jpg", alt: "Le groupe Burning Heart" },
  { src: "/images/image-1.jpg", alt: "Burning Heart — image 1" },
  { src: "/images/image-2.jpg", alt: "Burning Heart — image 2" },
  { src: "/images/image-3.jpg", alt: "Burning Heart — image 3" },
  { src: "/images/image-4.jpg", alt: "Burning Heart — image 4" },
  { src: "/images/image-5.jpg", alt: "Burning Heart — image 5" },
  { src: "/images/image-6.jpg", alt: "Burning Heart — image 6" },
] as const;

const INTERVAL = 6000;

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback((index: number) => {
    setCurrent((index + SLIDES.length) % SLIDES.length);
  }, []);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  // Avance automatique toutes les 6 s ; l'intervalle repart à chaque
  // changement (manuel ou auto) pour laisser le temps de lecture complet.
  useEffect(() => {
    if (paused) return;
    const id = setTimeout(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, INTERVAL);
    return () => clearTimeout(id);
  }, [current, paused]);

  return (
    <div
      className="absolute inset-0 z-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Images empilées, fondu enchaîné */}
      {SLIDES.map((slide, i) => (
        <Image
          key={slide.src}
          src={slide.src}
          alt={slide.alt}
          fill
          priority={i === 0}
          sizes="100vw"
          className={`object-cover brightness-50 transition-opacity duration-1000 ease-in-out ${
            i === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Dégradé de lisibilité */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-background" />

      {/* Flèches précédent / suivant */}
      <button
        type="button"
        onClick={prev}
        aria-label="Image précédente"
        className="group absolute left-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:left-6"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Image suivante"
        className="group absolute right-3 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm transition hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white sm:right-6"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Points de navigation (retour à une image déjà passée) */}
      <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Aller à l'image ${i + 1}`}
            aria-current={i === current}
            className={`h-2.5 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
              i === current
                ? "w-8 bg-white"
                : "w-2.5 bg-white/50 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
