import { motion } from "framer-motion";

// One connected panel with four cells instead of four separate cards.
const Stat = ({ label, value, detail, tone, isLoading, index }) => (
    <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
            type: "spring",
            stiffness: 200,
            damping: 20,
            delay: 0.1 + index * 0.08,
        }}
        whileHover={{ scale: 1.03 }}
        className="px-5 py-4"
    >
        <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
        {isLoading ? (
            <div className="mt-2 h-7 w-24 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
        ) : (
            <p className={`mt-1 truncate text-2xl font-semibold ${tone}`}>
                {value}
            </p>
        )}
        {!isLoading && detail && (
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                {detail}
            </p>
        )}
    </motion.div>
);

const StatStrip = ({ items, isLoading }) => (
    <div className="grid grid-cols-2 divide-slate-200 rounded-xl border border-slate-200 bg-white dark:divide-slate-800 dark:border-slate-800 dark:bg-slate-900 lg:grid-cols-4 lg:divide-x [&>*:nth-child(n+3)]:border-t [&>*:nth-child(n+3)]:border-slate-200 dark:[&>*:nth-child(n+3)]:border-slate-800 lg:[&>*:nth-child(n+3)]:border-t-0 [&>*:nth-child(even)]:border-l [&>*:nth-child(even)]:border-slate-200 dark:[&>*:nth-child(even)]:border-slate-800 lg:[&>*:nth-child(even)]:border-l-0">
        {items.map((item, index) => (
            <Stat
                key={item.label}
                index={index}
                isLoading={isLoading}
                {...item}
            />
        ))}
    </div>
);

export default StatStrip;
