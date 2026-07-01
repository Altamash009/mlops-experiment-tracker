import Card from "../UI/Card";
import SectionHeader from "../UI/SectionHeader";

import {
    Line
} from "react-chartjs-2";

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler
} from "chart.js";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend,
    Filler
);

function AccuracyChart({ data }) {

    const chartData = {
        labels: data.map(item => `Run ${item.run_id}`),

        datasets: [
            {
                label: "Accuracy",

                data: data.map(item => item.value),

                borderColor: "#2563EB",

                backgroundColor: (context) => {

                    const chart = context.chart;

                    const { ctx, chartArea } = chart;

                    if (!chartArea) return null;

                    const gradient = ctx.createLinearGradient(
                        0,
                        chartArea.top,
                        0,
                        chartArea.bottom
                    );

                    gradient.addColorStop(0, "rgba(37,99,235,0.35)");
                    gradient.addColorStop(1, "rgba(37,99,235,0)");

                    return gradient;
                },

                fill: true,

                borderWidth: 3,

                tension: 0.45,

                pointRadius: 5,

                pointHoverRadius: 7,

                pointBackgroundColor: "#2563EB",

                pointBorderColor: "#ffffff",

                pointBorderWidth: 2
            }
        ]
    };

    const options = {

        responsive: true,

        maintainAspectRatio: false,

        plugins: {

            legend: {
                display: false
            },

            tooltip: {

                backgroundColor: "#1E293B",

                padding: 12,

                cornerRadius: 10,

                titleFont: {
                    size: 14
                },

                bodyFont: {
                    size: 13
                }

            }

        },

        scales: {

            x: {

                grid: {
                    display: false
                },

                ticks: {
                    color: "#64748B"
                }

            },

            y: {

                beginAtZero: false,

                grid: {
                    color: "#E2E8F0"
                },

                ticks: {
                    color: "#64748B"
                }

            }

        }

    };

    return (

        <Card>

            <SectionHeader
                title="Accuracy Trend"
                subtitle="Model accuracy across experiment runs"
            />

            <div className="h-80">

                <Line
                    data={chartData}
                    options={options}
                />

            </div>

        </Card>

    );

}

export default AccuracyChart;