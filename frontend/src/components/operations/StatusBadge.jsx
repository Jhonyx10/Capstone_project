export const OPERATION_STATUSES = [
    "upcoming",
    "active",
    "completed",
    "suspended",
];

const STYLES = {
    upcoming:
        "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    active: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
    completed:
        "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
    suspended:
        "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

const StatusBadge = ({ status }) => (
    <span
        className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${
            STYLES[status] ?? STYLES.completed
        }`}
    >
        {status}
    </span>
);

export default StatusBadge;
