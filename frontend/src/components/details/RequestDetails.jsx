import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import {
    IoAlertCircle,
    IoClose,
    IoCopyOutline,
    IoCheckmark,
    IoOpenOutline,
    IoWarning,
    IoShieldCheckmark,
    IoTimeOutline,
} from "react-icons/io5";

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

// 0.4 km -> "400 m", 1.234 km -> "1.23 km"
const formatDistance = (km) =>
    km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(2)} km`;

const formatWhen = (value) => {
    if (!value) return null;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    });
};

const Row = ({ label, children }) => (
    <div className="flex items-start justify-between gap-4 py-2.5">
        <dt className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
            {label}
        </dt>
        <dd className="min-w-0 text-right text-sm font-medium text-slate-800 dark:text-slate-100">
            {children}
        </dd>
    </div>
);

const RequestDetails = ({ requestId, onClose, tanodLocations, geoFence }) => {
    const queryClient = useQueryClient();
    const [copied, setCopied] = useState(false);

    const requests = queryClient.getQueryData(["request"]);
    const requestDetails = requests?.find((r) => r.id === requestId);

    // Close with the Escape key
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    // Tanod currently assigned to this request
    const assignedTanod = Object.values(tanodLocations ?? {}).find(
        (loc) => String(loc.requestId) === String(requestId)
    );

    const distanceKm =
        assignedTanod && requestDetails
            ? haversineDistance(
                  Number(requestDetails.latitude),
                  Number(requestDetails.longitude),
                  Number(assignedTanod.lat),
                  Number(assignedTanod.lng)
              )
            : null;

    const isOutsideJurisdiction =
        requestDetails &&
        !geoFence(requestDetails.longitude, requestDetails.latitude);

    const coords = requestDetails
        ? `${Number(requestDetails.latitude).toFixed(6)}, ${Number(
              requestDetails.longitude
          ).toFixed(6)}`
        : "";

    const copyCoords = async () => {
        try {
            await navigator.clipboard.writeText(coords);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* clipboard unavailable: ignore */
        }
    };

    const when = formatWhen(requestDetails?.created_at);

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-label="Incident request details"
            className="relative w-[340px] max-w-[calc(100vw-2rem)] shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
        >
            {/* top accent: red for emergencies */}
            <div className="h-1 bg-red-500" />

            <button
                type="button"
                onClick={onClose}
                aria-label="Close details"
                className="absolute right-3 top-4 flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
                <IoClose className="h-4 w-4" aria-hidden="true" />
            </button>

            {requestDetails ? (
                <div className="p-5">
                    {/* Header */}
                    <div className="flex items-start gap-3 pr-8">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400">
                            <IoAlertCircle
                                className="h-5 w-5"
                                aria-hidden="true"
                            />
                        </div>
                        <div className="min-w-0">
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                Incident request #{requestDetails.id}
                            </p>
                            <h2 className="break-words text-lg font-semibold leading-snug text-slate-900 dark:text-white">
                                {requestDetails.category_name ??
                                    "Unknown category"}
                            </h2>
                            {when && (
                                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                                    <IoTimeOutline
                                        className="h-3.5 w-3.5"
                                        aria-hidden="true"
                                    />
                                    {when}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Jurisdiction warning goes first: it changes what the admin does */}
                    {isOutsideJurisdiction && (
                        <div className="mt-4 flex gap-2.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 dark:border-red-500/30 dark:bg-red-500/10">
                            <IoWarning
                                className="mt-0.5 h-4 w-4 shrink-0 text-red-600 dark:text-red-400"
                                aria-hidden="true"
                            />
                            <div>
                                <p className="text-sm font-semibold text-red-700 dark:text-red-300">
                                    Outside jurisdiction
                                </p>
                                <p className="mt-0.5 text-xs text-red-700/90 dark:text-red-300/80">
                                    This request is outside Barangay Igpit.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Responder status */}
                    <div
                        className={`mt-4 flex items-center gap-3 rounded-lg border px-3 py-2.5 ${
                            assignedTanod
                                ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/30 dark:bg-emerald-500/10"
                                : "border-amber-200 bg-amber-50 dark:border-amber-500/30 dark:bg-amber-500/10"
                        }`}
                    >
                        <IoShieldCheckmark
                            className={`h-5 w-5 shrink-0 ${
                                assignedTanod
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-amber-600 dark:text-amber-400"
                            }`}
                            aria-hidden="true"
                        />
                        <div className="min-w-0">
                            <p
                                className={`text-sm font-semibold ${
                                    assignedTanod
                                        ? "text-emerald-800 dark:text-emerald-300"
                                        : "text-amber-800 dark:text-amber-300"
                                }`}
                            >
                                {assignedTanod
                                    ? "Tanod responding"
                                    : "No tanod assigned yet"}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                                {distanceKm !== null
                                    ? `${formatDistance(
                                          distanceKm
                                      )} from the incident`
                                    : "Waiting for a tanod to accept."}
                            </p>
                        </div>
                    </div>

                    {/* Details */}
                    <dl className="mt-3 divide-y divide-slate-100 dark:divide-slate-800">
                        <Row label="Location">
                            <span className="inline-flex items-center gap-1.5">
                                <span className="tabular-nums">{coords}</span>
                                <button
                                    type="button"
                                    onClick={copyCoords}
                                    aria-label="Copy coordinates"
                                    className="flex h-6 w-6 items-center justify-center rounded text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:hover:bg-slate-800 dark:hover:text-slate-200 cursor-pointer"
                                >
                                    {copied ? (
                                        <IoCheckmark
                                            className="h-4 w-4 text-green-600"
                                            aria-hidden="true"
                                        />
                                    ) : (
                                        <IoCopyOutline
                                            className="h-4 w-4"
                                            aria-hidden="true"
                                        />
                                    )}
                                </button>
                            </span>
                        </Row>
                        {requestDetails.status && (
                            <Row label="Status">
                                <span className="capitalize">
                                    {String(requestDetails.status).replace(
                                        /_/g,
                                        " "
                                    )}
                                </span>
                            </Row>
                        )}
                    </dl>

                    <a
                        href={`https://www.google.com/maps?q=${requestDetails.latitude},${requestDetails.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400"
                    >
                        Open in Google Maps
                        <IoOpenOutline className="h-4 w-4" aria-hidden="true" />
                    </a>
                </div>
            ) : (
                <div className="p-5 pr-12">
                    <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        Request details unavailable
                    </p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        This request is no longer in the list. Close this card
                        and try again.
                    </p>
                </div>
            )}
        </motion.div>
    );
};

export default RequestDetails;
