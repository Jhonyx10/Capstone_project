import { useEffect, useRef } from "react";
import { motion } from "framer-motion";

const ConfirmDialog = ({
    title,
    message,
    confirmLabel = "Confirm",
    danger = false,
    loading = false,
    onConfirm,
    onCancel,
}) => {
    const onCancelRef = useRef(onCancel);
    onCancelRef.current = onCancel;

    useEffect(() => {
        const onKeyDown = (e) => e.key === "Escape" && onCancelRef.current();
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
        >
            <motion.div
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="confirm-title"
                className="w-full max-w-sm rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
            >
                <h2
                    id="confirm-title"
                    className="text-lg font-semibold text-gray-900 dark:text-white"
                >
                    {title}
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {message}
                </p>

                <div className="mt-6 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow-sm focus:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer ${
                            danger
                                ? "bg-red-600 hover:bg-red-500 focus-visible:ring-red-400"
                                : "bg-green-600 hover:bg-green-500 focus-visible:ring-green-400"
                        }`}
                    >
                        {loading ? "Working…" : confirmLabel}
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default ConfirmDialog;
