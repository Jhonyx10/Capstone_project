import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    IoWarningOutline,
    IoChevronForward,
    IoCloseOutline,
    IoLocationOutline,
    IoPersonOutline,
    IoAlertCircleOutline,
} from "react-icons/io5";
import useAppState from "../store/useAppState";
import { violatorsViolationTotal } from "../functions/Analytics";

const VISIBLE_COUNT = 5;

const rankStyle = [
    "bg-amber-500/15 text-amber-600 dark:text-amber-400", // 1st
    "bg-slate-400/20 text-slate-600 dark:text-slate-300", // 2nd
    "bg-orange-500/15 text-orange-600 dark:text-orange-400", // 3rd
];

const fullName = (v) =>
    `${v.first_name ?? ""} ${v.last_name ?? ""}`.trim() || "Unnamed";

const initialsOf = (v) =>
    [v.first_name, v.last_name]
        .filter(Boolean)
        .map((n) => n[0].toUpperCase())
        .join("") || "?";

const Avatar = ({ violator, size = "h-11 w-11", text = "text-sm" }) =>
    violator.photo ? (
        <img
            src={violator.photo}
            alt=""
            className={`${size} shrink-0 rounded-full object-cover`}
        />
    ) : (
        <div
            aria-hidden="true"
            className={`${size} ${text} flex shrink-0 items-center justify-center rounded-full bg-green-600/15 font-semibold text-green-600 dark:text-green-400`}
        >
            {initialsOf(violator)}
        </div>
    );

/* ---------- quick view dialog ---------- */

const QuickView = ({ violator, onClose, onOpenDetails }) => {
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        const onKeyDown = (e) => e.key === "Escape" && onCloseRef.current();
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="violator-quick-title"
                className="relative w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
            >
                <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close"
                    className="absolute right-3 top-3 rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:hover:bg-gray-800 dark:hover:text-gray-200 cursor-pointer"
                >
                    <IoCloseOutline className="h-5 w-5" />
                </button>

                <div className="flex flex-col items-center text-center">
                    <Avatar
                        violator={violator}
                        size="h-20 w-20"
                        text="text-2xl"
                    />
                    <h2
                        id="violator-quick-title"
                        className="mt-3 text-lg font-semibold text-gray-900 dark:text-white"
                    >
                        {fullName(violator)}
                    </h2>
                    <span className="mt-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                        {violator.total_violations} violation
                        {violator.total_violations === 1 ? "" : "s"}
                    </span>
                </div>

                <dl className="mt-5 space-y-2.5 text-sm">
                    {violator.age != null && violator.age !== "" && (
                        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                            <IoPersonOutline
                                className="h-4 w-4 text-gray-400"
                                aria-hidden="true"
                            />
                            <dt className="sr-only">Age</dt>
                            <dd>{violator.age} years old</dd>
                        </div>
                    )}
                    {violator.address && (
                        <div className="flex items-start gap-2 text-gray-700 dark:text-gray-200">
                            <IoLocationOutline
                                className="mt-0.5 h-4 w-4 shrink-0 text-gray-400"
                                aria-hidden="true"
                            />
                            <dt className="sr-only">Address</dt>
                            <dd className="break-words">{violator.address}</dd>
                        </div>
                    )}
                </dl>

                <button
                    type="button"
                    onClick={onOpenDetails}
                    className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 cursor-pointer"
                >
                    View full record
                    <IoChevronForward className="h-4 w-4" aria-hidden="true" />
                </button>
            </motion.div>
        </motion.div>
    );
};

/* ---------- widget ---------- */

const SkeletonRow = () => (
    <div className="flex animate-pulse items-center gap-3 px-5 py-3.5">
        <div className="h-7 w-7 rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="h-11 w-11 rounded-full bg-gray-200 dark:bg-gray-800" />
        <div className="flex-1 space-y-2">
            <div className="h-3.5 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-2 w-full rounded bg-gray-200 dark:bg-gray-800" />
        </div>
    </div>
);

