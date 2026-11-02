import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";
import ChartCard from "./ChartCard";
import { useChartTheme, allZero, MONTHS } from "./ChartTheme";

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    LineElement,
    PointElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

/* ---------- shared building blocks ---------- */

const Donut = ({ labels, values, tooltip }) => {
    const t = useChartTheme();
    return (
        <Doughnut
            data={{
                labels,
                datasets: [
                    {
                        data: values,
                        backgroundColor: t.palette,
                        borderColor: t.surface,
                        borderWidth: 3,
                    },
                ],
            }}
            options={{
                ...t.base,
                cutout: "68%",
                plugins: {
                    ...t.base.plugins,
                    legend: { ...t.base.plugins.legend, position: "right" },
                    tooltip: {
                        ...t.base.plugins.tooltip,
                        callbacks: { label: (c) => tooltip(c.dataIndex) },
                    },
                },
            }}
        />
    );
};

const HBar = ({ labels, values, tooltip }) => {
    const t = useChartTheme();
    const axes = t.axes({ ticks: { color: t.text, precision: 1 } });
    return (
        <Bar
            data={{
                labels,
                datasets: [
                    {
                        data: values,
                        backgroundColor: t.palette[0],
                        borderRadius: 6,
                        barThickness: 18,
                    },
                ],
            }}
            options={{
                ...t.base,
                indexAxis: "y",
                plugins: {
                    ...t.base.plugins,
                    legend: { display: false },
                    tooltip: {
                        ...t.base.plugins.tooltip,
                        callbacks: { label: (c) => tooltip(c.dataIndex) },
                    },
                },
                scales: {
                    x: {
                        ...axes.y,
                        title: {
                            display: true,
                            text: "Minutes",
                            color: t.text,
                        },
                    },
                    y: { ...axes.x, ticks: { color: t.text } },
                },
            }}
        />
    );
};

// One bar group per label, one colored bar per month.
const GroupedBar = ({ rows, labelKey }) => {
    const t = useChartTheme();
    const labels = [...new Set(rows.map((r) => r[labelKey]))];
    const months = [...new Set(rows.map((r) => r.month_name))];
    const datasets = months.map((m, i) => ({
        label: m,
        backgroundColor: t.palette[i % t.palette.length],
        borderRadius: 4,
        data: labels.map(
            (l) =>
                rows.find((r) => r[labelKey] === l && r.month_name === m)
                    ?.total ?? 0
        ),
    }));
    return (
        <Bar
            data={{ labels, datasets }}
            options={{ ...t.base, scales: t.axes() }}
        />
    );
};

/* ---------- incident breakdown ---------- */

export const CategoryReportsChart = ({ data, isLoading }) => {
    const rows = data?.category_reports ?? [];
    return (
        <ChartCard
            title="Reports by category"
            subtitle="Share of all incident reports"
            isLoading={isLoading}
            empty={!rows.length}
        >
            <Donut
                labels={rows.map((r) => r.category)}
                values={rows.map((r) => r.count)}
                tooltip={(i) =>
                    ` ${rows[i].category}: ${rows[i].count} (${Number(
                        rows[i].percentage
                    ).toFixed(1)}%)`
                }
            />
        </ChartCard>
    );
};

export const ZoneReportsChart = ({ data, isLoading }) => {
    const rows = data?.zones ?? [];
    return (
        <ChartCard
            title="Reports by zone"
            subtitle="Where incidents are happening"
            isLoading={isLoading}
            empty={!rows.length}
        >
            <Donut
                labels={rows.map((r) => r.zone_name)}
                values={rows.map((r) => r.total_incidents)}
                tooltip={(i) =>
                    ` ${rows[i].zone_name}: ${rows[i].total_incidents} (${rows[i].percentage}%)`
                }
            />
        </ChartCard>
    );
};

/* ---------- response time (minutes, not report counts) ---------- */

export const ZoneResponseChart = ({ data, isLoading }) => {
    const rows = data?.response_time ?? [];
    return (
        <ChartCard
            title="Average response time by zone"
            subtitle="Minutes from report to response"
            isLoading={isLoading}
            empty={!rows.length}
        >
            <HBar
                labels={rows.map((r) => r.zone_name)}
                values={rows.map((r) => Number(r.average_zone_response))}
                tooltip={(i) =>
                    ` ${Number(rows[i].average_zone_response).toFixed(
                        2
                    )} mins (${rows[i].reports} reports)`
                }
            />
        </ChartCard>
    );
};

export const CategoryResponseChart = ({ data, isLoading }) => {
    const rows = data?.category_response_time ?? [];
    return (
        <ChartCard
            title="Average response time by category"
            subtitle="Minutes from report to response"
            isLoading={isLoading}
            empty={!rows.length}
        >
            <HBar
                labels={rows.map((r) => r.category_name)}
                values={rows.map((r) => Number(r.avg_response_time))}
                tooltip={(i) =>
                    ` ${Number(rows[i].avg_response_time).toFixed(2)} mins (${
                        rows[i].reports
                    } reports)`
                }
            />
        </ChartCard>
    );
};

/* ---------- trends over time ---------- */

