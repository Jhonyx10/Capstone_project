import useAppState from "../../store/useAppState";
import React from "react";
import { motion } from "framer-motion";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    Title,
    Tooltip,
    Legend
);

const MonthlyReportChart = ({ data, isLoading }) => {
    const { darkMode } = useAppState();

    // Fallback if no data yet
    const monthlyReports = data?.monthly_reports || [];

    const labels = [
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
    ];

    // Reports count
    const values = labels.map((month) => {
        const found = monthlyReports.find((m) => m.month === month);
        return found ? found.report_count : 0;
    });

    // Month-over-Month Change
    const momValues = labels.map((month) => {
        const found = monthlyReports.find((m) => m.month === month);
        return found && found.mom_change !== null ? found.mom_change : null;
    });

    const chartData = {
        labels,
        datasets: [
            {
                label: "Reports",
                data: values,
                backgroundColor: darkMode ? "#4ade80" : "#22c55e",
                yAxisID: "y",
                type: "bar",
            },
            {
                label: "MoM Change (%)",
                data: momValues,
                borderColor: "#f43f5e",
                backgroundColor: "rgba(244,63,94,0.3)",
                yAxisID: "y1",
                type: "line",
                tension: 0.3,
                spanGaps: true, // so null values don’t break the line
            },
        ],
    };

    const options = {
        responsive: true,
        interaction: { mode: "index", intersect: false },
        stacked: false,
        plugins: {
            title: {
                display: true,
                text: "Monthly Reports & MoM Change",
                color: darkMode ? "#fff" : "#000",
            },
            legend: {
                position: "top",
                labels: {
                    color: darkMode ? "#fff" : "#000",
                },
            },
        },
        scales: {
            x: {
                ticks: { color: darkMode ? "#fff" : "#000" },
            },
            y: {
                type: "linear",
                display: true,
                position: "left",
                title: {
                    display: true,
                    text: "Reports",
                    color: darkMode ? "#fff" : "#000",
                },
                ticks: { color: darkMode ? "#fff" : "#000" },
            },
            y1: {
                type: "linear",
                display: true,
                position: "right",
                title: {
                    display: true,
                    text: "MoM %",
                    color: darkMode ? "#fff" : "#000",
                },
                grid: { drawOnChartArea: false },
                ticks: { color: "#f43f5e" },
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
                delay: 0.2,
            }}
            whileHover={{ scale: 1.02 }}
            className={`p-4 shadow-lg rounded-md w-[510px] ${
                darkMode ? "bg-slate-900" : "bg-white"
            }`}
        >
            {isLoading ? (
                <p className={darkMode ? "text-white" : ""}>Loading chart...</p>
            ) : (
                <Bar data={chartData} options={options} />
            )}
        </motion.div>
    );
};

export default MonthlyReportChart;
