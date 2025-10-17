import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import useAppState from "../../store/useAppState";
import { requestRecords } from "../../functions/ReportsApi";

const RequestTable = () => {
    const { base_url, token, darkMode, setReports } = useAppState();

    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState("all");
    const [selectedTime, setSelectedTime] = useState("all");
    const [search, setSearch] = useState("");

    const { data: reports, isLoading } = useQuery({
        queryKey: ["request_records"],
        queryFn: () => requestRecords({ base_url, token }),
        onSuccess: (data) => setReports(data),
    });

    const getTimeFrame = (time) => {
        if (!time) return "";
        const hour = new Date(`1970-01-01T${time}`).getHours();
        if (hour >= 5 && hour < 12) return "morning";
        if (hour >= 12 && hour < 17) return "afternoon";
        if (hour >= 17 && hour < 21) return "evening";
        return "night";
    };

    const filteredReports =
        reports?.filter((report) => {
            const reportMonth = new Date(report.created_at).getMonth() + 1;
            const categoryMatch =
                selectedCategory === "all" ||
                report.category?.id === parseInt(selectedCategory);
            const statusMatch =
                selectedStatus === "all" || report.status === selectedStatus;
            const monthMatch =
                selectedMonth === "all" ||
                reportMonth === parseInt(selectedMonth);
            const timeFrameMatch =
                selectedTime === "all" ||
                getTimeFrame(report.created_at) === selectedTime;
            const searchLower = search.toLowerCase();
            const searchMatch =
                report.category?.category_name
                    ?.toLowerCase()
                    .includes(searchLower) ||
                report.user?.name?.toLowerCase().includes(searchLower) ||
                report.latitude?.toString().includes(searchLower) ||
                report.longitude?.toString().includes(searchLower);
            return (
                categoryMatch &&
                statusMatch &&
                monthMatch &&
                timeFrameMatch &&
                searchMatch
            );
        }) || [];

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const reportsPerPage = 6;
    const totalReports = filteredReports.length;
    const totalPages = Math.ceil(totalReports / reportsPerPage);
    const startIndex = (currentPage - 1) * reportsPerPage;
    const currentReports = filteredReports.slice(
        startIndex,
        startIndex + reportsPerPage
    );

    // Reset page when filters change
    useEffect(
        () => setCurrentPage(1),
        [selectedCategory, selectedStatus, selectedMonth, selectedTime, search]
    );

    return (
        <>
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
                className="p-2"
            >
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
                        <thead
                            className={darkMode ? "bg-slate-800" : "bg-gray-50"}
                        >
                            <tr>
                                <th className="px-4 py-3 text-left dark:text-white text-xs font-medium uppercase tracking-wider">
                                    Requested By
                                </th>
                                <th className="px-4 py-3 dark:text-white text-center text-xs font-medium uppercase tracking-wider">
                                    Mobile #
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    <select
                                        className={`w-full p-2 rounded text-sm ${
                                            darkMode
                                                ? "bg-slate-700 text-gray-200"
                                                : "bg-white"
                                        }`}
                                        value={selectedCategory}
                                        onChange={(e) =>
                                            setSelectedCategory(e.target.value)
                                        }
                                    >
                                        <option value="all">Category</option>
                                        {reports
                                            ?.map((r) => r.category)
                                            ?.filter(
                                                (v, i, a) =>
                                                    a.findIndex(
                                                        (c) => c.id === v.id
                                                    ) === i
                                            )
                                            ?.map((cat) => (
                                                <option
                                                    key={cat.id}
                                                    value={cat.id}
                                                >
                                                    {cat.category_name}
                                                </option>
                                            ))}
                                    </select>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    <select
                                        className={`w-full p-2 rounded text-sm ${
                                            darkMode
                                                ? "bg-slate-700 text-gray-200"
                                                : "bg-white"
                                        }`}
                                        value={selectedMonth}
                                        onChange={(e) =>
                                            setSelectedMonth(e.target.value)
                                        }
                                    >
                                        <option value="all">Month</option>
                                        {[
                                            "January",
                                            "February",
                                            "March",
                                            "April",
                                            "May",
                                            "June",
                                            "July",
                                            "August",
                                            "September",
                                            "October",
                                            "November",
                                            "December",
                                        ].map((month, idx) => (
                                            <option key={month} value={idx + 1}>
                                                {month}
                                            </option>
                                        ))}
                                    </select>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    <select
                                        className={`w-full p-2 rounded text-sm ${
                                            darkMode
                                                ? "bg-slate-700 text-gray-200"
                                                : "bg-white"
                                        }`}
                                        value={selectedTime}
                                        onChange={(e) =>
                                            setSelectedTime(e.target.value)
                                        }
                                    >
                                        <option value="all">Time Frame</option>
                                        <option value="morning">
                                            Morning (5AM–12PM)
                                        </option>
                                        <option value="afternoon">
                                            Afternoon (12PM–5PM)
                                        </option>
                                        <option value="evening">
                                            Evening (5PM–9PM)
                                        </option>
                                        <option value="night">
                                            Night (9PM–5AM)
                                        </option>
                                    </select>
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider">
                                    <select
                                        className={`w-full p-2 rounded text-sm ${
                                            darkMode
                                                ? "bg-slate-700 text-gray-200"
                                                : "bg-white"
                                        }`}
                                        value={selectedStatus}
                                        onChange={(e) =>
                                            setSelectedStatus(e.target.value)
                                        }
                                    >
                                        <option value="all">Status</option>
                                        {[
                                            "pending",
                                            "ongoing",
                                            "done",
                                            "cancel",
                                        ].map((status) => (
                                            <option key={status} value={status}>
                                                {status
                                                    .charAt(0)
                                                    .toUpperCase() +
                                                    status.slice(1)}
                                            </option>
                                        ))}
                                    </select>
                                </th>
                            </tr>
                        </thead>

                        {isLoading ? (
                            <div className="text-center text-white font-bold m-2">
                                <h1>Loading...</h1>
                            </div>
                        ) : (
                            <tbody
                                className={`${
                                    darkMode ? "bg-slate-900" : "bg-white"
                                }`}
                            >
                                {currentReports.map((report, index) => (
                                    <motion.tr
                                        key={report.id}
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
                                                    ? "px-4 py-3 text-gray-200"
                                                    : "px-4 py-3 text-gray-700"
                                            }
                                        >
                                            {report.user?.name}
                                        </td>
                                        <td
                                            className={
                                                darkMode
                                                    ? "px-4 py-3 text-gray-200"
                                                    : "px-4 py-3 text-gray-700"
                                            }
                                        >
                                            {report?.user?.email}
                                        </td>
                                        <td
                                            className={
                                                darkMode
                                                    ? "px-4 py-3 text-gray-200"
                                                    : "px-4 py-3 text-gray-700"
                                            }
                                        >
                                            {report.category?.category_name}
                                        </td>
                                        <td
                                            className={
                                                darkMode
                                                    ? "px-4 py-3 text-gray-200"
                                                    : "px-4 py-3 text-gray-700"
                                            }
                                        >
                                            {new Date(
                                                report.created_at
                                            ).toLocaleDateString()}
                                        </td>
                                        <td
                                            className={
                                                darkMode
                                                    ? "px-4 py-3 text-gray-200 text-center"
                                                    : "px-4 py-3 text-gray-700 text-center"
                                            }
                                        >
                                            {new Date(
                                                report.created_at
                                            ).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </td>
                                        <td
                                            className={
                                                darkMode
                                                    ? "px-4 py-3 text-gray-200"
                                                    : "px-4 py-3 text-gray-700"
                                            }
                                        >
                                            {report.status}
                                        </td>
                                    </motion.tr>
                                ))}
                            </tbody>
                        )}
                    </table>

                    {/* Pagination */}
                    <div className="flex justify-between items-center p-2">
                        <button
                            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                        >
                            Previous
                        </button>
                        <span className="dark:text-white">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="px-3 py-1 bg-gray-300 rounded disabled:opacity-50"
                            disabled={
                                currentPage === totalPages || totalPages === 0
                            }
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                        >
                            Next
                        </button>
                    </div>
                </div>
            </motion.div>
        </>
    );
};

export default RequestTable;