export const MonthlyReportChart = ({ data, isLoading }) => {
    const t = useChartTheme();
    const rows = data?.monthly_reports ?? [];
    const find = (m) => rows.find((r) => r.month === m);
    const counts = MONTHS.map((m) => find(m)?.report_count ?? 0);
    const mom = MONTHS.map((m) => find(m)?.mom_change ?? null);
    const axes = t.axes();
    return (
        <ChartCard
            title="Monthly reports"
            subtitle="Reports per month and change from the previous month"
            isLoading={isLoading}
            empty={allZero(counts)}
        >
            <Bar
                data={{
                    labels: MONTHS,
                    datasets: [
                        {
                            label: "Reports",
                            data: counts,
                            backgroundColor: t.palette[0],
                            borderRadius: 4,
                            yAxisID: "y",
                        },
                        {
                            type: "line",
                            label: "Change (%)",
                            data: mom,
                            borderColor: t.palette[3],
                            backgroundColor: t.palette[3],
                            tension: 0.3,
                            spanGaps: true,
                            pointRadius: 3,
                            yAxisID: "y1",
                        },
                    ],
                }}
                options={{
                    ...t.base,
                    interaction: { mode: "index", intersect: false },
                    scales: {
                        x: axes.x,
                        y: axes.y,
                        y1: {
                            position: "right",
                            grid: { drawOnChartArea: false },
                            border: { display: false },
                            ticks: { color: t.palette[3] },
                        },
                    },
                }}
            />
        </ChartCard>
    );
};

export const YearComparisonChart = ({ data, isLoading }) => {
    const t = useChartTheme();
    const year = new Date().getFullYear();
    const series = (y) => {
        const arr = new Array(12).fill(0);
        (data?.reports ?? []).forEach((r) => {
            if (r.year === y) arr[r.month - 1] = r.total;
        });
        return arr;
    };
    const current = series(year);
    const previous = series(year - 1);
    return (
        <ChartCard
            title="Year over year"
            subtitle={`${year} compared with ${year - 1}`}
            isLoading={isLoading}
            empty={allZero(current) && allZero(previous)}
        >
            <Line
                data={{
                    labels: MONTHS,
                    datasets: [
                        {
                            label: `${year}`,
                            data: current,
                            borderColor: t.palette[0],
                            backgroundColor: t.palette[0],
                            tension: 0.35,
                            pointRadius: 3,
                        },
                        {
                            label: `${year - 1}`,
                            data: previous,
                            borderColor: t.palette[7],
                            backgroundColor: t.palette[7],
                            borderDash: [5, 4],
                            tension: 0.35,
                            pointRadius: 3,
                        },
                    ],
                }}
                options={{
                    ...t.base,
                    interaction: { mode: "index", intersect: false },
                    scales: t.axes(),
                }}
            />
        </ChartCard>
    );
};

export const IncidentPeakHoursChart = ({ data, isLoading, className }) => {
    const t = useChartTheme();
    const hours = Array.from({ length: 24 }, (_, h) => h);
    const values = hours.map(
        (h) => data?.incident_peak_hours?.find((i) => i.hour === h)?.total ?? 0
    );
    const labels = hours.map((h) => `${h % 12 || 12} ${h < 12 ? "AM" : "PM"}`);
    const axes = t.axes();
    return (
        <ChartCard
            title="Incidents by hour of day"
            subtitle="When reports come in"
            isLoading={isLoading}
            empty={allZero(values)}
            className={className}
        >
            <Line
                data={{
                    labels,
                    datasets: [
                        {
                            label: "Incidents",
                            data: values,
                            borderColor: t.palette[0],
                            backgroundColor: "rgba(34,197,94,0.15)",
                            fill: true,
                            tension: 0.35,
                            pointRadius: 0,
                            pointHoverRadius: 4,
                        },
                    ],
                }}
                options={{
                    ...t.base,
                    interaction: { mode: "index", intersect: false },
                    plugins: { ...t.base.plugins, legend: { display: false } },
                    scales: {
                        x: {
                            ...axes.x,
                            ticks: { color: t.text, maxTicksLimit: 12 },
                        },
                        y: axes.y,
                    },
                }}
            />
        </ChartCard>
    );
};

export const IncidentTrendChart = ({ data, isLoading }) => {
    const rows = data?.incident_trend ?? [];
    return (
        <ChartCard
            title="Category trends"
            subtitle="Reports per category, by month"
            isLoading={isLoading}
            empty={!rows.length}
        >
            <GroupedBar rows={rows} labelKey="category" />
        </ChartCard>
    );
};

export const ZoneIncidentTrendsChart = ({ data, isLoading }) => {
    const rows = data?.zone_incident_trends ?? [];
    return (
        <ChartCard
            title="Zone trends"
            subtitle="Reports per zone, by month"
            isLoading={isLoading}
            empty={!rows.length}
        >
            <GroupedBar rows={rows} labelKey="zone_name" />
        </ChartCard>
    );
};

/* ---------- violators ---------- */

export const MonthlyViolatorsChart = ({ data, isLoading }) => {
    const t = useChartTheme();
    const values = MONTHS.map(
        (_, i) => data?.violators?.find((v) => v.month === i + 1)?.total ?? 0
    );
    return (
        <ChartCard
            title="Recorded violators by month"
            isLoading={isLoading}
            empty={allZero(values)}
        >
            <Bar
                data={{
                    labels: MONTHS,
                    datasets: [
                        {
                            label: "Violators",
                            data: values,
                            backgroundColor: t.palette[2],
                            borderRadius: 4,
                        },
                    ],
                }}
                options={{
                    ...t.base,
                    plugins: { ...t.base.plugins, legend: { display: false } },
                    scales: t.axes(),
                }}
            />
        </ChartCard>
    );
};

export const ZoneViolatorsChart = ({ data, isLoading }) => {
    const rows = data?.zone_violators ?? [];
    return (
        <ChartCard
            title="Violators by zone"
            isLoading={isLoading}
            empty={!rows.length}
        >
            <Donut
                labels={rows.map((r) => r.zone_name)}
                values={rows.map((r) => r.total)}
                tooltip={(i) => ` ${rows[i].zone_name}: ${rows[i].total}`}
            />
        </ChartCard>
    );
};
