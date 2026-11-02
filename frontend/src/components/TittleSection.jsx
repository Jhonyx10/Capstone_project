import React from "react";
import { motion } from "framer-motion";
import Logo from "./Logo";

const TitleSection = ({ open }) => {
    return (
        <div className="mb-3 border-b border-slate-300 dark:border-slate-950 pb-1">
            <div className="flex cursor-pointer items-center justify-between rounded-md transition-colors hover:bg-slate-100 dark:hover:bg-slate-600">
                <div className="flex items-center gap-2">
                    <Logo />
                    {open && (
                        <motion.div
                            layout
                            key="label"
                            // initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <span className="block text-xs font-semibold dark:text-white ">
                                Barangay Igpit
                            </span>
                            <span className="block font-light text-xs text-slate-500 dark:text-gray-400 whitespace-nowrap">
                                Incident Management System
                            </span>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TitleSection;
