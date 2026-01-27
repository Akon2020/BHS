"use client"

import { useEffect, useState } from "react"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartData,
} from "chart.js"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

// Generate random data for the chart
const generateData = () => {
  const labels = Array.from({ length: 30 }, (_, i) => `${i + 1}`)
  const data1 = Array.from({ length: 30 }, () => Math.floor(Math.random() * 100) + 50)
  const data2 = Array.from({ length: 30 }, () => Math.floor(Math.random() * 50) + 20)

  return {
    labels,
    datasets: [
      {
        label: "Visites",
        data: data1,
        borderColor: "hsl(346, 77%, 49%)",
        backgroundColor: "rgba(220, 38, 38, 0.1)",
        fill: true,
        tension: 0.4,
      },
      {
        label: "Pages vues",
        data: data2,
        borderColor: "hsl(217, 91%, 60%)",
        backgroundColor: "rgba(37, 99, 235, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  }
}

export default function AdminChart() {
  const [chartData, setChartData] = useState<ChartData<"line">>({ datasets: [] })
  const [chartOptions, setChartOptions] = useState({})

  useEffect(() => {
    setChartData(generateData())
    setChartOptions({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top" as const,
        },
        tooltip: {
          mode: "index" as const,
          intersect: false,
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            drawBorder: false,
          },
        },
        x: {
          grid: {
            display: false,
          },
        },
      },
      interaction: {
        mode: "nearest" as const,
        axis: "x" as const,
        intersect: false,
      },
    })
  }, [])

  return (
    <div className="h-[300px] w-full">
      <Line options={chartOptions} data={chartData} />
    </div>
  )
}
