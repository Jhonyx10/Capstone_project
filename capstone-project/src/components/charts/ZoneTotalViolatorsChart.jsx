import useAppState from "../../store/useAppState";
import { useQuery } from "@tanstack/react-query";
import { ZoneTotalViolators } from "../../functions/Analytics";
import { motion } from "framer-motion";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend, Title);

const ZoneTotalViolatorsChart = () => {
    const { darkMode, token, base_url } = useAppState();

    const {
        data: ZoneViolators,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["zone_violators_total"],
        queryFn: () => ZoneTotalViolators({ base_url, token }),
    });

    if (isLoading) {
        return null;
    }

    if (isError || !ZoneViolators) {
        return null;
    }

    // Extract labels and values from API response
    const labels = ZoneViolators.map((item) => item.zone_name);
    const values = ZoneViolators.map((item) => item.total);

    const data = {
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
            <Doughnut data={data} options={options} />
        </motion.div>
    );
};

export default ZoneTotalViolatorsChart;
