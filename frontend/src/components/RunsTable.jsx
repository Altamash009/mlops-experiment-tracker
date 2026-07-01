import Card from "./UI/Card";
import SectionHeader from "./UI/SectionHeader";

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
            className={`
                px-3
                py-1
                rounded-full
                text-xs
                font-semibold
                whitespace-nowrap
                ${styles[normalizedStatus] || "bg-gray-100 text-gray-700"}
            `}
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

function RunsTable({ runs }) {

    return (

        <Card className="mt-10">

            <SectionHeader
                title="Recent Experiment Runs"
                subtitle="Latest training and evaluation activity"
            />

            <div className="overflow-x-auto rounded-xl border border-slate-200">

                <table className="min-w-full">

                    <thead className="bg-slate-100 sticky top-0">

                        <tr>

                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                                Run ID
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                                Experiment
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                                Status
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                                Started
                            </th>

                            <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
                                Finished
                            </th>

                        </tr>

                    </thead>

                    <tbody className="divide-y divide-slate-200">

                        {

                            runs.length === 0 ?

                            (

                                <tr>

                                    <td
                                        colSpan="5"
                                        className="py-16 text-center text-slate-500"
                                    >

                                        <div className="flex flex-col items-center">

                                            <div className="text-5xl mb-4">

                                                📊

                                            </div>

                                            <h3 className="text-lg font-semibold">

                                                No Runs Found

                                            </h3>

                                            <p className="text-sm mt-2">

                                                Start an experiment to see results here.

                                            </p>

                                        </div>

                                    </td>

                                </tr>

                            )

                            :

                            (

                                runs.map((run) => (

                                    <tr
                                        key={run.run_id}
                                        className="
                                            hover:bg-blue-50
                                            transition-all
                                            duration-200
                                        "
                                    >

                                        <td className="px-6 py-5 font-semibold text-slate-700">

                                            #{run.run_id}

                                        </td>

                                        <td className="px-6 py-5">

                                            <div>

                                                <p className="font-semibold text-slate-800">

                                                    {run.experiment_name}

                                                </p>

                                                <p className="text-sm text-slate-500">

                                                    Machine Learning Experiment

                                                </p>

                                            </div>

                                        </td>

                                        <td className="px-6 py-5">

                                            <StatusBadge
                                                status={run.status}
                                            />

                                        </td>

                                        <td className="px-6 py-5 text-slate-600">

                                            {formatDate(run.start_time)}

                                        </td>

                                        <td className="px-6 py-5 text-slate-600">

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

        </Card>

    );

}

export default RunsTable;