import useAppState from "../../store/useAppState";
import React from "react";
import { motion } from "framer-motion";

const LeastReportedCategory = ({ data, isLoading }) => {
    const { darkMode } = useAppState();

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
                <div className="space-y-6">
                    {/* Least Reported */}
                    <div className="p-4 rounded-xl bg-green-100 dark:bg-green-900/30 shadow-sm">
                        <h1 className="text-sm font-medium tracking-wide dark:text-white">
                            Least Reported Category
                        </h1>
                        <h2 className="text-xl font-bold text-green-700 dark:text-green-400">
                            {data?.least_reported_category?.category}
                        </h2>
                        <p className="text-sm font-semibold dark:text-white">
                            Reports: {data?.least_reported_category?.total}
                        </p>
                    </div>                  
                </div>
            )}
        </motion.div>
    );
};

export default LeastReportedCategory;
