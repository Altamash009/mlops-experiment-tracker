import Card from "../UI/Card";
import SectionHeader from "../UI/SectionHeader";

import { Doughnut } from "react-chartjs-2";

import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

function StatusChart({ data }) {

    const labels = Object.keys(data);
    const values = Object.values(data);

    const totalRuns = values.reduce((a, b) => a + b, 0);

    const chartData = {

        labels,

        datasets: [

            {

                data: values,

                backgroundColor: [

                    "#22C55E",
                    "#F59E0B",
                    "#EF4444",
                    "#64748B"

                ],

                borderColor: "#ffffff",

                borderWidth: 4,

                hoverOffset: 12,

                cutout: "72%"

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

                cornerRadius: 10,

                padding: 12,

                titleFont: {

                    size: 14

                },

                bodyFont: {

                    size: 13

                }

            }

        }

    };

    const colors = [

        "bg-green-500",

        "bg-yellow-500",

        "bg-red-500",

        "bg-slate-500"

    ];

    return (

        <Card>

            <SectionHeader

                title="Run Status"

                subtitle="Distribution of experiment status"

            />

            <div className="relative h-80">

                <Doughnut

                    data={chartData}

                    options={options}

                />

                {/* Center Text */}

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">

                    <p className="text-4xl font-bold text-slate-800">

                        {totalRuns}

                    </p>

                    <p className="text-sm text-slate-500">

                        Total Runs

                    </p>

                </div>

            </div>

            {/* Custom Legend */}

            <div className="mt-8 space-y-3">

                {

                    labels.map((label, index) => (

                        <div

                            key={label}

                            className="flex justify-between items-center"

                        >

                            <div className="flex items-center gap-3">

                                <div

                                    className={`

                                        w-3

                                        h-3

                                        rounded-full

                                        ${colors[index]}

                                    `}

                                />

                                <span className="text-slate-700 font-medium">

                                    {label}

                                </span>

                            </div>

                            <span className="font-bold text-slate-800">

                                {values[index]}

                            </span>

                        </div>

                    ))

                }

            </div>

        </Card>

    );

}

export default StatusChart;