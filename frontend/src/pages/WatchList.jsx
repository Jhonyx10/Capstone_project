import { useState } from "react";
import { motion } from "framer-motion";
import { IoAddCircleOutline } from "react-icons/io5";
import WatchListTable from "../components/tables/WatchListTable";
import WatchListForm from "../forms/WatchListForm";

const WatchList = () => {
    const [isAddOpen, setIsAddOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-7xl space-y-5 p-4 md:p-6"
        >
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
                        WatchList
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        People and vehicles to look out for. Residents and
                        tanods can report sightings of active entries.
                    </p>
                </div>
                <button
                    onClick={() => setIsAddOpen(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-400 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 cursor-pointer"
                >
                    <IoAddCircleOutline size={20} />
                    Add entry
                </button>
            </header>

            <WatchListTable />

            {isAddOpen && <WatchListForm onClose={() => setIsAddOpen(false)} />}
        </motion.div>
    );
};

export default WatchList;
