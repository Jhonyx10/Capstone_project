import { useEffect, useState } from "react";
import useAppState from "../../store/useAppState";
import Map, { Marker, Source, Layer } from "react-map-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import useZones from "../../hooks/useZones";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { incidentRequest } from "../../functions/LocationApi";
import { IoLocationSharp } from "react-icons/io5";
import RequestDetails from "../details/RequestDetails";
import IgpitGeoFence from "../../assets/geomap/igpityoungsville.json";
import echo from "../../echo";
import * as turf from "@turf/turf"; 
import WarningAlert from "../alerts/WarningAlert";

const IncidentRequestMap = () => {
    const [mapLoaded, setMapLoaded] = useState(false);
    const {
        map_token,
        darkMode,
        map_styles,
        token,
        base_url,
    } = useAppState();
    const [isWarningOpen, setIsWarningOpen] = useState(false);
    const [requestId, setRequestId] = useState(null);
    const [routes, setRoutes] = useState(null);
    const [viewPort, setViewPort] = useState({
        latitude: 8.5107242,
        longitude: 124.5851259,
        zoom: 14,
    });
    const [hoveredZoneId, setHoveredZoneId] = useState(null);
    const [tanodLocations, setTanodLocations] = useState([]);

    const { data: zones = [], isLoading, isError } = useZones();
    const { data: requests = [] } = useQuery({
        queryKey: ["request"],
        queryFn: () => incidentRequest({ base_url, token }),
    });

    const isInsideGeofence = (longitude, latitude) => {
        if (!IgpitGeoFence?.features?.length) return false;
        const polygon = IgpitGeoFence.features[0].geometry;
        const point = turf.point([longitude, latitude]);
        const poly = turf.polygon(polygon.coordinates);
        return turf.booleanPointInPolygon(point, poly);
    };

    useEffect(() => {
        if (!requests?.length) return;

        requests.forEach((r) => {
            if (!isInsideGeofence(r.longitude, r.latitude)) {
                console.warn(`⚠️ Request ID ${r.id} is outside the geofence!`);
                // You can replace console.warn with a toast, alert, or API call
                // alert(`Request ID ${r.id} is outside the geofence!`);
            }
        });
    }, [requests]);

    useEffect(() => {
        Object.entries(tanodLocations).forEach(([id, loc]) => {
            if (!loc?.lng || !loc?.lat) return;
            if (!isInsideGeofence(loc.lng, loc.lat)) {
                setIsWarningOpen(true)
            }
        });
    }, [tanodLocations]);

    // 🔹 Echo listener for tanod location updates
    useEffect(() => {
        const channel = echo.channel("locations");

        channel.listen(".location.updated", (e) => {
           setTanodLocations((prev) => {
               const existingIndex = prev.findIndex(
                   (t) => t.userId === e.userId && t.requestId === e.requestId
               );

               if (existingIndex !== -1) {
                   // update existing
                   const updated = [...prev];
                   updated[existingIndex] = {
                       userId: e.userId,
                       requestId: e.requestId,
                       lat: e.latitude,
                       lng: e.longitude,
                   };
                   return updated;
               }

               // add new
               return [
                   ...prev,
                   {
                       userId: e.userId,
                       requestId: e.requestId,
                       lat: e.latitude,
                       lng: e.longitude,
                   },
               ];
           });
        });

        return () => {
            channel.stopListening(".location.updated");
            echo.leaveChannel("locations");
        };
    }, []);

    // 🔹 Fetch routes only when data + map loaded
useEffect(() => {
    const fetchRoutes = async () => {
        if (!tanodLocations.length || !requests.length || !mapLoaded) return;

        try {
            const routePromises = Object.entries(tanodLocations).map(
                async ([tanodId, loc]) => {
                    const req = requests.find(
                        (r) => String(r.id) === String(loc.requestId)
                    );
                    if (!req) return null;

                    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${loc.lng},${loc.lat};${req.longitude},${req.latitude}?geometries=geojson&access_token=${map_token}`;
                    const res = await fetch(url);
                    const data = await res.json();

                    if (data.routes?.length) {
                        return {
                            type: "Feature",
                            geometry: data.routes[0].geometry,
                            properties: {
                                tanodId: String(tanodId),
                                requestId: String(loc.requestId),
                            },
                        };
                    }
                    return null;
                }
            );

            const features = (await Promise.all(routePromises)).filter(Boolean);
            console.log("✅ Fetched features:", features);

            setRoutes({
                type: "FeatureCollection",
                features,
            });
        } catch (err) {
            console.error("❌ Failed to fetch routes:", err);
        }
    };

    fetchRoutes();
}, [tanodLocations, requests, map_token, mapLoaded]);


    if (isLoading) return <div>Loading map zones...</div>;
    if (isError) return <div>Failed to load zones.</div>;

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full flex"
        >
            <AnimatePresence>
                {requestId && (
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`absolute z-50 dark:border-slate-700 ${
                            open ? "top-15 left-60" : "top-15 left-20"
                        }`}
                    >
                        <RequestDetails
                            requestId={requestId}
                            tanodLocations={tanodLocations}
                            onClose={() => setRequestId(null)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isWarningOpen && (
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`absolute z-50 dark:border-slate-700 ${
                            open ? "top-15 left-60" : "top-15 left-20"
                        }`}
                    >
                        <WarningAlert onClose={() => setIsWarningOpen(false)} />
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="flex-1 relative">
                <Map
                    {...viewPort}
                    onMove={(evt) => setViewPort(evt.viewState)}
                    mapboxAccessToken={map_token}
                    mapStyle={darkMode ? map_styles.dark : map_styles.light}
                    style={{ width: "100%", height: "100%" }}
                    onLoad={(e) => {
                        const mapInstance = e.target;

                        // Wait until the map style and layers are fully ready
                        const handleStyleLoad = () => {
                            console.log("✅ Map style fully loaded!");
                            setMapLoaded(true);
                            mapInstance.off("idle", handleStyleLoad); // cleanup listener
                        };

                        // 'idle' event ensures the style, tiles, and sources are all ready
                        mapInstance.on("idle", handleStyleLoad);
                    }}
                >
                    {mapLoaded && (
                        <Source id="igpit" type="geojson" data={IgpitGeoFence}>
                            <Layer
                                id="igpit-fill"
                                source="igpit"
                                type="fill"
                                paint={{
                                    "fill-color": "#f97316",
                                    "fill-opacity": 0.25,
                                }}
                            />
                            <Layer
                                id="igpit-outline"
                                source="igpit"
                                type="line"
                                paint={{
                                    "line-color": "#f97316",
                                    "line-width": 2,
                                }}
                            />
                        </Source>
                    )}

                    {/* ✅ Only render routes when map is fully loaded */}
                    {mapLoaded && routes?.features?.length > 0 && (
                        <Source id="routes" type="geojson" data={routes}>
                            <Layer
                                id="routes-line"
                                type="line"
                                paint={{
                                    "line-color": "#22c55e",
                                    "line-width": 5,
                                    "line-opacity": 0.9,
                                }}
                            />
                        </Source>
                    )}

                    {/* Incident Requests */}
                    {requests?.map((r) => (
                        <Marker
                            key={r.id}
                            longitude={r.longitude}
                            latitude={r.latitude}
                            onClick={() => setRequestId(r.id)}
                        >
                            <div className="text-red-600 hover:cursor-pointer">
                                <IoLocationSharp size={34} color="#ef4444" />
                            </div>
                        </Marker>
                    ))}

                    {/* Zones */}
                    {zones.map((zone) => (
                        <Marker
                            key={zone.id}
                            longitude={zone.longitude}
                            latitude={zone.latitude}
                            anchor="bottom"
                        >
                            <div
                                onMouseEnter={() => setHoveredZoneId(zone.id)}
                                onMouseLeave={() => setHoveredZoneId(null)}
                                style={{
                                    position: "relative",
                                    cursor: "pointer",
                                }}
                            >
                                <div
                                    style={{
                                        width:
                                            hoveredZoneId === zone.id
                                                ? "18px"
                                                : "14px",
                                        height:
                                            hoveredZoneId === zone.id
                                                ? "18px"
                                                : "14px",
                                        backgroundColor:
                                            hoveredZoneId === zone.id
                                                ? "orange"
                                                : "red",
                                        borderRadius: "50%",
                                        border: "2px solid white",
                                        transition: "all 0.2s ease",
                                    }}
                                />
                                {hoveredZoneId === zone.id && (
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white px-2 py-1 rounded text-xs font-bold shadow">
                                        {zone.zone_name}
                                    </div>
                                )}
                            </div>
                        </Marker>
                    ))}

                    {/* Tanod locations (real-time) */}
                    {Object.entries(tanodLocations).map(([id, loc]) => {
                        if (!loc?.lng || !loc?.lat) return null;
                        return (
                            <Marker
                                key={id}
                                longitude={loc.lng}
                                latitude={loc.lat}
                            >
                                <div className="text-blue-600">
                                    <IoLocationSharp
                                        size={34}
                                        color="#22c55e"
                                    />
                                </div>
                            </Marker>
                        );
                    })}
                </Map>
            </div>
        </motion.div>
    );
};

export default IncidentRequestMap;
