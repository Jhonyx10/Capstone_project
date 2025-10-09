import useAppState from "../../store/useAppState";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import SuccessAlert from "../alerts/SuccessAlert";
import axios from "axios";

const UpdateTanod = ({ data, tanodId, onClose }) => {
    const { base_url, token, darkMode } = useAppState();
    const queryClient = useQueryClient();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isAlertMessageOpen, setIsAlertMessageOpen] = useState(false);

    const tanod = data.find((user) => user.id === tanodId);

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const { mutate, isLoading, isSuccess, isError } = useMutation({
        mutationFn: async () => {
            if (password !== confirmPassword) {
                throw new Error("Passwords do not match");
            }

            await axios.put(
                `${base_url}users/${tanodId}`,
                { password },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
        },
        onSuccess: () => {
            queryClient.invalidateQueries(["volunteers"]);
            setIsAlertMessageOpen(true)
              setTimeout(() => {
                  setIsAlertMessageOpen(false);
                  onClose();
              }, 3000);
        },
        onError: (error) => {
            console.error("Password update failed:", error);
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutate();
    };

    return (
        <AnimatePresence>
            <motion.div
                className={`fixed inset-0 flex items-center justify-center z-50 ${
                    darkMode ? "bg-white/30" : "bg-black/40"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                <motion.div
                    className="bg-white dark:bg-gray-900 p-6 rounded-lg w-full max-w-md shadow-lg relative"
                    initial={{ scale: 0.9, y: 40, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 40, opacity: 0 }}
                >
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-xl text-gray-600 dark:text-gray-300 hover:text-red-500"
                    >
                        ×
                    </button>

                    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                        Change Password for {tanod?.name}
                    </h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium dark:text-white mb-1">
                                New Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="w-full px-3 py-2 pr-10 rounded border dark:bg-gray-800 dark:text-white"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                    {showPassword ? (
                                        // 👁 Eye with slash
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-5 h-5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#A9C46C"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                            <line
                                                x1="2"
                                                y1="2"
                                                x2="22"
                                                y2="22"
                                            />
                                        </svg>
                                    ) : (
                                        // 👁 Eye open
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-5 h-5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#A9C46C"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium dark:text-white mb-1">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    className="w-full px-3 py-2 pr-10 rounded border dark:bg-gray-800 dark:text-white"
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowConfirmPassword(
                                            !showConfirmPassword
                                        )
                                    }
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                                >
                                    {showConfirmPassword ? (
                                        // 👁 Eye with slash
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-5 h-5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#A9C46C"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                            <line
                                                x1="2"
                                                y1="2"
                                                x2="22"
                                                y2="22"
                                            />
                                        </svg>
                                    ) : (
                                        // 👁 Eye open
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-5 h-5"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="#A9C46C"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {isError && (
                            <p className="text-red-500 text-sm">
                                Passwords do not match or update failed.
                            </p>
                        )}

                        <div className="text-right">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="bg-green-600 text-white px-4 py-2 rounded hover:cursor-pointer hover:bg-green-500 disabled:opacity-50"
                            >
                                {isLoading ? "Updating..." : "Update Password"}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
            {isAlertMessageOpen && <SuccessAlert />}
        </AnimatePresence>
    );
};

export default UpdateTanod;
