import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import axios from "axios";
import {
    IoCloseOutline,
    IoLockClosedOutline,
    IoEyeOutline,
    IoEyeOffOutline,
    IoAlertCircleOutline,
} from "react-icons/io5";
import useAppState from "../../store/useAppState";
import { toast } from "../../store/useToast";

const inputClass =
    "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 pl-10 pr-11 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:opacity-60";

const PasswordField = ({
    id,
    label,
    value,
    onChange,
    inputRef,
    disabled,
    invalid,
}) => {
    const [visible, setVisible] = useState(false);

    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
            >
                {label}
            </label>
            <div className="relative">
                <IoLockClosedOutline
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                    aria-hidden="true"
                />
                <input
                    ref={inputRef}
                    id={id}
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    autoComplete="new-password"
                    required
                    disabled={disabled}
                    aria-invalid={invalid || undefined}
                    className={`${inputClass} ${
                        invalid
                            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                            : ""
                    }`}
                />
                <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    aria-label={
                        visible
                            ? `Hide ${label.toLowerCase()}`
                            : `Show ${label.toLowerCase()}`
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 cursor-pointer"
                >
                    {visible ? (
                        <IoEyeOffOutline className="h-4 w-4" />
                    ) : (
                        <IoEyeOutline className="h-4 w-4" />
                    )}
                </button>
            </div>
        </div>
    );
};

const UpdateTanod = ({ data, tanodId, onClose }) => {
    const { base_url, token } = useAppState();
    const queryClient = useQueryClient();

    const tanod = data.find((user) => user.id === tanodId);
    const profile = tanod?.profile;
    const fullName = `${profile?.first_name ?? ""} ${
        profile?.last_name ?? ""
    }`.trim();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const firstFieldRef = useRef(null);

    // Only flag a mismatch once the person has started confirming
    const mismatch = confirmPassword.length > 0 && password !== confirmPassword;

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

    const { mutate, isPending, isLoading } = useMutation({
        mutationFn: () =>
            axios.put(
                `${base_url}users/${tanodId}`,
                { password },
                { headers: { Authorization: `Bearer ${token}` } }
            ),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["volunteers"] });
            toast.success("Password updated");
            onClose();
        },
        onError: (error) => {
            console.error("Password update failed:", error);
            setErrorMessage(
                error?.response?.data?.message ||
                    "Could not update the password. Please try again."
            );
        },
    });

    const isSubmitting = isPending || isLoading;
    const canSubmit = password && confirmPassword && !mismatch && !isSubmitting;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!canSubmit) return;
        setErrorMessage("");
        mutate();
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
                aria-labelledby="update-tanod-title"
                className="relative w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 px-6 py-5">
                    <div className="flex items-center gap-3 min-w-0">
                        <div
                            aria-hidden="true"
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-600/15 text-base font-semibold text-green-600 dark:text-green-400"
                        >
                            {(fullName || tanod?.name || "?")[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <h2
                                id="update-tanod-title"
                                className="text-lg font-semibold text-gray-900 dark:text-white"
                            >
                                Change password
                            </h2>
                            <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                                {fullName || tanod?.name}
                                {fullName && tanod?.name
                                    ? ` · ${tanod.name}`
                                    : ""}
                            </p>
                        </div>
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
                    <PasswordField
                        id="new-password"
                        label="New password"
                        value={password}
                        inputRef={firstFieldRef}
                        onChange={(e) => {
                            setErrorMessage("");
                            setPassword(e.target.value);
                        }}
                    />

                    <div>
                        <PasswordField
                            id="confirm-password"
                            label="Confirm password"
                            value={confirmPassword}
                            invalid={mismatch}
                            onChange={(e) => {
                                setErrorMessage("");
                                setConfirmPassword(e.target.value);
                            }}
                        />
                        {mismatch && (
                            <p
                                role="alert"
                                className="mt-1.5 text-xs text-red-500"
                            >
                                Passwords don’t match yet.
                            </p>
                        )}
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
                            {isSubmitting ? "Updating…" : "Update password"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default UpdateTanod;
