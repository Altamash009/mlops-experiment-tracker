import {
    FaChartLine,
    FaDatabase,
    FaExchangeAlt,
    FaProjectDiagram,
    FaCube,
    FaRocket
} from "react-icons/fa";

import { NavLink } from "react-router-dom";

function Sidebar() {

    const menu = [

        {
            name: "Dashboard",
            icon: <FaChartLine />,
            path: "/"
        },

        {
            name: "Runs",
            icon: <FaDatabase />,
            path: "/runs"
        },

        {
            name: "Compare",
            icon: <FaExchangeAlt />,
            path: "/compare"
        },

        {
            name: "Registry",
            icon: <FaProjectDiagram />,
            path: "/registry"
        },

        {
            name: "Artifacts",
            icon: <FaCube />,
            path: "/artifacts"
        }

    ];

    return (

        <aside className="w-72 bg-slate-900 text-white flex flex-col shadow-2xl">

            {/* Logo */}

            <div className="px-8 py-8 border-b border-slate-800">

                <div className="flex items-center gap-4">

                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-2xl shadow-lg">

                        <FaRocket />

                    </div>

                    <div>

                        <h1 className="text-2xl font-bold">

                            MLOps Tracker

                        </h1>

                        <p className="text-slate-400 text-sm">

                            Enterprise Edition

                        </p>

                    </div>

                </div>

            </div>

            {/* Navigation */}

            <nav className="flex-1 px-5 py-8">

                <p className="text-xs uppercase tracking-widest text-slate-500 mb-4 px-3">

                    Navigation

                </p>

                {

                    menu.map(item => (

                        <NavLink

                            key={item.name}

                            to={item.path}

                            className={({ isActive }) =>

                                `

                                flex

                                items-center

                                gap-4

                                px-4

                                py-4

                                rounded-2xl

                                mb-3

                                transition-all

                                duration-300

                                ${

                                    isActive

                                        ?

                                        "bg-blue-600 shadow-lg"

                                        :

                                        "hover:bg-slate-800"

                                }

                                `

                            }

                        >

                            <div className="text-xl">

                                {item.icon}

                            </div>

                            <span className="font-medium">

                                {item.name}

                            </span>

                        </NavLink>

                    ))

                }

            </nav>

            {/* Footer */}

            <div className="p-5 border-t border-slate-800">

                <div className="rounded-2xl bg-slate-800 p-4">

                    <p className="text-sm text-slate-400">

                        Backend Status

                    </p>

                    <div className="flex items-center gap-3 mt-2">

                        <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>

                        <span className="font-semibold">

                            Connected

                        </span>

                    </div>

                </div>

            </div>

        </aside>

    );

}

export default Sidebar;