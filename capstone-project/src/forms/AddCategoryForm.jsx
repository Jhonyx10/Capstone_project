import useAppState from "../store/useAppState";
import { useState } from "react";
import { addCategory } from "../functions/CategoryApi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

const AddCategoryForm = ({ onClose }) => {
    const queryClient = useQueryClient();

    const { token, base_url } = useAppState();
    const [categoryName, setCategoryName] = useState("");

    const overlayVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { duration: 0.3 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
    };

    const mutation = useMutation({
        mutationFn: () => addCategory({base_url, token, categoryName}),
        onSuccess: () => {
            alert("suck-cess!!");
            setCategoryName("")
            queryClient.invalidateQueries(["categories"]);
            onClose();
        },
        onError: () => {
             console.error(
                 "Mutation error:",
                 error.response?.data || error.message
             );
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate();
    }

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
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
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
                        Add Incident Category
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
                                Incident Category
                            </label>
                            <input
                                type="text"
                                name="category_name"
                                value={categoryName}
                                onChange={(e) => setCategoryName(e.target.value)}
                                required
                                className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-700 shadow-sm p-2 text-gray-800 dark:text-white bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={mutation.isLoading}
                            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-md shadow transition duration-300 disabled:opacity-50 hover:cursor-pointer"
                        >
                            {mutation.isLoading
                                ? "Adding Category..."
                                : "Add Category"}
                        </motion.button>
                    </motion.form>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default AddCategoryForm;
