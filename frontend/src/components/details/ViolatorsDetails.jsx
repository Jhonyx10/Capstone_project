import useAppState from "../../store/useAppState";
import { useQuery } from "@tanstack/react-query";
import { violatorsDetails } from "../../functions/ReportsApi";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useParams } from "react-router-dom";

const ViolatorsDetails = () => {
    const { darkMode, token, base_url } = useAppState();
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        data: violator,
        isLoading: isViolatorLoading,
        isError: isViolatorError,
    } = useQuery({
        queryKey: ["violator_details", id],
        queryFn: () => violatorsDetails({ base_url, token, id }),
    });

    if (isViolatorLoading)
        return (
            <div className="flex justify-center item-center mt-10 text-white">
                <p className="font-bold text-2xl">Loading...</p>
            </div>
        );
    if (isViolatorError || !violator) return <p>No record found.</p>;

    return (
        <motion.div
            layout
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.1,
            }}
            className={`w-1/2 min-h-screen mx-auto px-6 py-10 space-y-8 ${
                darkMode ? "bg-slate-900" : "bg-gray-50"
            }`}
        >
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2
                    className={`text-2xl font-bold ${
                        darkMode ? "text-slate-100" : "text-gray-800"
                    }`}
                >
                    Violator Details
                </h2>
                <button
                    onClick={() => navigate(-1)}
                    className="bg-green-500 p-2 w-20 rounded-lg hover:bg-green-400"
                >
                    <h5 className="text-white font-bold">Back</h5>
                </button>
            </div>

            {/* Violator Info */}
            <motion.div
                layout
                className={`shadow-md rounded-2xl p-6 flex items-center space-x-6 ${
                    darkMode
                        ? "bg-slate-800 text-slate-200"
                        : "bg-white text-gray-800"
                }`}
            >
                <img
                    src={violator?.photo}
                    alt={violator?.first_name}
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-slate-700"
                />
                <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                        <p>
                            <span className="font-semibold">Name:</span>{" "}
                            {violator?.first_name} {violator?.last_name}
                        </p>
                        <p>
                            <span className="font-semibold">Age:</span>{" "}
                            {violator?.age}
                        </p>
                    </div>
                    <div>
                        <p>
                            <span className="font-semibold">Address:</span>{" "}
                            {violator?.address}
                        </p>
                        <p>
                            <span className="font-semibold">Zone:</span>{" "}
                            {violator?.zone?.zone_name}
                        </p>
                    </div>
                </div>
            </motion.div>
            {/* Records */}
            <motion.div
                layout
                className={`shadow-md rounded-2xl p-6 space-y-4 ${
                    darkMode
                        ? "bg-slate-800 text-slate-200"
                        : "bg-white text-gray-800"
                }`}
            >
                <h3 className="text-xl font-semibold border-b pb-2 mb-4">
                    Violator Records
                </h3>
                {isViolatorLoading ? (
                    <p>Loading records...</p>
                ) : violator?.reports && violator.reports.length > 0 ? (
                    <div className="w-full">
                        {violator.reports.map((record) => (
                            <motion.div
                                key={record.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 20,
                                    delay: 0.1,
                                }}
                                className={`rounded-lg shadow-md p-4 mt-2 border ${
                                    darkMode
                                        ? "bg-slate-900 border-slate-700"
                                        : "bg-gray-50 border-gray-200"
                                }`}
                            >
                                <div className="flex justify-between">
                                    <div>
                                        <p className="font-semibold text-sm">
                                            Incident:{" "}
                                            <span className="text-green-500">
                                                {
                                                    record?.incident_type
                                                        ?.category
                                                        ?.category_name
                                                }
                                            </span>
                                        </p>
                                        <p className="font-semibold text-sm">
                                            Incident:{" "}
                                            <span className="text-green-500">
                                                {
                                                    record?.incident_type
                                                        ?.incident_name
                                                }
                                            </span>
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm">
                                            Date:{" "}
                                            <span className="font-medium">
                                                {record?.date}
                                            </span>
                                        </p>
                                        <p className="text-sm">
                                            Time:{" "}
                                            <span className="font-medium">
                                                {new Date(
                                                    `1970-01-01T${record?.time}`
                                                ).toLocaleTimeString("en-US", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                                <div className="mt-2 flex justify-between items-center">
                                    <div>
                                        <p className="text-sm">
                                            Address:{" "}
                                            <span className="font-medium">
                                                {
                                                    record?.location?.zone
                                                        ?.zone_name
                                                }
                                                ,{" "}
                                                {
                                                    record?.location
                                                        ?.location_name
                                                }
                                            </span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={() =>
                                            navigate(
                                                `/report-details/${record.id}`
                                            )
                                        }
                                        className="bg-green-600 w-14 rounded hover:bg-green-500 hover:cursor-pointer"
                                    >
                                        <p className="text-white">View</p>
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p>No records available.</p>
                )}
            </motion.div>
        </motion.div>
    );
};

export default ViolatorsDetails;
