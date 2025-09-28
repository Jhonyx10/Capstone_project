import useAppState from "../../store/useAppState";
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { MonthlyRecordedViolators } from "../../functions/Analytics";
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

const MonthlyRecordedViolatorsChart = () => {
    const { darkMode, token, base_url } = useAppState();

    const { data: reportedViolators } = useQuery({
        queryKey: ["monthly_recorded_violators"],
        queryFn: () => MonthlyRecordedViolators({ token, base_url }),
    });

    // Fallback if no data yet
    const monthlyViolators = reportedViolators || [];

    // Labels for months
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

    // Fill chart data: map months 1-12, use value or 0 if missing
    const values = Array.from({ length: 12 }, (_, i) => {
        const monthData = monthlyViolators.find((item) => item.month === i + 1);
        return monthData ? monthData.total : 0;
    });

    const chartData = {
        labels,
        datasets: [
            {
                label:"Violators",
                data: values,
                backgroundColor: darkMode ? "#4ade80" : "#22c55e",
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            title: {
                display: true,
                text: "Monthly Recorded Violators",
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
            className={` p-4 shadow-lg rounded-md w-[510px] ${
                darkMode ? "bg-slate-900" : "bg-white"
            }`}
        >
            <Bar data={chartData} options={options} />
        </motion.div>
    );
};

export default MonthlyRecordedViolatorsChart;
