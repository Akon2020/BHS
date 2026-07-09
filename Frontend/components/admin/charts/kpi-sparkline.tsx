"use client";

import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { withAlpha } from "./chart-core";

interface Props {
  data: number[];
  /** Couleur (oklch résolu) de la courbe. */
  color: string;
}

/** Mini-courbe de tendance (sans axes ni légende) pour les cartes KPI. */
export function KpiSparkline({ data, color }: Props) {
  const chartData = {
    labels: data.map((_, i) => String(i)),
    datasets: [
      {
        data,
        borderColor: color,
        backgroundColor: withAlpha(color, 0.15),
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 0,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: { display: false, beginAtZero: true },
    },
    elements: { line: { borderJoinStyle: "round" } },
    animation: false,
  };

  return (
    <div className="h-12 w-full" aria-hidden="true">
      <Line data={chartData} options={options} />
    </div>
  );
}
