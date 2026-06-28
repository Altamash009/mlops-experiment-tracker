function RunsTable({

    runs

}){

return(

<div className="bg-white rounded-card shadow-card mt-8 overflow-hidden">

<div className="px-6 py-5 border-b">

<h2 className="text-xl font-semibold">

Recent Runs

</h2>

</div>

<table className="w-full">

<thead className="bg-slate-100">

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

runs.map(run=>(

<tr
key={run.run_id}
className="border-b hover:bg-slate-50 transition"
>

<td className="p-4">

{run.run_id}

</td>

<td className="p-4">

{run.experiment_name}

</td>

<td className="p-4">

{run.status}

</td>

<td className="p-4">

{

new Date(run.start_time)

.toLocaleString()

}

</td>

<td className="p-4">

{

run.end_time

?

new Date(run.end_time)

.toLocaleString()

:

"-"

}

</td>

</tr>

))

}

</tbody>

</table>

</div>

);

}

export default RunsTable;