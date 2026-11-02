import { motion } from "framer-motion";
import ReportTable from "../components/tables/ReportsTable";

const Reports = () => (
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
                Reports
            </motion.h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
                Search, filter and open incident reports.
            </p>
        </header>
        <ReportTable />
    </motion.div>
);

export default Reports;
