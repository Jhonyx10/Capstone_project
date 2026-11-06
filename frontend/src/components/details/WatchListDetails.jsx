import { useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    IoArrowBack,
    IoCreateOutline,
    IoTrashOutline,
    IoTimeOutline,
    IoOpenOutline,
    IoMapOutline,
} from "react-icons/io5";
import useAppState from "../../store/useAppState";
import { toast } from "../../store/useToast";
import { getWatchList, deleteWatchList } from "../../functions/WatchListApi";
import WatchListForm from "../../forms/WatchListForm";
import ConfirmDialog from "../alerts/ConfirmDialog";
import SightingsMap from "../map/SightingsMap";
import {
    TypeBadge,
    StatusBadge,
    Thumb,
    formatDate,
    formatDateTime,
    card,
} from "../WatchListUi";

const BackButton = ({ onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 cursor-pointer"
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

const LoadingState = () => (
    <div className="mx-auto max-w-7xl animate-pulse space-y-5 p-4 md:p-6">
        <div className="h-9 w-56 rounded bg-gray-200 dark:bg-gray-800" />
        <div className="grid gap-5 lg:grid-cols-2">
            <div className={`${card} h-80`} />
            <div className={`${card} h-80`} />
        </div>
        <div className={`${card} h-48`} />
    </div>
);

const LIST_ROUTE = "/watchlists";

const WatchListDetails = () => {
    const base_url = useAppState((s) => s.base_url);
    const token = useAppState((s) => s.token);
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [editing, setEditing] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const mapSectionRef = useRef(null);

    const {
        data: entry,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["watch-lists", "detail", id],
        queryFn: () => getWatchList({ base_url, token, id }),
    });

    const deleteMutation = useMutation({
        mutationFn: () => deleteWatchList({ base_url, token, id }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["watch-lists"] });
            toast.success("Entry deleted");
            navigate(LIST_ROUTE);
        },
        onError: () => {
            toast.error(
                "Could not delete the entry. Please try again.",
                "Delete failed"
            );
            setConfirmDelete(false);
        },
    });

    if (isLoading) return <LoadingState />;

    if (isError || !entry) {
        return (
            <div className="mx-auto max-w-4xl p-4 md:p-6">
                <div
                    className={`${card} flex flex-col items-center py-16 text-center`}
                >
                    <p className="font-medium text-gray-800 dark:text-gray-100">
                        Entry not found
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        It may have been deleted, or the link is incorrect.
                    </p>
                    <div className="mt-4">
                        <BackButton onClick={() => navigate(LIST_ROUTE)} />
                    </div>
                </div>
            </div>
        );
    }

    // Newest first (the API returns them that way); the list number matches the map pin
    const sightings = entry.sightings ?? [];
    const last = sightings[0];

    const showOnMap = (sightingId) => {
        setSelectedId(sightingId);
        mapSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-7xl space-y-5 p-4 md:p-6"
        >
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
                        Watch list details
                    </h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Entry information and reported sightings.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <BackButton onClick={() => navigate(LIST_ROUTE)} />
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 cursor-pointer"
                    >
                        <IoCreateOutline
                            className="h-4 w-4"
                            aria-hidden="true"
                        />
                        Edit
                    </button>
                    <button
                        type="button"
                        onClick={() => setConfirmDelete(true)}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-500/40 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-500/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-400 dark:text-red-400 cursor-pointer"
                    >
                        <IoTrashOutline
                            className="h-4 w-4"
                            aria-hidden="true"
                        />
                        Delete
                    </button>
                </div>
            </div>

            {/* Main info (left) + map (right) */}
            <div className="grid gap-5 lg:grid-cols-2">
                {/* Profile */}
                <section className={`${card} flex flex-col`}>
                    <div className="space-y-4 p-5">
                        <div className="flex gap-4">
                            <Thumb
                                src={entry.image_url}
                                type={entry.type}
                                alt={entry.identifier}
                                className="h-32 w-32"
                            />
                            <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <TypeBadge type={entry.type} />
                                    <StatusBadge status={entry.status} />
                                </div>
                                <h2 className="mt-2 break-words text-xl font-semibold text-gray-900 dark:text-white">
                                    {entry.identifier}
                                </h2>
                                <h3 className="mt-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                                    Description
                                </h3>
                                <p className="mt-0.5 whitespace-pre-line break-words text-sm text-gray-700 dark:text-gray-200">
                                    {entry.details}
                                </p>
                            </div>
                        </div>

                        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-2.5">
                            <h3 className="text-xs font-medium text-amber-700 dark:text-amber-400">
                                Reason for watch
                            </h3>
                            <p className="mt-1 whitespace-pre-line break-words text-sm text-gray-800 dark:text-gray-100">
                                {entry.reason}
                            </p>
                        </div>
                    </div>

                    <div className="mt-auto grid grid-cols-3 divide-x divide-gray-100 border-t border-gray-100 dark:divide-gray-800 dark:border-gray-800">
                        <Stat
                            label="Total sightings"
                            value={entry.sightings_count ?? sightings.length}
                        />
                        <Stat
                            label="Last seen"
                            value={last ? formatDate(last.created_at) : "Never"}
                        />
                        <Stat
                            label="Added"
                            value={formatDate(entry.created_at)}
                        />
                    </div>
                </section>

                {/* Sighting map: always shown */}
                <section
                    ref={mapSectionRef}
                    className={`${card} flex flex-col overflow-hidden`}
                >
                    <div className="flex flex-wrap items-center justify-between gap-2 p-5 pb-3">
                        <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                            Sighting locations
                        </h2>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                                Most recent
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                                Earlier
                            </span>
                            <span className="inline-flex items-center gap-1.5">
                                <span className="inline-block w-4 border-t-2 border-dashed border-red-500/70" />
                                Oldest to newest
                            </span>
                        </div>
                    </div>
                    <div className="relative min-h-[360px] flex-1">
                        <div className="absolute inset-0">
                            <SightingsMap
                                sightings={sightings}
                                selectedId={selectedId}
                                onSelect={setSelectedId}
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* Sighting reports */}
            <section className={`${card} p-5`}>
                <div className="flex items-center gap-2">
                    <h2 className="text-base font-semibold text-gray-900 dark:text-white">
                        Reported sightings
                    </h2>
                    <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                        {sightings.length}
                    </span>
                </div>

                {sightings.length === 0 ? (
                    <p className="mt-6 pb-2 text-center text-sm text-gray-500 dark:text-gray-400">
                        No sightings reported yet.
                    </p>
                ) : (
                    <ul className="mt-4 space-y-3">
                        {sightings.map((s, i) => (
                            <motion.li
                                key={s.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: Math.min(i, 8) * 0.04,
                                    duration: 0.25,
                                }}
                                className={`rounded-lg border p-4 transition-colors ${
                                    s.id === selectedId
                                        ? "border-green-500 bg-green-500/5"
                                        : "border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950/40"
                                }`}
                            >
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <p className="flex min-w-0 items-start gap-2 font-medium text-gray-900 dark:text-white">
                                        <span
                                            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white ${
                                                i === 0
                                                    ? "bg-red-500"
                                                    : "bg-amber-500"
                                            }`}
                                            aria-label={`Sighting ${i + 1}`}
                                        >
                                            {i + 1}
                                        </span>
                                        <span className="break-words">
                                            {s.location}
                                        </span>
                                    </p>
                                    <div className="flex shrink-0 items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => showOnMap(s.id)}
                                            className="inline-flex items-center gap-1 text-sm font-medium text-green-600 hover:underline dark:text-green-400 cursor-pointer"
                                        >
                                            <IoMapOutline
                                                className="h-4 w-4"
                                                aria-hidden="true"
                                            />
                                            Show on map
                                        </button>
                                        <a
                                            href={`https://www.google.com/maps?q=${s.latitude},${s.longitude}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-sm font-medium text-gray-500 hover:underline dark:text-gray-400"
                                        >
                                            Google Maps
                                            <IoOpenOutline
                                                className="h-4 w-4"
                                                aria-hidden="true"
                                            />
                                        </a>
                                    </div>
                                </div>

                                {s.note && (
                                    <p className="mt-2 whitespace-pre-line text-sm text-gray-700 dark:text-gray-200">
                                        {s.note}
                                    </p>
                                )}

                                <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-300">
                                    <IoTimeOutline
                                        className="h-4 w-4 text-gray-400"
                                        aria-hidden="true"
                                    />
                                    {formatDateTime(s.created_at)}
                                </p>
                            </motion.li>
                        ))}
                    </ul>
                )}
            </section>

            {editing && (
                <WatchListForm
                    entry={entry}
                    onClose={() => setEditing(false)}
                />
            )}

            {confirmDelete && (
                <ConfirmDialog
                    danger
                    title="Delete this entry?"
                    message={`“${entry.identifier}” will be removed from the watch list. You can restore it later from the list page.`}
                    confirmLabel="Delete"
                    loading={
                        deleteMutation.isPending || deleteMutation.isLoading
                    }
                    onConfirm={() => deleteMutation.mutate()}
                    onCancel={() => setConfirmDelete(false)}
                />
            )}
        </motion.div>
    );
};

export default WatchListDetails;
