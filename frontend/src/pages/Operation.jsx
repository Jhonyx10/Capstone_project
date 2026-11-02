import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    IoAddCircleOutline,
    IoShieldCheckmarkOutline,
    IoLocationOutline,
    IoChevronBack,
    IoChevronForward,
} from "react-icons/io5";
import useOperations from "../hooks/useOperations";
import StatusBadge, {
    OPERATION_STATUSES,
} from "../components/operations/StatusBadge";
import { fadeIn, rowFade } from "../utils/motion"; 
import { IoCalendarOutline } from "react-icons/io5";
import { formatEventDate } from "../utils/date";

const FILTERS = [null, ...OPERATION_STATUSES]; // null = all

const PAGER_BTN =
    "inline-flex items-center gap-1 rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 disabled:opacity-40 disabled:hover:bg-transparent transition cursor-pointer disabled:cursor-not-allowed";

const Operation = () => {
    const navigate = useNavigate();
    const [status, setStatus] = useState(null);
    const [page, setPage] = useState(1);

    const { operations } = useOperations({ status, page });
    const rows = operations.data?.data ?? [];
    const lastPage = operations.data?.last_page ?? 1;

    const changeStatus = (next) => {
        setStatus(next);
        setPage(1);
    };

    return (
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
                {...fadeIn()}
                className="flex flex-wrap items-start justify-between gap-4 mb-6"
            >
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                        Operations
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Plan operations, mark their areas, and station
                        personnel.
                    </p>
                </div>
                <button
                    onClick={() => navigate("/operations/new")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg shadow-sm hover:bg-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 transition cursor-pointer"
                >
                    <IoAddCircleOutline size={20} />
                    New operation
                </button>
            </motion.div>

            {/* Status filter */}
            <div
                role="group"
                aria-label="Filter by status"
                className="mb-5 inline-flex flex-wrap rounded-lg border border-gray-200 bg-white p-0.5 dark:border-gray-700 dark:bg-gray-900"
            >
                {FILTERS.map((s) => (
                    <button
                        key={s ?? "all"}
                        type="button"
                        onClick={() => changeStatus(s)}
                        aria-pressed={status === s}
                        className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize transition cursor-pointer ${
                            status === s
                                ? "bg-green-600 text-white"
                                : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                        }`}
                    >
                        {s ?? "All"}
                    </button>
                ))}
            </div>

            {/* States */}
            {operations.isLoading && (
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="h-28 animate-pulse rounded-xl border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-800"
                        />
                    ))}
                </div>
            )}

            {operations.isError && (
                <p className="text-sm text-red-500">
                    Failed to load operations.
                </p>
            )}

            {operations.isSuccess && rows.length === 0 && (
                <motion.div
                    {...fadeIn()}
                    className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 px-4 py-14 text-center dark:border-gray-700"
                >
                    <IoShieldCheckmarkOutline
                        size={28}
                        className="text-gray-400"
                        aria-hidden="true"
                    />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {status
                            ? `No ${status} operations`
                            : "No operations yet"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        {status
                            ? "Try another status filter."
                            : "Create your first operation to get started."}
                    </p>
                </motion.div>
            )}

            {/* Cards */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {rows.map((op, i) => (
                    <motion.button
                        key={op.id}
                        {...rowFade(i)}
                        onClick={() => navigate(`/operations/${op.id}`)}
                        className="group text-left rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:border-green-500 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-green-500 transition cursor-pointer"
                    >
                        <div className="flex items-start justify-between gap-2">
                            <h2 className="font-semibold text-gray-800 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition">
                                {op.name}
                            </h2>
                            <StatusBadge status={op.status} />
                        </div>
                        <div className="flex items-start justify-between gap-2">
                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                {op.zone?.zone_name ?? "No zone"}
                            </p>
                            <p className="mt-2 inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                <IoCalendarOutline aria-hidden="true" />
                                {formatEventDate(op.event_date) ??
                                    "No event date"}
                            </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between text-xs">
                            <span className="text-gray-500 dark:text-gray-400">
                                {op.areas_count}{" "}
                                {op.areas_count === 1 ? "area" : "areas"}
                            </span>
                            <span
                                className={`inline-flex items-center gap-1 ${
                                    op.geofence
                                        ? "text-green-600 dark:text-green-400"
                                        : "text-amber-600 dark:text-amber-400"
                                }`}
                            >
                                <IoLocationOutline aria-hidden="true" />
                                {op.geofence
                                    ? "Geofence set"
                                    : "No geofence yet"}
                            </span>
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
                <div className="mt-6 flex items-center justify-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                    <button
                        disabled={page <= 1}
                        onClick={() => setPage((p) => p - 1)}
                        className={PAGER_BTN}
                    >
                        <IoChevronBack aria-hidden="true" /> Prev
                    </button>
                    <span>
                        Page {page} of {lastPage}
                    </span>
                    <button
                        disabled={page >= lastPage}
                        onClick={() => setPage((p) => p + 1)}
                        className={PAGER_BTN}
                    >
                        Next <IoChevronForward aria-hidden="true" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default Operation;
