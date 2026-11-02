import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    IoCloseOutline,
    IoBusinessOutline,
    IoCallOutline,
    IoAlertCircleOutline,
} from "react-icons/io5";
import useAppState from "../store/useAppState";
import { updateHotline } from "../functions/HotlineApi";
import { toast } from "../store/useToast";

const inputClass =
    "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 pl-10 pr-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-60";

const UpdateHotlineForm = ({ id, onClose }) => {
    const queryClient = useQueryClient();
    const { token, base_url } = useAppState();

    // Read the current values from the cache on first render so the
    // fields are never shown empty.
    const [original] = useState(() => {
        const found = queryClient
            .getQueryData(["hotlines"])
            ?.find((h) => h.id === id);
        return {
            department_name: found?.department_name ?? "",
            hotline_number: found?.hotline_number ?? "",
        };
    });
    const [form, setForm] = useState(original);
    const [errorMessage, setErrorMessage] = useState("");
    const firstFieldRef = useRef(null);

    // Keep the latest onClose without re-running the effect below
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        firstFieldRef.current?.focus();
        const onKeyDown = (e) => e.key === "Escape" && onCloseRef.current();
        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setErrorMessage("");
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const mutation = useMutation({
        mutationFn: () => updateHotline({ base_url, token, id, form }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["hotlines"] });
            toast.success("Hotline updated");
            onClose();
        },
        onError: (error) => {
            console.error("Error updating hotline:", error);
            setErrorMessage(
                error?.response?.data?.message ||
                    "Could not update the hotline. Please try again."
            );
        },
    });

    const isSubmitting = mutation.isPending || mutation.isLoading;
    const hasChanges =
        form.department_name !== original.department_name ||
        form.hotline_number !== original.hotline_number;
    const canSubmit =
        form.department_name.trim() &&
        form.hotline_number.trim() &&
        hasChanges &&
        !isSubmitting;

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
                aria-labelledby="update-hotline-title"
                className="relative w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 px-6 py-5">
                    <div className="min-w-0">
                        <h2
                            id="update-hotline-title"
                            className="text-lg font-semibold text-gray-900 dark:text-white"
                        >
                            Edit hotline
                        </h2>
                        <p className="mt-1 truncate text-sm text-gray-500 dark:text-gray-400">
                            {original.department_name
                                ? `Editing ${original.department_name}`
                                : "Update the authority name or number."}
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
                            htmlFor="department_name"
                            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
                            Authority name
                        </label>
                        <div className="relative">
                            <IoBusinessOutline
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                                aria-hidden="true"
                            />
                            <input
                                ref={firstFieldRef}
                                id="department_name"
                                type="text"
                                name="department_name"
                                value={form.department_name}
                                onChange={handleChange}
                                placeholder="e.g., Police Department"
                                autoComplete="off"
                                required
                                className={inputClass}
                            />
                        </div>
                    </div>

                    <div>
                        <label
                            htmlFor="hotline_number"
                            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
                        >
                            Hotline number
                        </label>
                        <div className="relative">
                            <IoCallOutline
                                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                                aria-hidden="true"
                            />
                            <input
                                id="hotline_number"
                                type="tel"
                                inputMode="tel"
                                name="hotline_number"
                                value={form.hotline_number}
                                onChange={handleChange}
                                placeholder="e.g., 911 or (02) 8722-0650"
                                autoComplete="off"
                                required
                                className={inputClass}
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
                            {isSubmitting ? "Saving…" : "Save changes"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default UpdateHotlineForm;
