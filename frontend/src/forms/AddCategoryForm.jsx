import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    IoCloseOutline,
    IoGridOutline,
    IoAlertCircleOutline,
} from "react-icons/io5";
import useAppState from "../store/useAppState";
import { addCategory } from "../functions/CategoryApi";
import { toast } from "../store/useToast";

const AddCategoryForm = ({ onClose }) => {
    const queryClient = useQueryClient();
    const { token, base_url } = useAppState();
    const [categoryName, setCategoryName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const inputRef = useRef(null);

    // Keep the latest onClose without re-running the effect below
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        inputRef.current?.focus();
        const onKeyDown = (e) => e.key === "Escape" && onCloseRef.current();
        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    const mutation = useMutation({
        mutationFn: () => addCategory({ base_url, token, categoryName }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] });
            toast.success("Category added");
            onClose();
        },
        onError: (error) => {
            console.error(
                "Mutation error:",
                error?.response?.data || error?.message
            );
            setErrorMessage(
                error?.response?.data?.message ||
                    "Could not add the category. Please try again."
            );
        },
    });

    const isSubmitting = mutation.isPending || mutation.isLoading;
    const canSubmit = categoryName.trim() && !isSubmitting;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setErrorMessage("");
        mutation.mutate();
    };

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
            <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-category-title"
                className="relative w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 px-6 py-5">
                    <div>
                        <h2
                            id="add-category-title"
                            className="text-lg font-semibold text-gray-900 dark:text-white"
                        >
                            Add incident category
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Categories group related incident types, like
                            Traffic or Noise.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 cursor-pointer"
                    >
                        <IoCloseOutline className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
                    <div>
                        <label
                            htmlFor="category_name"
                            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
                            Category name
                        </label>
                        <div className="relative">
                            <IoGridOutline
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                                aria-hidden="true"
                            />
                            <input
                                ref={inputRef}
                                id="category_name"
                                type="text"
                                name="category_name"
                                value={categoryName}
                                onChange={(e) => {
                                    setErrorMessage("");
                                    setCategoryName(e.target.value);
                                }}
                                placeholder="Enter category name"
                                autoComplete="off"
                                required
                                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 pl-10 pr-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-60"
                            />
                        </div>
                    </div>

                    {errorMessage && (
                        <div
                            role="alert"
                            className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
                        >
                            <IoAlertCircleOutline className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <div className="flex justify-end gap-3 pt-1">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-gray-300 dark:border-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!canSubmit}
                            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 disabled:cursor-not-allowed disabled:opacity-50 transition cursor-pointer"
                        >
                            {isSubmitting ? "Adding…" : "Add category"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default AddCategoryForm;
