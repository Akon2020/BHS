"use client";

import { Doughnut } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { useChartPalette, withAlpha } from "./chart-core";

interface Props {
  label: string;
  count: number;
  montantLabel: string;
  /** Part représentée par l'anneau (0 → 1). */
  ratio: number;
  /** Clé de couleur de la palette. */
  colorKey?: "primary" | "chart2" | "chart4";
}

/** Jauge radiale (anneau) pour un total de dons — période mois/année. */
export function DonsRadial({
  label,
  count,
  montantLabel,
  ratio,
  colorKey = "primary",
}: Props) {
  const p = useChartPalette();
  const color = p[colorKey];
  const safe = Math.max(0, Math.min(1, ratio || 0));

  const data = {
    datasets: [
      {
        data: [safe, 1 - safe],
        backgroundColor: [color, withAlpha(p.mutedFg, 0.15)],
        borderWidth: 0,
        circumference: 360,
        rotation: 0,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "80%",
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative h-24 w-24 shrink-0">
        <Doughnut data={data} options={options} />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="text-xl font-bold tabular-nums">{count}</span>
        </div>
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        <p className="truncate text-sm text-muted-foreground">{montantLabel}</p>
      </div>
    </div>
  );
}
