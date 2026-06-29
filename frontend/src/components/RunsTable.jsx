function StatusBadge({ status }) {

    const normalizedStatus = (status || "").toUpperCase();

    const styles = {
        RUNNING: "bg-yellow-100 text-yellow-700",
        COMPLETED: "bg-green-100 text-green-700",
        FINISHED: "bg-green-100 text-green-700",
        FAILED: "bg-red-100 text-red-700",
        ERROR: "bg-red-100 text-red-700",
        CANCELLED: "bg-gray-200 text-gray-700"
    };

    return (
        <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                styles[normalizedStatus] || "bg-gray-100 text-gray-700"
            }`}
        >
            {status}
        </span>
    );
}

function formatDate(date) {

    if (!date) return "-";

    return new Date(date).toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
    });
}

function RunsTable({

    runs

}){

return(

<div className="bg-white rounded-card shadow-card mt-8 overflow-hidden">

<div className="px-6 py-5 border-b">

<div className="flex justify-between items-center">

    <div>

        <h2 className="text-xl font-bold">

            Recent Experiment Runs

        </h2>

        <p className="text-sm text-gray-500">

            Latest training and evaluation runs

        </p>

    </div>

</div>

</div>

<table className="w-full">

<thead className="bg-slate-50 text-slate-600 uppercase text-sm tracking-wide">

<tr>

<th className="p-4 text-left">

Run ID

</th>

<th className="p-4 text-left">

Experiment

</th>

<th className="p-4 text-left">

Status

</th>

<th className="p-4 text-left">

Started

</th>

<th className="p-4 text-left">

Finished

</th>

</tr>

</thead>

<tbody>

{
runs.length === 0 ? (

<tr>

<td
colSpan="5"
className="text-center py-10 text-gray-500"
>

No experiment runs found.

</td>

</tr>

) : (

runs.map(run=>(

<tr
key={run.run_id}
className="border-b hover:bg-blue-50 transition-all duration-200"
>

<td className="p-4">

{run.run_id}

</td>

<td className="p-4">

{run.experiment_name}

</td>

<td className="p-4">

    <StatusBadge status={run.status} />

</td>

<td className="p-4">

{

formatDate(run.start_time)

}

</td>

<td className="p-4">

{

run.end_time

?

formatDate(run.end_time)

:

"-"

}

</td>

</tr>

))

)

}

</tbody>

</table>

</div>

);

}

export default RunsTable;