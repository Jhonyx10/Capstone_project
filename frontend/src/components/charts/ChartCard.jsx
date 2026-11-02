import { motion } from "framer-motion";

const ChartCard = ({
    title,
    subtitle,
    isLoading,
    empty,
    height = "h-72",
    className = "",
    children,
}) => (
    <motion.section
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 20, delay: 0.1 }}
        whileHover={{ scale: 1.02 }}
        className={`rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 ${className}`}
    >
        <header className="mb-4">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {title}
            </h3>
            {subtitle && (
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    {subtitle}
                </p>
            )}
        </header>
        <div className={`relative ${height}`}>
            {isLoading ? (
                <div className="h-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
            ) : empty ? (
                <div className="flex h-full items-center justify-center text-sm text-slate-400">
                    No data recorded yet
                </div>
            ) : (
                children
            )}
        </div>
    </motion.section>
);

export default ChartCard;
