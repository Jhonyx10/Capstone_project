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

const ZoneIncidentTrendsChart = ({ data, isLoading }) => {
    const { darkMode } = useAppState();

    const incidentTrend = data?.zone_incident_trends || [];

    // Unique zones and months
    const zones = [...new Set(incidentTrend.map((item) => item.zone_name))];
    const months = [...new Set(incidentTrend.map((item) => item.month_name))];

    // Colors per month
    const baseColors = darkMode
        ? ["#22c55e", "#f87171", "#3b82f6"]
        : ["#22c55e", "#ef4444", "#3b82f6"];

    const monthColors = {};
    months.forEach((month, index) => {
        monthColors[month] = baseColors[index % baseColors.length];
    });

    // Build datasets per month
    const datasets = months.map((month) => ({
        label: month,
        data: zones.map((zone) => {
            const entry = incidentTrend.find(
                (item) => item.zone_name === zone && item.month_name === month
            );
            return entry ? entry.total : 0;
        }),
        backgroundColor: monthColors[month],
    }));

    const chartData = {
        labels: zones,
        datasets,
    };

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: "Incident Trends by Zone",
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
                Incident Trends by Zone
            </h1>
            <Bar data={chartData} options={options} />
        </motion.div>
    );
};

export default ZoneIncidentTrendsChart;
