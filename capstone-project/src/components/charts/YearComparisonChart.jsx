import useAppState from "../../store/useAppState";
import React, { useMemo } from "react";
import { motion } from "framer-motion";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

const YearComparisonChart = ({data, isLoading}) => {
    const { darkMode } = useAppState();

    const chartData = useMemo(() => {
        if (!data?.reports) return null;

        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;

        const currentYearData = new Array(12).fill(0);
        const previousYearData = new Array(12).fill(0);

        data?.reports?.forEach((r) => {
            if (r.year === currentYear) {
                currentYearData[r.month - 1] = r.total;
            } else if (r.year === previousYear) {
                previousYearData[r.month - 1] = r.total;
            }
        });

        return {
            labels: [
                "Jan",
                "Feb",
                "Mar",
                "Apr",
                "May",
                "Jun",
                "Jul",
                "Aug",
                "Sep",
                "Oct",
                "Nov",
                "Dec",
            ],
            datasets: [
                {
                    label: `${currentYear}`,
                    data: currentYearData,
                    borderColor: darkMode ? "#4ade80" : "#22c55e",
                    backgroundColor: darkMode ? "#64748b" : "#94a3b8",
                    tension: 0.3,
                    fill: false,
                },
                {
                    label: `${previousYear}`,
                    data: previousYearData,
                    borderColor: "rgba(255, 99, 132, 1)",
                    backgroundColor: "rgba(255, 99, 132, 0.2)",
                    tension: 0.3,
                    fill: false,
                },
            ],
        };
    }, [data, darkMode]);

    const options = {
        responsive: true,
        color: darkMode ? "#fff" : "#000",
        plugins: {
            title: {
                display: true,
                text: "Yearly Reports",
                color: darkMode ? "#fff" : "#000",
            },
            legend: {
                position: "top",
            },
        },
        scales: {
            x: {
                ticks: {
                    color: darkMode ? "#fff" : "#000",
                },
                beginAtZero: true,
            },
            y: {
                ticks: {
                    color: darkMode ? "#fff" : "#000",
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
            className={`p-4 shadow-lg rounded-md w-[510px] ${
                darkMode ? "bg-slate-900" : "bg-white"
            }`}
        >
            {isLoading ? (
                <p className={darkMode ? "text-white" : ""}>Loading chart...</p>
            ) : chartData ? (
                <Line data={chartData} options={options} />
            ) : (
                <p>No data available</p>
            )}
        </motion.div>
    );
};

export default YearComparisonChart;
