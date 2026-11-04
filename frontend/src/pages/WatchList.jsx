import { motion } from "framer-motion";
import ViolatorsTable from "../components/tables/ViolatorsTable";

const WatchList = () => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mx-auto max-w-7xl space-y-5 p-4 md:p-6"
    >
        <header>
            <motion.h1
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="text-2xl font-semibold text-slate-800 dark:text-white"
            >
                WatchList
            </motion.h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Search recorded WatchList and open their details.
            </p>
        </header>
        <WatchListTable />
    </motion.div>
);

export default WatchList;
