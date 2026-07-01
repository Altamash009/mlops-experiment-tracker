import Card from "../UI/Card";
import SectionHeader from "../UI/SectionHeader";
import ProgressBar from "../UI/ProgressBar";

function TopModels({ models }) {

    return (

        <Card>

            <SectionHeader
                title="Top Performing Models"
                subtitle="Highest accuracy across registered models"
            />

            {

                models.length === 0 ?

                (

                    <div className="h-72 flex flex-col justify-center items-center">

                        <div className="text-5xl mb-4">

                            🤖

                        </div>

                        <h3 className="text-xl font-semibold text-slate-700">

                            No Models Found

                        </h3>

                        <p className="text-slate-500 mt-2">

                            Register a model to see the leaderboard.

                        </p>

                    </div>

                )

                :

                (

                    <div className="space-y-6">

                        {

                            models.map((model, index) => {

                                const medals = [

                                    "🥇",

                                    "🥈",

                                    "🥉"

                                ];

                                return (

                                    <div

                                        key={`${model.model_name}-${model.version}`}

                                        className="
                                            p-5
                                            rounded-2xl
                                            border
                                            border-slate-200
                                            hover:border-blue-300
                                            hover:shadow-lg
                                            transition-all
                                            duration-300
                                        "

                                    >

                                        <div className="flex justify-between items-start">

                                            <div className="flex items-center gap-4">

                                                <div
                                                    className="
                                                        w-12
                                                        h-12
                                                        rounded-xl
                                                        bg-slate-100
                                                        flex
                                                        items-center
                                                        justify-center
                                                        text-2xl
                                                    "
                                                >

                                                    {

                                                        medals[index] || "🏅"

                                                    }

                                                </div>

                                                <div>

                                                    <h3 className="text-lg font-bold text-slate-800">

                                                        {model.model_name}

                                                    </h3>

                                                    <div className="flex items-center gap-2 mt-2">

                                                        <span
                                                            className="
                                                                px-3
                                                                py-1
                                                                rounded-full
                                                                bg-blue-100
                                                                text-blue-700
                                                                text-xs
                                                                font-semibold
                                                            "
                                                        >

                                                            Version {model.version}

                                                        </span>

                                                    </div>

                                                </div>

                                            </div>

                                            <div className="text-right">

                                                <p className="text-3xl font-bold text-blue-600">

                                                    {model.accuracy.toFixed(2)}%

                                                </p>

                                                <p className="text-xs text-slate-500 mt-1">

                                                    Accuracy

                                                </p>

                                            </div>

                                        </div>

                                        <div className="mt-5">

                                            <ProgressBar

                                                value={model.accuracy}

                                            />

                                        </div>

                                    </div>

                                );

                            })

                        }

                    </div>

                )

            }

        </Card>

    );

}

export default TopModels;