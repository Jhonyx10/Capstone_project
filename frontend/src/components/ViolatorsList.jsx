import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import useAppState from "../store/useAppState";
import Barangay from "../assets/img/Barangay.png";
import { useQuery } from "@tanstack/react-query";
import { violatorsViolationTotal } from "../functions/Analytics";
import { useNavigate } from "react-router-dom";


// Helper function → only first 5 characters
const cutToFive = (text) => (!text ? "" : text.substring(0, 5));

const listVariants = {
    hidden: { opacity: 0, y: -20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 120, delay: 0.2 },
    },
};

// Default item animation
const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 120, delay: 0.6 },
    },
};

export default function ViolatorsList() {
    const { open, base_url, token } = useAppState();
    const [selected, setSelected] = useState(null); // modal state
    const navigate = useNavigate();

    const {data} = useQuery({
        queryKey: ['violations_total'],
        queryFn: () => violatorsViolationTotal({base_url, token})
    })

    return (
        <>
            <motion.div
                className="w-full bg-white rounded-lg dark:bg-slate-900 shadow-lg dark:border-0 border border-gray-200"
                initial="hidden"
                animate="show"
                variants={listVariants}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-5 dark:border-b">
                    <div className="w-8 h-8 rounded-full bg-green-400 flex items-center justify-center">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 
                                   1.79-4 4 1.79 4 4 4zm0 2c-2.67 
                                   0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                                fill="white"
                            />
                        </svg>
                    </div>
                    <h1 className=" font-medium text-gray-700 dark:text-white">
                        Most Violators List
                    </h1>
                </div>

                {/* Table Header */}
                <div className="hidden sm:grid grid-cols-3 gap-4 px-6 py-4 bg-gray-100 dark:bg-slate-950">
                    <div className="text-sm font-medium text-gray-600 dark:text-white">
                        Violator
                    </div>
                    <div className="text-sm font-medium text-gray-600 text-center dark:text-white">
                        Count
                    </div>
                    <div className="text-sm font-medium text-gray-600 text-center dark:text-white">
                        Actions
                    </div>
                </div>

                {/* Violators List */}
                {data?.map((violator) => (
                    <motion.div
                        key={violator.id}
                        variants={itemVariants}
                        className="dark:hover:bg-slate-950 hover:bg-gray-200 flex flex-col sm:grid sm:grid-cols-3 gap-4 px-6 py-5 transition-colors rounded-md dark:border-b dark:border-gray-700 border-b border-gray-200"
                    >
                        {/* Violator Info */}
                        <div className="flex items-center gap-4">
                            {selected && selected.id === violator.id ? (
                                // keep spacing so name doesn’t move
                                <div className="w-12 h-12 mr-12" />
                            ) : (
                                <motion.img
                                    layoutId={`avatar-${violator.id}`} // shared element ID
                                    src={violator.photo}
                                    alt={violator.first_name}
                                    className="w-12 h-12 rounded-full object-cover border cursor-pointer"
                                    onClick={() => setSelected(violator)} // 👈 open modal
                                />
                            )}
                            <div>
                                <div className="font-medium text-gray-700 text-base dark:text-white">
                                    {violator.first_name}
                                </div>
                            </div>
                        </div>

                        {/* Violations Count */}
                        <div className="flex justify-between sm:justify-center items-center">
                            {" "}
                            <span className="sm:hidden text-sm font-medium text-gray-600 dark:text-white">
                                {" "}
                                Count:{" "}
                            </span>{" "}
                            <motion.p
                                key={open ? "open" : "closed"}
                                initial={{ x: open ? -20 : 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: open ? 20 : -20, opacity: 0 }}
                                transition={{
                                    duration: 0.3,
                                    ease: "easeInOut",
                                }}
                                className="mr-2 dark:text-white text-center"
                            >
                                {violator.total_violations}
                            </motion.p>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-between sm:justify-center items-center">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors hover:cursor-pointer"
                                onClick={() => setSelected(violator)} // 👈 open modal
                            >
                                View
                            </motion.button>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Modal */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        className="fixed inset-0 bg-gray-50/60 dark:bg-gray-700/90 flex items-center justify-center z-50"
                        onClick={() => setSelected(null)}
                    >
                        <motion.div
                            layoutId={`avatar-${selected.id}`}
                            className="bg-white dark:bg-slate-900 rounded-lg p-6 shadow-lg max-w-md w-full relative"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Avatar */}
                            <img
                                src={selected.photo || Barangay} // use selected photo, fallback to placeholder
                                alt={selected.first_name}
                                className="w-32 h-32 rounded-full mx-auto border object-cover"
                                layoutId={`avatar-${selected.id}`}
                            />

                            {/* Info */}
                            <motion.h2
                                initial={{ y: -20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 20,
                                    delay: 0.3,
                                }}
                                className="text-xl text-center font-semibold text-gray-800 dark:text-white"
                            >
                                {selected.first_name} {selected.last_name}
                            </motion.h2>
                            <motion.div
                                layout
                                className="mt-4 flex justify-between"
                            >
                                <div>
                                    <motion.p
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 200,
                                            damping: 20,
                                            delay: 0.4,
                                        }}
                                        className="text-gray-600 dark:text-gray-300"
                                    >
                                        Age: {selected.age}
                                    </motion.p>
                                    <motion.p
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 200,
                                            damping: 20,
                                            delay: 0.6,
                                        }}
                                        className="text-gray-600 mt-2 dark:text-gray-300"
                                    >
                                        Address: {selected.address}
                                    </motion.p>
                                </div>
                                <div>
                                    <motion.p
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 200,
                                            damping: 20,
                                            delay: 0.5,
                                        }}
                                        className="text-gray-600 dark:text-gray-300"
                                    >
                                        Violations: {selected.total_violations}
                                    </motion.p>
                                    <motion.button
                                        onClick={() =>
                                            navigate(
                                                `/violators-details/${selected.id}`
                                            )
                                        }
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 200,
                                            damping: 20,
                                            delay: 0.6,
                                        }}
                                        className="mt-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors hover:cursor-pointer"
                                    >
                                        Details
                                    </motion.button>
                                </div>
                            </motion.div>

                            {/* Close Button */}
                            <button
                                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                                onClick={() => setSelected(null)}
                            >
                                ✕
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
