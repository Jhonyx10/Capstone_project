import { useState } from "react";
import { motion } from "framer-motion";
import { IoTrashOutline } from "react-icons/io5";
import useAreaPersonnel from "../../hooks/useAreaPersonnel";
import { getApiError } from "../../functions/OperationApi";
import { fadeIn, rowFade } from "../../utils/motion"; // <-- adjust path

const STATUSES = ["active", "standby", "inactive"];

const SELECT =
    "rounded-md border border-gray-300 bg-white px-2 py-1 text-xs capitalize text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 cursor-pointer disabled:cursor-wait disabled:opacity-60";

export const displayName = (u) =>
    u?.name ??
    ([u?.first_name, u?.last_name].filter(Boolean).join(" ") ||
        `User #${u?.id}`);

const Avatar = ({ user }) => (
    <span
        aria-hidden="true"
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300"
    >
        {displayName(user).charAt(0).toUpperCase()}
    </span>
);

const Spinner = () => (
    <span
        aria-hidden="true"
        className="inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-green-600 border-t-transparent"
    />
);

// render with key={area.id} so state resets when another area is selected
const AreaPersonnelPanel = ({
    area,
    candidates = [],
    assignedUserIds = [],
    onDeleteArea,
    deleting,
}) => {
    const {
        personnel,
        assign,
        setStatus: changeStatus,
        remove,
    } = useAreaPersonnel(area.id);

    const [assigning, setAssigning] = useState(false);
    const [selected, setSelected] = useState([]);
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("active");
    const [failed, setFailed] = useState([]);
    const [error, setError] = useState("");
    // which row is changing status, and to what: { userId, status } | null
    const [updating, setUpdating] = useState(null);

    const rows = personnel.data ?? [];
    const assignedIds = new Set(assignedUserIds);
    const activeCount = rows.filter((p) => p.status === "active").length;

    const available = candidates.filter(
        (u) =>
            !assignedIds.has(u.id) &&
            displayName(u).toLowerCase().includes(search.toLowerCase())
    );

    const toggle = (id) =>
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
        );

    const nameOf = (userId) =>
        displayName(candidates.find((u) => u.id === userId) ?? { id: userId });

    const handleAssign = async () => {
        setError("");
        setFailed([]);
        try {
            const result = await assign.mutateAsync({
                userIds: selected,
                status,
            });
            setFailed(result.failed);
            setSelected([]);
            if (result.failed.length === 0) setAssigning(false);
        } catch (err) {
            setError(getApiError(err, "Could not assign personnel."));
        }
    };

    const handleRowError = (err) =>
        setError(getApiError(err, "Something went wrong."));

    const handleStatusChange = async (p, nextStatus) => {
        setError("");
        setUpdating({ userId: p.user_id, status: nextStatus });
        try {
            await changeStatus.mutateAsync({
                userId: p.user_id,
                status: nextStatus,
            });
        } catch (err) {
            handleRowError(err);
        } finally {
            setUpdating(null);
        }
    };

    return (
        <motion.section
            {...fadeIn()}
            className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
        >
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h2 className="font-semibold text-gray-800 dark:text-white">
                        {area.name}
                    </h2>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {activeCount} of{" "}
                        {area.capacity > 0 ? area.capacity : "unlimited"} active
                    </p>
                </div>
                <button
                    onClick={onDeleteArea}
                    disabled={deleting}
                    aria-label="Delete area"
                    title="Delete area"
                    className="rounded-md p-2 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-gray-800 disabled:opacity-40 transition cursor-pointer"
                >
                    <IoTrashOutline size={18} />
                </button>
            </div>

            {personnel.isLoading && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Loading personnel...
                </p>
            )}
            {personnel.isSuccess && rows.length === 0 && (
                <p className="rounded-lg border border-dashed border-gray-300 px-3 py-5 text-center text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    No personnel stationed here yet.
                </p>
            )}

            <ul className="flex flex-col gap-2">
                {rows.map((p, i) => {
                    const isUpdating = updating?.userId === p.user_id;

                    return (
                        <motion.li
                            key={p.id}
                            {...rowFade(i)}
                            aria-busy={isUpdating}
                            className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 transition-colors ${
                                isUpdating
                                    ? "border-green-300 bg-green-50/60 dark:border-green-700 dark:bg-green-900/10"
                                    : "border-gray-200 dark:border-gray-700"
                            }`}
                        >
                            <Avatar user={p.user} />
                            <span className="flex-1 truncate text-sm text-gray-800 dark:text-white">
                                {displayName(p.user)}
                            </span>

                            {isUpdating && (
                                <span
                                    role="status"
                                    className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400"
                                >
                                    <Spinner />
                                    <span className="sr-only">
                                        Updating status
                                    </span>
                                </span>
                            )}

                            <select
                                value={isUpdating ? updating.status : p.status}
                                disabled={isUpdating}
                                onChange={(e) =>
                                    handleStatusChange(p, e.target.value)
                                }
                                className={SELECT}
                            >
                                {STATUSES.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                            <button
                                onClick={() =>
                                    remove
                                        .mutateAsync({ userId: p.user_id })
                                        .catch(handleRowError)
                                }
                                disabled={isUpdating}
                                aria-label="Remove from area"
                                title="Remove from area"
                                className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                            >
                                <IoTrashOutline size={16} />
                            </button>
                        </motion.li>
                    );
                })}
            </ul>

            {!assigning ? (
                <button
                    onClick={() => setAssigning(true)}
                    className="w-full rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 transition cursor-pointer"
                >
                    Assign personnel
                </button>
            ) : (
                <div className="flex flex-col gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search tanods..."
                        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 dark:border-gray-700 dark:bg-gray-900 dark:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                    />

                    <div className="flex max-h-48 flex-col gap-1 overflow-y-auto hide-scrollbar">
                        {available.length === 0 && (
                            <p className="py-2 text-center text-xs text-gray-500 dark:text-gray-400">
                                {search
                                    ? "No match."
                                    : "Everyone is already assigned in this operation."}
                            </p>
                        )}
                        {available.map((u) => (
                            <label
                                key={u.id}
                                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-gray-800 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
                            >
                                <input
                                    type="checkbox"
                                    checked={selected.includes(u.id)}
                                    onChange={() => toggle(u.id)}
                                    className="accent-green-600"
                                />
                                <Avatar user={u} />
                                {displayName(u)}
                            </label>
                        ))}
                    </div>

                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className={`${SELECT} py-1.5 text-sm`}
                    >
                        {STATUSES.map((s) => (
                            <option key={s} value={s}>
                                Assign as {s}
                            </option>
                        ))}
                    </select>

                    {failed.length > 0 && (
                        <ul className="text-xs text-red-500">
                            {failed.map((f) => (
                                <li key={f.userId}>
                                    {nameOf(f.userId)}: {f.message}
                                </li>
                            ))}
                        </ul>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setAssigning(false);
                                setSelected([]);
                                setFailed([]);
                            }}
                            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
                        >
                            Close
                        </button>
                        <button
                            onClick={handleAssign}
                            disabled={selected.length === 0 || assign.isPending}
                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-green-500 disabled:opacity-50 transition cursor-pointer"
                        >
                            {assign.isPending && (
                                <span
                                    aria-hidden="true"
                                    className="inline-block size-4 animate-spin rounded-full border-2 border-white border-t-transparent"
                                />
                            )}
                            {assign.isPending
                                ? "Assigning..."
                                : `Assign (${selected.length})`}
                        </button>
                    </div>
                </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
        </motion.section>
    );
};

export default AreaPersonnelPanel;
