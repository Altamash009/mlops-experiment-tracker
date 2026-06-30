function TopModels({ models }) {

    return (

        <div className="bg-white rounded-card shadow-card p-6">

            <h2 className="text-xl font-bold">

                Top Performing Models

            </h2>

            <p className="text-gray-500 text-sm mb-6">

                Ranked by Accuracy

            </p>

            <div className="space-y-5">

                {models.map((model, index) => (

                    <div
                        key={index}
                        className="flex items-center justify-between"
                    >

                        <div>

                            <h3 className="font-semibold">

                                {model.model_name}

                            </h3>

                            <span className="text-sm text-gray-500">

                                {model.version}

                            </span>

                        </div>

                        <div className="text-lg font-bold text-blue-600">

                            {model.accuracy}%

                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}

export default TopModels;