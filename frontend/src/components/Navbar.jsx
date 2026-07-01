import {

    FaBell,
    FaUserCircle,
    FaSyncAlt

} from "react-icons/fa";

function Navbar() {

    return (

        <header className="h-24 bg-white border-b border-slate-200 flex items-center justify-between px-10">

            <div>

                <h1 className="text-3xl font-bold text-slate-800">

                    Dashboard

                </h1>

                <p className="text-slate-500 mt-1">

                    Monitor machine learning experiments and deployments.

                </p>

            </div>

            <div className="flex items-center gap-6">

                <button className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-blue-100 transition flex items-center justify-center">

                    <FaSyncAlt className="text-slate-600" />

                </button>

                <button className="relative w-11 h-11 rounded-xl bg-slate-100 hover:bg-blue-100 transition flex items-center justify-center">

                    <FaBell className="text-slate-600" />

                    <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full"></span>

                </button>

                <div className="flex items-center gap-3">

                    <FaUserCircle className="text-5xl text-blue-600" />

                    <div>

                        <p className="font-semibold text-slate-800">

                            Altamash

                        </p>

                        <p className="text-sm text-slate-500">

                            ML Engineer

                        </p>

                    </div>

                </div>

            </div>

        </header>

    );

}

export default Navbar;