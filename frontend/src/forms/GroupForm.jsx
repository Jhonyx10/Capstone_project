import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { IoClose, IoSearchOutline } from "react-icons/io5";
import useGroups from "../hooks/useGroups";
import useTanods, { getVolunteerName } from "../hooks/useTanods";
import { getApiError } from "../functions/GroupApi";
import useToast from "../store/useToast";

const inputClass =
    "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500";

/**
 * Two modes:
 *  - no `group` prop  -> create a new group (optionally with volunteers)
 *  - `group` prop     -> add volunteers to that existing group
 *    (`group` is the object from GET /groups/{id})
 */
const GroupModal = ({ group = null, onClose }) => {
    const isAssign = Boolean(group);

    const { data: tanods = [], isLoading: loadingTanods } = useTanods();
    const { groups: groupsQuery, create, assign } = useGroups();
    const groups = groupsQuery.data ?? [];
    const showToast = useToast((s) => s.showToast); // ⚠️ rename to your store's add-toast function

    const [name, setName] = useState("");
    const [capacity, setCapacity] = useState("5");
    const [selected, setSelected] = useState([]);
    const [search, setSearch] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(""); // inline form validation only

    const limit = isAssign ? group.available_slots : Number(capacity) || 0;
    const overLimit = selected.length > limit;

    // userId -> the group they're currently in
    const groupOfUser = useMemo(() => {
        const map = new Map();
        groups.forEach((g) => g.users?.forEach((u) => map.set(u.id, g)));
        return map;
    }, [groups]);

    const candidates = useMemo(() => {
        const q = search.trim().toLowerCase();
        return (
            tanods
                .filter((v) => v.role === "tanod")
                // hide volunteers who already belong to a group
                .filter((v) => !groupOfUser.has(v.id))
                .filter(
                    (v) =>
                        !q ||
                        `${getVolunteerName(v)} ${v.name} ${v.email}`
                            .toLowerCase()
                            .includes(q)
                )
        );
    }, [tanods, search, groupOfUser]);

    // close on Escape
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    const toggle = (id) =>
        setSelected((prev) =>
            prev.includes(id)
                ? prev.filter((x) => x !== id)
                : prev.length < limit
                ? [...prev, id]
                : prev
        );

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!isAssign) {
            if (!name.trim()) return setError("Give the group a name.");
            const cap = Number(capacity);
            if (!Number.isInteger(cap) || cap < 1 || cap > 100) {
                return setError(
                    "Capacity must be a whole number from 1 to 100."
                );
            }
        } else if (selected.length === 0) {
            return setError("Select at least one volunteer.");
        }

        if (overLimit) {
            return setError(
                `This group only has room for ${limit} volunteer${
                    limit === 1 ? "" : "s"
                }.`
            );
        }

        setSubmitting(true);
        try {
            const { failed } = isAssign
                ? await assign.mutateAsync({
                      groupId: group.id,
                      userIds: selected,
                  })
                : await create.mutateAsync({
                      name: name.trim(),
                      capacity: Number(capacity),
                      userIds: selected,
                  });

            if (failed.length === 0) {
                showToast({
                    type: "success",
                    message: isAssign
                        ? "Volunteers added to the group."
                        : "Group created successfully.",
                });
                onClose();
                return;
            }

            // the group (or part of the batch) was saved, so close and report what failed
            const nameOf = (id) =>
                getVolunteerName(tanods.find((t) => t.id === id));
            showToast({
                type: "error",
                title: isAssign
                    ? "Some volunteers weren't added"
                    : "Group created, but some volunteers weren't added",
                message: failed
                    .map((f) => `${nameOf(f.userId)}: ${f.message}`)
                    .join(" · "),
            });
            onClose();
        } catch (err) {
            showToast({
                type: "error",
                title: "Couldn't save the group",
                message: getApiError(err, "Please try again."),
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.form
                role="dialog"
                aria-modal="true"
                aria-label={isAssign ? "Add volunteers" : "New group"}
                onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900"
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 p-5 dark:border-gray-800">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {isAssign ? "Add volunteers" : "New group"}
                        </h2>
                        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                            {isAssign
                                ? `${group.name} · ${
                                      group.available_slots
                                  } slot${
                                      group.available_slots === 1 ? "" : "s"
                                  } left`
                                : "Create a responder group and pick who's in it."}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="cursor-pointer rounded p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                        <IoClose className="h-5 w-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                    {!isAssign && (
                        <div className="grid grid-cols-3 gap-3">
                            <label className="col-span-2 text-sm">
                                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-200">
                                    Group name
                                </span>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g. Alpha Team"
                                    maxLength={255}
                                    autoFocus
                                    className={inputClass}
                                />
                            </label>
                            <label className="text-sm">
                                <span className="mb-1 block font-medium text-gray-700 dark:text-gray-200">
                                    Capacity
                                </span>
                                <input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={capacity}
                                    onChange={(e) =>
                                        setCapacity(e.target.value)
                                    }
                                    className={inputClass}
                                />
                            </label>
                        </div>
                    )}

                    <div>
                        <div className="mb-1 flex items-baseline justify-between text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-200">
                                Volunteers{isAssign ? "" : " (optional)"}
                            </span>
                            <span
                                className={
                                    overLimit
                                        ? "text-red-600 dark:text-red-400"
                                        : "text-gray-500 dark:text-gray-400"
                                }
                            >
                                {selected.length} of {limit} selected
                            </span>
                        </div>

                        <div className="relative">
                            <IoSearchOutline
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                                aria-hidden="true"
                            />
                            <input
                                type="search"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search volunteers"
                                className={`${inputClass} pl-9`}
                            />
                        </div>

                        <ul className="mt-2 max-h-56 divide-y divide-gray-100 overflow-y-auto rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-700">
                            {loadingTanods && (
                                <li className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
                                    Loading volunteers…
                                </li>
                            )}
                            {!loadingTanods && candidates.length === 0 && (
                                <li className="px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
                                    No volunteers to show.
                                </li>
                            )}
                            {candidates.map((v) => {
                                const checked = selected.includes(v.id);
                                const current = groupOfUser.get(v.id);
                                const disabled =
                                    !checked && selected.length >= limit;

                                return (
                                    <li key={v.id}>
                                        <label
                                            className={`flex items-center gap-3 px-3 py-2 text-sm ${
                                                disabled
                                                    ? "cursor-not-allowed opacity-50"
                                                    : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                disabled={disabled}
                                                onChange={() => toggle(v.id)}
                                                className="h-4 w-4 accent-green-600"
                                            />
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-gray-900 dark:text-white">
                                                    {getVolunteerName(v)}
                                                </span>
                                                <span className="block truncate text-xs text-gray-500 dark:text-gray-400">
                                                    {current
                                                        ? `In ${current.name} · will be moved`
                                                        : "No group yet"}
                                                </span>
                                            </span>
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {error && (
                        <p
                            role="alert"
                            className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
                        >
                            {error}
                        </p>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 border-t border-gray-100 p-4 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={submitting || overLimit}
                        className="cursor-pointer rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting
                            ? "Saving…"
                            : isAssign
                            ? "Add to group"
                            : "Create group"}
                    </button>
                </div>
            </motion.form>
        </div>
    );
};

export default GroupModal;
