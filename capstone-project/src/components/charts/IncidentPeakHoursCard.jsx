import useAppState from "../../store/useAppState";
import React from "react";
import { motion } from "framer-motion";

const IncidentPeakHoursCard = ({ data, isLoading }) => {
    const { darkMode } = useAppState();

    // Helper to format 24h hour into readable format (e.g., 18 -> 6 PM)
    const formatHour = (hour) => {
        if (hour === null || hour === undefined) return "N/A";
        const ampm = hour >= 12 ? "PM" : "AM";
        const formattedHour = hour % 12 || 12;
        return `${formattedHour} ${ampm}`;
    };

    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.2,
            }}
            whileHover={{ scale: 1.03 }}
            className={`p-6 shadow-lg rounded-2xl
                transition-colors duration-300
                ${
                    darkMode
                        ? "bg-slate-900 text-gray-200"
                        : "bg-white text-gray-800"
                }
            `}
        >
            {isLoading ? (
                <div className="flex items-center justify-center h-24">
                    <span className="animate-pulse text-sm text-gray-500">
                        Loading...
                    </span>
                </div>
            ) : (
                <div className="space-y-2 text-center">
                    <h1 className="text-lg font-semibold tracking-wide">
                        Peak Reporting Hour
                    </h1>
                    <h2
                        className={`text-3xl font-bold ${
                            darkMode ? "text-green-400" : "text-green-600"
                        }`}
                    >
                        {formatHour(data?.peak_hours?.hour)}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {data?.peak_hours?.total ?? 0} reports
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default IncidentPeakHoursCard;