export default function ViolatorsList() {
    const base_url = useAppState((s) => s.base_url);
    const token = useAppState((s) => s.token);
    const navigate = useNavigate();

    const [selected, setSelected] = useState(null);
    const [showAll, setShowAll] = useState(false);

    const {
        data = [],
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["violations_total"],
        queryFn: () => violatorsViolationTotal({ base_url, token }),
    });

    const ranked = [...data].sort(
        (a, b) => (b.total_violations ?? 0) - (a.total_violations ?? 0)
    );
    const rows = showAll ? ranked : ranked.slice(0, VISIBLE_COUNT);
    const max = ranked[0]?.total_violations || 1;

    return (
        <>
            <motion.section
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="w-full rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-slate-900"
            >
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                            <IoWarningOutline
                                className="h-5 w-5"
                                aria-hidden="true"
                            />
                        </div>
                        <div>
                            <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
                                Most violators
                            </h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                Ranked by total violations
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => navigate("/violators")}
                        className="text-sm font-medium text-green-600 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:text-green-400 cursor-pointer"
                    >
                        View all
                    </button>
                </div>

                {/* Body */}
                {isLoading && (
                    <div>
                        {[0, 1, 2].map((i) => (
                            <SkeletonRow key={i} />
                        ))}
                    </div>
                )}

                {isError && (
                    <div
                        role="alert"
                        className="m-5 flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
                    >
                        <IoAlertCircleOutline className="mt-0.5 h-4 w-4 shrink-0" />
                        Could not load the violators list.
                    </div>
                )}

                {!isLoading && !isError && ranked.length === 0 && (
                    <p className="px-5 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        No violators recorded yet.
                    </p>
                )}

                <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                    {rows.map((violator, i) => (
                        <motion.li
                            key={violator.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.25 }}
                        >
                            <button
                                type="button"
                                onClick={() => setSelected(violator)}
                                className="group flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors hover:bg-gray-50 focus:outline-none focus-visible:bg-gray-50 dark:hover:bg-slate-800/60 dark:focus-visible:bg-slate-800/60 cursor-pointer"
                            >
                                <span
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                        rankStyle[i] ??
                                        "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"
                                    }`}
                                >
                                    {i + 1}
                                </span>

                                <Avatar violator={violator} />

                                <div className="min-w-0 flex-1">
                                    <div className="flex items-baseline justify-between gap-3">
                                        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                                            {fullName(violator)}
                                        </p>
                                        <p className="shrink-0 text-sm font-semibold text-gray-900 dark:text-white">
                                            {violator.total_violations}
                                            <span className="ml-1 text-xs font-normal text-gray-500 dark:text-gray-400">
                                                {violator.total_violations === 1
                                                    ? "violation"
                                                    : "violations"}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="mt-2 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                                        <motion.div
                                            className="h-1.5 rounded-full bg-amber-500"
                                            initial={{ width: 0 }}
                                            animate={{
                                                width: `${
                                                    ((violator.total_violations ??
                                                        0) /
                                                        max) *
                                                    100
                                                }%`,
                                            }}
                                            transition={{
                                                duration: 0.5,
                                                delay: 0.1 + i * 0.05,
                                            }}
                                        />
                                    </div>
                                </div>

                                <IoChevronForward
                                    className="h-4 w-4 shrink-0 text-gray-300 transition-transform group-hover:translate-x-0.5 group-hover:text-gray-500 dark:text-gray-600"
                                    aria-hidden="true"
                                />
                            </button>
                        </motion.li>
                    ))}
                </ul>

                {ranked.length > VISIBLE_COUNT && (
                    <div className="border-t border-gray-100 px-5 py-3 text-center dark:border-gray-800">
                        <button
                            type="button"
                            onClick={() => setShowAll((v) => !v)}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900 focus:outline-none focus-visible:underline dark:text-gray-300 dark:hover:text-white cursor-pointer"
                        >
                            {showAll
                                ? "Show less"
                                : `Show all ${ranked.length}`}
                        </button>
                    </div>
                )}
            </motion.section>

            {selected && (
                <QuickView
                    violator={selected}
                    onClose={() => setSelected(null)}
                    onOpenDetails={() =>
                        navigate(`/violators-details/${selected.id}`)
                    }
                />
            )}
        </>
    );
}
