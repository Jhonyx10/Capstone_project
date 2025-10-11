import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../functions/ReportsApi";
import useAppState from "../../store/useAppState";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import useZones from "../../hooks/useZones";
import { useNavigate } from "react-router-dom";
import { getReports } from "../../functions/ReportsApi";
import Search from "../Search";

const ReportTable = () => {
    const { base_url, token, setCategories, darkMode, setReports } = useAppState();
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedZone, setSelectedZone] = useState("all");
    const [selectedIncidentType, setSelectedIncidentType] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState("all");
    const [selectedTime, setSelectedTime] = useState("all");
    const navigate = useNavigate();

    const [isOpenCategoryForm, setIsOpenCategoryForm] = useState(false);
    const [isOpenIncidentForm, setIsOpenIncidentForm] = useState(false);

    const [search, setSearch] = useState("");

      const { data: reports, isLoading } = useQuery({
          queryKey: ["reports"],
          queryFn: () => getReports({ base_url, token }),
          onSuccess: (data) => {
              console.log(data);
          },
      });

      const { data: categories } = useQuery({
          queryKey: ["categories"],
          queryFn: () => getCategories({ base_url, token }),
          onSuccess: (data) => {
              setCategories(data);
          },
      });

       useEffect(() => {
           if (reports && categories) {
               setReports(reports);
               setCategories(categories);
           }
       }, [reports, categories]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const reportsPerPage = 6;

    const getTimeFrame = (time) => {
        if (!time) return "";
        const hour = parseInt(time.split(":")[0], 10);
        if (hour >= 5 && hour < 12) return "morning";
        if (hour >= 12 && hour < 17) return "afternoon";
        if (hour >= 17 && hour < 21) return "evening";
        return "night";
    };

    const { data: zones } = useZones();

    const handleCategoryChange = (e) => {
        setSelectedCategory(e.target.value);
        setSelectedIncidentType("all");
        setCurrentPage(1); 
    };

    const filteredReports =
        reports?.filter((report) => {
            const reportMonth = new Date(report?.date).getMonth() + 1;
            const categoryMatch =
                selectedCategory === "all" ||
                report?.incident_type?.category?.id ===
                    parseInt(selectedCategory);
            const incidentMatch =
                selectedIncidentType === "all" ||
                report?.incident_type?.id === parseInt(selectedIncidentType);
            const monthMatch =
                selectedMonth === "all" ||
                reportMonth === parseInt(selectedMonth);
            const timeFrameMatch =
                selectedTime === "all" ||
                getTimeFrame(report?.time) === selectedTime;
            const zoneMatch =
                selectedZone === "all" ||
                report?.location?.zone?.id ===
                parseInt(selectedZone);
            const searchLower = search.toLowerCase();
            const searchMatch =
                report?.incident_type?.category?.category_name
                    ?.toLowerCase()
                    .includes(searchLower) ||
                report?.incident_type?.incident_name
                    ?.toLowerCase()
                    .includes(searchLower) ||
                report?.location?.zone?.zone_name
                    ?.toLowerCase()
                    .includes(searchLower) ||
                report?.location?.location_name
                    ?.toLowerCase()
                    .includes(searchLower) ||
                report?.user?.name?.toLowerCase().includes(searchLower);
            return (
                categoryMatch && incidentMatch && monthMatch && timeFrameMatch && zoneMatch && searchMatch
            );
        }) || [];

    // Pagination logic
    const totalReports = filteredReports.length;
    const totalPages = Math.ceil(totalReports / reportsPerPage);
    const startIndex = (currentPage - 1) * reportsPerPage;
    const currentReports = filteredReports.slice(
        startIndex,
        startIndex + reportsPerPage
    );

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [selectedCategory, selectedIncidentType, selectedMonth, selectedTime, selectedZone]);

    return (
        <>
            <div className="flex items-center gap-2">
                <Search search={search} setSearch={setSearch} />
            </div>
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
                                    "Category",
                                    "Incident",
                                    "Month",
                                    "Time Frame",
                                ].map((header, idx) => (
                                    <th
                                        key={idx}
                                        className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                            darkMode
                                                ? "text-gray-200"
                                                : "text-gray-600"
                                        }`}
                                    >
                                        {/* Filter dropdowns */}
                                        {header === "Category" && (
                                            <select
                                                className={`w-full p-2 rounded text-sm hover:cursor-pointer ${
                                                    darkMode
                                                        ? "bg-slate-700 text-gray-200"
                                                        : "bg-white"
                                                }`}
                                                value={selectedCategory}
                                                onChange={handleCategoryChange}
                                            >
                                                <option value="all">
                                                    Category
                                                </option>
                                                {categories?.map((cat) => (
                                                    <option
                                                        key={cat.id}
                                                        value={cat.id}
                                                    >
                                                        {cat.category_name}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        {header === "Incident" && (
                                            <select
                                                className={`w-full p-2 rounded text-sm hover:cursor-pointer ${
                                                    darkMode
                                                        ? "bg-slate-700 text-gray-200"
                                                        : "bg-white"
                                                }`}
                                                value={selectedIncidentType}
                                                onChange={(e) =>
                                                    setSelectedIncidentType(
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="all">
                                                    Incident
                                                </option>
                                                {categories
                                                    ?.find(
                                                        (cat) =>
                                                            selectedCategory ===
                                                                "all" ||
                                                            cat.id ===
                                                                parseInt(
                                                                    selectedCategory
                                                                )
                                                    )
                                                    ?.incident_types?.map(
                                                        (type) => (
                                                            <option
                                                                key={type.id}
                                                                value={type.id}
                                                            >
                                                                {
                                                                    type.incident_name
                                                                }
                                                            </option>
                                                        )
                                                    )}
                                            </select>
                                        )}
                                        {header === "Month" && (
                                            <select
                                                className={`w-full p-2 rounded text-sm hover:cursor-pointer ${
                                                    darkMode
                                                        ? "bg-slate-700 text-gray-200"
                                                        : "bg-white"
                                                }`}
                                                value={selectedMonth}
                                                onChange={(e) =>
                                                    setSelectedMonth(
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="all">
                                                    Month
                                                </option>
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
                                                ].map((month, index) => (
                                                    <option
                                                        key={month}
                                                        value={index + 1}
                                                    >
                                                        {month}
                                                    </option>
                                                ))}
                                            </select>
                                        )}
                                        {header === "Time Frame" && (
                                            <select
                                                className={`w-full p-2 rounded text-sm hover:cursor-pointer ${
                                                    darkMode
                                                        ? "bg-slate-700 text-gray-200"
                                                        : "bg-white"
                                                }`}
                                                value={selectedTime}
                                                onChange={(e) =>
                                                    setSelectedTime(
                                                        e.target.value
                                                    )
                                                }
                                            >
                                                <option value="all">
                                                    Time
                                                </option>
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
                                        )}
                                    </th>
                                ))}
                                <th
                                    className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        darkMode
                                            ? "text-gray-200"
                                            : "text-gray-600"
                                    }`}
                                >
                                    <select
                                        className={`w-full p-2 rounded text-sm hover:cursor-pointer ${
                                            darkMode
                                                ? "bg-slate-700 text-gray-200"
                                                : "bg-white"
                                        }`}
                                        value={selectedZone}
                                        onChange={(e) =>
                                            setSelectedZone(e.target.value)
                                        }
                                    >
                                        <option value="all">Zones</option>
                                        {zones?.map((zone) => (
                                            <option
                                                value={zone.id}
                                                key={zone.id}
                                            >
                                                {zone.zone_name}
                                            </option>
                                        ))}
                                    </select>
                                </th>
                                <th
                                    className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        darkMode
                                            ? "text-gray-200"
                                            : "text-gray-600"
                                    }`}
                                >
                                    Location
                                </th>
                                <th
                                    className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider ${
                                        darkMode
                                            ? "text-gray-200"
                                            : "text-gray-600"
                                    }`}
                                >
                                    Filed By
                                </th>
                                <th
                                    className={`px-4 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                                        darkMode
                                            ? "text-gray-200"
                                            : "text-gray-600"
                                    }`}
                                >
                                    Action
                                </th>
                            </tr>
                        </motion.thead>

                        {/* --- BODY --- */}
                        {isLoading ? (
                            <div className="text-center text-white font-bold m-2">
                                <h1>Loading..</h1>
                            </div>
                        ) : (
                            <tbody
                                className={`hide-scrollbar ${
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
                                            {
                                                report?.incident_type?.category
                                                    ?.category_name
                                            }
                                        </td>
                                        <td
                                            className={
                                                darkMode
                                                    ? "px-4 py-3 text-gray-200"
                                                    : "px-4 py-3 text-gray-700"
                                            }
                                        >
                                            {
                                                report?.incident_type
                                                    ?.incident_name
                                            }
                                        </td>
                                        <td
                                            className={
                                                darkMode
                                                    ? "px-4 py-3 text-gray-200"
                                                    : "px-4 py-3 text-gray-700"
                                            }
                                        >
                                            {report?.date}
                                        </td>
                                        <td
                                            className={
                                                darkMode
                                                    ? "px-4 py-3 text-gray-200 text-center"
                                                    : "px-4 py-3 text-gray-700 text-center"
                                            }
                                        >
                                            {new Date(
                                                `1970-01-01T${report?.time}`
                                            ).toLocaleTimeString("en-US", {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                                hour12: true,
                                            })}
                                        </td>
                                        <td
                                            className={
                                                darkMode
                                                    ? "px-4 py-3 text-gray-200"
                                                    : "px-4 py-3 text-gray-700"
                                            }
                                        >
                                            {report?.location?.zone?.zone_name}
                                        </td>
                                        <td
                                            className={
                                                darkMode
                                                    ? "px-4 py-3 text-gray-200"
                                                    : "px-4 py-3 text-gray-700"
                                            }
                                        >
                                            {report?.location?.location_name}
                                        </td>
                                        <td
                                            className={
                                                darkMode
                                                    ? "px-4 py-3 text-gray-200"
                                                    : "px-4 py-3 text-gray-700"
                                            }
                                        >
                                            {report?.user?.name}
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
                {/* --- PAGINATION CONTROLS --- */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-6">
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
        </>
    );
};

export default ReportTable;
