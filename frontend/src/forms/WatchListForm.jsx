import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    IoCloseOutline,
    IoAlertCircleOutline,
    IoImageOutline,
} from "react-icons/io5";
import useAppState from "../store/useAppState";
import { toast } from "../store/useToast";
import { createWatchList, updateWatchList } from "../functions/WatchListApi";
import { TypeIcon } from "../components/WatchListUi";

const MAX_IMAGE_MB = 4;

const fieldClass =
    "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500";

const Label = ({ htmlFor, children }) => (
    <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
    >
        {children}
    </label>
);

const FieldError = ({ message }) =>
    message ? <p className="mt-1.5 text-xs text-red-500">{message}</p> : null;

// Used for both adding (no `entry`) and editing (pass `entry`).
const WatchListForm = ({ entry = null, onClose }) => {
    const queryClient = useQueryClient();
    const base_url = useAppState((s) => s.base_url);
    const token = useAppState((s) => s.token);
    const isEdit = Boolean(entry);

    const [form, setForm] = useState({
        type: entry?.type ?? "person",
        identifier: entry?.identifier ?? "",
        details: entry?.details ?? "",
        reason: entry?.reason ?? "",
        status: entry?.status ?? "active",
    });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(entry?.image_url ?? null);
    const [errors, setErrors] = useState({});
    const [errorMessage, setErrorMessage] = useState("");
    const firstFieldRef = useRef(null);

    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        firstFieldRef.current?.focus();
        const onKeyDown = (e) => e.key === "Escape" && onCloseRef.current();
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    useEffect(() => {
        if (!image) return;
        const url = URL.createObjectURL(image);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [image]);

    const update = (field, value) => {
        setErrorMessage("");
        setErrors((e) => ({ ...e, [field]: undefined }));
        setForm((f) => ({ ...f, [field]: value }));
    };

    const pickImage = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
            setErrors((er) => ({
                ...er,
                image: "Use a JPG, PNG, or WebP image.",
            }));
            return;
        }
        if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
            setErrors((er) => ({
                ...er,
                image: `Image must be under ${MAX_IMAGE_MB} MB.`,
            }));
            return;
        }
        setErrors((er) => ({ ...er, image: undefined }));
        setImage(file);
    };

    const mutation = useMutation({
        mutationFn: () => {
            const payload = { ...form, image };
            return isEdit
                ? updateWatchList({
                      base_url,
                      token,
                      id: entry.id,
                      form: payload,
                  })
                : createWatchList({ base_url, token, form: payload });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["watch-lists"] });
            toast.success(
                isEdit ? "Watch list entry updated" : "Watch list entry added"
            );
            onClose();
        },
        onError: (error) => {
            const data = error?.response?.data;
            if (data?.errors) {
                setErrors(
                    Object.fromEntries(
                        Object.entries(data.errors).map(([k, v]) => [k, v[0]])
                    )
                );
            }
            setErrorMessage(
                data?.message || "Could not save the entry. Please try again."
            );
        },
    });

    const isSubmitting = mutation.isPending || mutation.isLoading;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!isEdit && !image) {
            setErrors((er) => ({ ...er, image: "Please add a photo." }));
            return;
        }
        setErrors({});
        setErrorMessage("");
        mutation.mutate();
    };

    const isVehicle = form.type === "vehicle";

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
                aria-labelledby="watchlist-form-title"
                className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-900"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5 dark:border-gray-800">
                    <div>
                        <h2
                            id="watchlist-form-title"
                            className="text-lg font-semibold text-gray-900 dark:text-white"
                        >
                            {isEdit
                                ? "Edit watch list entry"
                                : "Add watch list entry"}
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Residents and tanods will be able to report
                            sightings of active entries.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:hover:bg-gray-800 dark:hover:text-gray-200 cursor-pointer"
                    >
                        <IoCloseOutline className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form
                    onSubmit={handleSubmit}
                    className="space-y-4 overflow-y-auto px-6 py-5"
                >
                    {/* Type */}
                    <div>
                        <Label>Type</Label>
                        <div
                            className="grid grid-cols-2 gap-2"
                            role="group"
                            aria-label="Type"
                        >
                            {["person", "vehicle"].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => update("type", t)}
                                    aria-pressed={form.type === t}
                                    className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium capitalize transition cursor-pointer ${
                                        form.type === t
                                            ? "border-green-600 bg-green-600/10 text-green-700 dark:text-green-400"
                                            : "border-gray-300 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                                    }`}
                                >
                                    <TypeIcon type={t} className="h-4 w-4" />
                                    {t}
                                </button>
                            ))}
                        </div>
                        <FieldError message={errors.type} />
                    </div>

                    <div>
                        <Label htmlFor="identifier">
                            {isVehicle ? "Plate number" : "Name or alias"}
                        </Label>
                        <input
                            ref={firstFieldRef}
                            id="identifier"
                            type="text"
                            value={form.identifier}
                            onChange={(e) =>
                                update("identifier", e.target.value)
                            }
                            placeholder={
                                isVehicle
                                    ? "e.g., ABC 1234"
                                    : "e.g., Juan Dela Cruz"
                            }
                            autoComplete="off"
                            required
                            className={fieldClass}
                        />
                        <FieldError message={errors.identifier} />
                    </div>

                    <div>
                        <Label htmlFor="details">Description</Label>
                        <textarea
                            id="details"
                            rows={3}
                            value={form.details}
                            onChange={(e) => update("details", e.target.value)}
                            placeholder={
                                isVehicle
                                    ? "Make, model, color, distinguishing marks"
                                    : "Height, build, clothing, distinguishing marks"
                            }
                            required
                            className={fieldClass}
                        />
                        <FieldError message={errors.details} />
                    </div>

                    <div>
                        <Label htmlFor="reason">Reason for watch</Label>
                        <textarea
                            id="reason"
                            rows={2}
                            value={form.reason}
                            onChange={(e) => update("reason", e.target.value)}
                            placeholder="Why is this entry on the watch list?"
                            required
                            className={fieldClass}
                        />
                        <FieldError message={errors.reason} />
                    </div>

                    {/* Photo */}
                    <div>
                        <Label htmlFor="image">Photo</Label>
                        <div className="flex items-center gap-4">
                            {preview ? (
                                <img
                                    src={preview}
                                    alt="Preview"
                                    className="h-20 w-20 shrink-0 rounded-lg object-cover"
                                />
                            ) : (
                                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400 dark:bg-gray-800">
                                    <IoImageOutline className="h-7 w-7" />
                                </div>
                            )}
                            <div className="min-w-0">
                                <label
                                    htmlFor="image"
                                    className="inline-block rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus-within:ring-2 focus-within:ring-green-500 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                                >
                                    {preview ? "Change photo" : "Choose photo"}
                                    <input
                                        id="image"
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={pickImage}
                                        className="sr-only"
                                    />
                                </label>
                                <p className="mt-1.5 truncate text-xs text-gray-500 dark:text-gray-400">
                                    {image
                                        ? image.name
                                        : `JPG, PNG, or WebP, up to ${MAX_IMAGE_MB} MB.`}
                                </p>
                            </div>
                        </div>
                        <FieldError message={errors.image} />
                    </div>

                    {isEdit && (
                        <div>
                            <Label htmlFor="status">Status</Label>
                            <select
                                id="status"
                                value={form.status}
                                onChange={(e) =>
                                    update("status", e.target.value)
                                }
                                className={`${fieldClass} cursor-pointer`}
                            >
                                <option value="active">
                                    Active, sightings can be reported
                                </option>
                                <option value="inactive">
                                    Inactive, hidden from residents
                                </option>
                            </select>
                            <FieldError message={errors.status} />
                        </div>
                    )}

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
                            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                        >
                            {isSubmitting
                                ? "Saving…"
                                : isEdit
                                ? "Save changes"
                                : "Add entry"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default WatchListForm;
