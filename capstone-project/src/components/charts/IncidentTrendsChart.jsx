import useAppState from "../../store/useAppState";
import React from "react";
import { motion } from "framer-motion";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const IncidentTrendChart = ({data}) => {
    const { darkMode } = useAppState();

    const currentMonth = new Date().toLocaleString("default", {
        month: "long",
    });

    const incidentTrend = data?.incident_trend || [];

    const categories = [...new Set(incidentTrend.map((item) => item.category))];
    const months = [...new Set(incidentTrend.map((item) => item.month_name))];

    const baseColors = darkMode
        ? ["#22c55e", "#f87171"]
        : ["#22c55e", "#ef4444"];

    const monthColors = {};
    months.forEach((month, index) => {
        monthColors[month] = baseColors[index % baseColors.length];
    });

    const datasets = months.map((month) => ({
        label: month,
        data: categories.map((category) => {
            const entry = incidentTrend.find(
                (item) =>
                    item.category === category && item.month_name === month
            );
            return entry ? entry.total : 0;
        }),
        backgroundColor: monthColors[month],
    }));

    const chartData = {
        labels: categories,
        datasets,
    };


    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: "Incident Trends by Category",
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
                ticks: {
                    color: darkMode ? "#fff" : "#000",
                },
            },
            y: {
                beginAtZero: true,
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
                delay: 0.2,
            }}
            whileHover={{ scale: 1.02 }}
            className={`p-4 shadow-lg rounded-md w-[510px] ${
                darkMode ? "bg-slate-900" : "bg-white"
            }`}
        >
            <h1
                className={`text-lg font-bold ${
                    darkMode ? "text-white" : "text-black"
                }`}
            >
                Incident Trends By Category
            </h1>
            <Bar data={chartData} options={options} />
        </motion.div>
    );
};

export default IncidentTrendChart;
