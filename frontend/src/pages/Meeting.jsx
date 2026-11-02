import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import axios from "axios";
import Map, { Marker, Popup, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
    IoAlertCircleOutline,
    IoLocationSharp,
    IoSearch,
    IoClose,
} from "react-icons/io5";
import useAppState from "../store/useAppState";
import useZones from "../hooks/useZones";
import useUnansweredRequests from "../hooks/useUnAnsweredRequests";
import IgpitGeoFence from "../assets/geomap/igpityoungsville.json";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const RANGES = [
    { label: "Last 7 days", days: 7 },
    { label: "Last 30 days", days: 30 },
    { label: "Last 90 days", days: 90 },
    { label: "All time", days: null },
];

const hourLabel = (h) =>
    `${h % 12 === 0 ? 12 : h % 12} ${h < 12 ? "AM" : "PM"}`;

/* ------------------------------------------------------------------ */
/* Map                                                                 */
/* ------------------------------------------------------------------ */

const toGeoJSON = (pts) => ({
    type: "FeatureCollection",
    features: pts.map((p) => ({
        type: "Feature",
        properties: { id: p.id },
        geometry: { type: "Point", coordinates: [p.lng, p.lat] },
    })),
});

const heatPaint = {
    "heatmap-weight": 1,
    "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 15, 3],
    "heatmap-color": [
        "interpolate",
        ["linear"],
        ["heatmap-density"],
        0,
        "rgba(34,197,94,0)",
        0.2,
        "rgba(134,239,172,0.6)",
        0.4,
        "rgba(250,204,21,0.75)",
        0.7,
        "rgba(249,115,22,0.85)",
        1,
        "rgb(220,38,38)",
    ],
    "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 6, 15, 40],
    "heatmap-opacity": 0.85,
};

/* ------------------------------------------------------------------ */
/* Location search                                                     */
/* ------------------------------------------------------------------ */

const CENTER = { lat: 8.5107242, lng: 124.5851259 };

