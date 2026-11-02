import { useState } from "react";
import { IoLayersOutline } from "react-icons/io5";
import useGroups from "../hooks/useGroups";
import GroupDetails, { CapacityBar } from "./details/GroupDetails";

const GroupList = () => {
    const { groups: groupsQuery } = useGroups();
    const { data: groups = [], isLoading, isError } = groupsQuery;
    const [selectedId, setSelectedId] = useState(null);

    // open the first group until the user picks one
    const activeId = selectedId ?? groups[0]?.id ?? null;

    if (isLoading) {
        return (
            <div className="grid gap-4 lg:grid-cols-3">
                <div className="space-y-3">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="h-20 animate-pulse rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                        />
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div
                role="alert"
                className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
            >
                Could not load groups.
            </div>
        );
    }

    if (groups.length === 0) {
        return (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 py-16 text-center dark:border-gray-700">
                <IoLayersOutline className="h-10 w-10 text-gray-400" />
                <p className="mt-3 font-medium text-gray-700 dark:text-gray-200">
                    No groups yet
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Use “New group” to create the first one.
                </p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 lg:grid-cols-3">
            <ul className="space-y-3 lg:col-span-1">
                {groups.map((g) => {
                    const count = g.users_count ?? g.users?.length ?? 0;
                    const active = g.id === activeId;

                    return (
                        <li key={g.id}>
                            <button
                                type="button"
                                onClick={() => setSelectedId(g.id)}
                                aria-pressed={active}
                                className={`w-full cursor-pointer rounded-xl border p-4 text-left transition ${
                                    active
                                        ? "border-green-500 bg-green-50 dark:bg-green-900/10"
                                        : "border-gray-200 bg-white hover:border-green-500 dark:border-gray-800 dark:bg-gray-900"
                                }`}
                            >
                                <div className="flex items-baseline justify-between gap-3">
                                    <span className="truncate font-medium text-gray-900 dark:text-white">
                                        {g.name}
                                    </span>
                                    <span className="shrink-0 text-sm text-gray-500 dark:text-gray-400">
                                        {count}/{g.capacity}
                                    </span>
                                </div>
                                <div className="mt-2">
                                    <CapacityBar
                                        count={count}
                                        capacity={g.capacity}
                                    />
                                </div>
                            </button>
                        </li>
                    );
                })}
            </ul>

            <div className="lg:col-span-2">
                {activeId && <GroupDetails key={activeId} groupId={activeId} />}
            </div>
        </div>
    );
};

export default GroupList;
