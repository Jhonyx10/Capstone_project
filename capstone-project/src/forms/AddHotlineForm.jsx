import useAppState from "../store/useAppState";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { postHotline } from "../functions/HotlineApi";
import SuccessAlert from "../components/alerts/SuccessAlert";

const AddHotlineForm = ({ onClose }) => {
    const queryClient = useQueryClient();
    const { token, base_url, darkMode } = useAppState();
    const [isAlertMessageOpen, setIsAlertMessageOpen] = useState(false);

    const [form, setForm] = useState({
        department_name: "",
        hotline_number: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const mutation = useMutation({
        mutationFn: () => postHotline({ base_url, token, form }),
        onSuccess: () => {
             queryClient.invalidateQueries(["hotlines"]);
             setIsAlertMessageOpen(true);
             setTimeout(() => {
                 setIsAlertMessageOpen(false);
                 onClose();
             }, 3000);
        },
        onError: (error) => {
            console.error("Error adding hotline:", error);
            alert("Failed to add hotline. Please try again.");
        },
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate();
    };

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
    };

    const modalVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 50 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: { duration: 0.4, ease: "easeOut" },
        },
        exit: {
            opacity: 0,
            scale: 0.9,
            y: 50,
            transition: { duration: 0.3, ease: "easeIn" },
        },
    };

    return (
        <AnimatePresence>
            <motion.div
                className={`fixed inset-0 bg-opacity-50 flex items-center justify-center z-50 ${
                    darkMode ? "bg-white/40" : "bg-black/40"
                }`}
                variants={overlayVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
            >
                <motion.div
                    className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-md p-6 relative"
                    variants={modalVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                >
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-2xl hover:cursor-pointer"
                    >
                        ×
                    </button>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">
                        Add Hotline Number
                    </h2>

                    {/* Form */}
                    <motion.form
                        onSubmit={handleSubmit}
                        className="space-y-4"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2, duration: 0.4 }}
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Authority Name
                            </label>
                            <input
                                type="text"
                                name="department_name"
                                value={form.department_name}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Police Department"
                                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 shadow-sm p-2 text-gray-800 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Hotline Number
                            </label>
                            <input
                                type="text"
                                name="hotline_number"
                                value={form.hotline_number}
                                onChange={handleChange}
                                required
                                placeholder="e.g., 911 or (02) 8722-0650"
                                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 shadow-sm p-2 text-gray-800 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>

                        {/* Submit Button */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={mutation.isLoading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow transition duration-300 disabled:opacity-50 hover:cursor-pointer"
                        >
                            {mutation.isLoading
                                ? "Adding Hotline..."
                                : "Add Hotline"}
                        </motion.button>
                    </motion.form>
                </motion.div>
            </motion.div>
            {isAlertMessageOpen && <SuccessAlert />}
        </AnimatePresence>
    );
};

export default AddHotlineForm;
