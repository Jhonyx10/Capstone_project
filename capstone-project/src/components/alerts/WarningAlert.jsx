import { motion } from "framer-motion";

const WarningAlert = ({onClose}) => {

    return (
        <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="w-[320px] bg-white dark:bg-slate-800 p-4 border-l rounded-lg border-gray-200 dark:border-slate-700 shadow-lg relative flex-shrink-0"
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute right-2 top-2 text-gray-500 hover:text-red-500 transition"
            >
                ✕
            </button>
            <div className="mt-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 underline mb-1">
                    The Incident Is Outside the Jurisdiction.
                </p>
            </div>
        </motion.div>
    );
};

export default WarningAlert;
