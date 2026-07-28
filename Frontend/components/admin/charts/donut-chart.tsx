"use client";

import { Doughnut } from "react-chartjs-2";
import type { ChartOptions } from "chart.js";
import "./chart-core";

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface Props {
  segments: DonutSegment[];
  centerValue?: string | number;
  centerLabel?: string;
}

/** Donut générique : segments colorés, total au centre, légende chiffrée. */
export function DonutChart({ segments, centerValue, centerLabel }: Props) {
  const total = segments.reduce((a, s) => a + s.value, 0);
  const center = centerValue ?? total;

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
      tooltip: { callbacks: { label: (ctx) => ` ${ctx.label} : ${ctx.parsed}` } },
    },
  };

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <div className="relative h-40 w-40 shrink-0">
        {total === 0 ? (
          <div className="flex h-full w-full items-center justify-center rounded-full border-8 border-muted text-sm text-muted-foreground">
            Aucune donnée
          </div>
        ) : (
          <>
            <Doughnut data={data} options={options} />
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold tabular-nums">{center}</span>
              {centerLabel && (
                <span className="text-xs text-muted-foreground">
                  {centerLabel}
                </span>
              )}
            </div>
          </>
        )}
      </div>
      <ul className="w-full space-y-2">
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
