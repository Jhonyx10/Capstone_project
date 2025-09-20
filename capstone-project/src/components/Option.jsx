import { motion, AnimatePresence } from "framer-motion";

const Option = ({ Icon, title, selected, setSelected, open }) => {
    return (
        <button
            onClick={() => setSelected(title)}
            className={`flex items-center h-10 w-full rounded-md transition-colors ${
                selected === title
                    ? "bg-slate-100 dark:bg-slate-700"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
        >
            {/* Fixed Icon Box (no movement) */}
            <div className="flex h-full w-10 items-center justify-center shrink-0 text-lg">
                <Icon color="#22c55e" />
            </div>

            {/* Animate text only when open */}
            <AnimatePresence>
                {open && (
                    <motion.span
                        key="label"
                        // initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-sm  text-slate-700 dark:text-slate-200"
                    >
                        {title}
                    </motion.span>
                )}
            </AnimatePresence>
        </button>
    );
};

export default Option;
