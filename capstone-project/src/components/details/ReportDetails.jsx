import useAppState from "../../store/useAppState";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ReportViolators from "./ReportViolators";
import { useQuery } from "@tanstack/react-query";
import { reportDetails } from "../../functions/ReportsApi";

const ReportDetails = () => {
    const { id } = useParams();
    const { darkMode, token, base_url } = useAppState();
   const navigation = useNavigate();

    const {
        data: report,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["report_details", id],
        queryFn: () => reportDetails({ token, base_url, id }),
    });

    if (isLoading) return (
        <div className="flex justify-center item-center mt-10 text-white">
            <p className="font-bold text-2xl">Loading...</p>
        </div>
    );
    if (isError || !report) return <p>No report found.</p>;

    if (!report) {
        return (
            <p
                className={`text-center mt-10 text-lg ${
                    darkMode ? "text-gray-400" : "text-gray-600"
                }`}
            >
                No report found.
            </p>
        );
    }

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
            className={`w-1/2 mx-auto px-6 py-10 space-y-8 ${
                darkMode ? "bg-slate-900" : "bg-gray-50"
            }`}
        >
            {/* Title */}
            <div className="flex justify-between item-center">
                <h2
                    className={`text-3xl font-bold text-left ${
                        darkMode ? "text-slate-100" : "text-gray-800"
                    }`}
                >
                    Report Details
                </h2>
                <button
                    onClick={() => navigation(-1)}
                    className="bg-green-500 p-2 w-20 rounded-lg hover:bg-green-400 hover:cursor-pointer"
                >
                    <h5 className="text-white font-bold hover:text-slate-800">
                        Back
                    </h5>
                </button>
            </div>

            {/* Header Section */}
            <motion.div
                layout
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: 0.2,
                }}
                className={`flex justify-between shadow-md rounded-2xl p-6 space-y-3 ${
                    darkMode
                        ? "bg-slate-800 text-slate-200"
                        : "bg-white text-gray-800"
                }`}
            >
                <motion.div
                    layout
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: 0.3,
                    }}
                >
                    <p className="text-lg">
                        <span className="font-semibold">Reported By:</span>{" "}
                        {report?.user?.name}
                    </p>
                    <p>
                        <span className="font-semibold">Role:</span>{" "}
                        {report?.user?.role}
                    </p>
                </motion.div>
                <motion.div
                    layout
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: 0.3,
                    }}
                >
                    <p>
                        <span className="font-semibold">Date:</span>{" "}
                        {report?.date}
                    </p>
                    <p>
                        <span className="font-semibold">Time:</span>{" "}
                        {new Date(
                            `1970-01-01T${report?.time}`
                        ).toLocaleTimeString("en-US", {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                        })}
                    </p>
                </motion.div>
            </motion.div>

            {/* Incident Info */}
            <motion.div
                layout
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: 0.3,
                }}
                className={`shadow-md rounded-2xl p-6 space-y-4 ${
                    darkMode
                        ? "bg-slate-800 text-slate-200"
                        : "bg-white text-gray-800"
                }`}
            >
                <motion.h3
                    layout
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: 0.4,
                    }}
                    className={`text-xl font-semibold border-b pb-2 ${
                        darkMode ? "border-slate-700" : "border-gray-200"
                    }`}
                >
                    Incident Information
                </motion.h3>
                <motion.div
                    layout
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: 0.4,
                    }}
                    className="flex justify-between"
                >
                    <p>
                        <span className="font-semibold">Category:</span>{" "}
                        {report?.incident_type?.category?.category_name}
                    </p>
                    <p>
                        <span className="font-semibold">Incident Type:</span>{" "}
                        {report?.incident_type?.incident_name}
                    </p>
                </motion.div>
                <motion.div
                    layout
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: 0.5,
                    }}
                >
                    <p className="font-semibold mb-1">Report Description:</p>
                    <p
                        className={`p-4 rounded-md leading-relaxed shadow-sm ${
                            darkMode
                                ? "bg-slate-700 text-slate-300"
                                : "bg-gray-100 text-gray-700"
                        }`}
                    >
                        {report?.report_description}
                    </p>
                </motion.div>
            </motion.div>

            {/* Location */}
            <motion.div
                layout
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: 0.4,
                }}
                className={`shadow-md rounded-2xl p-6 space-y-4 ${
                    darkMode
                        ? "bg-slate-800 text-slate-200"
                        : "bg-white text-gray-800"
                }`}
            >
                <motion.h3
                    layout
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: 0.5,
                    }}
                    className={`text-xl font-semibold border-b pb-2 ${
                        darkMode ? "border-slate-600" : "border-gray-200"
                    }`}
                >
                    Location
                </motion.h3>
                <motion.div
                    layout
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: 0.6,
                    }}
                    className="flex justify-between"
                >
                    <p>
                        <span className="font-semibold">Zone:</span>{" "}
                        {report?.location?.zone?.zone_name}
                    </p>
                    <p>
                        <span className="font-semibold">Location:</span>{" "}
                        {report?.location?.location_name}
                    </p>
                </motion.div>

                <motion.div
                    layout
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: 0.5,
                    }}
                >
                    <p className="font-semibold mb-2">Landmark:</p>
                    {report?.location?.landmark ? (
                        <img
                            src={report?.location?.landmark}
                            alt="landmark"
                            className={`w-full max-w-md h-64 object-fill rounded-xl border shadow-sm ${
                                darkMode
                                    ? "border-slate-600"
                                    : "border-gray-200"
                            }`}
                        />
                    ) : (
                        <p
                            className={`italic ${
                                darkMode ? "text-slate-400" : "text-gray-500"
                            }`}
                        >
                            No landmark provided
                        </p>
                    )}
                </motion.div>
            </motion.div>
            {/* report violators */}  
                <ReportViolators reportId={id} />
            <motion.div
                layout
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: 0.5,
                }}
                className={`shadow-md rounded-2xl p-6 space-y-4 ${
                    darkMode
                        ? "bg-slate-800 text-slate-200"
                        : "bg-white text-gray-800"
                }`}
            >
                <motion.h3
                    layout
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: 0.6,
                    }}
                    className={`text-xl font-semibold border-b pb-2 ${
                        darkMode ? "border-slate-600" : "border-gray-200"
                    }`}
                >
                    Evidences
                </motion.h3>
                {report.evidences?.length > 0 ? (
                    <div className="flex flex-wrap gap-4">
                        {report.evidences.map((evidence, index) => (
                            <motion.div
                                layout
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 20,
                                    delay: 0.7,
                                }}
                                key={index}
                                className={`flex flex-col items-center p-3 rounded-lg shadow-sm ${
                                    darkMode ? "bg-slate-800" : "bg-gray-100"
                                }`}
                            >
                                <img
                                    src={evidence.file_url}
                                    alt={`evidence-${index}`}
                                    className={`w-40 h-40 object-cover rounded-md mb-2 border ${
                                        darkMode
                                            ? "border-slate-600"
                                            : "border-gray-300"
                                    }`}
                                />
                                <p
                                    className={`text-sm text-center ${
                                        darkMode
                                            ? "text-slate-300"
                                            : "text-gray-600"
                                    }`}
                                >
                                    {evidence?.remarks}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p
                        className={`italic ${
                            darkMode ? "text-slate-400" : "text-gray-500"
                        }`}
                    >
                        No evidences available
                    </p>
                )}
            </motion.div>
        </motion.div>
    );
};

export default ReportDetails;
