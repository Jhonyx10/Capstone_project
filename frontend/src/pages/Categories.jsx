import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { FaPlus, FaSearch } from "react-icons/fa";
import useAppState from "../store/useAppState";
import { getCategories } from "../functions/CategoryApi";
import { AnalyticalData } from "../functions/Analytics";
import AddCategoryForm from "../forms/AddCategoryForm";
import AddIncidentTypeForm from "../forms/AddIncidentTypeForm";
import { CategoryReportsChart } from "../components/charts/AnalyticsCharts";
import { PALETTE } from "../components/charts/ChartTheme";

const Categories = () => {
    const { base_url, token } = useAppState();
    const [isOpenCategoryForm, setIsOpenCategoryForm] = useState(false);
    const [isOpenIncidentForm, setIsOpenIncidentForm] = useState(false);
    const [search, setSearch] = useState("");

    const { data, isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: () => getCategories({ base_url, token }),
    });

    // Same query key as the Analytics page, so it is shared from cache.
    const { data: analytics, isLoading: analyticsLoading } = useQuery({
        queryKey: ["analytics"],
        queryFn: () => AnalyticalData({ base_url, token }),
        enabled: !!base_url && !!token,
    });

    const ranking = analytics?.category_reports ?? [];
    const reportCount = (name) =>
        ranking.find((r) => r.category === name)?.count ?? 0;

    const categories = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return data ?? [];
        return (data ?? []).filter(
            (c) =>
                c.category_name?.toLowerCase().includes(q) ||
                c.incident_types?.some((i) =>
                    i.incident_name?.toLowerCase().includes(q)
                )
        );
    }, [data, search]);

    const totalTypes = (data ?? []).reduce(
        (sum, c) => sum + (c.incident_types?.length ?? 0),
        0
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-7xl space-y-6 p-4 md:p-6"
        >
            {/* Header */}
            <header className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <motion.h1
                        layout
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="text-2xl font-semibold text-slate-800 dark:text-white"
                    >
                        Categories
                    </motion.h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        {isLoading
                            ? "Loading categories..."
                            : `${
                                  data?.length ?? 0
                              } categories and ${totalTypes} incident types`}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsOpenIncidentForm(true)}
                        className="flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                    >
                        <FaPlus size={11} /> Add incident type
                    </button>
                    <button
                        onClick={() => setIsOpenCategoryForm(true)}
                        className="flex items-center gap-2 rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-400"
                    >
                        <FaPlus size={11} /> Add category
                    </button>
                </div>
            </header>

            {/* Visual overview: chart + ranking */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <div className="lg:col-span-3">
                    <CategoryReportsChart
                        data={analytics}
                        isLoading={analyticsLoading}
                    />
                </div>
                <motion.section
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 20,
                        delay: 0.2,
                    }}
                    whileHover={{ scale: 1.02 }}
                    className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2"
                >
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                        Most reported
                    </h3>
                    <p className="mb-4 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Categories ranked by number of reports
                    </p>
                    {analyticsLoading ? (
                        <div className="h-48 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
                    ) : ranking.length === 0 ? (
                        <p className="py-10 text-center text-sm text-slate-400">
                            No reports recorded yet
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {[...ranking]
                                .sort((a, b) => b.count - a.count)
                                .slice(0, 6)
                                .map((r) => (
                                    <li key={r.category}>
                                        <div className="mb-1 flex justify-between text-sm">
                                            <span className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
                                                <span
                                                    className="size-2 rounded-full"
                                                    style={{
                                                        background:
                                                            PALETTE[
                                                                ranking.indexOf(
                                                                    r
                                                                ) %
                                                                    PALETTE.length
                                                            ],
                                                    }}
                                                />
                                                {r.category}
                                            </span>
                                            <span className="text-slate-500 dark:text-slate-400">
                                                {r.count} ·{" "}
                                                {Number(r.percentage).toFixed(
                                                    0
                                                )}
                                                %
                                            </span>
                                        </div>
                                        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-800">
                                            <div
                                                className="h-1.5 rounded-full bg-green-500"
                                                style={{
                                                    width: `${Math.min(
                                                        Number(r.percentage),
                                                        100
                                                    )}%`,
                                                }}
                                            />
                                        </div>
                                    </li>
                                ))}
                        </ul>
                    )}
                </motion.section>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <FaSearch
                    size={12}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search categories or incident types"
                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                />
            </div>

            {/* Category cards */}
            {isLoading ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="h-40 animate-pulse rounded-xl bg-slate-100 dark:bg-slate-800"
                        />
                    ))}
                </div>
            ) : categories.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 py-12 text-center dark:border-slate-700">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                        {search
                            ? `No categories match "${search}".`
                            : "No categories yet."}
                    </p>
                    {!search && (
                        <button
                            onClick={() => setIsOpenCategoryForm(true)}
                            className="mt-3 text-sm font-medium text-green-500 hover:underline"
                        >
                            Add your first category
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {categories.map((cat, index) => {
                        const types = cat.incident_types ?? [];
                        return (
                            <motion.article
                                key={cat.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 20,
                                    delay: 0.05 * index,
                                }}
                                whileHover={{ scale: 1.02 }}
                                className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <h3 className="font-semibold text-slate-800 dark:text-slate-100">
                                        {cat.category_name}
                                    </h3>
                                    <span className="shrink-0 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
                                        {reportCount(cat.category_name)} reports
                                    </span>
                                </div>
                                <p className="mb-3 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                                    {types.length} incident{" "}
                                    {types.length === 1 ? "type" : "types"}
                                </p>
                                {types.length > 0 ? (
                                    <div className="flex flex-wrap gap-1.5">
                                        {types.map((inc) => (
                                            <span
                                                key={inc.id}
                                                className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                            >
                                                {inc.incident_name}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-xs italic text-slate-400">
                                        No incident types yet
                                    </p>
                                )}
                            </motion.article>
                        );
                    })}
                </div>
            )}

            {isOpenCategoryForm && (
                <AddCategoryForm onClose={() => setIsOpenCategoryForm(false)} />
            )}
            {isOpenIncidentForm && (
                <AddIncidentTypeForm
                    onClose={() => setIsOpenIncidentForm(false)}
                />
            )}
        </motion.div>
    );
};

export default Categories;
