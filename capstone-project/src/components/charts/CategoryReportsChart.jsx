import useAppState from "../../store/useAppState";
import { motion } from "framer-motion";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const CategoryReportsChart = ({ data }) => {
    const { darkMode } = useAppState();

    // Extract labels, values, and percentages
    const labels = data?.category_reports?.map(
        (item) => `${item.category} (${item.percentage.toFixed(2)}%)`
    );
    const values = data?.category_reports?.map((item) => item.count);

    const chartData = {
        labels,
        datasets: [
            {
                label: "Total Reports",
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
                text: "Total Incident Reports By Category",
                color: darkMode ? "#fff" : "#000",
            },
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const index = context.dataIndex;
                        const category = data.category_reports[index];
                        return `${category.category}: ${
                            category.count
                        } (${category.percentage.toFixed(2)}%)`;
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
            <Doughnut data={chartData} options={options} />
        </motion.div>
    );
};

export default CategoryReportsChart;
