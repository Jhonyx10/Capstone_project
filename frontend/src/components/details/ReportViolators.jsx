import useAppState from "../../store/useAppState";
import { useQuery } from "@tanstack/react-query";
import { getReportViolators } from "../../functions/ReportsApi";
import { motion } from "framer-motion"

const ReportViolators = ({ reportId }) => {
    const { token, base_url, darkMode } = useAppState();

    const { data: reportViolators, isLoading } = useQuery({
        queryKey: ["report_violators", reportId],
        queryFn: () => getReportViolators({ reportId, base_url, token }),
    });

    if (isLoading) {
        return <p className="italic text-slate-400">Loading violators...</p>;
    }

    if (!reportViolators || reportViolators.length === 0) {
        return null;
    }

    return (
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
            <h3
                className={`text-xl font-semibold border-b pb-2 ${
                    darkMode ? "border-slate-600" : "border-gray-200"
                }`}
            >
                Violators
            </h3>
            {reportViolators.map((item) => (
                <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 rounded-lg shadow-sm bg-slate-700 text-slate-200"
                >
                    <img
                        src={item.violators?.photo}
                        alt={item.violators?.first_name}
                        className="w-16 h-16 rounded-full object-cover border border-slate-600"
                    />
                    <div>
                        <p className="font-semibold">
                            {item.violators?.first_name}{" "}
                            {item.violators?.last_name}
                        </p>
                        <p>Age: {item.violators?.age}</p>
                        <p>
                            Address: {item.violators?.zone?.zone_name},{" "}
                            {item.violators?.address}
                        </p>
                    </div>
                </div>
            ))}
        </motion.div>
    );
};

export default ReportViolators;
