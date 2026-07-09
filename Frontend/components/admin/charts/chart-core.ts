"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

// Enregistrement unique (idempotent) des éléments chart.js utilisés.
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Filler,
  Tooltip,
  Legend,
);

export interface ChartPalette {
  chart1: string;
  chart2: string;
  chart3: string;
  chart4: string;
  chart5: string;
  primary: string;
  mutedFg: string;
  border: string;
  foreground: string;
  muted: string;
}

// Valeurs de repli (thème clair) — utilisées côté serveur avant hydratation.
const FALLBACK: ChartPalette = {
  chart1: "oklch(0.42 0.16 15)",
  chart2: "oklch(0.6 0.118 184.704)",
  chart3: "oklch(0.398 0.07 227.392)",
  chart4: "oklch(0.828 0.189 84.429)",
  chart5: "oklch(0.769 0.188 70.08)",
  primary: "oklch(0.42 0.16 15)",
  mutedFg: "oklch(0.52 0.015 286)",
  border: "oklch(0.92 0.004 286)",
  foreground: "oklch(0.165 0.012 286)",
  muted: "oklch(0.96 0.004 286)",
};

// Applique une opacité à une couleur oklch (sinon renvoie la couleur telle quelle).
export const withAlpha = (color: string, alpha: number): string => {
  if (!color) return `rgba(0,0,0,${alpha})`;
  const c = color.trim();
  if (c.startsWith("oklch(") && c.endsWith(")")) {
    const inner = c.slice(6, -1).trim();
    const base = inner.split("/")[0].trim();
    return `oklch(${base} / ${alpha})`;
  }
  return c;
};

const readPalette = (): ChartPalette => {
  if (typeof window === "undefined") return FALLBACK;
  const s = getComputedStyle(document.documentElement);
  const v = (name: string, fallback: string) =>
    s.getPropertyValue(name).trim() || fallback;
  return {
    chart1: v("--chart-1", FALLBACK.chart1),
    chart2: v("--chart-2", FALLBACK.chart2),
    chart3: v("--chart-3", FALLBACK.chart3),
    chart4: v("--chart-4", FALLBACK.chart4),
    chart5: v("--chart-5", FALLBACK.chart5),
    primary: v("--primary", FALLBACK.primary),
    mutedFg: v("--muted-foreground", FALLBACK.mutedFg),
    border: v("--border", FALLBACK.border),
    foreground: v("--foreground", FALLBACK.foreground),
    muted: v("--muted", FALLBACK.muted),
  };
};

/** Palette de graphiques dérivée des tokens CSS, ré-évaluée au changement de thème. */
export const useChartPalette = (): ChartPalette => {
  const [palette, setPalette] = useState<ChartPalette>(FALLBACK);

  useEffect(() => {
    const update = () => setPalette(readPalette());
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return palette;
};
