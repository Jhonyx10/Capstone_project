import useAppState from "../../store/useAppState";
import { useQuery } from "@tanstack/react-query";
import { violatorsDetails, violatorsRecords } from "../../functions/ReportsApi";
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

    const { data: records, isLoading: isRecordsLoading } = useQuery({
        queryKey: ["records", id],
        queryFn: () => violatorsRecords({ base_url, token, id }),
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
                className={`shadow-md rounded-2xl p-6 ${
                    darkMode
                        ? "bg-slate-800 text-slate-200"
                        : "bg-white text-gray-800"
                }`}
            >
                <h3 className="text-xl font-semibold border-b pb-2 mb-4">
                    Violator Records
                </h3>
                {isRecordsLoading ? (
                    <p>Loading records...</p>
                ) : records && records.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <table
                            className={`min-w-full divide-y text-sm ${
                                darkMode
                                    ? "divide-slate-700"
                                    : "divide-gray-200"
                            }`}
                        >
                            <motion.thead
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
                                className={
                                    darkMode ? "bg-slate-800" : "bg-gray-50"
                                }
                            >
                                <tr>
                                    {[
                                        "Category",
                                        "Incident",
                                        "Date",
                                        "Time",
                                        "Zone",
                                        "Location",
                                        "Filed By",
                                        "Action",
                                    ].map((header, idx) => (
                                        <th
                                            key={idx}
                                            className={`px-4 py-3 w-40 text-center text-xs font-medium uppercase tracking-wider ${
                                                darkMode
                                                    ? "text-gray-200"
                                                    : "text-gray-600"
                                            }`}
                                        >
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </motion.thead>
                            {isRecordsLoading ? (
                                <div className="text-center text-white font-bold m-2">
                                    <h1>Loading..</h1>
                                </div>
                            ) : (
                                <tbody
                                    className={
                                        darkMode ? "bg-slate-900" : "bg-white"
                                    }
                                >
                                    {records.map((record, index) => (
                                        <motion.tr
                                            key={violator.id}
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{
                                                type: "spring",
                                                stiffness: 200,
                                                damping: 20,
                                                delay: 0.2,
                                            }}
                                            className={
                                                index % 2 === 0
                                                    ? darkMode
                                                        ? "bg-slate-800"
                                                        : "bg-white"
                                                    : darkMode
                                                    ? "bg-slate-900"
                                                    : "bg-gray-50"
                                            }
                                        >
                                            <td
                                                className={
                                                    darkMode
                                                        ? "px-4 py-3 text-gray-200 text-center"
                                                        : "px-4 py-3 text-gray-700 text-center"
                                                }
                                            >
                                                {
                                                    record?.incident_type
                                                        ?.category
                                                        ?.category_name
                                                }
                                            </td>
                                            <td
                                                className={
                                                    darkMode
                                                        ? "px-4 py-3 text-gray-200 text-center"
                                                        : "px-4 py-3 text-gray-700 text-center"
                                                }
                                            >
                                                {
                                                    record?.incident_type
                                                        ?.incident_name
                                                }
                                            </td>
                                            <td
                                                className={
                                                    darkMode
                                                        ? "px-4 py-3 text-gray-200 text-center"
                                                        : "px-4 py-3 text-gray-700 text-center"
                                                }
                                            >
                                                {record?.date}
                                            </td>
                                            <td
                                                className={
                                                    darkMode
                                                        ? "px-4 py-3 text-gray-200 text-center"
                                                        : "px-4 py-3 text-gray-700 text-center"
                                                }
                                            >
                                                {new Date(
                                                    `1970-01-01T${record?.time}`
                                                ).toLocaleTimeString("en-US", {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                    hour12: true,
                                                })}
                                            </td>
                                            <td
                                                className={
                                                    darkMode
                                                        ? "px-4 py-3 text-gray-200 text-center"
                                                        : "px-4 py-3 text-gray-700 text-center"
                                                }
                                            >
                                                {
                                                    record?.location?.zone
                                                        ?.zone_name
                                                }
                                            </td>
                                            <td
                                                className={
                                                    darkMode
                                                        ? "px-4 py-3 text-gray-200 text-center"
                                                        : "px-4 py-3 text-gray-700 text-center"
                                                }
                                            >
                                                {
                                                    record?.location
                                                        ?.location_name
                                                }
                                            </td>
                                            <td
                                                className={
                                                    darkMode
                                                        ? "px-4 py-3 text-gray-200 text-center"
                                                        : "px-4 py-3 text-gray-700 text-center"
                                                }
                                            >
                                                {record?.user?.name}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() =>
                                                        navigate(
                                                            `/report-details/${report.id}`
                                                        )
                                                    }
                                                    className="px-3 py-1 text-xs font-medium bg-green-400 text-white rounded hover:bg-green-500 transition hover:cursor-pointer"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            )}
                        </table>
                    </div>
                ) : (
                    <p>No records available.</p>
                )}
            </motion.div>
        </motion.div>
    );
};

export default ViolatorsDetails;
