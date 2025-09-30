import useAppState from "../../store/useAppState";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { IncidentTrendForTheMonth } from "../../functions/Analytics";
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

const IncidentTrendChart = () => {
    const { darkMode, token, base_url } = useAppState();

    const { data } = useQuery({
        queryKey: ["incident_trend"],
        queryFn: () => IncidentTrendForTheMonth({ token, base_url }),
    });

    const currentMonth = new Date().toLocaleString("default", {
        month: "long",
    });

    const incidentTrend = data || [];

    const categories = [...new Set(incidentTrend.map((item) => item.category))];
    const years = [...new Set(incidentTrend.map((item) => item.year))];

   
    const baseColors = darkMode
        ? ["#22c55e", "#f87171"] 
        : ["#22c55e", "#ef4444"];

        const yearColors = {};
        years.forEach((year, index) => {
            yearColors[year] = baseColors[index % baseColors.length];
        });

    const datasets = years.map((year) => ({
        label: `${year}`,
        data: categories.map((category) => {
            const entry = incidentTrend.find(
                (item) => item.category === category && item.year === year
            );
            return entry ? entry.total : 0;
        }),
        backgroundColor: yearColors[year] || "#22c55e",
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
            <h1 className="text-lg text-white font-bold">{currentMonth}</h1>
            <Bar data={chartData} options={options} />
        </motion.div>
    );
};

export default IncidentTrendChart;
