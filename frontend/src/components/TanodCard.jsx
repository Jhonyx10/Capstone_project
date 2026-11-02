import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    IoMailOutline,
    IoLocationOutline,
    IoMapOutline,
    IoKeyOutline,
    IoSearchOutline,
    IoPeopleOutline,
    IoLayersOutline,
} from "react-icons/io5";
import useAppState from "../store/useAppState";
import { getTanodUser } from "../functions/UsersApi";
import UpdateTanod from "./details/UpdateTanod";

const getInitials = (fullName, fallback) => {
    const source = fullName.trim() || fallback || "?";
    return source
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("");
};

const Detail = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 text-sm">
        <Icon
            className="mt-0.5 h-4 w-4 shrink-0 text-gray-400 dark:text-gray-500"
            aria-hidden="true"
        />
        <div className="min-w-0">
            <span className="sr-only">{label}: </span>
            {value ? (
                <span className="break-words text-gray-700 dark:text-gray-200">
                    {value}
                </span>
            ) : (
                <span className="italic text-gray-400 dark:text-gray-500">
                    No {label.toLowerCase()} yet
                </span>
            )}
        </div>
    </div>
);

const SkeletonCard = () => (
    <div className="animate-pulse rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
        <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-gray-200 dark:bg-gray-800" />
            <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
                <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
            </div>
        </div>
        <div className="mt-5 space-y-3">
            <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-5/6 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
    </div>
);

const TanodCard = () => {
    const { base_url, token } = useAppState();
    const [selectedId, setSelectedId] = useState(null);
    const [search, setSearch] = useState("");
    const [zoneFilter, setZoneFilter] = useState("all");

    const { data, isLoading } = useQuery({
        queryKey: ["volunteers"],
        queryFn: () => getTanodUser({ base_url, token }),
    });

    const zones = useMemo(() => {
        const names = (data ?? [])
            .map((v) => v.profile?.zone?.zone_name)
            .filter(Boolean);
        return [...new Set(names)].sort();
    }, [data]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        return (data ?? []).filter((v) => {
            const p = v.profile;
            const zone = p?.zone?.zone_name ?? "";
            if (zoneFilter !== "all" && zone !== zoneFilter) return false;
            if (!q) return true;
            return [p?.first_name, p?.last_name, v.name, v.email, zone]
                .filter(Boolean)
                .join(" ")
                .toLowerCase()
                .includes(q);
        });
    }, [data, search, zoneFilter]);

    if (isLoading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {[0, 1, 2].map((i) => (
                    <SkeletonCard key={i} />
                ))}
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center rounded-xl border border-dashed border-gray-300 dark:border-gray-700 py-16 text-center">
                <IoPeopleOutline className="h-10 w-10 text-gray-400" />
                <p className="mt-3 font-medium text-gray-700 dark:text-gray-200">
                    No volunteers yet
                </p>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Use “New account” to add the first tanod.
                </p>
            </div>
        );
    }

    return (
        <div>
            {/* Toolbar */}
            <div className="mb-5 flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[220px] max-w-md">
                    <IoSearchOutline
                        className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                        aria-hidden="true"
                    />
                    <input
                        type="search"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name, call sign, or email"
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 py-2 pl-9 pr-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                </div>

                <select
                    value={zoneFilter}
                    onChange={(e) => setZoneFilter(e.target.value)}
                    aria-label="Filter by zone"
                    className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                    <option value="all">All zones</option>
                    {zones.map((z) => (
                        <option key={z} value={z}>
                            {z}
                        </option>
                    ))}
                </select>

                <p className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                    {filtered.length === data.length
                        ? `${data.length} volunteer${
                              data.length === 1 ? "" : "s"
                          }`
                        : `${filtered.length} of ${data.length} volunteers`}
                </p>
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 py-12 text-center">
                    <p className="font-medium text-gray-700 dark:text-gray-200">
                        No volunteers match your search
                    </p>
                    <button
                        onClick={() => {
                            setSearch("");
                            setZoneFilter("all");
                        }}
                        className="mt-2 text-sm text-green-600 dark:text-green-400 hover:underline cursor-pointer"
                    >
                        Clear filters
                    </button>
                </div>
            ) : (
                <motion.div
                    className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                >
                    {filtered.map((volunteer) => {
                        const profile = volunteer.profile;
                        const fullName = `${profile?.first_name ?? ""} ${
                            profile?.last_name ?? ""
                        }`.trim();

                        return (
                            <article
                                key={volunteer.id}
                                className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
                            >
                                {/* Identity */}
                                <div className="flex items-center gap-4 p-5">
                                    {profile?.photo ? (
                                        <img
                                            src={profile.photo}
                                            alt={fullName}
                                            className="h-14 w-14 shrink-0 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div
                                            aria-hidden="true"
                                            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-green-600/15 text-lg font-semibold text-green-600 dark:text-green-400"
                                        >
                                            {getInitials(
                                                fullName,
                                                volunteer.name
                                            )}
                                        </div>
                                    )}

                                    <div className="min-w-0">
                                        <h3 className="truncate text-base font-semibold text-gray-900 dark:text-white">
                                            {fullName || volunteer.name}
                                        </h3>
                                        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                                            <span className="rounded-full bg-green-600/15 px-2 py-0.5 font-medium text-green-700 dark:text-green-400">
                                                {volunteer.name}
                                            </span>
                                            <span className="capitalize text-gray-500 dark:text-gray-400">
                                                {volunteer.role}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="flex-1 space-y-3 border-t border-gray-100 dark:border-gray-800 px-5 py-4">
                                    <Detail
                                        icon={IoMailOutline}
                                        label="Email"
                                        value={volunteer.email}
                                    />
                                    <Detail
                                        icon={IoMapOutline}
                                        label="Zone"
                                        value={profile?.zone?.zone_name}
                                    />
                                    <Detail
                                        icon={IoLayersOutline}
                                        label="Group"
                                        value={volunteer.current_group?.name}
                                    />
                                    <Detail
                                        icon={IoLocationOutline}
                                        label="Address"
                                        value={
                                            profile?.address
                                                ? `${profile.address}${
                                                      profile?.age
                                                          ? ` · ${profile.age} yrs old`
                                                          : ""
                                                  }`
                                                : null
                                        }
                                    />
                                </div>

                                {/* Actions */}
                                <div className="border-t border-gray-100 dark:border-gray-800 p-3">
                                    <button
                                        onClick={() =>
                                            setSelectedId(volunteer.id)
                                        }
                                        className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition cursor-pointer"
                                    >
                                        <IoKeyOutline
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                        />
                                        Change password
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </motion.div>
            )}

            {selectedId && (
                <UpdateTanod
                    data={data}
                    tanodId={selectedId}
                    onClose={() => setSelectedId(null)}
                />
            )}
        </div>
    );
};

export default TanodCard;
