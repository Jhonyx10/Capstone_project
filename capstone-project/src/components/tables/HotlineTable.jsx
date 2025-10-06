import useAppState from "../../store/useAppState";
import { useQuery } from "@tanstack/react-query";
import { getHotlines } from "../../functions/HotlineApi";
import { motion } from "framer-motion";
import { useState } from "react";
import UpdateHotlineForm from "../../forms/UpdateHotlineForm";

const HotlineTable = () => {
    const { token, base_url, darkMode } = useAppState();
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedHotlineId, setSelectedHotlineId] = useState(null);
    
    const {
        data: hotlines = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["hotlines"],
        queryFn: () => getHotlines({ base_url, token }),
    });

    // --- Pagination state ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const totalPages = Math.ceil(hotlines.length / itemsPerPage);
    const currentHotlines = hotlines.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

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
            className="p-4 ml-0 w-full"
        >
            <div
                className={`overflow-x-auto mt-4 rounded-lg shadow ${
                    darkMode ? "bg-slate-900" : "bg-white"
                }`}
            >
                <motion.h5
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="dark:text-white text-gray-700 gap-4 font-medium text-lg m-2"
                >
                    Authorities Official Hotline Numbers
                </motion.h5>
                <table
                    className={`min-w-full mt-2 divide-y text-sm ${
                        darkMode ? "divide-slate-700" : "divide-gray-200"
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
                        className={darkMode ? "bg-slate-800" : "bg-gray-50"}
                    >
                        <tr>
                            {[
                                "Department",
                                "Hotline Number",
                                "Created At",
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

                    {/* --- BODY --- */}
                    {isLoading ? (
                        <div className="text-center text-white font-bold m-2">
                            <h1>Loading..</h1>
                        </div>
                    ) : (
                        <tbody
                            className={darkMode ? "bg-slate-900" : "bg-white"}
                        >
                            {currentHotlines.map((hotline, index) => (
                                <motion.tr
                                    key={hotline.id}
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
                                    {/* Department */}
                                    <td
                                        className={
                                            darkMode
                                                ? "px-4 py-3 text-gray-200 text-center"
                                                : "px-4 py-3 text-gray-700 text-center"
                                        }
                                    >
                                        {hotline.department_name}
                                    </td>

                                    {/* Hotline Number */}
                                    <td className="px-4 py-3 text-center font-semibold text-blue-600">
                                        {hotline.hotline_number}
                                    </td>

                                    {/* Created At */}
                                    <td
                                        className={
                                            darkMode
                                                ? "px-4 py-3 text-gray-200 text-center"
                                                : "px-4 py-3 text-gray-700 text-center"
                                        }
                                    >
                                        {new Date(
                                            hotline.created_at
                                        ).toLocaleDateString()}
                                    </td>

                                    {/* Action */}
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() => {
                                                setSelectedHotlineId(
                                                    hotline.id
                                                );
                                                setIsFormOpen(true);
                                            }}
                                            className="px-3 py-1 text-xs font-medium bg-green-400 text-white rounded hover:bg-green-500 transition hover:cursor-pointer"
                                        >
                                            Update
                                        </button>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    )}
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <button
                        disabled={currentPage === 1}
                        onClick={() => setCurrentPage((prev) => prev - 1)}
                        className={`px-3 py-1 rounded ${
                            currentPage === 1
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-400 hover:bg-green-500 text-white"
                        }`}
                    >
                        Prev
                    </button>

                    <span
                        className={
                            darkMode
                                ? "text-gray-300 font-medium"
                                : "text-gray-700"
                        }
                    >
                        Page {currentPage} of {totalPages}
                    </span>

                    <button
                        disabled={currentPage === totalPages}
                        onClick={() => setCurrentPage((prev) => prev + 1)}
                        className={`px-3 py-1 rounded ${
                            currentPage === totalPages
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-green-400 hover:bg-green-500 text-white"
                        }`}
                    >
                        Next
                    </button>
                </div>
            )}
            {/* update form */}
            {isFormOpen && (
                <UpdateHotlineForm
                    onClose={() => setIsFormOpen(false)}
                    id={selectedHotlineId}
                />
            )}
        </motion.div>
    );
};

export default HotlineTable;
