import Layout from "../components/Layout";
import DashboardCard from "../components/DashboardCard";
import { useEffect, useState } from "react";

import { getDashboardSummary } from "../services/api";

import {

FaDatabase,

FaProjectDiagram,

FaCube,

FaRocket

} from "react-icons/fa";

function Dashboard(){

const [summary, setSummary] = useState(null);

const [loading, setLoading] = useState(true);

const [error, setError] = useState("");

useEffect(() => {

    async function loadDashboard() {

        try {

            const data = await getDashboardSummary();

            setSummary(data);

        }

        catch {

            setError("Failed to load dashboard.");

        }

        finally {

            setLoading(false);

        }

    }

    loadDashboard();

}, []);

if (loading) {

    return (

        <Layout>

            <h2 className="text-2xl font-semibold">

                Loading dashboard...

            </h2>

        </Layout>

    );

}

if (error) {

    return (

        <Layout>

            <h2 className="text-red-600">

                {error}

            </h2>

        </Layout>

    );

}

return(

<Layout>

<div className="mb-10">

<h1 className="text-4xl font-bold">

Dashboard

</h1>

<p className="text-gray-500 mt-2">

Monitor your machine learning experiments in real time.

</p>

</div>

<div className="grid grid-cols-4 gap-6">

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

color="text-red-500"

/>

</div>

</Layout>

);

}

export default Dashboard;