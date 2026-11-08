import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
    IoAlertCircle,
    IoDocumentText,
    IoPersonAdd,
    IoEye,
    IoClose,
} from "react-icons/io5";
import useVolunteers from "../hooks/useVolunteers";
import useAppState from "../store/useAppState";

// Where "View" goes for a sighting. Change this to your real page.


// Full class strings so Tailwind can see them
const STYLES = {
    request: {
        Icon: IoAlertCircle,
        tag: "Emergency",
        bar: "bg-red-500",
        icon: "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
        btn: "bg-red-600 hover:bg-red-700",
    },
    report: {
        Icon: IoDocumentText,
        tag: "New report",
        bar: "bg-emerald-500",
        icon: "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
        btn: "bg-emerald-600 hover:bg-emerald-700",
    },
    violator: {
        Icon: IoPersonAdd,
        tag: "New violator",
        bar: "bg-amber-500",
        icon: "bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400",
        btn: "bg-amber-600 hover:bg-amber-700",
    },
    sighting: {
        Icon: IoEye,
        tag: "New sighting",
        bar: "bg-sky-500",
        icon: "bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400",
        btn: "bg-sky-600 hover:bg-sky-700",
    },
};

const fullName = (p) =>
    [p?.first_name, p?.last_name].filter(Boolean).join(" ") ||
    p?.name ||
    "Unknown";

const findKey = (obj, key) => {
    if (!obj || typeof obj !== "object") return undefined;
    if (obj[key] !== undefined) return obj[key];
    for (const value of Object.values(obj)) {
        const found = findKey(value, key);
        if (found !== undefined) return found;
    }
    return undefined;
};

// Turns a toast into the title, detail rows and destination for its kind
const describe = (toast, { categories, volunteers }) => {
    const { kind, data } = toast;

    switch (kind) {
        case "request": {
            const category = categories.find((c) => c.id === data?.category_id);
            return {
                title: "Emergency request",
                rows: [["Category", category?.category_name ?? "Unknown"]],
                to: "/incident-request",
                cta: "View location",
            };
        }
        case "violator": {
            const v = data?.violator;
            return {
                title: fullName(v),
                rows: [
                    ["Age", v?.age],
                    ["Address", v?.address],
                ],
                to: `/violators-details/${v?.id}`,
                cta: "View profile",
            };
        }
        case "sighting": {
            const subject = findKey(data, "subject");
            const reporter = findKey(data, "reporter");
            const watchListId = findKey(data, "subject_id") ?? subject?.id;

            return {
                title: subject?.identifier ?? fullName(subject),
                rows: [
                    ["Reported by", reporter?.name ?? "Anonymous"],
                    ["Location", findKey(data, "location")],
                ],
                // never navigate to /undefined: fall back to the list
                to: watchListId
                    ? `/watch-list-details/${watchListId}`
                    : "/watchlists",
                cta: "View sighting",
            };
        }
        default: {
            const r = data?.report;
            const by = volunteers.find(
                (u) => Number(u.id) === Number(r?.user_id)
            );
            return {
                title: "Incident report filed",
                rows: [["Submitted by", by?.name ?? "Anonymous"]],
                to: `/report-details/${r?.id}`,
                cta: "View report",
            };
        }
    }
};

const Notification = ({ toast, onClose, duration = 7000 }) => {
    const categories = useAppState((s) => s.categories) ?? [];
    const navigate = useNavigate();
    const { data: volunteers = [] } = useVolunteers();

    // Restarts whenever a new toast arrives (each has a unique id)
    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [toast, duration, onClose]);

    const view = toast ? describe(toast, { categories, volunteers }) : null;
    const style = STYLES[toast?.kind] ?? STYLES.report;
    const { Icon } = style;

    return (
        <AnimatePresence>
            {toast && view && (
                <motion.div
                    key={toast.id}
                    role="status"
                    initial={{ x: "110%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: "110%", opacity: 0 }}
                    transition={{ type: "spring", stiffness: 160, damping: 22 }}
                    className="fixed right-5 top-20 z-[60] w-[22rem] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900"
                >
                    <div className="flex gap-3 p-4">
                        <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${style.icon}`}
                        >
                            <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                                {style.tag}
                            </p>
                            <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                                {view.title}
                            </p>

                            <dl className="mt-1 space-y-0.5 text-xs text-slate-500 dark:text-slate-400">
                                {view.rows
                                    .filter(([, value]) => value)
                                    .map(([label, value]) => (
                                        <div key={label} className="flex gap-1">
                                            <dt className="shrink-0">
                                                {label}:
                                            </dt>
                                            <dd className="truncate text-slate-700 dark:text-slate-300">
                                                {value}
                                            </dd>
                                        </div>
                                    ))}
                            </dl>

                            <button
                                onClick={() => {
                                    onClose();
                                    navigate(view.to);
                                }}
                                className={`mt-3 rounded-md px-3 py-1.5 text-xs font-medium text-white transition ${style.btn}`}
                            >
                                {view.cta}
                            </button>
                        </div>

                        <button
                            onClick={onClose}
                            aria-label="Dismiss"
                            className="-mr-1 -mt-1 h-7 w-7 shrink-0 rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        >
                            <IoClose className="mx-auto h-4 w-4" />
                        </button>
                    </div>

                    {/* auto-dismiss countdown */}
                    <motion.div
                        initial={{ scaleX: 1 }}
                        animate={{ scaleX: 0 }}
                        transition={{
                            duration: duration / 1000,
                            ease: "linear",
                        }}
                        style={{ transformOrigin: "left" }}
                        className={`h-1 ${style.bar}`}
                    />
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default Notification;
