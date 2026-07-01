import Layout from "../components/Layout";
import DashboardCard from "../components/DashboardCard";
import RunsTable from "../components/RunsTable";

import AccuracyChart from "../components/Analytics/AccuracyChart";
import StatusChart from "../components/Analytics/StatusChart";
import TopModels from "../components/Analytics/TopModels";

import { useEffect, useState } from "react";

import {
    getDashboardSummary,
    getRecentRuns,
    getDashboardAnalytics,
} from "../services/api";

import {
    FaDatabase,
    FaProjectDiagram,
    FaCube,
    FaRocket,
    FaSyncAlt
} from "react-icons/fa";

function Dashboard() {

    const [summary, setSummary] = useState(null);
    const [runs, setRuns] = useState([]);
    const [analytics, setAnalytics] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    async function loadDashboard() {

        try {

            setLoading(true);

            const summaryData = await getDashboardSummary();
            const recentRuns = await getRecentRuns();
            const analyticsData = await getDashboardAnalytics();

            setSummary(summaryData);
            setRuns(recentRuns);
            setAnalytics(analyticsData);

            setError("");

        }

        catch {

            setError("Failed to load dashboard.");

        }

        finally {

            setLoading(false);

        }

    }

    useEffect(() => {

        loadDashboard();

    }, []);

    if (loading) {

        return (

            <Layout>

                <div className="flex justify-center items-center h-[70vh]">

                    <div className="text-center">

                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>

                        <p className="mt-5 text-slate-500 text-lg">

                            Loading Dashboard...

                        </p>

                    </div>

                </div>

            </Layout>

        );

    }

    if (error) {

        return (

            <Layout>

                <div className="bg-red-50 border border-red-200 rounded-2xl p-6">

                    <h2 className="text-red-600 text-lg font-semibold">

                        {error}

                    </h2>

                </div>

            </Layout>

        );

    }

    return (

        <Layout>

            {/* HEADER */}

            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-10">

                <div>

                    <h1 className="text-4xl font-bold text-slate-800">

                        Dashboard

                    </h1>

                    <p className="text-slate-500 mt-2 text-lg">

                        Monitor experiments, models and production deployments.

                    </p>

                </div>

                <div className="flex items-center gap-4 mt-5 lg:mt-0">

                    <span className="text-sm text-slate-500">

                        Last Updated

                        {" "}

                        {new Date().toLocaleTimeString()}
                    </span>

                    <button
                        onClick={loadDashboard}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl shadow transition-all duration-300"
                    >

                        <FaSyncAlt />

                        Refresh

                    </button>

                </div>

            </div>

            {/* SUMMARY CARDS */}

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

                <DashboardCard
                    title="Total Runs"
                    value={summary.total_runs}
                    icon={<FaDatabase />}
                    color="text-blue-600"
                />

                <DashboardCard
                    title="Registered Models"
                    value={summary.registered_models}
                    icon={<FaProjectDiagram />}
                    color="text-green-600"
                />

                <DashboardCard
                    title="Artifacts"
                    value={summary.artifacts}
                    icon={<FaCube />}
                    color="text-purple-600"
                />

                <DashboardCard
                    title="Production Models"
                    value={summary.production_models}
                    icon={<FaRocket />}
                    color="text-red-600"
                />

            </div>

            {/* RECENT RUNS */}

            <div className="mt-10">

                <RunsTable runs={runs} />

            </div>

            {/* ANALYTICS */}

            {

                analytics && (

                    <div className="mt-10 grid grid-cols-1 xl:grid-cols-3 gap-6">

                        <AccuracyChart
                            data={analytics.metric_trends.accuracy}
                        />

                        <StatusChart
                            data={analytics.status_distribution}
                        />

                        <TopModels
                            models={analytics.top_models}
                        />

                    </div>

                )

            }

        </Layout>

    );

}

export default Dashboard;