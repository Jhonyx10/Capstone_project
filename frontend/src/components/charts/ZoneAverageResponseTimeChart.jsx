import useAppState from "../../store/useAppState";
import { motion } from "framer-motion";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const ZoneAverageResponseChart = ({ data, isLoading }) => {
    const { darkMode } = useAppState();

    if (isLoading) return null;
    if (!data || !data.response_time || data.response_time.length === 0)
        return <p>No data available</p>;

    // Extract labels (zone names) and values (reports count)
    const labels = data.response_time.map((item) => item.zone_name);
    const values = data.response_time.map((item) => item.reports);

    const chartData = {
        labels,
        datasets: [
            {
                label: "Incident Reports",
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
                text: "Average Response Time By Zone",
                color: darkMode ? "#fff" : "#000",
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const index = context.dataIndex;
                        const item = data.response_time[index];
                        return `${item.zone_name}: ${
                            item.reports
                        } reports | Avg Response: ${item.average_zone_response.toFixed(
                            2
                        )} mins`;
                    },
                },
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

export default ZoneAverageResponseChart;
