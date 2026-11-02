import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaTimes } from "react-icons/fa";
import useAppState from "../../store/useAppState";
import { reportDetails } from "../../functions/ReportsApi";
import ReportViolators from "./ReportViolators";

const spring = { type: "spring", stiffness: 200, damping: 20 };

const fmtDate = (
    d,
    opts = { month: "short", day: "numeric", year: "numeric" }
) => {
    const x = new Date(d);
    return isNaN(x) ? d ?? "—" : x.toLocaleDateString("en-US", opts);
};

const fmtTime = (t) => {
    if (!t) return "—";
    const x = new Date(t.includes?.("T") ? t : `1970-01-01T${t}`);
    return isNaN(x)
        ? t
        : x.toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
          });
};

// Response time is stored in minutes
const fmtDuration = (m) => {
    if (m === null || m === undefined) return "—";
    const n = Number(m);
    if (isNaN(n)) return m;
    if (n < 60) return `${n} min`;
    const h = Math.floor(n / 60);
    const r = Math.round(n % 60);
    return r ? `${h} h ${r} min` : `${h} h`;
};

const Card = ({ title, delay = 0.2, className = "", children }) => (
    <motion.section
        layout
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ ...spring, delay }}
        className={`rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 ${className}`}
    >
        {title && (
            <h3 className="mb-4 text-sm font-semibold text-slate-800 dark:text-slate-100">
                {title}
            </h3>
        )}
        {children}
    </motion.section>
);

const Field = ({ label, children }) => (
    <div>
        <dt className="text-xs text-slate-500 dark:text-slate-400">{label}</dt>
        <dd className="mt-0.5 text-sm font-medium text-slate-800 dark:text-slate-100">
            {children || "—"}
        </dd>
    </div>
);

// Shows a neat placeholder instead of a broken-image icon.
const SafeImage = ({ src, alt, className = "", ...rest }) => {
    const [failed, setFailed] = useState(false);
    if (!src || failed) {
        return (
            <div
                className={`flex items-center justify-center bg-slate-100 text-xs text-slate-400 dark:bg-slate-800 ${className}`}
            >
                Image unavailable
            </div>
        );
    }
    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setFailed(true)}
            {...rest}
        />
    );
};

const ReportDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token, base_url } = useAppState();
    const [lightbox, setLightbox] = useState(null);

    const {
        data: report,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["report_details", id],
        queryFn: () => reportDetails({ token, base_url, id }),
    });

    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && setLightbox(null);
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    const backButton = (
        <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
            <FaArrowLeft size={11} /> Back
        </button>
    );

    if (isLoading) {
        return (
            <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
                <div className="h-10 w-64 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800 lg:col-span-2" />
                    <div className="h-64 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800" />
                </div>
            </div>
        );
    }

    if (isError || !report) {
        return (
            <div className="mx-auto max-w-5xl space-y-4 p-4 md:p-6">
                {backButton}
                <p className="py-12 text-center text-slate-500 dark:text-slate-400">
                    This report could not be found.
                </p>
            </div>
        );
    }

    const response = report.response_record;
    const evidences = report.evidences ?? [];

    return (
        <motion.div
            layout
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ ...spring, delay: 0.1 }}
            className="mx-auto max-w-5xl space-y-6 p-4 md:p-6"
        >
            {/* Header */}
            <header className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <motion.h1
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="text-2xl font-semibold text-slate-800 dark:text-white"
                    >
                        {report.incident_type?.incident_name ??
                            "Report details"}
                    </motion.h1>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                        <span className="rounded-md bg-green-500/10 px-2 py-0.5 text-xs text-green-600 dark:text-green-400">
                            {report.incident_type?.category?.category_name ??
                                "Uncategorized"}
                        </span>
                        <span>Report #{report.id ?? id}</span>
                        <span>
                            · {fmtDate(report.date)}, {fmtTime(report.time)}
                        </span>
                    </div>
                </div>
                {backButton}
            </header>

            <div className="grid gap-4 lg:grid-cols-3">
                {/* Main column */}
                <div className="space-y-4 lg:col-span-2">
                    <Card title="Description" delay={0.2}>
                        <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                            {report.report_description ||
                                "No description provided."}
                        </p>
                    </Card>

                    <Card
                        title={`Evidence${
                            evidences.length ? ` (${evidences.length})` : ""
                        }`}
                        delay={0.3}
                    >
                        {evidences.length > 0 ? (
                            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                {evidences.map((ev, i) => (
                                    <motion.button
                                        key={i}
                                        layout
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{
                                            ...spring,
                                            delay: 0.35 + i * 0.05,
                                        }}
                                        whileHover={{ scale: 1.03 }}
                                        onClick={() => setLightbox(ev)}
                                        className="overflow-hidden rounded-lg border border-slate-200 text-left dark:border-slate-700"
                                    >
                                        <SafeImage
                                            src={ev.file_url}
                                            alt={`Evidence ${i + 1}`}
                                            className="h-32 w-full object-cover"
                                        />
                                        {ev.remarks && (
                                            <p className="truncate px-2 py-1.5 text-xs text-slate-600 dark:text-slate-300">
                                                {ev.remarks}
                                            </p>
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm italic text-slate-400">
                                No evidence uploaded.
                            </p>
                        )}
                    </Card>

                    <Card title="Location" delay={0.35}>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <dl className="space-y-3">
                                <Field label="Zone">
                                    {report.location?.zone?.zone_name}
                                </Field>
                                <Field label="Location">
                                    {report.location?.location_name}
                                </Field>
                            </dl>
                            <div>
                                <p className="mb-2 text-xs text-slate-500 dark:text-slate-400">
                                    Landmark
                                </p>
                                {report.location?.landmark ? (
                                    <SafeImage
                                        src={report.location.landmark}
                                        alt="Landmark"
                                        className="h-40 w-full cursor-pointer rounded-lg border border-slate-200 object-cover dark:border-slate-700"
                                        onClick={() =>
                                            setLightbox({
                                                file_url:
                                                    report.location.landmark,
                                                remarks: "Landmark",
                                            })
                                        }
                                    />
                                ) : (
                                    <p className="text-sm italic text-slate-400">
                                        No landmark provided
                                    </p>
                                )}
                            </div>
                        </div>
                    </Card>

                    <ReportViolators reportId={id} />
                </div>

                {/* Side column */}
                <div className="space-y-4">
                    <Card title="Report" delay={0.25}>
                        <dl className="space-y-3">
                            <Field label="Reported by">
                                {report.user?.name}
                            </Field>
                            <Field label="Role">{report.user?.role}</Field>
                            <Field label="Date">{fmtDate(report.date)}</Field>
                            <Field label="Time">{fmtTime(report.time)}</Field>
                        </dl>
                    </Card>

                    {response && (
                        <Card title="Response" delay={0.35}>
                            <dl className="space-y-3">
                                <Field label="Requested by">
                                    {response.request?.user?.name}
                                </Field>
                                <Field label="Distance">
                                    {response.distance != null
                                        ? `${response.distance} km`
                                        : null}
                                </Field>
                                <Field label="Response time">
                                    {fmtDuration(response.response_time)}
                                </Field>
                                <Field label="Requested on">
                                    {fmtDate(response.created_at)},{" "}
                                    {fmtTime(response.created_at)}
                                </Field>
                            </dl>
                        </Card>
                    )}
                </div>
            </div>

            {/* Image viewer */}
            <AnimatePresence>
                {lightbox && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setLightbox(null)}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
                    >
                        <button
                            aria-label="Close image"
                            className="absolute right-4 top-4 rounded-full bg-white/10 p-3 text-white hover:bg-white/20"
                            onClick={() => setLightbox(null)}
                        >
                            <FaTimes />
                        </button>
                        <motion.figure
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            transition={spring}
                            onClick={(e) => e.stopPropagation()}
                            className="max-h-full max-w-3xl"
                        >
                            <SafeImage
                                src={lightbox.file_url}
                                alt={lightbox.remarks || "Evidence"}
                                className="min-h-40 min-w-64 max-h-[80vh] rounded-lg object-contain"
                            />
                            {lightbox.remarks && (
                                <figcaption className="mt-2 text-center text-sm text-white">
                                    {lightbox.remarks}
                                </figcaption>
                            )}
                        </motion.figure>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default ReportDetails;
