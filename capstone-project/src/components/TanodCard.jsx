import useVolunteers from "../hooks/useVolunteers";

const TanodCard = () => {
    const { data } = useVolunteers();

    if (!data || data.length === 0) {
        return (
            <p className="text-gray-500 dark:text-gray-300">
                No volunteers found.
            </p>
        );
    }

    return (
        <>
            {data.map((volunteer) => (
                <div
                    key={volunteer.id}
                    className="bg-green-500 dark:bg-green-700 text-white rounded-lg shadow p-4 flex flex-col gap-2 hover:scale-105 transform transition"
                >
                    <h3 className="text-lg font-semibold">Brgy. Tanod</h3>
                    <p>
                        <span className="font-medium">Name:</span>{" "}
                        {volunteer.name}
                    </p>
                    <p>
                        <span className="font-medium">Email:</span>{" "}
                        {volunteer.email}
                    </p>
                </div>
            ))}
        </>
    );
};

export default TanodCard;
