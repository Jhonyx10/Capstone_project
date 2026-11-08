import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    IoSearchOutline,
    IoCreateOutline,
    IoTrashOutline,
    IoArrowUndoOutline,
    IoAlertCircleOutline,
    IoShieldCheckmarkOutline,
    IoEyeOutline,
} from "react-icons/io5";
import useAppState from "../../store/useAppState";
import useNotifications from "../../hooks/useNotifications";
import { toast } from "../../store/useToast";
import {
    getWatchLists,
    deleteWatchList,
    restoreWatchList,
} from "../../functions/WatchListApi";
import WatchListForm from "../../forms/WatchListForm";
import ConfirmDialog from "../alerts/ConfirmDialog";
import {
    TypeBadge,
    StatusBadge,
    Thumb,
    formatDate,
    card,
} from "../WatchListUi";

const PAGE_SIZE = 8;

const selectClass =
    "rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer";

const iconBtn =
    "rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white cursor-pointer";

const WatchListTable = () => {
    const base_url = useAppState((s) => s.base_url);
    const token = useAppState((s) => s.token);
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [type, setType] = useState("");
    const [status, setStatus] = useState("");
    const [showDeleted, setShowDeleted] = useState(false);
    const [page, setPage] = useState(1);

    const [editing, setEditing] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const { data: notifications = [] } = useNotifications();

    // Unread sighting notifications per watch list entry (item_id = entry id)
    const newSightings = useMemo(() => {
        const counts = {};
        (Array.isArray(notifications) ? notifications : []).forEach((n) => {
            if (
                n?.notification_type === "sighting-notification" &&
                Number(n?.status) === 0
            ) {
                const key = String(n.item_id);
                counts[key] = (counts[key] ?? 0) + 1;
            }
        });
        return counts;
    }, [notifications]);

    // Wait for the person to stop typing before asking the server
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => setPage(1), [debouncedSearch, type, status, showDeleted]);

    const filters = {
        search: debouncedSearch,
        type,
        status,
        trashed: showDeleted,
    };

    const {
        data: entries = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["watch-lists", "list", filters],
        queryFn: () => getWatchLists({ base_url, token, filters }),
    });

    const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const pageRows = entries.slice(
        (safePage - 1) * PAGE_SIZE,
        safePage * PAGE_SIZE
    );

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ["watch-lists"] });

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteWatchList({ base_url, token, id }),
        onSuccess: () => {
            invalidate();
            toast.success("Entry deleted");
            setDeleteTarget(null);
        },
        onError: () => {
            toast.error(
                "Could not delete the entry. Please try again.",
                "Delete failed"
            );
            setDeleteTarget(null);
        },
    });

    const restoreMutation = useMutation({
        mutationFn: (id) => restoreWatchList({ base_url, token, id }),
        onSuccess: () => {
            invalidate();
            toast.success("Entry restored");
        },
        onError: () =>
            toast.error(
                "Could not restore the entry. Please try again.",
                "Restore failed"
            ),
    });

    const hasFilters = Boolean(
        debouncedSearch || type || status || showDeleted
    );

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
                <div className="relative min-w-[220px] max-w-md flex-1">
                    <IoSearchOutline
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                        aria-hidden="true"
                    />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name, plate number, or description"
                        className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-9 pr-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                    />
                </div>

                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    aria-label="Filter by type"
                    className={selectClass}
                >
                    <option value="">All types</option>
                    <option value="person">Person</option>
                    <option value="vehicle">Vehicle</option>
                </select>

                <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    aria-label="Filter by status"
                    className={selectClass}
                    disabled={showDeleted}
                >
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>

                <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={showDeleted}
                        onChange={(e) => setShowDeleted(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                    />
                    Show deleted
                </label>

                <p className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                    {isLoading
                        ? "Loading…"
                        : `${entries.length} entr${
                              entries.length === 1 ? "y" : "ies"
                          }`}
                </p>
            </div>

            {isError && (
                <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
                >
                    <IoAlertCircleOutline className="mt-0.5 h-4 w-4 shrink-0" />
                    Could not load the watch list. Please try again.
                </div>
            )}

            {/* Table */}
            <div className={`${card} overflow-hidden`}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-xs text-gray-500 dark:border-gray-800 dark:bg-gray-950/40 dark:text-gray-400">
                            <tr>
                                <th className="px-4 py-3 font-medium">Entry</th>
                                <th className="px-4 py-3 font-medium">Type</th>
                                <th className="px-4 py-3 font-medium">
                                    Status
                                </th>
                                <th className="px-4 py-3 font-medium">
                                    Sightings
                                </th>
                                <th className="px-4 py-3 font-medium">Added</th>
                                <th className="px-4 py-3 text-right font-medium">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {isLoading &&
                                [0, 1, 2, 3].map((i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-4 py-4" colSpan={6}>
                                            <div className="h-10 rounded bg-gray-100 dark:bg-gray-800" />
                                        </td>
                                    </tr>
                                ))}

                            {!isLoading &&
                                pageRows.map((entry, i) => {
                                    const deleted = Boolean(entry.deleted_at);
                                    // unread sightings for this entry (never for deleted ones)
                                    const fresh = deleted
                                        ? 0
                                        : newSightings[String(entry.id)] ?? 0;

                                    return (
                                        <motion.tr
                                            key={entry.id}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{
                                                delay: i * 0.03,
                                                duration: 0.2,
                                            }}
                                            className={`hover:bg-gray-50 dark:hover:bg-gray-800/40 ${
                                                fresh > 0
                                                    ? "bg-red-50/60 dark:bg-red-500/5"
                                                    : ""
                                            }`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <Thumb
                                                        src={entry.image_url}
                                                        type={entry.type}
                                                        alt={entry.identifier}
                                                        className="h-11 w-11"
                                                    />
                                                    <div className="min-w-0">
                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {deleted ? (
                                                                <p className="font-medium text-gray-500 line-through dark:text-gray-400">
                                                                    {
                                                                        entry.identifier
                                                                    }
                                                                </p>
                                                            ) : (
                                                                <Link
                                                                    to={`/watch-list-details/${entry.id}`}
                                                                    className="font-medium text-gray-900 hover:text-green-600 focus:outline-none focus-visible:underline dark:text-white dark:hover:text-green-400"
                                                                >
                                                                    {
                                                                        entry.identifier
                                                                    }
                                                                </Link>
                                                            )}
                                                            {fresh > 0 && (
                                                                <span
                                                                    aria-label={`${fresh} new sightings`}
                                                                    className="inline-flex items-center gap-1 rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-semibold text-white"
                                                                >
                                                                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white motion-reduce:animate-none" />
                                                                    {fresh} new
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="max-w-xs truncate text-xs text-gray-500 dark:text-gray-400">
                                                            {entry.details}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <TypeBadge type={entry.type} />
                                            </td>
                                            <td className="px-4 py-3">
                                                <StatusBadge
                                                    status={entry.status}
                                                    deleted={deleted}
                                                />
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="font-medium text-gray-900 dark:text-white">
                                                    {entry.sightings_count ?? 0}
                                                </p>
                                                {entry.latest_sighting && (
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        Last seen{" "}
                                                        {formatDate(
                                                            entry
                                                                .latest_sighting
                                                                .created_at
                                                        )}
                                                    </p>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                                                {formatDate(entry.created_at)}
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex justify-end gap-1">
                                                    {deleted ? (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                restoreMutation.mutate(
                                                                    entry.id
                                                                )
                                                            }
                                                            disabled={
                                                                restoreMutation.isPending ||
                                                                restoreMutation.isLoading
                                                            }
                                                            aria-label={`Restore ${entry.identifier}`}
                                                            className={`${iconBtn} flex items-center gap-1.5 text-sm font-medium`}
                                                        >
                                                            <IoArrowUndoOutline className="h-4 w-4" />
                                                            Restore
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <Link
                                                                to={`/watch-list-details/${entry.id}`}
                                                                aria-label={`View ${entry.identifier}`}
                                                                className={`${iconBtn} flex items-center gap-1.5 text-sm font-medium`}
                                                            >
                                                                <IoEyeOutline className="h-4 w-4" />
                                                            </Link>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setEditing(
                                                                        entry
                                                                    )
                                                                }
                                                                aria-label={`Edit ${entry.identifier}`}
                                                                className={
                                                                    iconBtn
                                                                }
                                                            >
                                                                <IoCreateOutline className="h-4 w-4" />
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    setDeleteTarget(
                                                                        entry
                                                                    )
                                                                }
                                                                aria-label={`Delete ${entry.identifier}`}
                                                                className={`${iconBtn} hover:!text-red-600`}
                                                            >
                                                                <IoTrashOutline className="h-4 w-4" />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>

                {/* Empty state */}
                {!isLoading && !isError && entries.length === 0 && (
                    <div className="flex flex-col items-center px-4 py-14 text-center">
                        <IoShieldCheckmarkOutline className="h-10 w-10 text-gray-400" />
                        <p className="mt-3 font-medium text-gray-700 dark:text-gray-200">
                            {hasFilters
                                ? "No entries match your filters"
                                : "The watch list is empty"}
                        </p>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            {hasFilters
                                ? "Try a different search or clear the filters."
                                : "Use “Add entry” to record the first person or vehicle."}
                        </p>
                    </div>
                )}
            </div>

            {/* Pagination */}
            {entries.length > PAGE_SIZE && (
                <div className="flex items-center justify-between text-sm">
                    <p className="text-gray-500 dark:text-gray-400">
                        Showing {(safePage - 1) * PAGE_SIZE + 1}–
                        {Math.min(safePage * PAGE_SIZE, entries.length)} of{" "}
                        {entries.length}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            disabled={safePage === 1}
                            onClick={() => setPage(safePage - 1)}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                        >
                            Previous
                        </button>
                        <span className="text-gray-600 dark:text-gray-300">
                            {safePage} / {totalPages}
                        </span>
                        <button
                            type="button"
                            disabled={safePage === totalPages}
                            onClick={() => setPage(safePage + 1)}
                            className="rounded-lg border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {editing && (
                <WatchListForm
                    entry={editing}
                    onClose={() => setEditing(null)}
                />
            )}

            {deleteTarget && (
                <ConfirmDialog
                    danger
                    title="Delete this entry?"
                    message={`“${deleteTarget.identifier}” will be removed from the watch list. You can restore it later from “Show deleted”.`}
                    confirmLabel="Delete"
                    loading={
                        deleteMutation.isPending || deleteMutation.isLoading
                    }
                    onConfirm={() => deleteMutation.mutate(deleteTarget.id)}
                    onCancel={() => setDeleteTarget(null)}
                />
            )}
        </div>
    );
};

export default WatchListTable;
