"use client";

import { Bar } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { useChartPalette, withAlpha } from "./chart-core";

interface Props {
  labels: string[];
  utilisateurs: number[];
  abonnes: number[];
}

/** Barres groupées : nouveaux utilisateurs vs nouveaux abonnés sur 6 mois. */
export function GrowthBar({ labels, utilisateurs, abonnes }: Props) {
  const p = useChartPalette();

  const data = {
    labels,
    datasets: [
      {
        label: "Utilisateurs",
        data: utilisateurs,
        backgroundColor: p.chart1,
        borderRadius: 6,
        borderSkipped: false as const,
        maxBarThickness: 18,
      },
      {
        label: "Abonnés",
        data: abonnes,
        backgroundColor: p.chart2,
        borderRadius: 6,
        borderSkipped: false as const,
        maxBarThickness: 18,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        align: "end",
        labels: {
          usePointStyle: true,
          pointStyle: "circle",
          boxWidth: 8,
          color: p.mutedFg,
          font: { size: 12 },
        },
      },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: p.mutedFg, font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        ticks: { color: p.mutedFg, font: { size: 11 }, precision: 0 },
        grid: { color: withAlpha(p.border, 0.6) },
        border: { display: false },
      },
    },
  };

  return (
    <div className="h-64 w-full">
      <Bar data={data} options={options} />
    </div>
  );
}
