import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../functions/CategoryApi";
import useAppState from "../store/useAppState";
import { useState } from "react";
import AddCategoryForm from "../forms/AddCategoryForm";
import AddIncidentTypeForm from "../forms/AddIncidentTypeForm";
import { IoAddCircleOutline } from "react-icons/io5";

const Categories = () => {
    const { base_url, token, darkMode } = useAppState();
    const [isOpenCategoryForm, setIsOpenCategoryForm] = useState(false);
    const [isOpenIncidentForm, setIsOpenIncidentForm] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: () => getCategories({ base_url, token }),
    });

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex flex-col p-4"
        >
            <motion.h1
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="dark:text-white text-gray-800 font-semibold text-2xl mb-4"
            >
                Categories
            </motion.h1>
            <div className="m-2 flex gap-2 flex-end justify-end">
                <button
                    onClick={() => setIsOpenIncidentForm(true)}
                    className="flex bg-green-500 rounded-md h-10 text-center text-sm font-bold text-white items-center hover:bg-green-400 hover:cursor-pointer"
                > <IoAddCircleOutline size={30} />
                    Incident
                </button>
                <button
                    onClick={() => setIsOpenCategoryForm(true)}
                    className="flex mr-2 bg-green-500 rounded-md h-10 text-center text-sm font-bold text-white items-center hover:bg-green-400 hover:cursor-pointer"
                >
                    <IoAddCircleOutline size={30} />
                    Category
                </button>
            </div>
            <div
                className={`overflow-hidden rounded-xl shadow-sm border ${
                    darkMode
                        ? "border-slate-700 bg-slate-900"
                        : "border-gray-200 bg-white"
                }`}
            >
                {isLoading ? (
                    <div className="flex justify-center items-center py-10">
                        <h1 className="text-md font-semibold text-gray-600 dark:text-gray-300">
                            Loading Data...
                        </h1>
                    </div>
                ) : (
                    <table className="min-w-full border-collapse">
                        <thead
                            className={
                                darkMode
                                    ? "bg-slate-800 text-gray-300"
                                    : "bg-gray-100 text-gray-700"
                            }
                        >
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                    Category
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider">
                                    Incident Types
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {data?.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan="2"
                                        className="text-center py-6 text-gray-500 dark:text-gray-400"
                                    >
                                        No categories found
                                    </td>
                                </tr>
                            ) : (
                                data?.map((cat, index) => (
                                    <motion.tr
                                        key={cat.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            type: "spring",
                                            stiffness: 200,
                                            damping: 20,
                                            delay: 0.05 * index,
                                        }}
                                        className={`${
                                            index % 2 === 0
                                                ? darkMode
                                                    ? "bg-slate-800"
                                                    : "bg-gray-50"
                                                : darkMode
                                                ? "bg-slate-900"
                                                : "bg-white"
                                        } hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors`}
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-800 dark:text-gray-200">
                                            {cat.category_name}
                                        </td>
                                        <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                            {cat?.incident_types?.length > 0 ? (
                                                <ul className="list-disc list-inside space-y-1">
                                                    {cat.incident_types.map(
                                                        (inc) => (
                                                            <li key={inc.id}>
                                                                {
                                                                    inc.incident_name
                                                                }
                                                            </li>
                                                        )
                                                    )}
                                                </ul>
                                            ) : (
                                                <span className="italic text-gray-500">
                                                    No incidents
                                                </span>
                                            )}
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                )}
                {isOpenCategoryForm && (
                    <AddCategoryForm
                        onClose={() => setIsOpenCategoryForm(false)}
                    />
                )}
                {isOpenIncidentForm && (
                    <AddIncidentTypeForm
                        onClose={() => setIsOpenIncidentForm(false)}
                    />
                )}
            </div>
        </motion.div>
    );
};

export default Categories;
