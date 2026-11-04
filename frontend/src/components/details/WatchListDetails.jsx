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


    return (
        <motion.div>

        </motion.div>
    );
};

export default ViolatorsDetails;
