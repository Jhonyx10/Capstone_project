import useAppState from "../../store/useAppState";
import { motion } from "framer-motion";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const ZoneTotalViolatorsChart = ({data, isLoading, isError}) => {
    const { darkMode } = useAppState();


    if (isLoading) {
        return null;
    }

    if (isError || !data?.zone_violators) {
        return null;
    }

    // Extract labels and values from API response
    const labels = data?.zone_violators.map((item) => item.zone_name);
    const values = data?.zone_violators.map((item) => item.total);

    const chartData = {
        labels,
        datasets: [
            {
                label: "Total Violators",
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
                text: "Total Violators By Zone",
                color: darkMode ? "#fff" : "#000",
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

export default ZoneTotalViolatorsChart;
