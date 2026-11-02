import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";
import useAppState from "../store/useAppState";
import { AnalyticalData } from "../functions/Analytics";
import StatStrip from "../components/charts/StatStrip";
import {
    CategoryReportsChart,
    ZoneReportsChart,
    ZoneResponseChart,
    CategoryResponseChart,
    MonthlyReportChart,
    YearComparisonChart,
    IncidentPeakHoursChart,
    IncidentTrendChart,
    ZoneIncidentTrendsChart,
    MonthlyViolatorsChart,
    ZoneViolatorsChart,
} from "../components/charts/AnalyticsCharts";

const formatHour = (h) =>
    h === null || h === undefined
        ? "N/A"
        : `${h % 12 || 12} ${h >= 12 ? "PM" : "AM"}`;

const Section = ({ title, description, children }) => (
    <section className="space-y-3">
        <div>
            <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">
                {title}
            </h2>
            {description && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {description}
                </p>
            )}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{children}</div>
    </section>
);

const Analytics = () => {
    const { base_url, token } = useAppState();

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ["analytics"],
        queryFn: () => AnalyticalData({ base_url, token }),
        enabled: !!base_url && !!token,
    });

    const most = data?.most_reported_category;
    const least = data?.least_reported_category;
    const peak = data?.peak_hours;

    const stats = [
        {
            label: "Total reports",
            value: data?.total_reports ?? 0,
            tone: "text-slate-900 dark:text-white",
        },
        {
            label: "Most reported category",
            value: most?.category ?? "N/A",
            detail: `${most?.total ?? 0} reports`,
            tone: "text-rose-500",
        },
        {
            label: "Least reported category",
            value: least?.category ?? "N/A",
            detail: `${least?.total ?? 0} reports`,
            tone: "text-green-500",
        },
        {
            label: "Peak reporting hour",
            value: formatHour(peak?.hour),
            detail: `${peak?.total ?? 0} reports`,
            tone: "text-sky-500",
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-7xl space-y-8 p-4 md:p-6"
        >
            <header>
                <motion.h1
                    layout
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-2xl font-semibold text-slate-800 dark:text-white"
                >
                    Analytics
                </motion.h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    Incident reports, response times and violators across the
                    barangay.
                </p>
            </header>

            {isError && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950/40 dark:text-rose-300">
                    <span className="flex items-center gap-2">
                        <FaExclamationTriangle /> Analytics could not be loaded.
                        Check that the backend is running.
                    </span>
                    <button
                        onClick={() => refetch()}
                        className="rounded-md border border-current px-3 py-1 font-medium"
                    >
                        Try again
                    </button>
                </div>
            )}

            <StatStrip items={stats} isLoading={isLoading} />

            <Section
                title="Incident breakdown"
                description="What is being reported and where."
            >
                <CategoryReportsChart data={data} isLoading={isLoading} />
                <ZoneReportsChart data={data} isLoading={isLoading} />
            </Section>

            <Section
                title="Response time"
                description="How quickly incidents get a response."
            >
                <ZoneResponseChart data={data} isLoading={isLoading} />
                <CategoryResponseChart data={data} isLoading={isLoading} />
            </Section>

            <Section title="Trends over time">
                <MonthlyReportChart data={data} isLoading={isLoading} />
                <YearComparisonChart data={data} isLoading={isLoading} />
                <IncidentPeakHoursChart
                    data={data}
                    isLoading={isLoading}
                    className="lg:col-span-2"
                />
                <IncidentTrendChart data={data} isLoading={isLoading} />
                <ZoneIncidentTrendsChart data={data} isLoading={isLoading} />
            </Section>

            <Section title="Violators">
                <MonthlyViolatorsChart data={data} isLoading={isLoading} />
                <ZoneViolatorsChart data={data} isLoading={isLoading} />
            </Section>
        </motion.div>
    );
};

export default Analytics;
