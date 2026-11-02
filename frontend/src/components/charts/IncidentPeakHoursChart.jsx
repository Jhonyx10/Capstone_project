import useAppState from "../../store/useAppState";
import React from "react";
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
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const IncidentPeakHoursChart = ({ data }) => {
    const { darkMode } = useAppState();

    const peakHours = data?.incident_peak_hours || [];

    // Build full 24-hour range
    const allHours = Array.from({ length: 24 }, (_, i) => i);

    // Map peak_hours into the 24-hour range
    const values = allHours.map((hour) => {
        const entry = peakHours.find((item) => item.hour === hour);
        return entry ? entry.total : 0;
    });

    // Format hour as "1 AM, 2 PM"
    const labels = allHours.map((hour) => {
        const suffix = hour >= 12 ? "PM" : "AM";
        const displayHour = hour % 12 === 0 ? 12 : hour % 12;
        return `${displayHour} ${suffix}`;
    });

    const chartData = {
        labels,
        datasets: [
            {
                label: "Incidents",
                data: values,
                borderColor: darkMode ? "#22c55e" : "#22c55e",
                backgroundColor: darkMode ? "#22c55e" : "#22c55e",
                tension: 0.3,
                fill: true,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: "Incident Peak Hours (0–23)",
                color: darkMode ? "#fff" : "#000",
            },
            legend: {
                display: false,
            },
        },
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Hour of Day",
                    color: darkMode ? "#fff" : "#000",
                },
                ticks: {
                    color: darkMode ? "#fff" : "#000",
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: "Number of Incidents",
                    color: darkMode ? "#fff" : "#000",
                },
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
                className={`text-lg font-bold mb-2 ${
                    darkMode ? "text-white" : "text-black"
                }`}
            >
                Incident Peak Hours
            </h1>
            <Line data={chartData} options={options} />
        </motion.div>
    );
};

export default IncidentPeakHoursChart;
