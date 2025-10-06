import YearComparisonChart from "../components/charts/YearComparisonChart";
import MonthlyReportChart from "../components/charts/MonthlyReportChart";
import CategoryReportsChart from "../components/charts/CategoryReportsChart";
import ZoneReportsChart from "../components/charts/ZoneReportsChart";
import ZoneAverageResponseChart from "../components/charts/ZoneAverageResponseTimeChart";
import MonthlyRecordedViolatorsChart from "../components/charts/MonthlyRecordedViolatorsChart";
import ZoneTotalViolatorsChart from "../components/charts/ZoneTotalViolatorsChart";
import IncidentTrendChart from "../components/charts/IncidentTrendsChart";
import ZoneIncidentTrendsChart from "../components/charts/ZoneIncidentTrendsChart";
import CategoryAvgResponseTimeChart from "../components/charts/CategoryAvgResponseTimeChart";
import IncidentPeakHoursChart from "../components/charts/IncidentPeakHoursChart";
import TotalReportCard from "../components/charts/TotalReportsCard";
import LeastReportedCategory from "../components/charts/LeastReportedCategoryCard";
import MostReportedCategory from "../components/charts/MostReportedCategoryCard";
import IncidentPeakHoursCard from "../components/charts/IncidentPeakHoursCard";
import useAppState from "../store/useAppState";
import { useQuery } from "@tanstack/react-query";
import { AnalyticalData } from "../functions/Analytics";
import { motion } from "framer-motion"
import { useEffect } from "react";

const Analytics = () => {
    const { base_url, token} = useAppState();

    const { data, isLoading, isError } = useQuery({
        queryKey: ["analytics"],
        queryFn: () => AnalyticalData({ base_url, token }),
        enabled: !!base_url && !!token,
    });

        useEffect(() => {
            if (data) console.log(data);
        }, [data]);
    
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
            <div className="flex m-4 flex-wrap justify-center gap-4">
                <TotalReportCard data={data} isLoading={isLoading} />
                <MostReportedCategory data={data} isLoading={isLoading} />
                <LeastReportedCategory data={data} isLoading={isLoading} />
                <IncidentPeakHoursCard data={data} isLoading={isLoading} />
            </div>
            <div className="flex m-2 flex-wrap justify-center gap-4">
                <CategoryReportsChart data={data} isLoading={isLoading} />
                <ZoneReportsChart data={data} isLoading={isLoading} />
                <ZoneAverageResponseChart data={data} isLoading={isLoading} />
                <CategoryAvgResponseTimeChart data={data} />
                <MonthlyReportChart data={data} isLoading={isLoading} />
                <IncidentPeakHoursChart data={data} isLoading={isLoading} />
                <YearComparisonChart data={data} isLoading={isLoading} />
                <IncidentTrendChart data={data} />
                <ZoneIncidentTrendsChart data={data} isLoading={isLoading} />
                <MonthlyRecordedViolatorsChart
                    data={data}
                    isLoading={isLoading}
                />
                <ZoneTotalViolatorsChart
                    data={data}
                    isLoading={isLoading}
                    isError={isError}
                />
            </div>
        </div>
    );
}
export default Analytics;