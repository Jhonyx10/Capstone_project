export const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : "—");

export const STATUS_STYLE = {
    active: "bg-green-500/10 text-green-600 dark:text-green-400",
    pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    rejected: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    block: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

export const statusLabel = (s) => (s === "block" ? "Blocked" : cap(s));

export const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");
