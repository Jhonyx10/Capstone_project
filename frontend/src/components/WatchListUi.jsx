import { IoPersonOutline, IoCarSportOutline } from "react-icons/io5";

export const TypeIcon = ({ type, className }) =>
    type === "vehicle" ? (
        <IoCarSportOutline className={className} aria-hidden="true" />
    ) : (
        <IoPersonOutline className={className} aria-hidden="true" />
    );

export const TypeBadge = ({ type }) => (
    <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium capitalize text-blue-600 dark:text-blue-400">
        <TypeIcon type={type} className="h-3.5 w-3.5" />
        {type}
    </span>
);

export const StatusBadge = ({ status, deleted }) => {
    const s = deleted
        ? {
              label: "Deleted",
              cls: "bg-red-500/10 text-red-600 dark:text-red-400",
          }
        : status === "active"
        ? {
              label: "Active",
              cls: "bg-green-600/15 text-green-700 dark:text-green-400",
          }
        : {
              label: "Inactive",
              cls: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
          };

    return (
        <span
            className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${s.cls}`}
        >
            {s.label}
        </span>
    );
};

// Photo, or a placeholder icon when there isn't one
export const Thumb = ({ src, type, alt = "", className = "h-10 w-10" }) =>
    src ? (
        <img
            src={src}
            alt={alt}
            className={`${className} shrink-0 rounded-lg object-cover`}
        />
    ) : (
        <div
            aria-hidden="true"
            className={`${className} flex shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 dark:bg-gray-800`}
        >
            <TypeIcon type={type} className="h-1/2 w-1/2" />
        </div>
    );

export const formatDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
        ? "—"
        : d.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
          });
};

export const formatDateTime = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return Number.isNaN(d.getTime())
        ? "—"
        : d.toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
          });
};

export const card =
    "rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900";
