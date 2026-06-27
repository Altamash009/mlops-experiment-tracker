function DashboardCard({
    title,
    value,
    icon,
    color
}) {

    return (

        <div
            className="
            bg-white
            rounded-card
            shadow-card
            hover:shadow-hover
            transition-all
            duration-300
            p-6
            flex
            justify-between
            items-center
            "
        >

            <div>

                <p className="text-gray-500 text-sm">

                    {title}

                </p>

                <h2 className="text-4xl font-bold mt-2">

                    {value}

                </h2>

            </div>

            <div
                className={`
                    text-5xl
                    ${color}
                `}
            >

                {icon}

            </div>

        </div>

    );

}

export default DashboardCard;