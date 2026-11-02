import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaSearch } from "react-icons/fa";
import useAppState from "../../store/useAppState";
import { requestRecords } from "../../functions/ReportsApi";
import { fadeIn, rowFade } from "../../utils/motion";

const REQUESTS_PER_PAGE = 10;
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
const STATUSES = ["pending", "ongoing", "done", "cancel"];

const STATUS_STYLES = {
    pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    ongoing: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    done: "bg-green-500/10 text-green-600 dark:text-green-400",
    cancel: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");

// created_at is a full timestamp, so read the hour straight from the Date.
const getTimeFrame = (timestamp) => {
    const d = new Date(timestamp);
    if (isNaN(d)) return "";
    const hour = d.getHours();
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
};

const fmtDate = (ts) => {
    const d = new Date(ts);
    return isNaN(d)
        ? "—"
        : d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
          });
};

const fmtTime = (ts) => {
    const d = new Date(ts);
    return isNaN(d)
        ? ""
        : d.toLocaleTimeString("en-US", {
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

const RequestTable = () => {
    const { base_url, token } = useAppState();

    const [search, setSearch] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [selectedMonth, setSelectedMonth] = useState("all");
    const [selectedTime, setSelectedTime] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    const { data: reports, isLoading } = useQuery({
        queryKey: ["request_records"],
        queryFn: () => requestRecords({ base_url, token }),
    });

    // Unique categories that appear in the requests
    const categoryOptions = (reports ?? [])
        .map((r) => r.category)
        .filter((c, i, a) => c && a.findIndex((x) => x?.id === c.id) === i);

    const q = search.trim().toLowerCase();
    const filtered =
        reports?.filter((r) => {
            const month = new Date(r.created_at).getMonth() + 1;
            const categoryMatch =
                selectedCategory === "all" ||
                r.category?.id === parseInt(selectedCategory);
            const statusMatch =
                selectedStatus === "all" || r.status === selectedStatus;
            const monthMatch =
                selectedMonth === "all" || month === parseInt(selectedMonth);
            const timeMatch =
                selectedTime === "all" ||
                getTimeFrame(r.created_at) === selectedTime;
            const searchMatch =
                !q ||
                [
                    r.category?.category_name,
                    r.user?.name,
                    r.user?.email,
                    r.latitude?.toString(),
                    r.longitude?.toString(),
                ].some((v) => v?.toLowerCase().includes(q));
            return (
                categoryMatch &&
                statusMatch &&
                monthMatch &&
                timeMatch &&
                searchMatch
            );
        }) ?? [];

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / REQUESTS_PER_PAGE));
    const start = (currentPage - 1) * REQUESTS_PER_PAGE;
    const pageRows = filtered.slice(start, start + REQUESTS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedCategory, selectedStatus, selectedMonth, selectedTime]);

    const hasFilters =
        search ||
        [selectedCategory, selectedStatus, selectedMonth, selectedTime].some(
            (v) => v !== "all"
        );

    const clearFilters = () => {
        setSearch("");
        setSelectedCategory("all");
        setSelectedStatus("all");
        setSelectedMonth("all");
        setSelectedTime("all");
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
                        placeholder="Search by name, email, category or coordinates"
                        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <FilterSelect
                        label="Category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">All categories</option>
                        {categoryOptions.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.category_name}
                            </option>
                        ))}
                    </FilterSelect>
                    <FilterSelect
                        label="Status"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="all">All statuses</option>
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>
                                {cap(s)}
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
                                <th className={th}>Requested by</th>
                                <th className={th}>Category</th>
                                <th className={th}>Date and time</th>
                                <th className={th}>Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                [0, 1, 2, 3, 4].map((i) => (
                                    <tr key={i}>
                                        <td colSpan={4} className="px-4 py-3">
                                            <div className="h-8 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                                        </td>
                                    </tr>
                                ))
                            ) : pageRows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={4}
                                        className="px-4 py-12 text-center text-slate-500 dark:text-slate-400"
                                    >
                                        {hasFilters
                                            ? "No requests match these filters."
                                            : "No requests yet."}
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
                                            <p className="font-medium">
                                                {r.user?.name ?? "—"}
                                            </p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {r.user?.email}
                                            </p>
                                        </td>
                                        <td className={td}>
                                            {r.category?.category_name ?? "—"}
                                        </td>
                                        <td className={td}>
                                            <p>{fmtDate(r.created_at)}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                                {fmtTime(r.created_at)}
                                            </p>
                                        </td>
                                        <td className={td}>
                                            <span
                                                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                    STATUS_STYLES[r.status] ??
                                                    "bg-slate-500/10 text-slate-600 dark:text-slate-300"
                                                }`}
                                            >
                                                {cap(r.status)}
                                            </span>
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
                        {Math.min(start + REQUESTS_PER_PAGE, total)} of {total}{" "}
                        requests
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

export default RequestTable;
