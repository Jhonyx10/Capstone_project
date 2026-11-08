import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { FaSearch, FaExclamationTriangle } from "react-icons/fa";
import useAppState from "../../store/useAppState";
import useNotifications from "../../hooks/useNotifications";
import { getViolators } from "../../functions/ReportsApi";
import { fadeIn, rowFade } from "../../utils/motion";

const VIOLATORS_PER_PAGE = 10;

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

const Avatar = ({ violator }) =>
    violator.photo ? (
        <img
            src={violator.photo}
            alt={violator.first_name}
            className="size-11 shrink-0 rounded-full border border-slate-200 object-cover dark:border-slate-700"
        />
    ) : (
        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            {`${violator.first_name?.[0] ?? ""}${
                violator.last_name?.[0] ?? ""
            }`.toUpperCase()}
        </span>
    );

const ViolatorsTable = () => {
    const { base_url, token } = useAppState();
    const navigate = useNavigate();

    const [search, setSearch] = useState("");
    const [selectedZone, setSelectedZone] = useState("all");
    const [maxAge, setMaxAge] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const {
        data: violators = [],
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["violators"],
        queryFn: () => getViolators({ token, base_url }),
    });

    const { data: notifications = [] } = useNotifications();

    // ids of violators that still have an unread violators-notification
    const newViolatorIds = useMemo(
        () =>
            new Set(
                (Array.isArray(notifications) ? notifications : [])
                    .filter(
                        (n) =>
                            String(n?.notification_type ?? "").includes(
                                "violator"
                            ) && Number(n?.status) === 0
                    )
                    .map((n) => Number(n.item_id))
            ),
        [notifications]
    );

    // Unique zones that appear in the data
    const zoneOptions = violators
        .map((v) => v.zone)
        .filter((z, i, a) => z && a.findIndex((x) => x?.id === z.id) === i);

    const q = search.trim().toLowerCase();
    const filtered = violators.filter((v) => {
        const zoneMatch =
            selectedZone === "all" || v.zone?.id === parseInt(selectedZone);
        const ageMatch = maxAge === "" || v.age <= parseFloat(maxAge);
        const searchMatch =
            !q ||
            [
                v.first_name,
                v.last_name,
                `${v.first_name} ${v.last_name}`,
                v.address,
                v.zone?.zone_name,
            ].some((f) => f?.toLowerCase().includes(q));
        return zoneMatch && ageMatch && searchMatch;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / VIOLATORS_PER_PAGE));
    const start = (currentPage - 1) * VIOLATORS_PER_PAGE;
    const pageRows = filtered.slice(start, start + VIOLATORS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedZone, maxAge]);

    const hasFilters = search || selectedZone !== "all" || maxAge !== "";
    const clearFilters = () => {
        setSearch("");
        setSelectedZone("all");
        setMaxAge("");
    };

    const th =
        "px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400";
    const td = "px-4 py-3 text-slate-700 dark:text-slate-200";

    return (
        <div className="space-y-4">
            {isError && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                    <span className="flex items-center gap-2">
                        <FaExclamationTriangle /> Failed to load violators.
                    </span>
                    <button
                        onClick={() => refetch()}
                        className="rounded-md border border-current px-3 py-1 font-medium"
                    >
                        Try again
                    </button>
                </div>
            )}

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
                        placeholder="Search by name, address or zone"
                        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <FilterSelect
                        label="Zone"
                        value={selectedZone}
                        onChange={(e) => setSelectedZone(e.target.value)}
                    >
                        <option value="all">All zones</option>
                        {zoneOptions.map((z) => (
                            <option key={z.id} value={z.id}>
                                {z.zone_name}
                            </option>
                        ))}
                    </FilterSelect>
                    <input
                        type="number"
                        min="0"
                        value={maxAge}
                        onChange={(e) => setMaxAge(e.target.value)}
                        placeholder="Max age"
                        aria-label="Maximum age"
                        className="w-28 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200"
                    />
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
                                <th className={th}>Violator</th>
                                <th className={th}>Address</th>
                                <th className={th}>Zone</th>
                                <th className={`${th} text-right`}>
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                [0, 1, 2, 3, 4].map((i) => (
                                    <tr key={i}>
                                        <td colSpan={4} className="px-4 py-3">
                                            <div className="h-11 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
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
                                            ? "No violators match these filters."
                                            : "No violators recorded yet."}
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
                                pageRows.map((v, index) => (
                                    <motion.tr
                                        key={v.id}
                                        {...rowFade(index)}
                                        className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                    >
                                        <td className={td}>
                                            <div className="flex items-center gap-3">
                                                <Avatar violator={v} />
                                                <div>
                                                    <p className="flex items-center gap-2 font-medium">
                                                        {v.first_name}{" "}
                                                        {v.last_name}
                                                        {newViolatorIds.has(
                                                            Number(v.id)
                                                        ) && (
                                                            <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-semibold uppercase text-white">
                                                                New
                                                            </span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400">
                                                        {v.age != null
                                                            ? `${v.age} years old`
                                                            : "Age not recorded"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className={td}>
                                            {v.address ?? "—"}
                                        </td>
                                        <td className={td}>
                                            {v.zone?.zone_name ?? "—"}
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() =>
                                                    navigate(
                                                        `/violators-details/${v.id}`
                                                    )
                                                }
                                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-green-500 hover:bg-green-500 hover:text-white dark:border-slate-700 dark:text-slate-200"
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
                        {Math.min(start + VIOLATORS_PER_PAGE, total)} of {total}{" "}
                        violators
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

export default ViolatorsTable;