const LocationSearch = ({ token, zones, onPick, onClear }) => {
    const [query, setQuery] = useState("");
    const [places, setPlaces] = useState([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(-1);
    const wrapRef = useRef(null);

    // Local matches: your zones
    const zoneMatches = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (q.length < 2) return [];
        return zones
            .filter((z) => z.zone_name?.toLowerCase().includes(q))
            .slice(0, 3)
            .map((z) => ({
                id: `zone-${z.id}`,
                label: z.zone_name,
                sublabel: "Zone",
                lat: Number(z.latitude),
                lng: Number(z.longitude),
            }));
    }, [query, zones]);

    // Remote matches: Mapbox geocoding (debounced)
    useEffect(() => {
        const q = query.trim();
        if (q.length < 3 || !token) {
            setPlaces([]);
            setLoading(false);
            return;
        }

        const controller = new AbortController();
        const timer = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await axios.get(
                    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
                        q
                    )}.json`,
                    {
                        signal: controller.signal,
                        params: {
                            access_token: token,
                            country: "ph",
                            proximity: `${CENTER.lng},${CENTER.lat}`,
                            limit: 5,
                            autocomplete: true,
                        },
                    }
                );
                setPlaces(
                    (res.data?.features ?? []).map((f) => ({
                        id: f.id,
                        label: f.text,
                        sublabel: f.place_name,
                        lng: f.center[0],
                        lat: f.center[1],
                    }))
                );
            } catch (err) {
                if (!axios.isCancel(err)) setPlaces([]);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => {
            clearTimeout(timer);
            controller.abort();
        };
    }, [query, token]);

    // Close the dropdown on outside click
    useEffect(() => {
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const items = [...zoneMatches, ...places];

    const pick = (item) => {
        setQuery(item.label);
        setOpen(false);
        setActive(-1);
        onPick(item);
    };

    const clear = () => {
        setQuery("");
        setPlaces([]);
        setOpen(false);
        setActive(-1);
        onClear();
    };

    const onKeyDown = (e) => {
        if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
            setActive((i) => Math.min(i + 1, items.length - 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => Math.max(i - 1, 0));
        } else if (e.key === "Enter") {
            e.preventDefault();
            const item = items[active >= 0 ? active : 0];
            if (item) pick(item);
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    };

    const showDropdown = open && query.trim().length >= 2;

    return (
        <div
            ref={wrapRef}
            className="absolute right-3 top-3 z-10 w-72 max-w-[calc(100%-1.5rem)]"
        >
            <div className="relative">
                <IoSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setOpen(true);
                        setActive(-1);
                    }}
                    onFocus={() => setOpen(true)}
                    onKeyDown={onKeyDown}
                    placeholder="Search a place or zone…"
                    aria-label="Search location"
                    className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-9 text-sm text-gray-800 shadow focus:outline-none focus:ring-2 focus:ring-green-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100"
                />
                {query && (
                    <button
                        type="button"
                        onClick={clear}
                        aria-label="Clear search"
                        className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded p-1 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                    >
                        <IoClose className="h-4 w-4" />
                    </button>
                )}
            </div>

            {showDropdown && (
                <ul
                    role="listbox"
                    className="mt-1 max-h-72 overflow-y-auto rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-900"
                >
                    {items.map((item, i) => (
                        <li
                            key={item.id}
                            role="option"
                            aria-selected={i === active}
                        >
                            <button
                                type="button"
                                onClick={() => pick(item)}
                                onMouseEnter={() => setActive(i)}
                                className={`flex w-full flex-col px-3 py-2 text-left cursor-pointer ${
                                    i === active
                                        ? "bg-green-50 dark:bg-gray-800"
                                        : ""
                                }`}
                            >
                                <span className="truncate font-medium text-gray-900 dark:text-white">
                                    {item.label}
                                </span>
                                <span className="truncate text-xs text-gray-500 dark:text-gray-400">
                                    {item.sublabel}
                                </span>
                            </button>
                        </li>
                    ))}
                    {items.length === 0 && (
                        <li className="px-3 py-2 text-gray-500 dark:text-gray-400">
                            {loading ? "Searching…" : "No results found."}
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
};

// Same map setup as your Map page (react-map-gl, Igpit geofence, zone markers),
// with the unanswered requests drawn on top.
const UnansweredMap = ({ points, view, selectedId, onSelect }) => {
    const map_token = useAppState((s) => s.map_token);
    const map_styles = useAppState((s) => s.map_styles);
    const darkMode = useAppState((s) => s.darkMode);

    const mapRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [showZones, setShowZones] = useState(true);
    const [hoveredZoneId, setHoveredZoneId] = useState(null);
    const [searchPin, setSearchPin] = useState(null);

    const { data: zones = [] } = useZones();

    const geojson = useMemo(() => toGeoJSON(points), [points]);
    const selected = points.find((p) => p.id === selectedId);

    // Clicking a row in the list (or a pin) centers the map on that request
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !selected) return;
        map.flyTo({
            center: [selected.lng, selected.lat],
            zoom: Math.max(map.getZoom(), 16),
            duration: 600,
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedId]);

    const handlePick = (item) => {
        setSearchPin({ lng: item.lng, lat: item.lat, label: item.label });
        mapRef.current?.flyTo({
            center: [item.lng, item.lat],
            zoom: 16,
            duration: 800,
        });
    };

    return (
        <div className="relative h-full w-full">
            <Map
                ref={mapRef}
                initialViewState={{
                    latitude: 8.5107242,
                    longitude: 124.5851259,
                    zoom: 14,
                }}
                mapboxAccessToken={map_token}
                mapStyle={darkMode ? map_styles.dark : map_styles.light}
                style={{ width: "100%", height: "100%" }}
                onLoad={(e) => {
                    const mapInstance = e.target;
                    const handleIdle = () => {
                        setMapLoaded(true);
                        mapInstance.off("idle", handleIdle);
                    };
                    mapInstance.on("idle", handleIdle);
                }}
            >
                {mapLoaded && (
                    <>
                        <Source id="igpit" type="geojson" data={IgpitGeoFence}>
                            <Layer
                                id="igpit-fill"
                                type="fill"
                                paint={{
                                    "fill-color": "#f97316",
                                    "fill-opacity": 0.2,
                                }}
                            />
                            <Layer
                                id="igpit-outline"
                                type="line"
                                paint={{
                                    "line-color": "#f97316",
                                    "line-width": 2,
                                }}
                            />
                        </Source>

                        <Source id="unanswered" type="geojson" data={geojson}>
                            <Layer
                                id="unanswered-heat"
                                type="heatmap"
                                maxzoom={18}
                                layout={{
                                    visibility:
                                        view === "heatmap" ? "visible" : "none",
                                }}
                                paint={heatPaint}
                            />
                        </Source>
                    </>
                )}

                {/* Zones */}
                {showZones &&
                    zones.map((zone) => (
                        <Marker
                            key={`zone-${zone.id}`}
                            longitude={zone.longitude}
                            latitude={zone.latitude}
                            anchor="bottom"
                        >
                            <div
                                onMouseEnter={() => setHoveredZoneId(zone.id)}
                                onMouseLeave={() => setHoveredZoneId(null)}
                                className="relative cursor-pointer"
                            >
                                <div
                                    style={{
                                        width:
                                            hoveredZoneId === zone.id ? 16 : 12,
                                        height:
                                            hoveredZoneId === zone.id ? 16 : 12,
                                        backgroundColor: "#3b82f6",
                                        borderRadius: "50%",
                                        border: "2px solid white",
                                        transition: "all 0.2s ease",
                                    }}
                                />
                                {hoveredZoneId === zone.id && (
                                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-white px-2 py-1 text-xs font-bold text-gray-900 shadow">
                                        {zone.zone_name}
                                    </div>
                                )}
                            </div>
                        </Marker>
                    ))}

                {/* Pins */}
                {view === "pins" &&
                    points.map((p) => (
                        <Marker
                            key={p.id}
                            longitude={p.lng}
                            latitude={p.lat}
                            anchor="bottom"
                            onClick={(e) => {
                                e.originalEvent.stopPropagation();
                                onSelect(p.id);
                            }}
                        >
                            <IoLocationSharp
                                size={28}
                                color="#ef4444"
                                className="cursor-pointer drop-shadow"
                            />
                        </Marker>
                    ))}

                {/* Searched location */}
                {searchPin && (
                    <Marker
                        longitude={searchPin.lng}
                        latitude={searchPin.lat}
                        anchor="bottom"
                    >
                        <div className="flex flex-col items-center">
                            <span className="mb-0.5 max-w-[160px] truncate rounded bg-white px-2 py-0.5 text-xs font-semibold text-gray-900 shadow">
                                {searchPin.label}
                            </span>
                            <IoLocationSharp
                                size={30}
                                color="#8b5cf6"
                                className="drop-shadow"
                            />
                        </div>
                    </Marker>
                )}

                {selected && (
                    <Popup
                        longitude={selected.lng}
                        latitude={selected.lat}
                        anchor="bottom"
                        offset={view === "pins" ? 30 : 8}
                        closeOnClick={false}
                        onClose={() => onSelect(null)}
                    >
                        <div className="text-xs leading-snug text-gray-900">
                            <strong>{selected.category}</strong>
                            <div>{selected.createdAt.toLocaleString()}</div>
                        </div>
                    </Popup>
                )}
            </Map>

            <LocationSearch
                token={map_token}
                zones={zones}
                onPick={handlePick}
                onClear={() => setSearchPin(null)}
            />

            <button
                type="button"
                onClick={() => setShowZones((v) => !v)}
                aria-pressed={showZones}
                className={`absolute bottom-3 left-3 rounded-lg border px-3 py-1.5 text-sm font-medium shadow cursor-pointer ${
                    showZones
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-gray-200 bg-white text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
                }`}
            >
                Zones
            </button>
        </div>
    );
};

/* ------------------------------------------------------------------ */
/* Small UI pieces                                                     */
/* ------------------------------------------------------------------ */

const card =
    "rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900";

const selectClass =
    "rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer";

const Stat = ({ label, value, sub }) => (
    <div className={`${card} p-4`}>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="mt-1 truncate text-2xl font-semibold text-gray-900 dark:text-white">
            {value}
        </p>
        {sub && (
            <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                {sub}
            </p>
        )}
    </div>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

const Meetings = () => {
    const [rangeDays, setRangeDays] = useState(30);
    const [category, setCategory] = useState("all");
    const [view, setView] = useState("heatmap");
    const [selectedId, setSelectedId] = useState(null);

    const { data = [], isLoading, isError } = useUnansweredRequests();

    const categories = useMemo(
        () => [...new Set(data.map((p) => p.category))].sort(),
        [data]
    );

    const points = useMemo(() => {
        const since = rangeDays ? Date.now() - rangeDays * 86400000 : 0;
        return data.filter(
            (p) =>
                p.createdAt.getTime() >= since &&
                (category === "all" || p.category === category)
        );
    }, [data, rangeDays, category]);

    const stats = useMemo(() => {
        const byCategory = {};
        const byHour = Array(24).fill(0);
        points.forEach((p) => {
            byCategory[p.category] = (byCategory[p.category] ?? 0) + 1;
            byHour[p.createdAt.getHours()]++;
        });
        const categoryRows = Object.entries(byCategory)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
        const maxHour = Math.max(...byHour);
        return {
            categoryRows,
            byHour,
            maxHour,
            peakHour: maxHour > 0 ? byHour.indexOf(maxHour) : null,
        };
    }, [points]);

    const recent = useMemo(
        () => [...points].sort((a, b) => b.createdAt - a.createdAt).slice(0, 6),
        [points]
    );

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="mx-auto max-w-7xl space-y-5 p-4 md:p-6"
        >
            {/* Header + filters */}
            <header className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-800 dark:text-white">
                        Incident Meetings
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Unanswered requests, hotspots, and trends to review
                        before the meeting.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <select
                        value={rangeDays ?? "all"}
                        onChange={(e) =>
                            setRangeDays(
                                e.target.value === "all"
                                    ? null
                                    : Number(e.target.value)
                            )
                        }
                        aria-label="Time range"
                        className={selectClass}
                    >
                        {RANGES.map((r) => (
                            <option key={r.label} value={r.days ?? "all"}>
                                {r.label}
                            </option>
                        ))}
                    </select>

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        aria-label="Category"
                        className={selectClass}
                    >
                        <option value="all">All categories</option>
                        {categories.map((c) => (
                            <option key={c} value={c}>
                                {c}
                            </option>
                        ))}
                    </select>
                </div>
            </header>

            {isError && (
                <div
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400"
                >
                    <IoAlertCircleOutline className="mt-0.5 h-4 w-4 shrink-0" />
                    Could not load unanswered requests. Check that the request
                    endpoint is correct.
                </div>
            )}

            {/* Summary */}
            <div className="grid gap-4 sm:grid-cols-3">
                <Stat
                    label="Unanswered requests"
                    value={isLoading ? "…" : points.length}
                    sub={
                        rangeDays ? `In the last ${rangeDays} days` : "All time"
                    }
                />
                <Stat
                    label="Most affected category"
                    value={stats.categoryRows[0]?.name ?? "—"}
                    sub={
                        stats.categoryRows[0]
                            ? `${stats.categoryRows[0].count} unanswered`
                            : "No data"
                    }
                />
                <Stat
                    label="Busiest time of day"
                    value={
                        stats.peakHour === null
                            ? "—"
                            : hourLabel(stats.peakHour)
                    }
                    sub={
                        stats.peakHour === null
                            ? "No data"
                            : `${stats.maxHour} request${
                                  stats.maxHour === 1 ? "" : "s"
                              } created in this hour`
                    }
                />
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                {/* Map */}
                <section
                    className={`${card} relative overflow-hidden lg:col-span-2`}
                >
                    <div className="h-[520px]">
                        <UnansweredMap
                            points={points}
                            view={view}
                            selectedId={selectedId}
                            onSelect={setSelectedId}
                        />
                    </div>

                    <div
                        role="group"
                        aria-label="Map view"
                        className="absolute left-3 top-3 flex rounded-lg border border-gray-200 bg-white p-0.5 shadow dark:border-gray-700 dark:bg-gray-900"
                    >
                        {[
                            ["heatmap", "Heatmap"],
                            ["pins", "Pins"],
                        ].map(([key, label]) => (
                            <button
                                key={key}
                                type="button"
                                onClick={() => setView(key)}
                                aria-pressed={view === key}
                                className={`rounded-md px-3 py-1.5 text-sm font-medium transition cursor-pointer ${
                                    view === key
                                        ? "bg-green-600 text-white"
                                        : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>

                    {!isLoading && points.length === 0 && (
                        <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
                            <p className="rounded-lg bg-white/95 px-4 py-2 text-sm text-gray-700 shadow dark:bg-gray-900/95 dark:text-gray-200">
                                No unanswered requests for these filters.
                            </p>
                        </div>
                    )}
                </section>

                {/* Analytics */}
                <aside className="space-y-4">
                    <section className={`${card} p-4`}>
                        <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
                            By category
                        </h2>
                        {stats.categoryRows.length === 0 ? (
                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                Nothing to show yet.
                            </p>
                        ) : (
                            <ul className="mt-3 space-y-3">
                                {stats.categoryRows.slice(0, 6).map((row) => (
                                    <li key={row.name}>
                                        <div className="flex justify-between text-sm">
                                            <span className="truncate text-gray-700 dark:text-gray-200">
                                                {row.name}
                                            </span>
                                            <span className="ml-3 font-medium text-gray-900 dark:text-white">
                                                {row.count}
                                            </span>
                                        </div>
                                        <div className="mt-1 h-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
                                            <div
                                                className="h-1.5 rounded-full bg-green-500"
                                                style={{
                                                    width: `${
                                                        (row.count /
                                                            stats
                                                                .categoryRows[0]
                                                                .count) *
                                                        100
                                                    }%`,
                                                }}
                                            />
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>

                    <section className={`${card} p-4`}>
                        <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
                            When requests are created
                        </h2>
                        <div
                            className="mt-4 flex h-24 items-end gap-[3px]"
                            role="img"
                            aria-label="Unanswered requests by hour of day"
                        >
                            {stats.byHour.map((count, h) => (
                                <div
                                    key={h}
                                    title={`${hourLabel(h)}: ${count}`}
                                    className={`flex-1 rounded-sm ${
                                        h === stats.peakHour
                                            ? "bg-green-500"
                                            : "bg-gray-200 dark:bg-gray-700"
                                    }`}
                                    style={{
                                        height: `${
                                            stats.maxHour
                                                ? Math.max(
                                                      (count / stats.maxHour) *
                                                          100,
                                                      count ? 6 : 2
                                                  )
                                                : 2
                                        }%`,
                                    }}
                                />
                            ))}
                        </div>
                        <div className="mt-1.5 flex justify-between text-[11px] text-gray-400">
                            <span>12 AM</span>
                            <span>6 AM</span>
                            <span>12 PM</span>
                            <span>6 PM</span>
                        </div>
                    </section>

                    <section className={`${card} p-4`}>
                        <h2 className="text-sm font-semibold text-gray-800 dark:text-white">
                            Most recent
                        </h2>
                        {recent.length === 0 ? (
                            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                                Nothing to show yet.
                            </p>
                        ) : (
                            <ul className="mt-2 divide-y divide-gray-100 dark:divide-gray-800">
                                {recent.map((p) => (
                                    <li key={p.id}>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedId(p.id)}
                                            className="flex w-full items-center justify-between gap-3 py-2 text-left text-sm hover:text-green-600 dark:hover:text-green-400 cursor-pointer"
                                        >
                                            <span className="truncate text-gray-800 dark:text-gray-100">
                                                {p.category}
                                            </span>
                                            <span className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
                                                {p.createdAt.toLocaleString(
                                                    [],
                                                    {
                                                        month: "short",
                                                        day: "numeric",
                                                        hour: "numeric",
                                                        minute: "2-digit",
                                                    }
                                                )}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </aside>
            </div>
        </motion.div>
    );
};

export default Meetings;
