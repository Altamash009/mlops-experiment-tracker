import Card from "./UI/Card";

function DashboardCard({

    title,
    value,
    icon,
    color

}) {

    return (

        <Card
            className="
                relative
                overflow-hidden
                group
                cursor-pointer
            "
        >

            {/* Decorative Background */}

            <div
                className="
                    absolute
                    -right-10
                    -top-10
                    w-36
                    h-36
                    rounded-full
                    bg-slate-100
                    opacity-50
                    group-hover:scale-110
                    transition-all
                    duration-500
                "
            />

            {/* Icon */}

            <div
                className={`
                    w-16
                    h-16
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    text-3xl
                    shadow-lg
                    mb-6

                    ${color}

                    bg-slate-100

                    group-hover:scale-110
                    transition-all
                    duration-300
                `}
            >

                {icon}

            </div>

            {/* Title */}

            <p
                className="
                    text-slate-500
                    text-sm
                    font-semibold
                    uppercase
                    tracking-wider
                "
            >

                {title}

            </p>

            {/* Number */}

            <h2
                className="
                    text-5xl
                    font-bold
                    text-slate-800
                    mt-3
                "
            >

                {value}

            </h2>

            {/* Footer */}

            <div
                className="
                    mt-6
                    flex
                    justify-between
                    items-center
                "
            >

                <span
                    className="
                        text-green-600
                        text-sm
                        font-semibold
                    "
                >

                    ↑ Active

                </span>

                <span
                    className="
                        text-slate-400
                        text-xs
                    "
                >

                    Updated now

                </span>

            </div>

        </Card>

    );

}

export default DashboardCard;