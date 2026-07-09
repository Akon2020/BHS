"use client";

import { Doughnut } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { useChartPalette } from "./chart-core";

interface Props {
  aFaire: number;
  enCours: number;
  fait: number;
}

/** Donut de répartition des tâches par statut. */
export function TasksDonut({ aFaire, enCours, fait }: Props) {
  const p = useChartPalette();
  const total = aFaire + enCours + fait;

  const segments = [
    { label: "À faire", value: aFaire, color: p.chart3 },
    { label: "En cours", value: enCours, color: p.chart4 },
    { label: "Fait", value: fait, color: p.chart2 },
  ];

  const data = {
    labels: segments.map((s) => s.label),
    datasets: [
      {
        data: segments.map((s) => s.value),
        backgroundColor: segments.map((s) => s.color),
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "72%",
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) => ` ${ctx.label} : ${ctx.parsed}`,
        },
      },
    },
  };

  return (
    <div className="space-y-4">
      <div className="relative mx-auto h-44 w-44">
        {total === 0 ? (
          <div className="flex h-full w-full items-center justify-center rounded-full border-8 border-muted text-sm text-muted-foreground">
            Aucune
          </div>
        ) : (
          <>
            <Doughnut data={data} options={options} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold tabular-nums">{total}</span>
              <span className="text-xs text-muted-foreground">tâches</span>
            </div>
          </>
        )}
      </div>
      <ul className="space-y-2">
        {segments.map((s) => (
          <li
            key={s.label}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-muted-foreground">{s.label}</span>
            </span>
            <span className="font-semibold tabular-nums">{s.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
