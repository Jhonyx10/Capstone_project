import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    IoArrowBack,
    IoLocationOutline,
    IoCalendarOutline,
    IoTimeOutline,
    IoChevronForward,
    IoPersonOutline,
    IoMapOutline,
} from "react-icons/io5";
import useAppState from "../../store/useAppState";
import { violatorsDetails } from "../../functions/ReportsApi";

const card =
    "rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900";

/* ---------- formatting helpers ---------- */

const formatDate = (date) => {
    if (!date) return "—";
    const d = new Date(
        /^\d{4}-\d{2}-\d{2}$/.test(date) ? `${date}T00:00:00` : date
    );
    return Number.isNaN(d.getTime())
        ? date
        : d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
          });
};

const formatTime = (time) => {
    if (!time) return "—";
    const d = new Date(`1970-01-01T${time}`);
    return Number.isNaN(d.getTime())
        ? time
        : d.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
          });
};

const sortKey = (r) =>
    new Date(`${r.date ?? ""}T${r.time ?? "00:00:00"}`).getTime() || 0;

/* ---------- small pieces ---------- */

const BackButton = ({ onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-700 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 cursor-pointer"
    >
        <IoArrowBack className="h-4 w-4" aria-hidden="true" />
        Back
    </button>
);

const Stat = ({ label, value }) => (
    <div className="min-w-0 px-4 py-3">
        <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-0.5 truncate text-sm font-semibold text-gray-900 dark:text-white">
            {value}
        </p>
    </div>
);

const Meta = ({ icon: Icon, children }) => (
    <span className="inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
        <Icon className="h-4 w-4 text-gray-400" aria-hidden="true" />
        {children}
    </span>
);

const LoadingState = () => (
    <div className="mx-auto max-w-4xl space-y-5 p-4 md:p-6 animate-pulse">
        <div className="h-9 w-48 rounded bg-gray-200 dark:bg-gray-800" />
        <div className={`${card} h-48`} />
        <div className={`${card} h-64`} />
    </div>
);

/* ---------- page ---------- */

const ViolatorsDetails = () => {
    const base_url = useAppState((s) => s.base_url);
    const token = useAppState((s) => s.token);
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        data: violator,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["violator_details", id],
        queryFn: () => violatorsDetails({ base_url, token, id }),
    });

    const records = useMemo(
        () =>
            [...(violator?.reports ?? [])].sort(
                (a, b) => sortKey(b) - sortKey(a)
            ),
        [violator]
    );

    const summary = useMemo(() => {
        const counts = {};
        records.forEach((r) => {
            const name = r?.incident_type?.category?.category_name;
            if (name) counts[name] = (counts[name] ?? 0) + 1;
        });
        const top = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
        return {
            latest: records[0] ? formatDate(records[0].date) : "—",
            topCategory: top ? `${top[0]} (${top[1]})` : "—",
        };
    }, [records]);

    if (isLoading) return <LoadingState />;

    if (isError || !violator) {
        return (
            <div className="mx-auto max-w-4xl p-4 md:p-6">
                <div
                    className={`${card} flex flex-col items-center py-16 text-center`}
                >
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                        No record found
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        This violator may have been removed, or the link is
                        incorrect.
                    </p>
                    <div className="mt-4">
                        <BackButton onClick={() => navigate(-1)} />
                    </div>
                </div>
            </div>
        );
    }

    const fullName = `${violator.first_name ?? ""} ${
        violator.last_name ?? ""
    }`.trim();
    const initials =
        [violator.first_name, violator.last_name]
            .filter(Boolean)
            .map((n) => n[0].toUpperCase())
            .join("") || "?";

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-4xl space-y-5 p-4 md:p-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                        Violator details
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Profile and violation history.
                    </p>
                </div>
                <BackButton onClick={() => navigate(-1)} />
            </div>

            {/* Profile */}
            <section className={card}>
                <div className="flex flex-col items-center gap-5 p-5 text-center sm:flex-row sm:text-left">
                    {violator.photo ? (
                        <img
                            src={violator.photo}
                            alt={fullName}
                            className="h-24 w-24 shrink-0 rounded-full object-cover ring-4 ring-gray-100 dark:ring-gray-800"
                        />
                    ) : (
                        <div
                            aria-hidden="true"
                            className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-green-600/15 text-2xl font-semibold text-green-600 dark:text-green-400"
                        >
                            {initials}
                        </div>
                    )}

                    <div className="min-w-0">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {fullName || "Unnamed"}
                        </h2>
                        <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5 sm:justify-start">
                            {violator.age != null && violator.age !== "" && (
                                <Meta icon={IoPersonOutline}>
                                    {violator.age} years old
                                </Meta>
                            )}
                            {violator.zone?.zone_name && (
                                <Meta icon={IoMapOutline}>
                                    {violator.zone.zone_name}
                                </Meta>
                            )}
                            {violator.address && (
                                <Meta icon={IoLocationOutline}>
                                    {violator.address}
                                </Meta>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 divide-y divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    <Stat label="Total records" value={records.length} />
                    <Stat label="Latest violation" value={summary.latest} />
                    <Stat
                        label="Most common category"
                        value={summary.topCategory}
                    />
                </div>
            </section>

            {/* Records */}
            <section className={`${card} p-5`}>
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                        Violation records
                    </h2>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {records.length}
                    </span>
                </div>

                {records.length === 0 ? (
                    <p className="mt-6 pb-2 text-center text-sm text-gray-500 dark:text-gray-400">
                        No records available.
                    </p>
                ) : (
                    <ul className="mt-4 space-y-3">
                        {records.map((record, i) => {
                            const category =
                                record?.incident_type?.category?.category_name;
                            const incident =
                                record?.incident_type?.incident_name;
                            const zone = record?.location?.zone?.zone_name;
                            const place = record?.location?.location_name;
                            const address = [zone, place]
                                .filter(Boolean)
                                .join(", ");

                            return (
                                <motion.li
                                    key={record.id}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: Math.min(i, 8) * 0.04,
                                        duration: 0.25,
                                    }}
                                    className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950/40"
                                >
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div className="min-w-0">
                                            {category && (
                                                <span className="inline-block rounded-full bg-green-600/15 px-2 py-0.5 text-xs font-medium text-green-700 dark:text-green-400">
                                                    {category}
                                                </span>
                                            )}
                                            <p className="mt-1.5 font-medium text-gray-900 dark:text-white">
                                                {incident ??
                                                    "Unspecified incident"}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                navigate(
                                                    `/report-details/${record.id}`
                                                )
                                            }
                                            className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 cursor-pointer"
                                        >
                                            View report
                                            <IoChevronForward
                                                className="h-4 w-4"
                                                aria-hidden="true"
                                            />
                                        </button>
                                    </div>

                                    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
                                        <Meta icon={IoCalendarOutline}>
                                            {formatDate(record?.date)}
                                        </Meta>
                                        <Meta icon={IoTimeOutline}>
                                            {formatTime(record?.time)}
                                        </Meta>
                                        {address && (
                                            <Meta icon={IoLocationOutline}>
                                                {address}
                                            </Meta>
                                        )}
                                    </div>
                                </motion.li>
                            );
                        })}
                    </ul>
                )}
            </section>
        </motion.div>
    );
};

export default ViolatorsDetails;
