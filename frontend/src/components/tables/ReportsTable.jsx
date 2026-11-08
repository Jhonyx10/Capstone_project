import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import useAppState from "../../store/useAppState";
import useZones from "../../hooks/useZones";
import useNotifications from "../../hooks/useNotifications";
import { getCategories, getReports } from "../../functions/ReportsApi";
import { fadeIn, rowFade } from "../../utils/motion";

const REPORTS_PER_PAGE = 10;
const MONTHS = [
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
];

const getTimeFrame = (time) => {
    if (!time) return "";
    const hour = parseInt(time.split(":")[0], 10);
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
};

const fmtDate = (d) => {
    const x = new Date(d);
    return isNaN(x)
        ? d ?? "—"
        : x.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
          });
};

const fmtTime = (t) => {
    if (!t) return "—";
    const x = new Date(`1970-01-01T${t}`);
    return isNaN(x)
        ? t
        : x.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
          });
};

const FilterSelect = ({ label, value, onChange, children }) => (
    <select
        aria-label={label}
        value={value}
        onChange={onChange}
        className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none hover:cursor-pointer focus:border-green-500 focus:ring-2 focus:ring-green-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
    >
        {children}
    </select>
);

const ReportTable = () => {
    const { base_url, token, setCategories, setReports } = useAppState();
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedIncidentType, setSelectedIncidentType] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState("all");
    const [selectedTime, setSelectedTime] = useState("all");
    const [selectedZone, setSelectedZone] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    const { data: reports, isLoading } = useQuery({
        queryKey: ["reports"],
        queryFn: () => getReports({ base_url, token }),
    });

    const { data: categories } = useQuery({
        queryKey: ["categories"],
        queryFn: () => getCategories({ base_url, token }),
    });

    const { data: zones } = useZones();
    const { data: notifications = [] } = useNotifications();

    // ids of reports that still have an unread report-notification
    const newReportIds = useMemo(
        () =>
            new Set(
                (Array.isArray(notifications) ? notifications : [])
                    .filter(
                        (n) =>
                            String(n?.notification_type ?? "").includes(
                                "report"
                            ) && Number(n?.status) === 0
                    )
                    .map((n) => Number(n.item_id))
            ),
        [notifications]
    );

    useEffect(() => {
        if (reports && categories) {
            setReports(reports);
            setCategories(categories);
        }
    }, [reports, categories]);

    // Incident types follow the chosen category (all categories when none chosen)
    const incidentOptions =
        selectedCategory === "all"
            ? categories?.flatMap((c) => c.incident_types ?? [])
            : categories?.find((c) => c.id === parseInt(selectedCategory))
                  ?.incident_types;

    const q = search.trim().toLowerCase();
    const filteredReports =
        reports?.filter((r) => {
            const month = new Date(r?.date).getMonth() + 1;
            const categoryMatch =
                selectedCategory === "all" ||
                r?.incident_type?.category?.id === parseInt(selectedCategory);
            const incidentMatch =
                selectedIncidentType === "all" ||
                r?.incident_type?.id === parseInt(selectedIncidentType);
            const monthMatch =
                selectedMonth === "all" || month === parseInt(selectedMonth);
            const timeMatch =
                selectedTime === "all" ||
                getTimeFrame(r?.time) === selectedTime;
            const zoneMatch =
                selectedZone === "all" ||
                r?.location?.zone?.id === parseInt(selectedZone);
            const searchMatch =
                !q ||
                [
                    r?.incident_type?.category?.category_name,
                    r?.incident_type?.incident_name,
                    r?.location?.zone?.zone_name,
                    r?.location?.location_name,
                    r?.user?.name,
                ].some((v) => v?.toLowerCase().includes(q));
            return (
                categoryMatch &&
                incidentMatch &&
                monthMatch &&
                timeMatch &&
                zoneMatch &&
                searchMatch
            );
        }) ?? [];

    const total = filteredReports.length;
    const totalPages = Math.max(1, Math.ceil(total / REPORTS_PER_PAGE));
    const start = (currentPage - 1) * REPORTS_PER_PAGE;
    const pageRows = filteredReports.slice(start, start + REPORTS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [
        search,
        selectedCategory,
        selectedIncidentType,
        selectedMonth,
        selectedTime,
        selectedZone,
    ]);

    const hasFilters =
        search ||
        [
            selectedCategory,
            selectedIncidentType,
            selectedMonth,
            selectedTime,
            selectedZone,
        ].some((v) => v !== "all");

    const clearFilters = () => {
        setSearch("");
        setSelectedCategory("all");
        setSelectedIncidentType("all");
        setSelectedMonth("all");
        setSelectedTime("all");
        setSelectedZone("all");
    };

    const th =
        "px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400";
    const td = "px-4 py-3 text-slate-700 dark:text-slate-200";

    return (
        <div className="space-y-4">
            {/* Toolbar */}
            <motion.div
                {...fadeIn(0)}
                className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="relative">
                    <FaSearch
                        size={12}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by category, incident, zone, location or who filed it"
                        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <FilterSelect
                        label="Category"
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setSelectedIncidentType("all");
                        }}
                    >
                        <option value="all">All categories</option>
                        {categories?.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.category_name}
                            </option>
                        ))}
                    </FilterSelect>
                    <FilterSelect
                        label="Incident type"
                        value={selectedIncidentType}
                        onChange={(e) =>
                            setSelectedIncidentType(e.target.value)
                        }
                    >
                        <option value="all">All incident types</option>
                        {incidentOptions?.map((t) => (
                            <option key={t.id} value={t.id}>
                                {t.incident_name}
                            </option>
                        ))}
                    </FilterSelect>
                    <FilterSelect
                        label="Zone"
                        value={selectedZone}
                        onChange={(e) => setSelectedZone(e.target.value)}
                    >
                        <option value="all">All zones</option>
                        {zones?.map((z) => (
                            <option key={z.id} value={z.id}>
                                {z.zone_name}
                            </option>
                        ))}
                    </FilterSelect>
                    <FilterSelect
                        label="Month"
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                        <option value="all">Any month</option>
                        {MONTHS.map((m, i) => (
                            <option key={m} value={i + 1}>
                                {m}
                            </option>
                        ))}
                    </FilterSelect>
                    <FilterSelect
                        label="Time of day"
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                    >
                        <option value="all">Any time</option>
                        <option value="morning">Morning (5 AM–12 PM)</option>
                        <option value="afternoon">Afternoon (12–5 PM)</option>
                        <option value="evening">Evening (5–9 PM)</option>
                        <option value="night">Night (9 PM–5 AM)</option>
                    </FilterSelect>
                    {hasFilters && (
                        <button
                            onClick={clearFilters}
                            className="px-2 py-2 text-sm font-medium text-green-600 hover:underline dark:text-green-400"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
            </motion.div>

            {/* Table: the outer box animates and clips, the inner box scrolls */}
            <motion.div
                {...fadeIn(0.05)}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                            <tr>
                                <th className={th}>Incident</th>
                                <th className={th}>Date and time</th>
                                <th className={th}>Zone</th>
                                <th className={th}>Location</th>
                                <th className={th}>Filed by</th>
                                <th className={`${th} text-right`}>
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                [0, 1, 2, 3, 4].map((i) => (
                                    <tr key={i}>
                                        <td colSpan={6} className="px-4 py-3">
                                            <div className="h-8 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                                        </td>
                                    </tr>
                                ))
                            ) : pageRows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-12 text-center text-slate-500 dark:text-slate-400"
                                    >
                                        {hasFilters
                                            ? "No reports match these filters."
                                            : "No reports yet."}
                                        {hasFilters && (
                                            <button
                                                onClick={clearFilters}
                                                className="ml-2 font-medium text-green-600 hover:underline dark:text-green-400"
                                            >
                                                Clear filters
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                pageRows.map((r, index) => (
                                    <motion.tr
                                        key={r.id}
                                        {...rowFade(index)}
                                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    >
                                        <td className={td}>
                                            <p className="flex items-center gap-2 font-medium">
                                                {r?.incident_type
                                                    ?.incident_name ?? "—"}
                                                {newReportIds.has(
                                                    Number(r.id)
                                                ) && (
                                                    <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                                                        New
                                                    </span>
                                                )}
                                            </p>
                                            <span className="mt-1 inline-block rounded-md bg-green-500/10 px-2 py-0.5 text-xs text-green-600 dark:text-green-400">
                                                {r?.incident_type?.category
                                                    ?.category_name ??
                                                    "Uncategorized"}
                                            </span>
                                        </td>
                                        <td className={td}>
                                            <p>{fmtDate(r?.date)}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {fmtTime(r?.time)}
                                            </p>
                                        </td>
                                        <td className={td}>
                                            {r?.location?.zone?.zone_name ??
                                                "—"}
                                        </td>
                                        <td className={td}>
                                            {r?.location?.location_name ?? "—"}
                                        </td>
                                        <td className={td}>
                                            {r?.user?.name ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/report-details/${r.id}`
                                                    )
                                                }
                                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-green-500 hover:text-white hover:border-green-500 dark:border-slate-700 dark:text-slate-200"
                                            >
                                                View
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Pagination */}
            {!isLoading && total > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <span>
                        Showing {start + 1}–
                        {Math.min(start + REPORTS_PER_PAGE, total)} of {total}{" "}
                        reports
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((p) => p - 1)}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            Previous
                        </button>
                        <span>
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((p) => p + 1)}
                            className="rounded-lg border border-slate-300 px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReportTable;
