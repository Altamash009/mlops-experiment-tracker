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

Legend

} from "chart.js";

ChartJS.register(

CategoryScale,

LinearScale,

PointElement,

LineElement,

Tooltip,

Legend

);

function AccuracyChart({

    data

}) {

    const chartData = {

        labels: data.map(item => `Run ${item.run_id}`),

        datasets: [

            {

                label: "Accuracy",

                data: data.map(item => item.value),

                borderColor: "#2563EB",

                backgroundColor: "#93C5FD",

                tension: 0.35

            }

        ]

    };

    return (

        <div className="bg-white rounded-card shadow-card p-6">

            <h2 className="text-xl font-bold mb-6">

                Accuracy Trend

            </h2>

            <Line data={chartData} />

        </div>

    );

}

export default AccuracyChart;