import useAppState from "../../store/useAppState";
import { useQuery } from "@tanstack/react-query";
import { getViolators } from "../../functions/ReportsApi";
import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Search from "../Search";

const ViolatorsTable = () => {
    const { base_url, token, darkMode } = useAppState();
    const navigate = useNavigate();
    const [search, setSearch] = useState("");

    const {
        data: violators = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["violators"],
        queryFn: () => getViolators({ token, base_url }),
    });

    // --- Pagination state ---
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const totalPages = Math.ceil(violators.length / itemsPerPage);
    const filterViolators = violators.filter((v) => {
        const searchLower = search.toLowerCase();
        const ageMatch =
            !isNaN(parseFloat(search)) && v.age <= parseFloat(search);

        return (
            v.last_name.toLowerCase().includes(searchLower) ||
            v.first_name.toLowerCase().includes(searchLower) ||
            v?.zone?.zone_name.toLowerCase().includes(searchLower) ||
            ageMatch
        );
    });

   const currentViolators = filterViolators.slice(
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
            <Search search={search} setSearch={setSearch} />
            <div
                className={`overflow-x-auto mt-4 rounded-lg shadow ${
                    darkMode ? "bg-slate-900" : "bg-white"
                }`}
            >
                <table
                    className={`min-w-full mt-2 divide-y text-sm ${
                        darkMode ? "divide-slate-700" : "divide-gray-200"
                    }`}
                >
                    {/* --- HEADERS --- */}
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
                                "Photo",
                                "Name",
                                "Age",
                                "Address",
                                "Zone",
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
                            {currentViolators.map((violator, index) => (
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
                                    {/* Photo */}
                                    <td className="px-4 py-3 flex justify-center items-center">
                                        <img
                                            src={violator.photo}
                                            alt={violator.first_name}
                                            className="w-12 h-12 rounded-full object-cover border"
                                        />
                                    </td>

                                    {/* Name */}
                                    <td
                                        className={
                                            darkMode
                                                ? "px-4 py-3 text-gray-200 text-center"
                                                : "px-4 py-3 text-gray-700 text-center"
                                        }
                                    >
                                        {violator.first_name}{" "}
                                        {violator.last_name}
                                    </td>

                                    {/* Age */}
                                    <td
                                        className={
                                            darkMode
                                                ? "px-4 py-3 text-gray-200 text-center"
                                                : "px-4 py-3 text-gray-700 text-center"
                                        }
                                    >
                                        {violator.age}
                                    </td>

                                    {/* Address */}
                                    <td
                                        className={
                                            darkMode
                                                ? "px-4 py-3 text-gray-200 text-center"
                                                : "px-4 py-3 text-gray-700 text-center"
                                        }
                                    >
                                        {violator.address}
                                    </td>

                                    {/* Zone */}
                                    <td
                                        className={
                                            darkMode
                                                ? "px-4 py-3 text-gray-200 text-center"
                                                : "px-4 py-3 text-gray-700 text-center"
                                        }
                                    >
                                        {violator.zone?.zone_name}
                                    </td>

                                    {/* Action */}
                                    <td className="px-4 py-3 text-center">
                                        <button
                                            onClick={() =>
                                                navigate(
                                                    `/violators-details/${violator.id}`
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

            {/* --- PAGINATION CONTROLS --- */}
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
        </motion.div>
    );
};

export default ViolatorsTable;
