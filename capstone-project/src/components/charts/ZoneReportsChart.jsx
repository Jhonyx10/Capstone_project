import useAppState from "../../store/useAppState";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { Pie } from "react-chartjs-2";
import { zoneReportDetails } from "../../functions/Analytics";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const ZoneReportsChart = () => {
    const { darkMode, token, base_url } = useAppState();

    const { data: zoneReports, isLoading } = useQuery({
        queryKey: ["zone_reports"],
        queryFn: () => zoneReportDetails({ base_url, token }),
    });

    if (isLoading) return null;
    if (!zoneReports || zoneReports.length === 0)
        return <p>No data available</p>;

    // Extract labels (zone names) and values (zone_total)
    const labels = zoneReports.map((item) => item.zone.zone_name);
    const values = zoneReports.map((item) => item.zone_total);

    const chartData = {
        labels,
        datasets: [
            {
                label: "Incident Total",
                data: values,
                backgroundColor: [
                    "#22c55e",
                    "#3b82f6",
                    "#f97316",
                    "#e11d48",
                    "#9333ea",
                    "#14b8a6",
                ],
                borderColor: darkMode ? "#0f172a" : "#fff",
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: "right",
                labels: {
                    color: darkMode ? "#fff" : "#000",
                    font: {
                        size: 10,
                    },
                },
            },
            title: {
                display: true,
                text: "Total Incident Report By Zone",
                color: darkMode ? "#fff" : "#000",
            },
        },
    };

    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
                delay: 0.1,
            }}
            whileHover={{ scale: 1.02 }}
            className={`p-4 shadow-lg rounded-md ${
                darkMode ? "bg-slate-900" : "bg-white"
            }`}
        >
            <Pie data={chartData} options={options} />
        </motion.div>
    );
};

export default ZoneReportsChart;
