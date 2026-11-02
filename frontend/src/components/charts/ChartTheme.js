import useAppState from "../../store/useAppState";

export const PALETTE = [
    "#22c55e",
    "#38bdf8",
    "#f59e0b",
    "#f43f5e",
    "#a78bfa",
    "#2dd4bf",
    "#fb923c",
    "#94a3b8",
];

export const MONTHS = [
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

export const allZero = (arr) => !arr.some((v) => v);

// One place for colors, grid, tooltip and legend styling of every chart.
export const useChartTheme = () => {
    const { darkMode } = useAppState();
    const text = darkMode ? "#cbd5e1" : "#475569";
    const grid = darkMode ? "rgba(148,163,184,0.12)" : "rgba(100,116,139,0.15)";
    const surface = darkMode ? "#0f172a" : "#ffffff";

    const base = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: text,
                    usePointStyle: true,
                    boxWidth: 8,
                    font: { size: 11 },
                },
            },
            tooltip: {
                backgroundColor: surface,
                titleColor: darkMode ? "#f1f5f9" : "#0f172a",
                bodyColor: text,
                borderColor: grid,
                borderWidth: 1,
                padding: 10,
                cornerRadius: 8,
            },
        },
    };

    const axes = (yExtra = {}) => ({
        x: {
            ticks: { color: text },
            grid: { display: false },
            border: { display: false },
        },
        y: {
            beginAtZero: true,
            ticks: { color: text, precision: 0 },
            grid: { color: grid },
            border: { display: false },
            ...yExtra,
        },
    });

    return { darkMode, text, grid, surface, base, axes, palette: PALETTE };
};
