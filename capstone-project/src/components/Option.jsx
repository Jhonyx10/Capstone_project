import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const Option = ({ Icon, title, selected, setSelected, open }) => {
    const [hover, setHover] = useState(false);

    return (
        <button
            onClick={() => setSelected(title)}
            className={`relative flex items-center h-10 w-full rounded-md transition-colors hover:cursor-pointer ${
                selected === title
                    ? "bg-slate-100 dark:bg-slate-700"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {/* Fixed Icon Box */}
            <div className="flex h-full w-10 items-center justify-center shrink-0 text-lg">
                <Icon color="#22c55e" />
            </div>

            {/* Animated label when sidebar is open */}
            {/* <AnimatePresence> */}
                {open && (
                    <motion.span
                        key="label"
                        // initial={{ opacity: 0, x: -8 }}
                        // animate={{ opacity: 1, x: 0 }}
                        // exit={{ opacity: 0, x: -8 }}
                        // transition={{ duration: 0.2 }}
                        className="text-sm text-slate-700 dark:text-slate-200 whitespace-nowrap"
                    >
                        {title}
                    </motion.span>
                )}
            {/* </AnimatePresence> */}

            {/* Tooltip when sidebar is closed */}
            {!open && hover && (
                <motion.div
                    // initial={{ opacity: 0, x: -5 }}
                    // animate={{ opacity: 1, x: 0 }}
                    // exit={{ opacity: 0, x: -5 }}
                    // transition={{ duration: 0.15 }}
                    className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 
                     rounded-md text-sm text-white bg-gray-900 shadow-lg whitespace-nowrap z-9999"
                >
                    {title}
                </motion.div>
            )}
        </button>
    );
};

export default Option;
