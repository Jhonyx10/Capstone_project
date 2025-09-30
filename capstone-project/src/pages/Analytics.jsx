import YearComparisonChart from "../components/charts/YearComparisonChart";
import MonthlyReportChart from "../components/charts/MonthlyReportChart";
import CategoryReportsChart from "../components/charts/CategoryReportsChart";
import ZoneReportsChart from "../components/charts/ZoneReportsChart";
import ZoneAverageResponseChart from "../components/charts/ZoneAverageResponseTimeChart";
import MonthlyRecordedViolatorsChart from "../components/charts/MonthlyRecordedViolatorsChart";
import ZoneTotalViolatorsChart from "../components/charts/ZoneTotalViolatorsChart";
import IncidentTrendChart from "../components/charts/IncidentTrendsChart";
import ZoneIncidentTrendsChart from "../components/charts/ZoneIncidentTrendsChart";
import { motion } from "framer-motion"

const Analytics = () => {
    return (
        <div className="m-4">
            <motion.h1
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="dark:text-white text-gray-700 gap-4 font-medium text-2xl m-4"
            >
                Analytics
            </motion.h1>
            <div className="flex m-2 justify-center gap-4">
                <CategoryReportsChart />
                <ZoneReportsChart />
                <ZoneAverageResponseChart />
            </div>
            <motion.h1
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 }}
                className="dark:text-white text-gray-700 gap-4 font-medium text-2xl m-4"
            >
                Incident Reports
            </motion.h1>
            <div className="flex flex-wrap gap-4 justify-center">
                <MonthlyReportChart />
                <YearComparisonChart />
                <IncidentTrendChart/>
                <ZoneIncidentTrendsChart/>
            </div>
            <motion.h1
                layout
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1 }}
                className="dark:text-white text-gray-700 gap-4 font-medium text-2xl m-4"
            >
                Incident Violators
            </motion.h1>
            <div className="flex flex-wrap gap-4 justify-center">
                <MonthlyRecordedViolatorsChart/>
                <ZoneTotalViolatorsChart/>
            </div>
        </div>
    );
}
export default Analytics;