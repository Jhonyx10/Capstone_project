import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
    IoCloseOutline,
    IoPersonOutline,
    IoMailOutline,
    IoLockClosedOutline,
    IoEyeOutline,
    IoEyeOffOutline,
    IoAlertCircleOutline,
} from "react-icons/io5";
import useAppState from "../store/useAppState";
import { createTanodAccount } from "../functions/UsersApi";

const emptyForm = { name: "", email: "", password: "", role: "tanod" };

const inputClass =
    "w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2.5 pl-10 pr-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500";

const Field = ({ id, label, icon: Icon, hint, children }) => (
    <div>
        <label
            htmlFor={id}
            className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
            {label}
        </label>
        <div className="relative">
            <Icon
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                aria-hidden="true"
            />
            {children}
        </div>
        {hint && (
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                {hint}
            </p>
        )}
    </div>
);

const CreateTanodAccount = ({ onClose }) => {
    const queryClient = useQueryClient();
    const { token, base_url } = useAppState();
    const [accountForm, setAccountForm] = useState(emptyForm);
    const [showPassword, setShowPassword] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const firstFieldRef = useRef(null);

    // Focus the first field and allow Escape to close
    // Keep the latest onClose without re-running the effect below
    const onCloseRef = useRef(onClose);
    onCloseRef.current = onClose;

    useEffect(() => {
        firstFieldRef.current?.focus();
        const onKeyDown = (e) => e.key === "Escape" && onCloseRef.current();
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setErrorMessage("");
        setAccountForm((prev) => ({ ...prev, [name]: value }));
    };

    const accountMutation = useMutation({
        mutationFn: () => createTanodAccount({ base_url, token, accountForm }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["volunteers"] });
            setAccountForm(emptyForm);
            onClose();
        },
        onError: (error) => {
            setErrorMessage(
                error?.message ||
                    "Could not create the account. Please try again."
            );
        },
    });

    const isSubmitting = accountMutation.isPending || accountMutation.isLoading;

    const handleSubmit = (e) => {
        e.preventDefault();
        accountMutation.mutate();
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
                aria-labelledby="create-tanod-title"
                className="relative w-full max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl"
                initial={{ opacity: 0, y: 24, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 dark:border-gray-800 px-6 py-5">
                    <div>
                        <h2
                            id="create-tanod-title"
                            className="text-lg font-semibold text-gray-900 dark:text-white"
                        >
                            New tanod account
                        </h2>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            The volunteer will use these details to sign in.
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
                    <Field
                        id="name"
                        label="Call sign"
                        icon={IoPersonOutline}
                        hint="Shown on the volunteer's card, e.g. R35."
                    >
                        <input
                            ref={firstFieldRef}
                            id="name"
                            type="text"
                            name="name"
                            value={accountForm.name}
                            onChange={handleChange}
                            placeholder="Enter call sign"
                            autoComplete="off"
                            required
                            className={inputClass}
                        />
                    </Field>

                    <Field
                        id="email"
                        label="Email or mobile number"
                        icon={IoMailOutline}
                    >
                        <input
                            id="email"
                            type="email"
                            name="email"
                            value={accountForm.email}
                            onChange={handleChange}
                            placeholder="name@example.com"
                            autoComplete="off"
                            required
                            className={inputClass}
                        />
                    </Field>

                    <Field
                        id="password"
                        label="Password"
                        icon={IoLockClosedOutline}
                    >
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={accountForm.password}
                            onChange={handleChange}
                            placeholder="Create a password"
                            autoComplete="new-password"
                            required
                            className={`${inputClass} pr-11`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword((s) => !s)}
                            aria-label={
                                showPassword ? "Hide password" : "Show password"
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 cursor-pointer"
                        >
                            {showPassword ? (
                                <IoEyeOffOutline className="h-4 w-4" />
                            ) : (
                                <IoEyeOutline className="h-4 w-4" />
                            )}
                        </button>
                    </Field>

                    {errorMessage && (
                        <div
                            role="alert"
                            className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
                        >
                            <IoAlertCircleOutline className="mt-0.5 h-4 w-4 shrink-0" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                        Role: <span className="font-medium">Tanod</span>
                    </p>

                    {/* Actions */}
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
                            disabled={isSubmitting}
                            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 disabled:cursor-not-allowed disabled:opacity-60 transition cursor-pointer"
                        >
                            {isSubmitting ? "Creating…" : "Create account"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default CreateTanodAccount;
