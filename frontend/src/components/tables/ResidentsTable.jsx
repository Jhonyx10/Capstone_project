import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaSearch, FaExclamationTriangle } from "react-icons/fa";
import useAppState from "../../store/useAppState";
import { getResidents } from "../../functions/ReportsApi";
import { blockUser } from "../../functions/AuthApi";
import { fadeIn, rowFade } from "../../utils/motion";
import {
    cap,
    STATUS_STYLE,
    statusLabel,
    formatDate,
} from "../../utils/residentStatus";
import ResidentDetailsModal from "./ResidentDetailsModal";

const RESIDENTS_PER_PAGE = 10;

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

const ResidentsTable = () => {
    const { base_url, token } = useAppState();
    const queryClient = useQueryClient();

    const [search, setSearch] = useState("");
    const [selectedRole, setSelectedRole] = useState("all");
    const [selectedStatus, setSelectedStatus] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [confirmId, setConfirmId] = useState(null);
    const [selectedId, setSelectedId] = useState(null); // details modal

    const {
        data: residents,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["residents"],
        queryFn: () => getResidents({ base_url, token }),
    });

    // Block / unblock (the backend toggles the status)
    const userMutation = useMutation({
        mutationFn: ({ userId }) => blockUser({ base_url, token, userId }),
        onSuccess: () => {
            setConfirmId(null);
            queryClient.invalidateQueries({ queryKey: ["residents"] });
        },
    });

    const roles = [
        ...new Set((residents ?? []).map((u) => u.role).filter(Boolean)),
    ];
    const statuses = [
        ...new Set((residents ?? []).map((u) => u.status).filter(Boolean)),
    ];
    const pendingCount =
        residents?.filter((u) => u.status === "pending").length ?? 0;

    const q = search.trim().toLowerCase();
    const filtered =
        residents?.filter((u) => {
            const roleMatch = selectedRole === "all" || u.role === selectedRole;
            const statusMatch =
                selectedStatus === "all" || u.status === selectedStatus;
            const searchMatch =
                !q ||
                [u.name, u.email].some((v) => v?.toLowerCase().includes(q));
            return roleMatch && statusMatch && searchMatch;
        }) ?? [];

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / RESIDENTS_PER_PAGE));
    const start = (currentPage - 1) * RESIDENTS_PER_PAGE;
    const pageRows = filtered.slice(start, start + RESIDENTS_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedRole, selectedStatus]);

    const hasFilters =
        search || selectedRole !== "all" || selectedStatus !== "all";
    const clearFilters = () => {
        setSearch("");
        setSelectedRole("all");
        setSelectedStatus("all");
    };

    const th =
        "px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400";
    const td = "px-4 py-3 text-slate-700 dark:text-slate-200";
    const btn =
        "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50";
    const outlineBtn =
        "border border-slate-300 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800";

    return (
        <div className="space-y-4">
            {(isError || userMutation.isError) && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                    <span className="flex items-center gap-2">
                        <FaExclamationTriangle />
                        {isError
                            ? "Failed to load residents."
                            : "Could not update that user. Try again."}
                    </span>
                    {isError && (
                        <button
                            onClick={() => refetch()}
                            className="rounded-md border border-current px-3 py-1 font-medium"
                        >
                            Try again
                        </button>
                    )}
                </div>
            )}

            {/* Pending approvals banner */}
            {pendingCount > 0 && selectedStatus !== "pending" && (
                <motion.button
                    {...fadeIn(0)}
                    onClick={() => setSelectedStatus("pending")}
                    className="flex w-full items-center justify-between rounded-xl border border-amber-300 bg-amber-50 p-4 text-left text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300"
                >
                    <span>
                        <strong>{pendingCount}</strong> resident
                        {pendingCount > 1 ? "s" : ""} waiting for approval
                    </span>
                    <span className="font-medium underline">Show</span>
                </motion.button>
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
                        placeholder="Search by name or mobile number"
                        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <FilterSelect
                        label="Role"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                    >
                        <option value="all">All roles</option>
                        {roles.map((r) => (
                            <option key={r} value={r}>
                                {cap(r)}
                            </option>
                        ))}
                    </FilterSelect>
                    <FilterSelect
                        label="Status"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                    >
                        <option value="all">All statuses</option>
                        {statuses.map((s) => (
                            <option key={s} value={s}>
                                {statusLabel(s)}
                            </option>
                        ))}
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
                                <th className={th}>Resident</th>
                                <th className={th}>Role</th>
                                <th className={th}>Status</th>
                                <th className={th}>Registered</th>
                                <th className={th}>Requests</th>
                                <th className={th}>Canceled</th>
                                <th className={`${th} text-right`}>
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                [0, 1, 2, 3, 4].map((i) => (
                                    <tr key={i}>
                                        <td colSpan={7} className="px-4 py-3">
                                            <div className="h-8 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                                        </td>
                                    </tr>
                                ))
                            ) : pageRows.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-12 text-center text-slate-500 dark:text-slate-400"
                                    >
                                        {hasFilters
                                            ? "No residents match these filters."
                                            : "No residents yet."}
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
                                pageRows.map((user, index) => {
                                    const requests = user.requests?.length || 0;
                                    const canceled =
                                        user.requests?.filter(
                                            (r) => r.status === "cancel"
                                        ).length || 0;
                                    const blocked = user.status === "block";
                                    const pending = user.status === "pending";
                                    const active = user.status === "active";
                                    const working =
                                        userMutation.isPending &&
                                        userMutation.variables?.userId ===
                                            user.id;
                                    return (
                                        <motion.tr
                                            key={user.id}
                                            {...rowFade(index)}
                                            className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                                        >
                                            <td className={td}>
                                                <p className="font-medium">
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                                    {user.email} · ID {user.id}
                                                </p>
                                            </td>
                                            <td className={td}>
                                                {cap(user.role)}
                                            </td>
                                            <td className={td}>
                                                <span
                                                    className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                                        STATUS_STYLE[
                                                            user.status
                                                        ] ?? ""
                                                    }`}
                                                >
                                                    {statusLabel(user.status)}
                                                </span>
                                            </td>
                                            <td className={td}>
                                                {formatDate(user.created_at)}
                                            </td>
                                            <td className={td}>{requests}</td>
                                            <td className={td}>
                                                <span
                                                    className={
                                                        canceled > 0
                                                            ? "font-medium text-rose-500"
                                                            : ""
                                                    }
                                                >
                                                    {canceled}
                                                </span>
                                                {requests > 0 && (
                                                    <span className="text-xs text-slate-500 dark:text-slate-400">
                                                        {" "}
                                                        of {requests}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <span className="inline-flex items-center justify-end gap-2">
                                                    <button
                                                        onClick={() =>
                                                            setSelectedId(
                                                                user.id
                                                            )
                                                        }
                                                        className={`${btn} ${
                                                            pending
                                                                ? "bg-amber-500 text-white hover:bg-amber-400"
                                                                : outlineBtn
                                                        }`}
                                                    >
                                                        {pending
                                                            ? "Review"
                                                            : "Details"}
                                                    </button>

                                                    {blocked && (
                                                        <button
                                                            disabled={working}
                                                            onClick={() =>
                                                                userMutation.mutate(
                                                                    {
                                                                        userId: user.id,
                                                                    }
                                                                )
                                                            }
                                                            className={`${btn} ${outlineBtn}`}
                                                        >
                                                            {working
                                                                ? "Working..."
                                                                : "Unblock"}
                                                        </button>
                                                    )}

                                                    {active &&
                                                        (confirmId ===
                                                        user.id ? (
                                                            <>
                                                                <button
                                                                    disabled={
                                                                        working
                                                                    }
                                                                    onClick={() =>
                                                                        userMutation.mutate(
                                                                            {
                                                                                userId: user.id,
                                                                            }
                                                                        )
                                                                    }
                                                                    className={`${btn} bg-rose-600 text-white hover:bg-rose-500`}
                                                                >
                                                                    {working
                                                                        ? "Working..."
                                                                        : "Confirm block"}
                                                                </button>
                                                                <button
                                                                    onClick={() =>
                                                                        setConfirmId(
                                                                            null
                                                                        )
                                                                    }
                                                                    className={`${btn} text-slate-600 hover:underline dark:text-slate-300`}
                                                                >
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <button
                                                                onClick={() =>
                                                                    setConfirmId(
                                                                        user.id
                                                                    )
                                                                }
                                                                className={`${btn} border border-rose-300 text-rose-600 hover:bg-rose-600 hover:text-white dark:border-rose-900 dark:text-rose-400`}
                                                            >
                                                                Block
                                                            </button>
                                                        ))}
                                                </span>
                                            </td>
                                        </motion.tr>
                                    );
                                })
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
                        {Math.min(start + RESIDENTS_PER_PAGE, total)} of {total}{" "}
                        residents
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

            {/* Details / review modal */}
            <AnimatePresence>
                {selectedId && (
                    <ResidentDetailsModal
                        key={selectedId}
                        id={selectedId}
                        onClose={() => setSelectedId(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default ResidentsTable;
