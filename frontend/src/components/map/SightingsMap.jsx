import { useEffect, useMemo, useRef, useState } from "react";
import Map, { Marker, Popup, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import useAppState from "../../store/useAppState";
import { formatDateTime } from "../WatchListUi";
import IgpitGeoFence from "../../assets/geomap/igpityoungsville.json";

const DEFAULT_VIEW = { latitude: 8.5107242, longitude: 124.5851259, zoom: 14 };

const boundsOf = (pts) => {
    const lngs = pts.map((p) => p.lng);
    const lats = pts.map((p) => p.lat);
    return [
        [Math.min(...lngs), Math.min(...lats)],
        [Math.max(...lngs), Math.max(...lats)],
    ];
};

// Same map setup as your Map page (react-map-gl + Igpit geofence),
// showing where a watch list entry was sighted.
// `sightings` should be newest first: pin 1 is the most recent.
const SightingsMap = ({ sightings = [], selectedId, onSelect }) => {
    const map_token = useAppState((s) => s.map_token);
    const map_styles = useAppState((s) => s.map_styles);
    const darkMode = useAppState((s) => s.darkMode);

    const mapRef = useRef(null);
    const [mapLoaded, setMapLoaded] = useState(false);

    const points = useMemo(
        () =>
            sightings
                .map((s, i) => ({
                    ...s,
                    n: i + 1,
                    lat: Number(s.latitude),
                    lng: Number(s.longitude),
                }))
                .filter(
                    (p) => Number.isFinite(p.lat) && Number.isFinite(p.lng)
                ),
        [sightings]
    );

    // Dashed path from the oldest sighting to the newest, to show movement
    const path = useMemo(
        () => ({
            type: "Feature",
            geometry: {
                type: "LineString",
                coordinates: [...points].reverse().map((p) => [p.lng, p.lat]),
            },
        }),
        [points]
    );

    // Start zoomed to fit every sighting (computed once)
    const [initialView] = useState(() => {
        if (points.length === 0) return DEFAULT_VIEW;
        if (points.length === 1) {
            return {
                latitude: points[0].lat,
                longitude: points[0].lng,
                zoom: 16,
            };
        }
        return {
            bounds: boundsOf(points),
            fitBoundsOptions: { padding: 60, maxZoom: 16 },
        };
    });

    const selected = points.find((p) => p.id === selectedId);

    const showAll = () => {
        const map = mapRef.current;
        if (!map || points.length === 0) return;
        if (points.length === 1) {
            map.flyTo({
                center: [points[0].lng, points[0].lat],
                zoom: 16,
                duration: 600,
            });
        } else {
            map.fitBounds(boundsOf(points), {
                padding: 60,
                maxZoom: 16,
                duration: 600,
            });
        }
    };

    // Picking a sighting (pin or list item) centers the map on it
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

    return (
        <div className="relative h-full w-full">
            <Map
                ref={mapRef}
                initialViewState={initialView}
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

                        {points.length > 1 && (
                            <Source
                                id="sighting-path"
                                type="geojson"
                                data={path}
                            >
                                <Layer
                                    id="sighting-path-line"
                                    type="line"
                                    layout={{
                                        "line-cap": "round",
                                        "line-join": "round",
                                    }}
                                    paint={{
                                        "line-color": "#ef4444",
                                        "line-width": 2,
                                        "line-opacity": 0.6,
                                        "line-dasharray": [2, 2],
                                    }}
                                />
                            </Source>
                        )}
                    </>
                )}

                {points.map((p) => (
                    <Marker
                        key={p.id}
                        longitude={p.lng}
                        latitude={p.lat}
                        anchor="center"
                        onClick={(e) => {
                            e.originalEvent.stopPropagation();
                            onSelect(p.id);
                        }}
                    >
                        <button
                            type="button"
                            aria-label={`Sighting ${p.n}: ${p.location}`}
                            className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-xs font-bold text-white shadow transition-transform cursor-pointer ${
                                p.n === 1 ? "bg-red-500" : "bg-amber-500"
                            } ${
                                p.id === selectedId
                                    ? "scale-125 ring-2 ring-green-400"
                                    : ""
                            }`}
                        >
                            {p.n}
                        </button>
                    </Marker>
                ))}

                {selected && (
                    <Popup
                        longitude={selected.lng}
                        latitude={selected.lat}
                        anchor="bottom"
                        offset={20}
                        closeOnClick={false}
                        onClose={() => onSelect(null)}
                    >
                        <div className="max-w-[200px] text-xs leading-snug text-gray-900">
                            <strong className="block">
                                {selected.location}
                            </strong>
                            <span className="block text-gray-600">
                                {formatDateTime(selected.created_at)}
                            </span>
                            {selected.note && (
                                <span className="mt-1 block line-clamp-3">
                                    {selected.note}
                                </span>
                            )}
                        </div>
                    </Popup>
                )}
            </Map>

            {points.length === 0 && (
                <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-4">
                    <p className="rounded-lg bg-white/95 px-4 py-2 text-sm text-gray-700 shadow dark:bg-gray-900/95 dark:text-gray-200">
                        No sightings to show yet.
                    </p>
                </div>
            )}

            {points.length > 1 && (
                <button
                    type="button"
                    onClick={showAll}
                    className="absolute bottom-3 left-3 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800 cursor-pointer"
                >
                    Show all
                </button>
            )}
        </div>
    );
};

export default SightingsMap;
