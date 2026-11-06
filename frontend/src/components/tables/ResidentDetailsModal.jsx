import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FaTimes, FaExclamationTriangle } from "react-icons/fa";
import useAppState from "../../store/useAppState";
import {
    getResidentDetails,
    getResidentPhoto,
    approveResident,
    rejectResident,
} from "../../functions/ReportsApi";
import { STATUS_STYLE, statusLabel } from "../../utils/residentStatus";

const fmt = (d) => (d ? new Date(d).toLocaleString() : null);

const Field = ({ label, children }) => (
    <div>
        <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
        <dd className="mt-0.5 break-words text-sm font-medium text-slate-800 dark:text-slate-100">
            {children || "—"}
        </dd>
    </div>
);

const ResidentDetailsModal = ({ id, onClose }) => {
    const { base_url, token } = useAppState();
    const queryClient = useQueryClient();

    const [photoUrl, setPhotoUrl] = useState(null);
    const [photoState, setPhotoState] = useState("loading"); // loading | ready | none
    const [rejecting, setRejecting] = useState(false);
    const [reason, setReason] = useState("");

    const {
        data: r,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["resident", id],
        queryFn: () => getResidentDetails({ base_url, token, id }),
    });

    // Load the private photo as a blob and clean it up afterwards
    useEffect(() => {
        let url = null;
        let cancelled = false;
        setPhotoState("loading");
        setPhotoUrl(null);

        getResidentPhoto({ base_url, token, id }).then((blob) => {
            if (cancelled) return;
            if (!blob) return setPhotoState("none");
            url = URL.createObjectURL(blob);
            setPhotoUrl(url);
            setPhotoState("ready");
        });

        return () => {
            cancelled = true;
            if (url) URL.revokeObjectURL(url);
        };
    }, [id, base_url, token]);

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const refresh = () => {
        queryClient.invalidateQueries({ queryKey: ["residents"] });
        queryClient.invalidateQueries({ queryKey: ["resident", id] });
    };

    const approve = useMutation({
        mutationFn: () => approveResident({ base_url, token, id }),
        onSuccess: () => {
            refresh();
            onClose();
        },
    });

    const reject = useMutation({
        mutationFn: () =>
            rejectResident({ base_url, token, id, reason: reason.trim() }),
        onSuccess: () => {
            refresh();
            onClose();
        },
    });

    const error = approve.error ?? reject.error;
    const errorMessage =
        error &&
        (error.response?.data?.message ?? "Something went wrong. Try again.");

    const canReview = r && (r.status === "pending" || r.status === "rejected");
    const byStatus = Object.entries(r?.requests_by_status ?? {});

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        >
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-slate-900"
            >
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-white">
                        Resident details
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <FaTimes />
                    </button>
                </div>

                {isLoading && (
                    <div className="h-48 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                )}

                {isError && (
                    <p className="text-sm text-rose-600">
                        Could not load this resident.
                    </p>
                )}

                {r && (
                    <div className="space-y-5">
                        {r.on_block_list && (
                            <div className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                                <FaExclamationTriangle />
                                This number or device is on the block list.
                            </div>
                        )}

                        <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
                            {/* Face photo */}
                            <div className="flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800">
                                {photoState === "ready" && (
                                    <img
                                        src={photoUrl}
                                        alt={`${r.name} face`}
                                        className="h-full w-full object-cover"
                                    />
                                )}
                                {photoState === "loading" && (
                                    <div className="h-full w-full animate-pulse bg-slate-100 dark:bg-slate-800" />
                                )}
                                {photoState === "none" && (
                                    <span className="px-4 text-center text-sm text-slate-500">
                                        No photo available
                                    </span>
                                )}
                            </div>

                            {/* Info */}
                            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 content-start">
                                <Field label="Name">{r.name}</Field>
                                <Field label="Mobile number">{r.phone}</Field>
                                <Field label="Status">
                                    <span
                                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            STATUS_STYLE[r.status] ?? ""
                                        }`}
                                    >
                                        {statusLabel(r.status)}
                                    </span>
                                </Field>
                                <Field label="Registered">
                                    {fmt(r.created_at)}
                                </Field>
                                <Field label="Reviewed by">
                                    {r.reviewed_by}
                                </Field>
                                <Field label="Reviewed at">
                                    {fmt(r.reviewed_at)}
                                </Field>
                                {r.reject_reason && (
                                    <div className="col-span-2">
                                        <Field label="Reject reason">
                                            {r.reject_reason}
                                        </Field>
                                    </div>
                                )}
                                {r.block_reason && (
                                    <div className="col-span-2">
                                        <Field label="Block reason">
                                            {r.block_reason}
                                        </Field>
                                    </div>
                                )}
                                <div className="col-span-2">
                                    <Field label="Device ID">
                                        {r.device_id}
                                    </Field>
                                </div>
                            </dl>
                        </div>

                        {/* Requests */}
                        <div>
                            <p className="mb-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                                Requests ({r.requests_total})
                            </p>
                            {byStatus.length === 0 ? (
                                <p className="text-sm text-slate-500">
                                    No requests yet.
                                </p>
                            ) : (
                                <div className="flex flex-wrap gap-2">
                                    {byStatus.map(([status, count]) => (
                                        <span
                                            key={status}
                                            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-700 dark:border-slate-700 dark:text-slate-200"
                                        >
                                            {status}: <b>{count}</b>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Other accounts on the same phone */}
                        {r.same_device?.length > 0 && (
                            <div>
                                <p className="mb-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                                    Other accounts registered on this device
                                </p>
                                <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-700">
                                    {r.same_device.map((u) => (
                                        <li
                                            key={u.id}
                                            className="flex items-center justify-between px-3 py-2 text-sm"
                                        >
                                            <span className="text-slate-700 dark:text-slate-200">
                                                {u.name}{" "}
                                                <span className="text-xs text-slate-500">
                                                    {u.email}
                                                </span>
                                            </span>
                                            <span
                                                className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                                                    STATUS_STYLE[u.status] ?? ""
                                                }`}
                                            >
                                                {statusLabel(u.status)}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {errorMessage && (
                            <p className="text-sm text-rose-600">
                                {errorMessage}
                            </p>
                        )}

                        {/* Review actions */}
                        {canReview && (
                            <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
                                {rejecting ? (
                                    <>
                                        <textarea
                                            value={reason}
                                            onChange={(e) =>
                                                setReason(e.target.value)
                                            }
                                            maxLength={255}
                                            rows={3}
                                            placeholder="Reason for rejecting (the resident will see this)"
                                            className="w-full rounded-lg border border-slate-300 bg-white p-3 text-sm text-slate-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                                        />
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => {
                                                    setRejecting(false);
                                                    setReason("");
                                                }}
                                                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:underline dark:text-slate-300"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                disabled={
                                                    !reason.trim() ||
                                                    reject.isPending
                                                }
                                                onClick={() => reject.mutate()}
                                                className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-medium text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                {reject.isPending
                                                    ? "Working..."
                                                    : "Confirm reject"}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex justify-end gap-2">
                                        {r.status === "pending" && (
                                            <button
                                                onClick={() =>
                                                    setRejecting(true)
                                                }
                                                className="rounded-lg border border-rose-300 px-4 py-2 text-sm font-medium text-rose-600 hover:bg-rose-600 hover:text-white dark:border-rose-900 dark:text-rose-400"
                                            >
                                                Reject
                                            </button>
                                        )}
                                        <button
                                            disabled={approve.isPending}
                                            onClick={() => approve.mutate()}
                                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {approve.isPending
                                                ? "Working..."
                                                : "Approve"}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

export default ResidentDetailsModal;
