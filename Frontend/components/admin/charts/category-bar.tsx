"use client";

import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { useChartPalette, withAlpha } from "./chart-core";

interface Props {
  items: { categorie: string; count: number }[];
}

/** Barres horizontales : articles par catégorie. */
export function CategoryBar({ items }: Props) {
  const p = useChartPalette();

  if (items.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center text-sm text-muted-foreground">
        Aucun article catégorisé.
      </div>
    );
  }

  const data = {
    labels: items.map((i) => i.categorie),
    datasets: [
      {
        data: items.map((i) => i.count),
        backgroundColor: withAlpha(p.chart3, 0.85),
        borderRadius: 6,
        borderSkipped: false as const,
        maxBarThickness: 22,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.parsed.x} article(s)` } },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: p.mutedFg, font: { size: 11 }, precision: 0 },
        grid: { color: withAlpha(p.border, 0.6) },
        border: { display: false },
      },
      y: {
        grid: { display: false },
        ticks: { color: p.foreground, font: { size: 12 } },
      },
    },
  };

  return (
    <div className="h-56 w-full">
      <Bar data={data} options={options} />
    </div>
  );
}
