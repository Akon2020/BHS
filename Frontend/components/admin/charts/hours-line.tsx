"use client";

import { Line } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import { useChartPalette, withAlpha } from "./chart-core";

interface Props {
  labels: string[];
  data: number[];
}

/** Courbe des heures pointées sur 6 mois. */
export function HoursLine({ labels, data }: Props) {
  const p = useChartPalette();

  const chartData = {
    labels,
    datasets: [
      {
        label: "Heures",
        data,
        borderColor: p.chart5,
        backgroundColor: withAlpha(p.chart5, 0.12),
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: p.chart5,
        pointHoverRadius: 5,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: { label: (ctx) => ` ${ctx.parsed.y} h` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: p.mutedFg, font: { size: 11 } },
      },
      y: {
        beginAtZero: true,
        ticks: { color: p.mutedFg, font: { size: 11 } },
        grid: { color: withAlpha(p.border, 0.6) },
        border: { display: false },
      },
    },
    interaction: { mode: "index", intersect: false },
  };

  return (
    <div className="h-56 w-full">
      <Line data={chartData} options={options} />
    </div>
  );
}
