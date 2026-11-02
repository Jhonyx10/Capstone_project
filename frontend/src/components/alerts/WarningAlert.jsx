import { motion } from "framer-motion";
import { IoAlertCircle, IoCloseOutline } from "react-icons/io5";

// Error toast. Same props as before (onClose); title/message are optional.
const WarningAlert = ({
    onClose,
    title = "Outside jurisdiction",
    message = "This incident is outside the barangay's jurisdiction.",
}) => {
    return (
        <motion.div
            role="alert"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative flex w-[320px] flex-shrink-0 items-start gap-3 rounded-xl border border-gray-200 border-l-4 border-l-red-500 bg-white p-4 pr-10 shadow-lg dark:border-slate-700 dark:border-l-red-500 dark:bg-slate-800"
        >
            <IoAlertCircle
                className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
                aria-hidden="true"
            />
            <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                    {title}
                </p>
                <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-300">
                    {message}
                </p>
            </div>

            <button
                type="button"
                onClick={onClose}
                aria-label="Dismiss"
                className="absolute right-2 top-2 rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 dark:hover:bg-slate-700 dark:hover:text-gray-200 cursor-pointer"
            >
                <IoCloseOutline className="h-4 w-4" />
            </button>
        </motion.div>
    );
};

export default WarningAlert;
