function ProgressBar({ value }) {

    return (

        <div className="w-full">

            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">

                <div
                    className="
                        h-full
                        rounded-full
                        bg-gradient-to-r
                        from-blue-500
                        to-indigo-600
                        transition-all
                        duration-700
                    "
                    style={{
                        width: `${value}%`
                    }}
                />

            </div>

            <div className="flex justify-end mt-2">

                <span className="text-xs text-slate-500">

                    {value.toFixed(2)}%

                </span>

            </div>

        </div>

    );

}

export default ProgressBar;