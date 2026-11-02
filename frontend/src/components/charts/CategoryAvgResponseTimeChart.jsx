import useAppState from "../../store/useAppState";
import { motion } from "framer-motion";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const CategoryAvgResponseTimeChart = ({ data }) => {
    const { darkMode } = useAppState();

    if (
        !data ||
        !data.category_response_time ||
        data.category_response_time.length === 0
    ) {
        return <p>No data available</p>;
    }

    // Extract labels & values
    const labels = data.category_response_time.map(
        (item) => `${item.category_name}`
    );
    const values = data.category_response_time.map((item) => item.reports);

    const chartData = {
        labels,
        datasets: [
            {
                label: "Reports",
                data: values,
                backgroundColor: [
                    "#22c55e",
                    "rgba(255, 99, 132, 1)",
                    "#4e79a7",
                    "#f28e2b",
                    "#76b7b2",
                    "#edc948",
                    "#b07aa1",
                    "#ff9da7",
                    "#9c755f",
                    "#bab0ab",
                ],
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
                        size: 9,
                        family: "Arial",
                    },
                },
            },
            title: {
                display: true,
                text: "Average Response Time By Category",
                color: darkMode ? "#fff" : "#000",
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const index = context.dataIndex;
                        const item = data.category_response_time[index];
                        return `${item.category_name}: ${
                            item.reports
                        } reports | Avg Response: ${item.avg_response_time.toFixed(
                            2
                        )} mins`;
                    },
                },
            },
        },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.02 }}
            className={`p-4 shadow-lg rounded-md ${
                darkMode ? "bg-slate-900" : "bg-white"
            }`}
        >
            <Pie data={chartData} options={options} />
        </motion.div>
    );
};

export default CategoryAvgResponseTimeChart;
