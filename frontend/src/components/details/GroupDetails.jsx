import { useMemo, useState } from "react";
import { IoPersonAddOutline, IoPeopleOutline } from "react-icons/io5";
import useGroups from "../../hooks/useGroups";
import useTanods, { getVolunteerName } from "../../hooks/useTanods";
import { getApiError } from "../../functions/GroupApi";
import GroupModal from "../../forms/GroupForm";
import useToast from "../../store/useToast";

const card =
    "rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900";

// the DB returns "YYYY-MM-DD HH:MM:SS", which Safari can't parse without the T
const formatDate = (value) =>
    value
        ? new Date(String(value).replace(" ", "T")).toLocaleDateString([], {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : "";

const getInitials = (name) =>
    name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("");

export const CapacityBar = ({ count, capacity }) => {
    const pct = capacity ? Math.min((count / capacity) * 100, 100) : 0;
    const full = capacity > 0 && count >= capacity;

    return (
        <div
            className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={capacity}
            aria-valuenow={count}
        >
            <div
                className={`h-1.5 rounded-full ${
                    full ? "bg-amber-500" : "bg-green-500"
                }`}
                style={{ width: `${pct}%` }}
            />
        </div>
    );
};

const GroupDetails = ({ groupId }) => {
    const { details, unassign } = useGroups(groupId);
    const { data: group, isLoading, isError } = details;
    const { data: tanods = [] } = useTanods();
    const showToast = useToast((s) => s.showToast); // ⚠️ rename to your store's add-toast function

    const [addOpen, setAddOpen] = useState(false);
    const [removingId, setRemovingId] = useState(null);

    // the details endpoint only returns the account name, so look up the full name
    const tanodById = useMemo(
        () => new Map(tanods.map((t) => [t.id, t])),
        [tanods]
    );

    const handleRemove = async (member, label) => {
        if (!window.confirm(`Remove ${label} from ${group.name}?`)) return;

        setRemovingId(member.id);
        try {
            await unassign.mutateAsync({ userId: member.id });
            showToast({
                type: "success",
                message: `${label} was removed from ${group.name}.`,
            });
        } catch (err) {
            showToast({
                type: "error",
                title: "Couldn't remove volunteer",
                message: getApiError(err, "Please try again."),
            });
        } finally {
            setRemovingId(null);
        }
    };

    if (isLoading) {
        return (
            <div className={`${card} animate-pulse space-y-4 p-5`}>
                <div className="h-5 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-1.5 w-full rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-10 w-full rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-10 w-full rounded bg-gray-200 dark:bg-gray-800" />
            </div>
        );
    }

    if (isError || !group) {
        return (
            <div
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
            >
                Could not load this group.
            </div>
        );
    }

    return (
        <section className={card}>
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 p-5">
                <div className="min-w-0">
                    <h2 className="truncate text-lg font-semibold text-gray-900 dark:text-white">
                        {group.name}
                    </h2>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        {group.members_count} of {group.capacity} members
                        {group.is_full && " · Full"}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setAddOpen(true)}
                    disabled={group.is_full}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:border-green-500 hover:text-green-600 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:text-gray-200 dark:hover:text-green-400"
                >
                    <IoPersonAddOutline
                        className="h-4 w-4"
                        aria-hidden="true"
                    />
                    Add volunteers
                </button>
            </div>

            <div className="px-5 pb-4">
                <CapacityBar
                    count={group.members_count}
                    capacity={group.capacity}
                />
            </div>

            {/* Members */}
            {group.members.length === 0 ? (
                <div className="flex flex-col items-center border-t border-gray-100 py-10 text-center dark:border-gray-800">
                    <IoPeopleOutline className="h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        No volunteers in this group yet.
                    </p>
                </div>
            ) : (
                <ul className="divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
                    {group.members.map((m) => {
                        const full = tanodById.get(m.id);
                        const label = full ? getVolunteerName(full) : m.name;

                        return (
                            <li
                                key={m.id}
                                className="flex items-center gap-3 px-5 py-3"
                            >
                                <div
                                    aria-hidden="true"
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-600/15 text-sm font-semibold text-green-600 dark:text-green-400"
                                >
                                    {getInitials(label)}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                        {label}
                                    </p>
                                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                                        {m.name !== label && `${m.name} · `}
                                        Since {formatDate(m.assigned_at)}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleRemove(m, label)}
                                    disabled={removingId === m.id}
                                    className="shrink-0 cursor-pointer text-sm text-red-600 hover:underline disabled:opacity-50 dark:text-red-400"
                                >
                                    {removingId === m.id
                                        ? "Removing…"
                                        : "Remove"}
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}

            {addOpen && (
                <GroupModal group={group} onClose={() => setAddOpen(false)} />
            )}
        </section>
    );
};

export default GroupDetails;
