import ReportTable from "../components/tables/ReportsTable";
import { motion } from "framer-motion";
const Reports = () => {
    return (
        <div style={{ display: "flex", margin: 0 }}>
            <div>
                <motion.h1
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="dark:text-white text-gray-700 font-medium text-2xl mt-2 ml-6"
                >
                    Reports
                </motion.h1>
                <ReportTable />
            </div>
        </div>
    );
};
export default Reports;
