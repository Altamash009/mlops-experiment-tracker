import {
    Doughnut
} from "react-chartjs-2";

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

    const chartData = {

        labels: Object.keys(data),

        datasets: [
            {
                data: Object.values(data),

                backgroundColor: [
                    "#22C55E",
                    "#F59E0B",
                    "#EF4444",
                    "#6B7280"
                ],

                borderWidth: 2
            }
        ]
    };

    const options = {

        plugins: {

            legend: {

                position: "bottom"

            }

        }

    };

    return (

        <div className="bg-white rounded-card shadow-card p-6">

            <h2 className="text-xl font-bold mb-6">

                Run Status Distribution

            </h2>

            <Doughnut
                data={chartData}
                options={options}
            />

        </div>

    );

}

export default StatusChart;